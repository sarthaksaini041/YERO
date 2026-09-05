"use client";

import * as React from "react";

export function DeveloperSkeleton() {
  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-7 lg:space-y-8 pb-16 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-[var(--color-surface-muted)] rounded-lg" />
          <div className="h-4 w-80 bg-[var(--color-surface-muted)] rounded-md" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-8 w-36 bg-[var(--color-surface-muted)] rounded-lg" />
          <div className="h-8 w-28 bg-[var(--color-surface-muted)] rounded-lg" />
        </div>
      </div>

      {/* 1. Profile Bar Skeleton */}
      <div className="p-5 sm:p-6 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[var(--color-surface-muted)] shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-[var(--color-surface-muted)] rounded-md" />
            <div className="h-3.5 w-72 bg-[var(--color-surface-muted)] rounded-md" />
            <div className="h-3 w-60 bg-[var(--color-surface-muted)] rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 bg-[var(--color-surface-muted)] rounded-lg" />
          <div className="h-10 w-28 bg-[var(--color-surface-muted)] rounded-lg" />
        </div>
      </div>

      {/* 2. 7 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-3.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`h-24 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-4 flex flex-col justify-between ${
              i === 6 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-[var(--color-surface-muted)] rounded" />
              <div className="h-6 w-6 rounded-md bg-[var(--color-surface-muted)]" />
            </div>
            <div className="space-y-1">
              <div className="h-6 w-14 bg-[var(--color-surface-muted)] rounded" />
              <div className="h-2.5 w-20 bg-[var(--color-surface-muted)] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Heatmap Skeleton */}
      <div className="h-64 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
          <div className="h-4 w-44 bg-[var(--color-surface-muted)] rounded" />
          <div className="h-7 w-48 bg-[var(--color-surface-muted)] rounded-md" />
        </div>
        <div className="grid grid-cols-4 gap-3 my-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-[var(--color-surface-muted)] rounded-md" />
          ))}
        </div>
        <div className="h-28 w-full bg-[var(--color-surface-muted)] rounded-md" />
      </div>

      {/* 4. Development Analytics Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-6 h-72 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-5 sm:p-6 space-y-4">
          <div className="h-4 w-40 bg-[var(--color-surface-muted)] rounded" />
          <div className="h-3 w-full bg-[var(--color-surface-muted)] rounded-full" />
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-[var(--color-surface-muted)] rounded-md" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 h-72 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-5 sm:p-6 space-y-4">
          <div className="h-4 w-44 bg-[var(--color-surface-muted)] rounded" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-24 bg-[var(--color-surface-muted)] rounded-md" />
            <div className="h-24 bg-[var(--color-surface-muted)] rounded-md" />
          </div>
          <div className="h-10 bg-[var(--color-surface-muted)] rounded-md" />
        </div>
      </div>

      {/* 5. Activity Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7 h-80 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-5 sm:p-6 space-y-4">
          <div className="h-4 w-36 bg-[var(--color-surface-muted)] rounded" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-[var(--color-surface-muted)] rounded-md" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 h-80 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] p-5 sm:p-6 space-y-4">
          <div className="h-4 w-32 bg-[var(--color-surface-muted)] rounded" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-[var(--color-surface-muted)] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
