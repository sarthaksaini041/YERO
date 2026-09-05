"use client";

/**
 * NotificationBootstrap
 *
 * Silently attempts to subscribe the logged-in user to push notifications
 * on first app load. Fires once per session if permission hasn't been
 * granted yet. Does nothing if already subscribed or if push is unsupported.
 */
import * as React from "react";
import {
  isPushSupported,
  subscribeUserToPush,
} from "@/lib/notifications/client-push";
import {
  getNotificationStatus,
  toggleNotificationPreference,
} from "@/actions/notifications";

const SESSION_KEY = "yero_notif_bootstrapped";

export function NotificationBootstrap() {
  React.useEffect(() => {
    // Only run once per browser session
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");

    if (!isPushSupported()) return;

    // Already denied by user — don't re-prompt
    if (Notification.permission === "denied") return;

    // Already granted + subscribed — nothing to do
    if (Notification.permission === "granted") {
      getNotificationStatus()
        .then(async (status) => {
          if (status.hasActiveSubscription && status.notificationsEnabled) return;
          // Granted but not yet subscribed on server — silently subscribe
          const res = await subscribeUserToPush();
          if (res.success) {
            await toggleNotificationPreference(true);
          }
        })
        .catch(() => {});
      return;
    }

    // Permission is "default" — trigger the browser prompt
    // Small delay so the page renders first (better UX than instant prompt)
    const timer = setTimeout(async () => {
      try {
        const res = await subscribeUserToPush();
        if (res.success) {
          await toggleNotificationPreference(true);
        }
      } catch {
        // Silently ignore — user may have dismissed or it's unsupported
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null; // Renders nothing
}
