import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "neutral" | "active" | "success";
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral: "bg-slate-100/80 text-slate-600 border-slate-200/80",
    active: "bg-slate-900 text-white border-slate-900",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
