"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
  BellRing,
  Loader2,
} from "lucide-react";
import type { NotificationItem } from "@/actions/notifications";
import { formatISTNotificationTime, getISTDateCategory } from "@/lib/time/ist";

interface NotificationListProps {
  logs: NotificationItem[];
  onDelete: (id: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

type FilterCategory = "all" | "reminders" | "completed";

export function NotificationList({
  logs,
  onDelete,
  onClearAll,
}: NotificationListProps) {
  const [filter, setFilter] = React.useState<FilterCategory>("all");
  const [isClearing, setIsClearing] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClear = async () => {
    if (!confirm("Clear all notification history?")) {
      return;
    }
    setIsClearing(true);
    try {
      await onClearAll();
    } finally {
      setIsClearing(false);
    }
  };

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (filter === "all") return true;
      if (filter === "reminders") {
        return (
          log.eventType === "DAILY_PROMPT" ||
          log.eventType === "NO_TASKS_REMINDER" ||
          log.eventType === "PROGRESS_REMINDER"
        );
      }
      if (filter === "completed") {
        return log.eventType === "ALL_COMPLETED";
      }
      return true;
    });
  }, [logs, filter]);

  // Group by IST date
  const groupedLogs = React.useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const log of filteredLogs) {
      const groupKey = getISTDateCategory(log.sentAt);
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey)!.push(log);
    }
    return Array.from(map.entries());
  }, [filteredLogs]);

  // Icon and subtle accent based on event type
  const getEventMeta = (eventType: string) => {
    switch (eventType) {
      case "DAILY_PROMPT":
        return {
          icon: <Calendar className="w-4 h-4 text-blue-600" />,
          bgColor: "bg-blue-50/80 border-blue-200/60",
        };
      case "NO_TASKS_REMINDER":
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
          bgColor: "bg-amber-50/80 border-amber-200/60",
        };
      case "PROGRESS_REMINDER":
        return {
          icon: <Clock className="w-4 h-4 text-indigo-600" />,
          bgColor: "bg-indigo-50/80 border-indigo-200/60",
        };
      case "ALL_COMPLETED":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          bgColor: "bg-emerald-50/80 border-emerald-200/60",
        };
      case "TEST_NOTIFICATION":
      default:
        return {
          icon: <BellRing className="w-4 h-4 text-slate-700" />,
          bgColor: "bg-slate-100/80 border-slate-200/60",
        };
    }
  };

  const tabs: { key: FilterCategory; label: string }[] = [
    { key: "all", label: `All (${logs.length})` },
    { key: "reminders", label: "Reminders" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-4">
      {/* Category Tabs & Subtle Clear Action */}
      <div className="flex items-center justify-between gap-3">
        {/* Filter Capsule */}
        <div className="inline-flex p-1 rounded-full liquid-glass-card border border-white/90 shadow-2xs">
          {tabs.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`relative px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "text-slate-900 bg-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Subtle & Secondary Clear Action */}
        {logs.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isClearing}
            className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear history"}
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 ? (
        <div className="liquid-glass-card rounded-[22px] p-8 sm:p-10 border border-white/90 shadow-2xs text-center space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/80 border border-slate-200/60 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
            <BellRing className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            No notifications
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {filter === "all"
              ? "You're all caught up. Notifications will appear here when sent."
              : `No notifications under '${filter}'.`}
          </p>
        </div>
      ) : (
        /* Chronological Feed Grouped by IST Date */
        <div className="space-y-5">
          {groupedLogs.map(([dateCategory, items]) => (
            <div key={dateCategory} className="space-y-2">
              {/* Date Group Heading */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                  {dateCategory}
                </span>
                <div className="h-px flex-1 bg-slate-200/40" />
              </div>

              {/* Items in this date group */}
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
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="group relative liquid-glass-card rounded-2xl p-4 border border-white/90 shadow-2xs hover:shadow-xs transition-all flex items-start justify-between gap-3.5"
                      >
                        {/* Event Icon & Content */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.bgColor}`}
                          >
                            {meta.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-slate-900 tracking-tight">
                              {item.title}
                            </h4>

                            <p className="text-xs text-slate-600 leading-relaxed mt-1 break-words">
                              {item.body}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                              <span>{formatISTNotificationTime(item.sentAt)}</span>
                              <span>&bull;</span>
                              <span
                                className={
                                  item.status === "SENT"
                                    ? "text-emerald-600"
                                    : "text-rose-500"
                                }
                              >
                                {item.status === "SENT" ? "Delivered" : "Delivery Attempted"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Subtle Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                          aria-label="Delete notification"
                          title="Delete"
                          className="opacity-50 group-hover:opacity-100 sm:opacity-0 focus:opacity-100 w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 active:scale-90 transition-all flex items-center justify-center cursor-pointer shrink-0"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
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
