"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MOBILE_NAV_ITEMS } from "./nav-config";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useUnreadNotifications } from "@/lib/hooks/use-unread-notifications";

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount, hasUnread } = useUnreadNotifications();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-[max(0.875rem,env(safe-area-inset-bottom))] px-4 lg:hidden"
      aria-label="Mobile Navigation"
    >
      <nav
        className="pointer-events-auto w-full max-w-[420px] bg-white border border-[var(--color-border)] shadow-[var(--shadow-lg)] rounded-[22px] px-1.5 py-1.5 flex items-center justify-between gap-0.5"
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-[14px] min-h-[50px] transition-colors duration-150 select-none",
                isActive
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text-faint)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              {/* Animated active background */}
              {isActive && (
                <motion.span
                  layoutId="mobileActiveNavPill"
                  className="absolute inset-0 bg-[var(--color-accent-light)] rounded-[14px] -z-10 will-change-transform"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
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

                {/* Unread badge */}
                {item.isNotification && hasUnread && (
                  <span
                    aria-label={`${unreadCount} unread notifications`}
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-[var(--color-accent)] text-white text-[9px] font-bold flex items-center justify-center leading-none pointer-events-none shadow-[var(--shadow-xs)]"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>

              <span className={cn(
                "text-[10px] leading-tight mt-1 tracking-tight truncate max-w-full text-center",
                isActive ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
