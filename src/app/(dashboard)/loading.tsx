import * as React from "react";

export default function DashboardLoading() {
  return (
    <main
      className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:py-3.5 lg:py-4 max-w-4xl animate-pulse"
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="space-y-4">
        {/* ── Header Skeleton ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-36 bg-gray-200/80 rounded-lg" />
            <div className="h-5 w-24 bg-gray-100 rounded-md hidden sm:block" />
          </div>
          <div className="h-8 w-24 bg-gray-200/70 rounded-xl" />
        </div>

        {/* ── Tabs / Filters Skeleton ── */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-8 w-16 bg-gray-200/70 rounded-lg" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
        </div>

        {/* ── Cards Skeleton ── */}
        <div className="space-y-2.5 pt-2">
          <div className="h-14 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex items-center px-4 gap-3">
            <div className="w-5 h-5 rounded-md bg-gray-200/70 shrink-0" />
            <div className="h-4 bg-gray-200/70 rounded w-2/5" />
            <div className="ml-auto h-3.5 bg-gray-100 rounded w-16" />
          </div>
          <div className="h-14 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex items-center px-4 gap-3">
            <div className="w-5 h-5 rounded-md bg-gray-200/70 shrink-0" />
            <div className="h-4 bg-gray-200/70 rounded w-1/2" />
            <div className="ml-auto h-3.5 bg-gray-100 rounded w-14" />
          </div>
          <div className="h-14 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex items-center px-4 gap-3">
            <div className="w-5 h-5 rounded-md bg-gray-200/70 shrink-0" />
            <div className="h-4 bg-gray-200/70 rounded w-1/3" />
            <div className="ml-auto h-3.5 bg-gray-100 rounded w-12" />
          </div>
          <div className="h-14 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex items-center px-4 gap-3 opacity-60">
            <div className="w-5 h-5 rounded-md bg-gray-200/70 shrink-0" />
            <div className="h-4 bg-gray-200/70 rounded w-2/5" />
            <div className="ml-auto h-3.5 bg-gray-100 rounded w-16" />
          </div>
        </div>
      </div>
    </main>
  );
}
