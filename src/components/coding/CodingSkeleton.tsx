import * as React from "react";

export function CodingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-48 bg-gray-200 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-24 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 flex flex-col justify-between ${
              i === 4 ? "col-span-2 sm:col-span-1 lg:col-span-1" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Rating Progression & Problem Solving Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-[340px] bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5" />
        <div className="h-[340px] bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5" />
      </div>

      {/* Platform Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-56 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5"
          />
        ))}
      </div>
    </div>
  );
}
