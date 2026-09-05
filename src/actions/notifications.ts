"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getISTDateString } from "@/lib/time/ist";
import { sendPushNotification } from "@/lib/notifications/web-push";

export interface NotificationStatus {
  isSupported: boolean;
  hasActiveSubscription: boolean;
  notificationsEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  eventType: string; // 'DAILY_PROMPT' | 'NO_TASKS_REMINDER' | 'PROGRESS_REMINDER' | 'ALL_COMPLETED' | 'TEST_NOTIFICATION'
  targetDateIst: string;
  hourSlotIst: number;
  title: string;
  body: string;
  status: "SENT" | "FAILED" | "PENDING" | "SKIPPED";
  sentAt: string;
}

/**
 * Fetches user's current notification status and preferences.
 */
export async function getNotificationStatus(): Promise<NotificationStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isSupported: true,
      hasActiveSubscription: false,
      notificationsEnabled: false,
    };
  }

  // Check subscriptions
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  // Check preferences
  const { data: pref } = await supabase
    .from("user_preferences")
    .select("notifications_enabled")
    .eq("user_id", user.id)
    .single();

  return {
    isSupported: true,
    hasActiveSubscription: (subs && subs.length > 0) || false,
    notificationsEnabled: pref ? pref.notifications_enabled : true,
  };
}

/**
 * Toggles notification preference for the logged in user.
 */
export async function toggleNotificationPreference(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: user.id,
        notifications_enabled: enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  revalidatePath("/");
  return { success: true };
}

/**
 * Fetches all notification logs for the current authenticated user,
 * sorted by sent_at descending.
 */
export async function getNotificationLogs(): Promise<{
  data: NotificationItem[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: [], error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("notification_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  const mapped: NotificationItem[] = (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    eventType: row.event_type,
    targetDateIst: row.target_date_ist,
    hourSlotIst: row.hour_slot_ist,
    title: row.title,
    body: row.body,
    status: row.status as "SENT" | "FAILED" | "PENDING" | "SKIPPED",
    sentAt: row.sent_at,
  }));

  return { data: mapped };
}

/**
 * Deletes a single notification log item belonging to the current user.
 */
export async function deleteNotificationLog(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("notification_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Clears all notification logs for the current user.
 */
export async function clearAllNotificationLogs(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("notification_logs")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Sends an immediate test notification to the user's active push subscriptions
 * and inserts a log entry into public.notification_logs.
 */
export async function sendTestNotification(): Promise<{
  success: boolean;
  log?: NotificationItem;
  pushDelivered?: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const title = "Plan your day with YERO";
  const body = "This is a test notification from YERO. Your daily task reminders are active!";

  // 1. Fetch user's push subscriptions
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user.id);

  let pushDelivered = false;

  if (subs && subs.length > 0) {
    for (const sub of subs) {
      try {
        const sendRes = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          {
            title,
            body,
            url: "/notifications",
            tag: "yero-test-notification",
          }
        );
        if (sendRes.success) {
          pushDelivered = true;
        }
      } catch (err) {
        console.warn("[sendTestNotification] Push attempt error:", err);
      }
    }
  }

  // 2. Insert into notification_logs with a unique slot id
  const randomSlot = Math.floor(Date.now() % 1000000);
  const targetDate = getISTDateString();

  const { data: inserted, error: insertError } = await supabase
    .from("notification_logs")
    .insert({
      user_id: user.id,
      event_type: "TEST_NOTIFICATION",
      target_date_ist: targetDate,
      hour_slot_ist: randomSlot,
      title,
      body,
      status: pushDelivered || !subs || subs.length === 0 ? "SENT" : "FAILED",
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  const newLog: NotificationItem = {
    id: inserted.id,
    userId: inserted.user_id,
    eventType: inserted.event_type,
    targetDateIst: inserted.target_date_ist,
    hourSlotIst: inserted.hour_slot_ist,
    title: inserted.title,
    body: inserted.body,
    status: inserted.status as "SENT" | "FAILED" | "PENDING" | "SKIPPED",
    sentAt: inserted.sent_at,
  };

  revalidatePath("/notifications");
  return { success: true, log: newLog, pushDelivered };
}
