"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  // Desktop-only breadcrumb context
  const sectionName =
    pathname === "/"
      ? "Daily Tasks"
      : pathname.startsWith("/notes")
      ? "Notes"
      : pathname.startsWith("/notifications")
      ? "Notifications"
      : pathname.startsWith("/profile")
      ? "Profile"
      : pathname.startsWith("/settings")
      ? "Settings"
      : pathname.startsWith("/connectors")
      ? "Connectors"
      : "";

  return (
    <header className="hidden lg:flex w-full bg-transparent select-none items-center justify-between h-10 px-8 xl:px-10 border-b border-[var(--color-border)]/50">
      <div className="flex items-center gap-1.5 text-[12.5px]">
        <span className="font-medium text-[var(--color-text-faint)]">
          Workspace
        </span>
        <span className="text-[var(--color-text-faint)]">/</span>
        <span className="font-semibold text-[var(--color-text-secondary)]">
          {sectionName}
        </span>
      </div>
    </header>
  );
}
