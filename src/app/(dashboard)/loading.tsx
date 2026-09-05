import * as React from "react";

export default function DashboardLoading() {
  return (
    <main
      className="flex-1 w-full px-5 pt-5 pb-28 sm:px-7 sm:pt-6 sm:pb-32 lg:px-10 lg:py-8 animate-pulse"
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="space-y-5">
        {/* ── Page Hero Skeleton ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2.5">
            {/* Title */}
            <div className="h-7 w-40 bg-[var(--color-border)] rounded-lg" />
            {/* Date + progress meta */}
            <div className="h-4 w-28 bg-[var(--color-surface-muted)] rounded-md" />
            {/* Progress bar */}
            <div className="h-1.5 w-52 bg-[var(--color-surface-muted)] rounded-full" />
          </div>
          {/* Add button skeleton */}
          <div className="h-[38px] w-28 bg-[var(--color-border)] rounded-[var(--radius-md)]" />
        </div>

        {/* ── Filter Tabs Skeleton ── */}
        <div className="h-[38px] w-56 bg-[var(--color-surface-muted)] rounded-[var(--radius-md)] border border-[var(--color-border)]" />

        {/* ── Task Cards Skeleton ── */}
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-md)] bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)]"
              style={{ opacity: 1 - i * 0.15 }}
            >
              {/* Checkbox */}
              <div className="w-5 h-5 rounded-md bg-[var(--color-border)] shrink-0" />
              {/* Title */}
              <div
                className="h-4 bg-[var(--color-border)] rounded"
                style={{ width: `${[45, 60, 35, 50][i]}%` }}
              />
              {/* Time */}
              <div className="ml-auto h-3.5 w-14 bg-[var(--color-surface-muted)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
