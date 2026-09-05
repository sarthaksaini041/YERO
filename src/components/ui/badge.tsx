import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "active" | "success" | "warning" | "danger" | "info";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    neutral: "bg-gray-100 text-gray-600 border-gray-200",
    active:  "bg-[var(--color-accent-light)] text-[var(--color-accent)] border-[var(--color-accent-border)]",
    success: "bg-[var(--color-success-light)] text-[var(--color-success)] border-emerald-200",
    warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)] border-amber-200",
    danger:  "bg-[var(--color-danger-light)] text-[var(--color-danger)] border-red-200",
    info:    "bg-blue-50 text-blue-700 border-blue-200",
  };

  const dotColors: Record<string, string> = {
    neutral: "bg-gray-400",
    active:  "bg-[var(--color-accent)]",
    success: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    danger:  "bg-[var(--color-danger)]",
    info:    "bg-blue-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[12px] font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-sm shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
