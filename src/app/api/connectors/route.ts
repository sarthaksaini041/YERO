import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ConnectorRow } from "@/db/schema";

/**
 * GET /api/connectors
 * Returns all connector records for the authenticated user.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_connectors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map snake_case DB rows to camelCase for the client
  const connectors: ConnectorRow[] = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    platform: row.platform,
    platformUsername: row.platform_username,
    status: row.status,
    profileData: row.profile_data,
    lastSyncedAt: row.last_synced_at ? new Date(row.last_synced_at) : null,
    lastSyncAttemptedAt: row.last_sync_attempted_at
      ? new Date(row.last_sync_attempted_at)
      : null,
    errorMessage: row.error_message,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));

  return NextResponse.json({ connectors });
}
