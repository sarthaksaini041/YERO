"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_ITEMS } from "./nav-config";
import { Icon } from "@/components/ui/icon";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { useUnreadNotifications } from "@/lib/hooks/use-unread-notifications";
import { LogOutIcon, Loading03Icon } from "@hugeicons/core-free-icons";

export function Sidebar() {
  const pathname = usePathname();
  const [isLoggingOut, startTransition] = React.useTransition();
  const { unreadCount, hasUnread } = useUnreadNotifications();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <aside
      className="hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-30 select-none"
      style={{ width: "var(--sidebar-width)" }}
      aria-label="Main Navigation"
    >
      {/* Glass-white surface */}
      <div className="flex flex-col h-full bg-white border-r border-[var(--color-border)]">

        {/* ── Brand Header ── */}
        <div className="h-[60px] px-5 flex items-center border-b border-[var(--color-border)] shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[10px] overflow-hidden shadow-[var(--shadow-sm)] transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Image
                src="/logo-sm.webp"
                alt="YERO"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span
              className="font-bold text-[17px] tracking-tight text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
            >
              YERO
            </span>
          </Link>
        </div>

        {/* ── Navigation ── */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <nav className="space-y-0.5" role="navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-secondary)]"
                  )}
                >
                  {/* Active left accent bar */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="sidebarActiveBar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--color-accent)]"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </AnimatePresence>

                  <Icon
                    icon={item.icon}
                    size="md"
                    className={cn(
                      "shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-text-faint)] group-hover:text-[var(--color-text-muted)]"
                    )}
                  />
                  <span className="truncate flex-1">{item.label}</span>

                  {/* Notification badge */}
                  {item.isNotification && hasUnread && (
                    <span
                      aria-label={`${unreadCount} unread notifications`}
                      className="ml-auto min-w-[18px] h-[18px] px-1 rounded-md bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center leading-none shrink-0 shadow-[var(--shadow-xs)]"
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-[var(--color-border)] p-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors duration-150 cursor-pointer disabled:opacity-50 group"
          >
            {isLoggingOut ? (
              <Icon icon={Loading03Icon} size="sm" className="animate-spin text-[var(--color-danger)] shrink-0" />
            ) : (
              <Icon icon={LogOutIcon} size="sm" className="shrink-0 transition-colors group-hover:text-[var(--color-danger)]" />
            )}
            <span>{isLoggingOut ? "Signing out…" : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
