import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950 border border-slate-900/10",
      secondary:
        "bg-white/80 text-slate-700 border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-white hover:text-slate-900 hover:border-slate-300",
      ghost:
        "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60",
      destructive:
        "bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100/80 hover:text-red-700",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-sm gap-2.5",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          "liquid-glass-button",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
