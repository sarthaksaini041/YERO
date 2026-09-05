import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base
          "flex h-9.5 sm:h-10 w-full rounded-xl px-3 py-2 text-[14px] text-[var(--color-text-primary)]",
          // Background & border
          "bg-white border border-[var(--color-border)]",
          // Placeholder
          "placeholder:text-[var(--color-text-faint)]",
          // Focus — clean indigo ring, no glow
          "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)] focus:ring-offset-0",
          // States
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          // Shadow
          "shadow-[var(--shadow-xs)]",
          // Transition
          "transition-[border-color,box-shadow] duration-150",
          // Error state
          error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-red-100",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
