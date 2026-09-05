"use client";

import * as React from "react";
import {
  isPushSupported,
} from "@/lib/notifications/client-push";
import {
  getNotificationStatus,
} from "@/actions/notifications";
import { IconButton } from "@/components/ui/icon-button";
import { Icon } from "@/components/ui/icon";
import {
  Notification03Icon,
  NotificationOffIcon,
  Loading03Icon,
  NotificationSnooze01Icon,
} from "@hugeicons/core-free-icons";
import { NotificationPreferencesModal } from "@/components/notifications/NotificationPreferencesModal";

export function NotificationToggle() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const checkStatus = React.useCallback(async () => {
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
  }, []);

  React.useEffect(() => {
    let mounted = true;
    async function init() {
      const supported = isPushSupported();
      const currentPerm =
        supported && typeof window !== "undefined" && "Notification" in window
          ? Notification.permission
          : "default";

      try {
        const status = await getNotificationStatus();
        if (mounted) {
          setIsSupported(supported);
          setPermission(currentPerm);
          setIsSubscribed(status.hasActiveSubscription && status.notificationsEnabled);
        }
      } catch {
        if (mounted) {
          setIsSupported(supported);
          setPermission(currentPerm);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isSupported) return null;

  const isBlocked = permission === "denied";

  const ariaLabel = isBlocked
    ? "Notifications blocked in browser - click to view details"
    : isSubscribed
    ? "Daily reminders active - click to manage or mute"
    : "Daily reminders muted - click to enable";

  return (
    <>
      <div className="relative">
        <IconButton
          aria-label={ariaLabel}
          title={ariaLabel}
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
          variant="default"
          size="md"
          rounded="lg"
          className={isSubscribed ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}
        >
          {isLoading ? (
            <Icon icon={Loading03Icon} size="sm" className="animate-spin" />
          ) : isBlocked ? (
            <Icon icon={NotificationOffIcon} size="sm" className="text-[var(--color-danger)]" />
          ) : isSubscribed ? (
            <Icon icon={Notification03Icon} size="sm" />
          ) : (
            <Icon icon={NotificationSnooze01Icon} size="sm" />
          )}
        </IconButton>

        {/* Active indicator dot */}
        {isSubscribed && !isLoading && (
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-success)] ring-2 ring-white pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Mute/Unmute Alerts Modal */}
      <NotificationPreferencesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          checkStatus();
        }}
        onStatusChange={(enabled) => {
          setIsSubscribed(enabled);
        }}
      />
    </>
  );
}
