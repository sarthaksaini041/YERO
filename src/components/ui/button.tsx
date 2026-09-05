import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
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
      "inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 gap-1.5 transition-all duration-[var(--duration-fast)]";

    const variants: Record<string, string> = {
      primary:
        "bg-[var(--color-accent)] text-white shadow-[var(--shadow-xs)] hover:bg-[var(--color-accent-hover)] active:scale-[0.97]",
      secondary:
        "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-border-strong)] active:scale-[0.97]",
      outline:
        "bg-transparent text-[var(--color-accent)] border border-[var(--color-accent-border)] hover:bg-[var(--color-accent-light)] active:scale-[0.97]",
      ghost:
        "bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)] active:scale-[0.97]",
      destructive:
        "bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-[var(--color-danger-border)] hover:bg-red-100 hover:text-red-700 active:scale-[0.97]",
    };

    const sizes: Record<string, string> = {
      sm:       "h-[34px] px-3 text-[12.5px]",
      md:       "h-[38px] px-4 text-[13.5px]",
      lg:       "h-[42px] px-5 text-[14.5px]",
      icon:     "h-[38px] w-[38px] p-0",
      "icon-sm": "h-[32px] w-[32px] p-0",
      "icon-lg": "h-[42px] w-[42px] p-0",
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
