import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

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
        "flex flex-col items-center justify-center text-center",
        "py-12 px-6 sm:py-16",
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] border-dashed bg-white",
        className
      )}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center mb-4 text-[var(--color-text-faint)]">
        {icon}
      </div>

      <p className="text-[14.5px] font-semibold text-[var(--color-text-primary)] mb-1.5">
        {title}
      </p>

      {description && (
        <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed max-w-[280px]">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
