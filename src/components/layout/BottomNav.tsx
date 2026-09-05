"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./nav-config";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useUnreadNotifications } from "@/lib/hooks/use-unread-notifications";

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount, hasUnread } = useUnreadNotifications();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 sm:px-4 lg:hidden"
      aria-label="Mobile Navigation"
    >
      <nav
        className="pointer-events-auto w-full max-w-[340px] bg-white border border-[var(--color-border)] shadow-[var(--shadow-lg)] rounded-2xl px-1.5 py-1 flex items-center justify-between"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl min-h-[46px] transition-colors duration-150 select-none",
                isActive
                  ? "text-[var(--color-accent)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-medium"
              )}
            >
              {/* Active animated background indicator */}
              {isActive && (
                <motion.span
                  layoutId="mobileActiveNavPill"
                  className="absolute inset-0 bg-[var(--color-accent-light)] rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}

              <div className="relative">
                <Icon
                  icon={item.icon}
                  size="md"
                  className={cn(
                    "transition-transform duration-150",
                    isActive ? "scale-105" : "scale-100"
                  )}
                />

                {/* Show badge on Notifications item ONLY when hasUnread is true */}
                {item.isNotification && hasUnread && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-2.5 min-w-[15px] h-[15px] px-0.5 rounded-md bg-[var(--color-accent)] text-white text-[9px] font-bold flex items-center justify-center leading-none select-none shadow-[var(--shadow-xs)] pointer-events-none"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>

              <span className="text-[10.5px] leading-tight mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
