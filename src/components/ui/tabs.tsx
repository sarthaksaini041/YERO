"use client";

/**
 * Tabs — segmented tab control with animated sliding pill indicator.
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
        "relative flex items-center p-1 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border)]",
        fullWidth ? "w-full" : "inline-flex",
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
              "relative flex items-center justify-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] font-medium cursor-pointer select-none transition-colors duration-[var(--duration-base)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1",
              "[-webkit-tap-highlight-color:transparent]",
              fullWidth ? "flex-1" : "shrink-0",
              size === "sm"
                ? "px-3 py-1.5 text-[12px]"
                : "px-3.5 py-1.5 text-[12.5px] sm:text-[13px]",
              isActive
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            {/* Sliding background pill */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-white rounded-[calc(var(--radius-md)-2px)] shadow-[var(--shadow-sm)] border border-[var(--color-border)]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}

            <span className="relative z-10">{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={cn(
                  "relative z-10 px-1.5 py-0.5 rounded-md text-[10.5px] font-semibold transition-colors duration-150 min-w-[20px] text-center",
                  isActive
                    ? "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
                    : "bg-[var(--color-border)] text-[var(--color-text-faint)]"
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
