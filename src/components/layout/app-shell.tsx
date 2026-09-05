"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  withNav?: boolean;
}

export function AppShell({
  children,
  header,
  footer,
  maxWidth = "lg",
  className,
}: AppShellProps) {
  const maxWidths = {
    sm: "max-w-xl",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
    full: "max-w-full",
  };

  return (
    <>
      {header}
      <main
        className={cn(
          "flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:py-3.5 lg:py-4",
          maxWidths[maxWidth],
          className
        )}
      >
        {children}
      </main>
      {footer}
    </>
  );
}

/**
 * AppHeader — preserved for custom subpage headers if needed
 */
export function AppHeader({
  left,
  right,
  className,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("w-full bg-transparent select-none", className)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">{left}</div>
        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>
    </header>
  );
}
