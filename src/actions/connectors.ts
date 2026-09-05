"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { connectConnectorSchema, platformSchema } from "@/lib/validations/connector";
import { getConnectorService } from "@/lib/connectors/connector.factory";
import type { Platform, ConnectorProfile, ConnectorErrorCode } from "@/lib/connectors/types";

export interface ConnectorRecord {
  id: string;
  userId: string;
  platform: Platform;
  platformUsername: string;
  status: "connected" | "error" | "syncing";
  profileData: ConnectorProfile | null;
  lastSyncedAt: string | null;
  lastSyncAttemptedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fetch all connectors for the current authenticated user. */
export async function getConnectors(): Promise<{
  data: ConnectorRecord[];
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_connectors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };

  const connectors: ConnectorRecord[] = (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    platform: row.platform as Platform,
    platformUsername: row.platform_username,
    status: row.status as "connected" | "error" | "syncing",
    profileData: row.profile_data as ConnectorProfile | null,
    lastSyncedAt: row.last_synced_at,
    lastSyncAttemptedAt: row.last_sync_attempted_at,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { data: connectors };
}

/**
 * Connect a platform: fetch public profile data, normalize, and save to DB.
 * Returns the saved ConnectorRecord on success.
 */
export async function connectPlatform(
  platformRaw: string,
  usernameRaw: string
): Promise<{
  success: boolean;
  connector?: ConnectorRecord;
  error?: string;
  errorCode?: ConnectorErrorCode;
}> {
  const validation = connectConnectorSchema.safeParse({
    platform: platformRaw,
    username: usernameRaw,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Invalid username or profile link.",
      errorCode: "INVALID_INPUT",
    };
  }

  const { platform, username } = validation.data;

  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: "Please log in to connect platforms.",
      errorCode: "AUTH_REQUIRED",
    };
  }

  const supabase = await createClient();

  // Optimistically set status to syncing
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

  // Fetch from platform service
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

    revalidatePath("/settings");
    revalidatePath("/connectors");
    revalidatePath("/coding");
    revalidatePath("/developer");

    return {
      success: false,
      error: errorMsg,
      errorCode: result.error.code,
    };
  }

  const now = new Date().toISOString();
  const { data: saved, error: dbError } = await supabase
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

  if (dbError) {
    return {
      success: false,
      error: dbError.message,
      errorCode: "UNKNOWN_ERROR",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/connectors");
  revalidatePath("/coding");
  revalidatePath("/developer");

  const connector: ConnectorRecord = {
    id: saved.id,
    userId: saved.user_id,
    platform: saved.platform as Platform,
    platformUsername: saved.platform_username,
    status: saved.status as "connected" | "error" | "syncing",
    profileData: saved.profile_data as ConnectorProfile | null,
    lastSyncedAt: saved.last_synced_at,
    lastSyncAttemptedAt: saved.last_sync_attempted_at,
    errorMessage: saved.error_message,
    createdAt: saved.created_at,
    updatedAt: saved.updated_at,
  };

  return { success: true, connector };
}

/** Disconnect a platform by deleting the connector record. */
export async function disconnectPlatform(
  platformRaw: string
): Promise<{ success: boolean; error?: string }> {
  const result = platformSchema.safeParse(platformRaw);
  if (!result.success) {
    return { success: false, error: "Unsupported platform." };
  }
  const platform = result.data;

  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_connectors")
    .delete()
    .eq("user_id", user.id)
    .eq("platform", platform);

  if (error) return { success: false, error: error.message };

  revalidatePath("/settings");
  revalidatePath("/connectors");
  revalidatePath("/coding");
  revalidatePath("/developer");
  return { success: true };
}

/**
 * Re-sync a connected platform: re-fetch and update the stored profile data.
 * Includes a 10s cooldown to prevent abuse.
 */
export async function syncConnector(
  platformRaw: string
): Promise<{
  success: boolean;
  connector?: ConnectorRecord;
  error?: string;
  errorCode?: ConnectorErrorCode;
}> {
  const platformResult = platformSchema.safeParse(platformRaw);
  if (!platformResult.success) {
    return { success: false, error: "Unsupported platform.", errorCode: "INVALID_INPUT" };
  }
  const platform = platformResult.data;

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized", errorCode: "AUTH_REQUIRED" };
  }

  const supabase = await createClient();

  // Get current record from DB
  const { data: existing } = await supabase
    .from("user_connectors")
    .select("platform_username, last_sync_attempted_at, status")
    .eq("user_id", user.id)
    .eq("platform", platform)
    .maybeSingle();

  if (!existing) {
    return {
      success: false,
      error: "Connector not found. Please connect the platform first.",
      errorCode: "PROFILE_NOT_FOUND",
    };
  }

  // Prevent spamming sync within 10 seconds
  if (existing.last_sync_attempted_at) {
    const elapsedMs = Date.now() - new Date(existing.last_sync_attempted_at).getTime();
    if (elapsedMs < 10000 && existing.status === "connected") {
      return {
        success: false,
        error: "Stats were synced recently. Please wait a few seconds before refreshing.",
        errorCode: "RATE_LIMITED",
      };
    }
  }

  return connectPlatform(platform, existing.platform_username);
}
