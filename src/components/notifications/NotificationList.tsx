"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/actions/notifications";
import { formatISTNotificationTime, getISTDateCategory } from "@/lib/time/ist";
import {
  Calendar03Icon,
  AlertCircleIcon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Notification03Icon,
  Delete02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface NotificationListProps {
  logs: NotificationItem[];
  onDelete: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

type FilterCategory = "all" | "reminders" | "completed";

/* ── Event meta (icon + accent) ──────────────────────────────── */
function getEventMeta(eventType: string) {
  switch (eventType) {
    case "DAILY_PROMPT":
      return {
        icon: <Icon icon={Calendar03Icon} size="md" className="text-blue-600" />,
        accent: "bg-blue-50 border-blue-100 text-blue-600",
      };
    case "NO_TASKS_REMINDER":
      return {
        icon: <Icon icon={AlertCircleIcon} size="md" className="text-amber-600" />,
        accent: "bg-amber-50 border-amber-100 text-amber-600",
      };
    case "PROGRESS_REMINDER":
      return {
        icon: <Icon icon={Clock01Icon} size="md" className="text-indigo-600" />,
        accent: "bg-indigo-50 border-indigo-100 text-indigo-600",
      };
    case "ALL_COMPLETED":
      return {
        icon: <Icon icon={CheckmarkCircle01Icon} size="md" className="text-[var(--color-success)]" />,
        accent: "bg-[var(--color-success-light)] border-emerald-100 text-[var(--color-success)]",
      };
    default:
      return {
        icon: <Icon icon={Notification03Icon} size="md" className="text-[var(--color-text-muted)]" />,
        accent: "bg-gray-100 border-gray-200 text-[var(--color-text-muted)]",
      };
  }
}

/* ── NotificationList ────────────────────────────────────────── */
export function NotificationList({ logs, onDelete, onClearAll }: NotificationListProps) {
  const [filter, setFilter] = React.useState<FilterCategory>("all");
  const [isClearing, setIsClearing] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await onDelete(id); }
    finally { setDeletingId(null); }
  };

  const handleClear = async () => {
    if (!confirm("Clear all notification history?")) return;
    setIsClearing(true);
    try { await onClearAll(); }
    finally { setIsClearing(false); }
  };

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (filter === "all") return true;
      if (filter === "reminders")
        return ["DAILY_PROMPT", "NO_TASKS_REMINDER", "PROGRESS_REMINDER"].includes(log.eventType);
      if (filter === "completed") return log.eventType === "ALL_COMPLETED";
      return true;
    });
  }, [logs, filter]);

  const groupedLogs = React.useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const log of filteredLogs) {
      const groupKey = getISTDateCategory(log.sentAt);
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push(log);
    }
    return Array.from(map.entries());
  }, [filteredLogs]);

  /* Tabs */
  const filterTabs: import("@/components/ui/tabs").TabItem<FilterCategory>[] = [
    { key: "all",       label: "All",       count: logs.length },
    { key: "reminders", label: "Reminders" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-3.5">
      {/* ── Filter Bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Tabs
          tabs={filterTabs}
          activeKey={filter}
          onChange={(k) => setFilter(k as FilterCategory)}
          layoutId="notifFilter"
          fullWidth
          className="w-full sm:w-auto"
        />

        {logs.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isClearing}
            className="text-[12.5px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors duration-150 cursor-pointer disabled:opacity-50"
          >
            {isClearing ? "Clearing…" : "Clear history"}
          </button>
        )}
      </div>

      {/* ── Empty State ── */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<Icon icon={Notification03Icon} size="lg" />}
          title="No notifications"
          description={
            filter === "all"
              ? "You're all caught up. Notifications will appear here when sent."
              : `No ${filter} notifications yet.`
          }
        />
      ) : (
        /* ── Grouped Feed ── */
        <div className="space-y-3.5">
          {groupedLogs.map(([dateCategory, items]) => (
            <div key={dateCategory} className="space-y-1.5">
              {/* Date group heading */}
              <div className="px-0.5">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-faint)]">
                  {dateCategory}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((item) => {
                    const meta      = getEventMeta(item.eventType);
                    const isDeleting = deletingId === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "group relative flex items-start justify-between gap-3",
                          "py-2.5 px-3.5 sm:px-4 rounded-xl",
                          "bg-white border border-[var(--color-border)]",
                          "shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]",
                          "transition-[box-shadow] duration-150",
                          isDeleting && "opacity-40 pointer-events-none"
                        )}
                      >
                        {/* Event icon */}
                        <div
                          className={cn(
                            "w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 border",
                            meta.accent
                          )}
                        >
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[13.5px] font-semibold text-[var(--color-text-primary)] tracking-tight">
                            {item.title}
                          </h4>
                          <p className="text-[12.5px] text-[var(--color-text-muted)] leading-relaxed mt-0.5 break-words">
                            {item.body}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11.5px] text-[var(--color-text-faint)]">
                            <span>{formatISTNotificationTime(item.sentAt)}</span>
                            <span>&bull;</span>
                            <span
                              className={
                                item.status === "SENT"
                                  ? "text-[var(--color-success)] font-medium"
                                  : "text-[var(--color-danger)] font-medium"
                              }
                            >
                              {item.status === "SENT" ? "Delivered" : "Failed"}
                            </span>
                          </div>
                        </div>

                        {/* Delete */}
                        <IconButton
                          aria-label="Delete notification"
                          onClick={() => handleDelete(item.id)}
                          disabled={!!deletingId}
                          variant="danger"
                          size="sm"
                          rounded="md"
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 shrink-0 max-sm:opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          {isDeleting ? (
                            <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                          ) : (
                            <Icon icon={Delete02Icon} size="sm" />
                          )}
                        </IconButton>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
