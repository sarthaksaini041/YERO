"use client";

import * as React from "react";
import {
  isPushSupported,
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from "@/lib/notifications/client-push";
import {
  getNotificationStatus,
  toggleNotificationPreference,
} from "@/actions/notifications";
import { IconButton } from "@/components/ui/icon-button";
import { Icon } from "@/components/ui/icon";
import {
  Notification03Icon,
  NotificationOffIcon,
  Loading03Icon,
  NotificationSnooze01Icon,
} from "@hugeicons/core-free-icons";

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

    if (permission === "denied") {
      alert(
        "Notifications are blocked in your browser settings. To receive daily reminders, please allow notifications for YERO in your site permissions."
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isSubscribed) {
        await unsubscribeUserFromPush();
        await toggleNotificationPreference(false);
        setIsSubscribed(false);
      } else {
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

  if (!isSupported) return null;

  const isBlocked = permission === "denied";

  const ariaLabel = isBlocked
    ? "Notifications blocked in browser"
    : isSubscribed
    ? "Mute daily task reminders"
    : "Enable daily task reminders";

  return (
    <div className="relative">
      <IconButton
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={handleToggle}
        disabled={isLoading}
        variant="default"
        size="md"
        rounded="lg"
        className={isSubscribed ? "text-[var(--color-accent)]" : ""}
      >
        {isLoading ? (
          <Icon icon={Loading03Icon} size="sm" className="animate-spin" />
        ) : isBlocked ? (
          <Icon icon={NotificationOffIcon} size="sm" className="text-[var(--color-danger)]" />
        ) : isSubscribed ? (
          <Icon icon={NotificationSnooze01Icon} size="sm" />
        ) : (
          <Icon icon={Notification03Icon} size="sm" />
        )}
      </IconButton>

      {/* Active indicator dot */}
      {isSubscribed && !isLoading && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-sm bg-[var(--color-success)] ring-2 ring-white pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
