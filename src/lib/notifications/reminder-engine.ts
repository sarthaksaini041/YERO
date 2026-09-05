import { createClient } from "@supabase/supabase-js";
import {
  getISTDetails,
  getISTDayBounds,
  getActive3HourSlotIST,
  isWithinActiveHoursIST,
} from "@/lib/time/ist";
import { sendPushNotification, type PushTarget } from "./web-push";


interface SubscriberRow {
  user_id: string;
  notifications_enabled: boolean;
  active_hours_start_ist: number;
  active_hours_end_ist: number;
  subscription_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface ReminderRunResult {
  istTime: string;
  targetDateIst: string;
  hourSlotIst: number;
  activeUsersCount: number;
  notificationsDispatched: number;
  skippedDuplicates: number;
  details: Array<{
    userId: string;
    eventType: string;
    status: "DISPATCHED" | "DUPLICATE_SKIPPED" | "NO_ACTION" | "DELIVERY_FAILED";
    body?: string;
    message?: string;
  }>;
}


/**
 * Core Reminder Engine.
 * Operates strictly using Asia/Kolkata (IST).
 * Idempotent, duplicate-safe, and multi-device aware.
 */
export async function runReminderEngine(
  referenceDate: Date = new Date(),
  forceRun = false
): Promise<ReminderRunResult> {
  const istDetails = getISTDetails(referenceDate);
  const targetDateIst = istDetails.dateString;
  const currentHourIst = istDetails.hour;
  const hourSlotIst = getActive3HourSlotIST(referenceDate);

  const result: ReminderRunResult = {
    istTime: `${istDetails.dateString} ${String(istDetails.hour).padStart(2, "0")}:${String(istDetails.minute).padStart(2, "0")} IST`,
    targetDateIst,
    hourSlotIst,
    activeUsersCount: 0,
    notificationsDispatched: 0,
    skippedDuplicates: 0,
    details: [],
  };

  // 1. Enforce active hours (09:00 - 21:00 IST) unless explicitly forced (for testing)
  if (!forceRun && !isWithinActiveHoursIST(9, 21, referenceDate)) {
    return result;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 2. Fetch all active subscribers
  const { data: subscribers, error: subError } = await supabase.rpc(
    "get_subscribers_for_reminders"
  );

  if (subError || !subscribers) {
    console.error("[ReminderEngine] Error fetching subscribers:", subError?.message);
    return result;
  }

  // Group subscriptions by user_id
  const userMap = new Map<
    string,
    {
      preferences: {
        notificationsEnabled: boolean;
        activeHoursStart: number;
        activeHoursEnd: number;
      };
      subscriptions: PushTarget[];
    }
  >();

  for (const row of subscribers as SubscriberRow[]) {
    if (!row.notifications_enabled) continue;

    if (!userMap.has(row.user_id)) {
      userMap.set(row.user_id, {
        preferences: {
          notificationsEnabled: row.notifications_enabled,
          activeHoursStart: row.active_hours_start_ist,
          activeHoursEnd: row.active_hours_end_ist,
        },
        subscriptions: [],
      });
    }

    userMap.get(row.user_id)!.subscriptions.push({
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
    });
  }

  result.activeUsersCount = userMap.size;

  // 3. Get exact UTC boundaries for the current IST day
  const { startUtc, endUtc } = getISTDayBounds(targetDateIst);

  // 4. Process each user
  for (const [userId, userData] of userMap.entries()) {
    // Respect user's custom active hours if defined
    if (
      !forceRun &&
      (currentHourIst < userData.preferences.activeHoursStart ||
        currentHourIst > userData.preferences.activeHoursEnd)
    ) {
      result.details.push({
        userId,
        eventType: "SKIPPED_OUTSIDE_USER_HOURS",
        status: "NO_ACTION",
      });
      continue;
    }

    // Query task summary for current IST day via SECURITY DEFINER function
    const { data: summaryRows, error: tasksError } = await supabase.rpc(
      "get_user_task_summary_for_ist_date",
      {
        p_user_id: userId,
        p_start_utc: startUtc.toISOString(),
        p_end_utc: endUtc.toISOString(),
      }
    );

    if (tasksError) {
      console.error(`[ReminderEngine] Error querying tasks for ${userId}:`, tasksError.message);
      continue;
    }

    const summary = (summaryRows && summaryRows[0]) || { total_tasks: 0, completed_tasks: 0 };
    const totalTasks = summary.total_tasks || 0;
    const completedTasks = summary.completed_tasks || 0;
    const incompleteCount = totalTasks - completedTasks;


    let eventType: string | null = null;
    let slotToClaim = 0;
    let title = "";
    let body = "";

    // STATE 1: ZERO tasks created today in IST
    if (totalTasks === 0) {
      if (currentHourIst < 12) {
        // Morning initial prompt (slot 0)
        eventType = "DAILY_PROMPT";
        slotToClaim = 0;
        title = "Plan your day with YERO";
        body = "Take a moment to set your daily tasks for today.";
      } else {
        // Every 3 hours reminder if still 0 tasks
        eventType = "NO_TASKS_REMINDER";
        slotToClaim = hourSlotIst > 0 ? hourSlotIst : currentHourIst;
        title = "No tasks set for today";
        body = "You haven't set any tasks yet. Keep your momentum going by creating one!";
      }
    }
    // STATE 2: Tasks created, some incomplete remaining
    else if (incompleteCount > 0) {
      // Progress reminder every 3 hours
      eventType = "PROGRESS_REMINDER";
      slotToClaim = hourSlotIst > 0 ? hourSlotIst : currentHourIst;
      title = "Daily Tasks Progress";
      body =
        incompleteCount === 1
          ? "You have 1 task left for today."
          : `You have ${incompleteCount} tasks left for today.`;
    }
    // STATE 3: Tasks created, and ALL are completed
    else if (totalTasks > 0 && incompleteCount === 0) {
      eventType = "ALL_COMPLETED";
      slotToClaim = 0; // Once per day
      title = "All tasks completed!";
      body = "All tasks completed! Great work.";
    }

    if (!eventType) {
      result.details.push({
        userId,
        eventType: "NONE",
        status: "NO_ACTION",
      });
      continue;
    }

    // 5. ATOMIC IDEMPOTENCY CHECK VIA DATABASE
    // Calls claim_notification_slot which uses INSERT ... ON CONFLICT DO NOTHING
    const { data: claimResult, error: claimError } = await supabase.rpc(
      "claim_notification_slot",
      {
        p_user_id: userId,
        p_event_type: eventType,
        p_target_date_ist: targetDateIst,
        p_hour_slot_ist: slotToClaim,
        p_title: title,
        p_body: body,
      }
    );

    if (claimError) {
      console.error("[ReminderEngine] Error claiming slot:", claimError.message);
      continue;
    }

    const logId = claimResult;

    // If logId is null, this notification was already claimed or dispatched today!
    if (!logId) {
      result.skippedDuplicates++;
      result.details.push({
        userId,
        eventType,
        status: "DUPLICATE_SKIPPED",
        message: `Already dispatched or claimed for slot ${slotToClaim}`,
      });
      continue;
    }

    // 6. Dispatch Web Push to all devices of the user
    let dispatchSuccess = false;
    for (const sub of userData.subscriptions) {
      const sendRes = await sendPushNotification(sub, {
        title,
        body,
        url: "/",
        tag: `yero-${eventType.toLowerCase()}`,
      });
      if (sendRes.success) {
        dispatchSuccess = true;
      }
    }

    // Update log status
    await supabase.rpc("set_notification_status", {
      p_log_id: logId,
      p_status: dispatchSuccess ? "SENT" : "FAILED",
    });

    if (dispatchSuccess) {
      result.notificationsDispatched++;
      result.details.push({
        userId,
        eventType,
        status: "DISPATCHED",
        body,
        message: body,
      });
    } else {
      result.details.push({
        userId,
        eventType,
        status: "DELIVERY_FAILED",
        body,
        message: `Delivery attempted: "${body}"`,
      });
    }
  }


  return result;
}
