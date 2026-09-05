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

function getEventMeta(eventType: string) {
  switch (eventType) {
    case "DAILY_PROMPT":
      return { icon: <Icon icon={Calendar03Icon} size="sm" className="text-blue-600" />, bg: "bg-blue-50 border-blue-100" };
    case "NO_TASKS_REMINDER":
      return { icon: <Icon icon={AlertCircleIcon} size="sm" className="text-amber-600" />, bg: "bg-amber-50 border-amber-100" };
    case "PROGRESS_REMINDER":
      return { icon: <Icon icon={Clock01Icon} size="sm" className="text-indigo-600" />, bg: "bg-indigo-50 border-indigo-100" };
    case "ALL_COMPLETED":
      return { icon: <Icon icon={CheckmarkCircle01Icon} size="sm" className="text-emerald-600" />, bg: "bg-emerald-50 border-emerald-100" };
    default:
      return { icon: <Icon icon={Notification03Icon} size="sm" className="text-[var(--color-text-muted)]" />, bg: "bg-[var(--color-surface-muted)] border-[var(--color-border)]" };
  }
}

export function NotificationList({ logs, onDelete, onClearAll }: NotificationListProps) {
  const [filter, setFilter] = React.useState<FilterCategory>("all");
  const [isClearing, setIsClearing] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await onDelete(id); } finally { setDeletingId(null); }
  };

  const handleClear = async () => {
    if (!confirm("Clear all notification history?")) return;
    setIsClearing(true);
    try { await onClearAll(); } finally { setIsClearing(false); }
  };

  const filteredLogs = React.useMemo(() =>
    logs.filter((log) => {
      if (filter === "all") return true;
      if (filter === "reminders") return ["DAILY_PROMPT", "NO_TASKS_REMINDER", "PROGRESS_REMINDER"].includes(log.eventType);
      if (filter === "completed") return log.eventType === "ALL_COMPLETED";
      return true;
    }), [logs, filter]);

  const groupedLogs = React.useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const log of filteredLogs) {
      const key = getISTDateCategory(log.sentAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    }
    return Array.from(map.entries());
  }, [filteredLogs]);

  const filterTabs: import("@/components/ui/tabs").TabItem<FilterCategory>[] = [
    { key: "all",       label: "All",       count: logs.length },
    { key: "reminders", label: "Reminders" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-heading-xl">Notifications</h1>
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isClearing}
            className="text-[12.5px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isClearing ? "Clearing…" : "Clear all"}
          </button>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div>
        <Tabs
          tabs={filterTabs}
          activeKey={filter}
          onChange={(k) => setFilter(k as FilterCategory)}
          layoutId="notifFilter"
        />
      </div>

      {/* ── Notification Feed ── */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<Icon icon={Notification03Icon} size="lg" />}
          title="No notifications"
          description={filter === "all" ? "You're all caught up." : `No ${filter} notifications.`}
        />
      ) : (
        <div className="space-y-6">
          {groupedLogs.map(([dateCategory, items]) => (
            <div key={dateCategory} className="space-y-2">
              {/* Date divider */}
              <div className="flex items-center gap-3">
                <span className="text-micro">{dateCategory}</span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((item) => {
                    const meta = getEventMeta(item.eventType);
                    const isDeleting = deletingId === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "group flex items-start gap-3.5 px-4 py-3.5",
                          "bg-white rounded-[var(--radius-md)] border border-[var(--color-border)]",
                          "shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]",
                          "transition-[box-shadow,opacity] duration-150",
                          isDeleting && "opacity-40 pointer-events-none"
                        )}
                      >
                        <div className={cn("w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 border", meta.bg)}>
                          {meta.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-semibold text-[var(--color-text-primary)] leading-tight">{item.title}</p>
                          <p className="text-[12.5px] text-[var(--color-text-muted)] leading-relaxed mt-0.5 break-words">{item.body}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11.5px] text-[var(--color-text-faint)]">
                            <span>{formatISTNotificationTime(item.sentAt)}</span>
                            <span>·</span>
                            <span className={item.status === "SENT" ? "text-[var(--color-success)] font-medium" : "text-[var(--color-danger)] font-medium"}>
                              {item.status === "SENT" ? "Delivered" : "Failed"}
                            </span>
                          </div>
                        </div>

                        <IconButton
                          aria-label="Delete notification"
                          onClick={() => handleDelete(item.id)}
                          disabled={!!deletingId}
                          variant="danger"
                          size="sm"
                          rounded="md"
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 shrink-0"
                        >
                          {isDeleting
                            ? <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                            : <Icon icon={Delete02Icon} size="sm" />}
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
