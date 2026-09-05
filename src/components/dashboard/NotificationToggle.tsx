"use client";

import * as React from "react";
import { Bell, BellOff, Loader2, BellRing } from "lucide-react";
import {
  isPushSupported,
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from "@/lib/notifications/client-push";
import {
  getNotificationStatus,
  toggleNotificationPreference,
} from "@/actions/notifications";

export function NotificationToggle() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStatus() {
      const supported = isPushSupported();
      const currentPerm =
        supported && typeof window !== "undefined" && "Notification" in window
          ? Notification.permission
          : "default";

      try {
        const status = await getNotificationStatus();
        setIsSupported(supported);
        setPermission(currentPerm);
        setIsSubscribed(status.hasActiveSubscription && status.notificationsEnabled);
      } catch {
        setIsSupported(supported);
        setPermission(currentPerm);
      } finally {
        setIsLoading(false);
      }
    }

    loadStatus();
  }, []);


  const handleToggle = async () => {
    if (isLoading || !isSupported) return;

    // If permission was denied by browser, alert user
    if (permission === "denied") {
      alert(
        "Notifications are blocked in your browser settings. To receive daily reminders, please allow notifications for YERO in your site permissions."
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        await unsubscribeUserFromPush();
        await toggleNotificationPreference(false);
        setIsSubscribed(false);
      } else {
        // Subscribe
        const res = await subscribeUserToPush();
        setPermission(res.permission);
        if (res.success) {
          await toggleNotificationPreference(true);
          setIsSubscribed(true);
        } else if (res.permission === "denied") {
          alert("Notification permission was denied.");
        } else {
          alert(res.error || "Could not enable notifications.");
        }
      }
    } catch {
      alert("An unexpected error occurred while updating notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  const isBlocked = permission === "denied";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={
        isBlocked
          ? "Notifications blocked in browser"
          : isSubscribed
          ? "Daily task reminders active (click to mute)"
          : "Enable daily task reminders"
      }
      title={
        isBlocked
          ? "Notifications blocked in browser settings"
          : isSubscribed
          ? "Daily task reminders active (click to mute)"
          : "Enable daily task reminders"
      }
      className={`relative w-8 h-8 rounded-full liquid-glass-card border border-white/90 shadow-2xs flex items-center justify-center transition-all cursor-pointer ${
        isSubscribed
          ? "text-slate-900 bg-white/95 hover:bg-white"
          : "text-slate-500 hover:text-slate-900 hover:bg-white/90"
      } active:scale-95`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
      ) : isBlocked ? (
        <BellOff className="w-3.5 h-3.5 text-rose-500/80" />
      ) : isSubscribed ? (
        <>
          <BellRing className="w-3.5 h-3.5 text-slate-900" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
        </>
      ) : (
        <Bell className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
