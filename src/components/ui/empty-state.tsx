import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState — consistent empty state display across all list pages.
 *
 * Usage:
 *   import { EmptyState } from "@/components/ui/empty-state";
 *   import { Icon } from "@/components/ui/icon";
 *   import { ListViewIcon } from "@hugeicons/core-free-icons";
 *
 *   <EmptyState
 *     icon={<Icon icon={ListViewIcon} size="lg" />}
 *     title="No tasks yet"
 *     description="Add your first task to get started."
 *   />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-7 px-4 sm:py-8 sm:px-5",
        "rounded-xl sm:rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)]",
        className
      )}
    >
      {/* Icon container — rounded-square */}
      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex items-center justify-center mb-2.5 text-[var(--color-text-secondary)]">
        {icon}
      </div>

      <p className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-0.5">
        {title}
      </p>

      {description && (
        <p className="text-[12.5px] text-[var(--color-text-muted)] leading-relaxed max-w-[260px]">
          {description}
        </p>
      )}

      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}
