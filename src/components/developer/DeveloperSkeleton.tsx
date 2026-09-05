"use client";

import * as React from "react";

export function DeveloperSkeleton() {
  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-3.5 sm:space-y-4 pb-10 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-48 bg-[var(--color-surface-muted)] rounded-lg" />
          <div className="h-5 w-24 bg-[var(--color-surface-muted)] rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-32 bg-[var(--color-surface-muted)] rounded-lg" />
          <div className="h-7 w-24 bg-[var(--color-surface-muted)] rounded-lg" />
        </div>
      </div>

      {/* 1. Profile Bar Skeleton */}
      <div className="p-4 sm:p-4.5 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--color-surface-muted)] shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-44 bg-[var(--color-surface-muted)] rounded-md" />
            <div className="h-3 w-64 bg-[var(--color-surface-muted)] rounded-md" />
            <div className="h-2.5 w-48 bg-[var(--color-surface-muted)] rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-28 bg-[var(--color-surface-muted)] rounded-lg" />
        </div>
      </div>

      {/* 2. 7 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3">
        {Array.from({ length: 7 }).map((_, i) => {
          const spanClass =
            i === 0 ? "col-span-2 sm:col-span-2 xl:col-span-1" : "col-span-1";

          return (
            <div
              key={i}
              className={`h-20 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-3 sm:p-3.5 flex flex-col justify-between ${spanClass}`}
            >
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-14 bg-[var(--color-surface-muted)] rounded" />
                <div className="h-5 w-5 rounded-md bg-[var(--color-surface-muted)]" />
              </div>
              <div className="space-y-1">
                <div className="h-5 w-12 bg-[var(--color-surface-muted)] rounded" />
                <div className="h-2 w-16 bg-[var(--color-surface-muted)] rounded" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Heatmap Skeleton */}
      <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-4 sm:p-4.5 space-y-3">
        <div className="flex justify-between items-center pb-2.5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="h-4 w-36 bg-[var(--color-surface-muted)] rounded" />
            <div className="h-5 w-24 bg-[var(--color-surface-muted)] rounded-full" />
          </div>
          <div className="h-6 w-36 bg-[var(--color-surface-muted)] rounded-md" />
        </div>
        <div className="h-28 w-full bg-[var(--color-surface-muted)] rounded-md" />
      </div>

      {/* 4. Engineering Analytics & Activity Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Languages (5 cols) */}
        <div className="lg:col-span-5 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-4 sm:p-4.5 space-y-3">
          <div className="h-4 w-36 bg-[var(--color-surface-muted)] rounded" />
          <div className="h-2.5 w-full bg-[var(--color-surface-muted)] rounded-full" />
          <div className="grid grid-cols-2 gap-2 pt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 bg-[var(--color-surface-muted)] rounded-md" />
            ))}
          </div>
        </div>

        {/* Velocity (7 cols) */}
        <div className="lg:col-span-7 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-4 sm:p-4.5 space-y-3">
          <div className="h-4 w-40 bg-[var(--color-surface-muted)] rounded" />
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="h-20 bg-[var(--color-surface-muted)] rounded-md" />
            <div className="h-20 bg-[var(--color-surface-muted)] rounded-md" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="h-9 bg-[var(--color-surface-muted)] rounded-md" />
            <div className="h-9 bg-[var(--color-surface-muted)] rounded-md" />
            <div className="h-9 bg-[var(--color-surface-muted)] rounded-md" />
          </div>
        </div>

        {/* Activity Feed (7 cols) */}
        <div className="lg:col-span-7 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-4 sm:p-4.5 space-y-3">
          <div className="h-4 w-32 bg-[var(--color-surface-muted)] rounded" />
          <div className="space-y-2 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-[var(--color-surface-muted)] rounded-md" />
            ))}
          </div>
        </div>

        {/* PRs & Issues (5 cols) */}
        <div className="lg:col-span-5 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-4 sm:p-4.5 space-y-3">
          <div className="h-4 w-28 bg-[var(--color-surface-muted)] rounded" />
          <div className="space-y-2 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-[var(--color-surface-muted)] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
