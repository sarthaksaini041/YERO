import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2";

    const variants: Record<string, string> = {
      primary:
        "bg-[var(--color-accent)] text-white shadow-[var(--shadow-xs)] hover:bg-[var(--color-accent-hover)] active:scale-[0.98]",
      secondary:
        "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] hover:bg-gray-50 hover:border-[var(--color-border-strong)] active:scale-[0.98]",
      ghost:
        "bg-transparent text-[var(--color-text-muted)] hover:bg-gray-100 hover:text-[var(--color-text-primary)] active:scale-[0.98]",
      destructive:
        "bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-red-200 hover:bg-red-100 hover:text-red-700 active:scale-[0.98]",
    };

    const sizes: Record<string, string> = {
      sm:      "h-8 px-3 text-[12.5px] gap-1.5",
      md:      "h-9 px-3.5 text-[13.5px] gap-1.5",
      lg:      "h-10.5 px-4.5 text-[14.5px] gap-2",
      icon:    "h-9 w-9 p-0",
      "icon-sm": "h-7.5 w-7.5 p-0",
      "icon-lg": "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
