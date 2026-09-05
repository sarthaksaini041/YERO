import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Card ─────────────────────────────────────────────────────────── */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "raised" | "flat" | "bordered";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default:  "bg-white border border-[var(--color-border)] shadow-[var(--shadow-sm)]",
    raised:   "bg-white border border-[var(--color-border)] shadow-[var(--shadow-md)]",
    flat:     "bg-[var(--color-surface-muted)] border border-[var(--color-border)]",
    bordered: "bg-white border-2 border-[var(--color-border-strong)]",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl transition-shadow duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

/* ── CardHeader ───────────────────────────────────────────────────── */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 px-4 py-3 sm:px-5 sm:py-3.5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/* ── CardTitle ────────────────────────────────────────────────────── */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[15px] sm:text-[16px] font-semibold tracking-tight text-[var(--color-text-primary)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/* ── CardDescription ──────────────────────────────────────────────── */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[12.5px] text-[var(--color-text-muted)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/* ── CardContent ──────────────────────────────────────────────────── */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-4 pb-4 sm:px-5 sm:pb-4.5", className)} {...props} />
));
CardContent.displayName = "CardContent";
