import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Initialize VAPID configuration
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const rawSubject = (process.env.VAPID_SUBJECT || "mailto:admin@yero.app").trim();
const vapidSubject =
  rawSubject.startsWith("mailto:") || rawSubject.startsWith("http://") || rawSubject.startsWith("https://")
    ? rawSubject
    : `mailto:${rawSubject}`;

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.warn("[WebPush] Failed to set VAPID details:", err);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

export interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Sends a web push notification to a target subscription.
 * Automatically prunes subscriptions that return 410 (Gone) or 404 (Not Found).
 */
export async function sendPushNotification(
  target: PushTarget,
  payload: PushPayload
): Promise<{ success: boolean; expired?: boolean; error?: string }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: "VAPID keys not configured." };
  }

  const pushSubscription = {
    endpoint: target.endpoint,
    keys: {
      p256dh: target.p256dh,
      auth: target.auth,
    },
  };

  try {
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload),
      {
        TTL: 60 * 60, // 1 hour TTL
        urgency: "normal",
      }
    );
    return { success: true };
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    const statusCode = error.statusCode;

    // 410 Gone or 404 Not Found indicates subscription expired or unregistered
    if (statusCode === 410 || statusCode === 404) {
      console.log(`[WebPush] Subscription expired (${statusCode}), pruning endpoint: ${target.endpoint.slice(0, 40)}...`);
      await pruneDeadSubscription(target.endpoint);
      return { success: false, expired: true, error: `Subscription expired (${statusCode})` };
    }

    console.error("[WebPush] Push notification failed:", error.message || error);
    return { success: false, error: error.message || "Push dispatch failed." };
  }
}

/**
 * Prunes expired or deleted push subscription endpoints using Supabase RPC.
 */
async function pruneDeadSubscription(endpoint: string): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.rpc("prune_push_subscription", {
      p_endpoint: endpoint,
    });

    if (error) {
      console.warn("[WebPush] Failed to prune subscription via RPC:", error.message);
    }
  } catch (err) {
    console.warn("[WebPush] Error pruning subscription:", err);
  }
}
