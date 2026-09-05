"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  isPushSupported,
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from "@/lib/notifications/client-push";
import {
  getNotificationStatus,
  toggleNotificationPreference,
} from "@/actions/notifications";
import {
  Notification03Icon,
  NotificationOffIcon,
  NotificationSnooze01Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  Loading03Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

export interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (enabled: boolean) => void;
}

export function NotificationPreferencesModal({
  isOpen,
  onClose,
  onStatusChange,
}: NotificationPreferencesModalProps) {
  const [, setIsSupported] = React.useState(true);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load latest notification status when modal opens
  React.useEffect(() => {
    if (!isOpen) return;

    async function loadStatus() {
      setIsLoading(true);
      setError(null);
      const supported = isPushSupported();
      const currentPerm =
        supported && typeof window !== "undefined" && "Notification" in window
          ? Notification.permission
          : "default";

      setIsSupported(supported);
      setPermission(currentPerm);

      try {
        const status = await getNotificationStatus();
        setIsSubscribed(status.hasActiveSubscription && status.notificationsEnabled);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadStatus();
  }, [isOpen]);

  const handleMute = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await unsubscribeUserFromPush();
      const res = await toggleNotificationPreference(false);
      if (res.success) {
        setIsSubscribed(false);
        onStatusChange?.(false);
        onClose();
      } else {
        setError(res.error || "Failed to mute notifications.");
      }
    } catch {
      setError("An unexpected error occurred while muting alerts.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnmute = async () => {
    if (isSubmitting) return;

    if (permission === "denied") {
      setError("Notifications are blocked in your browser site settings.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const subRes = await subscribeUserToPush();
      setPermission(subRes.permission);

      if (subRes.success) {
        await toggleNotificationPreference(true);
        setIsSubscribed(true);
        onStatusChange?.(true);
        onClose();
      } else if (subRes.permission === "denied") {
        setError("Notification permission was denied. Please allow notifications in your browser settings.");
      } else {
        setError(subRes.error || "Could not enable notifications.");
      }
    } catch {
      setError("An unexpected error occurred while enabling alerts.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBlocked = permission === "denied";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      icon={
        isBlocked ? (
          <Icon icon={NotificationOffIcon} size="sm" className="text-[var(--color-danger)]" />
        ) : isSubscribed ? (
          <Icon icon={Notification03Icon} size="sm" className="text-[var(--color-accent)]" />
        ) : (
          <Icon icon={NotificationSnooze01Icon} size="sm" className="text-[var(--color-text-muted)]" />
        )
      }
      title="Daily Task Reminders"
      description="Manage automated push alerts for your daily tasks"
    >
      <div className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-[var(--color-danger-border)] text-[12.5px] text-[var(--color-danger)] font-medium"
          >
            <Icon icon={Alert01Icon} size="xs" className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Status Card */}
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[var(--color-text-muted)]">
              Current Status
            </span>

            {isLoading ? (
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                <span>Checking…</span>
              </div>
            ) : isBlocked ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-danger-light)] text-[var(--color-danger)] text-[11px] font-semibold border border-[var(--color-danger-border)]">
                <Icon icon={Alert01Icon} size="xs" />
                Blocked in Browser
              </span>
            ) : isSubscribed ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-success-light)] text-[var(--color-success)] text-[11px] font-semibold border border-[var(--color-success-border)]">
                <Icon icon={CheckmarkCircle01Icon} size="xs" />
                Active · Unmuted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface)] text-[var(--color-text-muted)] text-[11px] font-semibold border border-[var(--color-border)]">
                <Icon icon={NotificationSnooze01Icon} size="xs" />
                Muted
              </span>
            )}
          </div>

          <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed">
            {isBlocked
              ? "Notifications are blocked in your browser site permissions. To receive reminders, click the tune/lock icon in your address bar and allow notifications."
              : isSubscribed
              ? "Reminders are currently active. You will receive gentle prompts on this device when you have unfinished tasks."
              : "Reminders are currently muted. You will not receive push notifications for active tasks on this device."}
          </p>
        </div>

        {/* Schedule Info */}
        {!isBlocked && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-text-secondary)]">
              <Icon icon={Clock01Icon} size="xs" className="text-[var(--color-text-muted)]" />
              <span>Reminder Times (IST · UTC+05:30)</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11.5px]">
              <div className="p-2 rounded-[var(--radius-md)] bg-white border border-[var(--color-border)]">
                <span className="block font-semibold text-[var(--color-text-primary)]">09:00 AM</span>
                <span className="text-[10px] text-[var(--color-text-faint)]">Morning Kickoff</span>
              </div>
              <div className="p-2 rounded-[var(--radius-md)] bg-white border border-[var(--color-border)]">
                <span className="block font-semibold text-[var(--color-text-primary)]">02:00 PM</span>
                <span className="text-[10px] text-[var(--color-text-faint)]">Mid-day Check</span>
              </div>
              <div className="p-2 rounded-[var(--radius-md)] bg-white border border-[var(--color-border)]">
                <span className="block font-semibold text-[var(--color-text-primary)]">08:00 PM</span>
                <span className="text-[10px] text-[var(--color-text-faint)]">Evening Wrap</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--color-border)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          {isBlocked ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          ) : isSubscribed ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleMute}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                  Muting…
                </>
              ) : (
                <>
                  <Icon icon={NotificationSnooze01Icon} size="xs" />
                  Mute Alerts
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleUnmute}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                  Enabling…
                </>
              ) : (
                <>
                  <Icon icon={Notification03Icon} size="xs" />
                  Unmute & Enable
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
