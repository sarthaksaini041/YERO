import * as React from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * AppShell — full-width content wrapper.
 *
 * No max-width centering: content fills the entire available content column
 * (viewport minus the 240px sidebar) with consistent edge padding only.
 * Individual page sections control their own internal layout constraints.
 */
export function AppShell({
  children,
  className,
  noPadding = false,
}: AppShellProps) {
  return (
    <main
      className={cn(
        "flex-1 w-full",
        !noPadding && [
          /* Mobile — side padding + bottom clearance for floating nav */
          "px-5 pt-5 pb-28",
          /* Tablet */
          "sm:px-7 sm:pt-6 sm:pb-32",
          /* Desktop — generous, consistent horizontal padding, positioned higher up */
          "lg:px-10 lg:pt-6 lg:pb-10",
        ],
        className
      )}
    >
      {children}
    </main>
  );
}

/**
 * PageHeader — page-level title + optional description + action slot.
 * Renders a single <h1> for the page. Use at the top of each page component.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div className="min-w-0">
        <h1 className="text-heading-xl">{title}</h1>
        {description && (
          <p className="mt-1 text-[13.5px] text-[var(--color-text-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 flex items-center gap-2">{action}</div>
      )}
    </div>
  );
}

/**
 * SectionCard — lightweight card container with consistent border/shadow.
 */
export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-xs)]",
        className
      )}
    >
      {children}
    </div>
  );
}
