import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { platformSchema, connectConnectorSchema } from "@/lib/validations/connector";
import { getConnectorService } from "@/lib/connectors/connector.factory";
import type { Platform } from "@/lib/connectors/types";

type RouteContext = { params: Promise<{ platform: string }> };

/**
 * GET /api/connectors/[platform]
 * Returns the connector record for this user + platform, or 404.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { platform: rawPlatform } = await params;

  const platformResult = platformSchema.safeParse(rawPlatform);
  if (!platformResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "Unsupported platform." },
      },
      { status: 400 }
    );
  }
  const platform = platformResult.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "AUTH_REQUIRED", message: "Unauthorized" },
      },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("user_connectors")
    .select("*")
    .eq("user_id", user.id)
    .eq("platform", platform)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNKNOWN_ERROR", message: error.message },
      },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ success: true, connector: null }, { status: 200 });
  }

  return NextResponse.json({ success: true, connector: data });
}

/**
 * POST /api/connectors/[platform]
 * Connects a platform: validates/normalizes handle, fetches public data, and upserts record.
 * Body: { username: string }
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { platform: rawPlatform } = await params;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.username !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "Invalid request body." },
      },
      { status: 400 }
    );
  }

  const validation = connectConnectorSchema.safeParse({
    platform: rawPlatform,
    username: body.username,
  });

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: validation.error.issues[0]?.message ?? "Invalid input.",
        },
      },
      { status: 400 }
    );
  }

  const { platform, username } = validation.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "AUTH_REQUIRED", message: "Unauthorized" },
      },
      { status: 401 }
    );
  }

  // Mark connector as syncing (upsert to prevent duplicate)
  await supabase.from("user_connectors").upsert(
    {
      user_id: user.id,
      platform,
      platform_username: username,
      status: "syncing",
      last_sync_attempted_at: new Date().toISOString(),
    },
    { onConflict: "user_id,platform" }
  );

  // Fetch profile from the platform service
  const service = getConnectorService(platform as Platform);
  const result = await service.fetchProfile(username);

  if (!result.success) {
    const errorMsg = result.error.message;
    await supabase
      .from("user_connectors")
      .update({
        status: "error",
        error_message: errorMsg,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("platform", platform);

    const status = result.notFound ? 404 : result.rateLimited ? 429 : result.error.statusCode ?? 502;
    return NextResponse.json(
      {
        success: false,
        platform,
        error: {
          code: result.error.code,
          message: errorMsg,
        },
      },
      { status }
    );
  }

  // Save normalized profile data
  const now = new Date().toISOString();
  const { data: savedRow, error: upsertError } = await supabase
    .from("user_connectors")
    .upsert(
      {
        user_id: user.id,
        platform,
        platform_username: result.profile.username,
        status: "connected",
        profile_data: result.profile as unknown as Record<string, unknown>,
        last_synced_at: now,
        last_sync_attempted_at: now,
        error_message: null,
        updated_at: now,
      },
      { onConflict: "user_id,platform" }
    )
    .select()
    .single();

  if (upsertError) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNKNOWN_ERROR", message: upsertError.message },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    platform,
    connector: savedRow,
    profile: result.profile,
  });
}

/**
 * DELETE /api/connectors/[platform]
 * Disconnects a platform connector for the authenticated user.
 */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { platform: rawPlatform } = await params;

  const platformResult = platformSchema.safeParse(rawPlatform);
  if (!platformResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "Unsupported platform." },
      },
      { status: 400 }
    );
  }
  const platform = platformResult.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "AUTH_REQUIRED", message: "Unauthorized" },
      },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("user_connectors")
    .delete()
    .eq("user_id", user.id)
    .eq("platform", platform);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNKNOWN_ERROR", message: error.message },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, platform });
}
