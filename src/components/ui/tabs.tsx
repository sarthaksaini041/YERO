"use client";

/**
 * Tabs — shared segmented tab control with animated sliding indicator.
 *
 * Usage:
 *   <Tabs
 *     tabs={[
 *       { key: "all", label: "All", count: 5 },
 *       { key: "active", label: "Active", count: 3 },
 *     ]}
 *     activeKey="all"
 *     onChange={(key) => setFilter(key)}
 *   />
 */
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  layoutId?: string;
  className?: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export function Tabs<T extends string = string>({
  tabs,
  activeKey,
  onChange,
  layoutId = "activeTab",
  className,
  size = "md",
  fullWidth = false,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "items-center p-0.5 bg-gray-100 border border-[var(--color-border)] relative",
        size === "sm" ? "rounded-lg" : "rounded-xl",
        fullWidth ? "flex w-full" : "inline-flex",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={(e) => {
              e.currentTarget.blur();
              onChange(tab.key);
            }}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-lg font-medium cursor-pointer select-none transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1",
              "[-webkit-tap-highlight-color:transparent]",
              fullWidth ? "flex-1" : "shrink-0",
              size === "sm"
                ? "px-2.5 py-1 text-[12px]"
                : "px-3 py-1 text-[12.5px] sm:text-[13px]",
              isActive
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            {/* Sliding background pill */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-white rounded-lg shadow-[var(--shadow-xs)]"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}

            <span className="relative z-10">{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={cn(
                  "relative z-10 px-1.5 py-0.5 rounded-md text-[11px] font-medium transition-colors duration-150",
                  isActive
                    ? "bg-gray-100 text-[var(--color-text-secondary)]"
                    : "bg-gray-200/70 text-[var(--color-text-faint)]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
