import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
  "aria-label": string; // Required for accessibility
}

/**
 * IconButton — reusable icon-only button with rounded-square shape,
 * consistent sizing, hover/focus states, and centered icon alignment.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      rounded = "lg",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 active:scale-95";

    const variants: Record<string, string> = {
      default: "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] hover:bg-gray-50 hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]",
      ghost:   "bg-transparent text-[var(--color-text-muted)] hover:bg-gray-100 hover:text-[var(--color-text-primary)]",
      danger:  "bg-transparent text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-danger)]",
    };

    const sizes: Record<string, string> = {
      sm: "w-8 h-8",
      md: "w-9 h-9",
      lg: "w-10 h-10",
    };

    // Rounded-square shapes (10px–14px corner radius)
    const radii: Record<string, string> = {
      sm:   "rounded-lg",
      md:   "rounded-lg",
      lg:   "rounded-xl",
      xl:   "rounded-2xl",
      full: "rounded-xl", // Mapped to rounded-square to eliminate circular buttons
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          radii[rounded],
          "transition-[background-color,color,border-color,transform] duration-150",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
