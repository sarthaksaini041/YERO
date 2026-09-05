"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-config";
import { Icon } from "@/components/ui/icon";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { useUnreadNotifications } from "@/lib/hooks/use-unread-notifications";
import {
  LogOutIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

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
      className="hidden lg:flex flex-col fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[var(--color-border)] z-30 select-none"
      aria-label="Main Navigation"
    >
      {/* ── Brand Header ── */}
      <div className="h-13 sm:h-14 px-5 flex items-center border-b border-[var(--color-border)]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo-sm.webp"
            alt="YERO"
            width={28}
            height={28}
            className="w-7 h-7 rounded-lg object-cover shadow-[var(--shadow-xs)] transition-transform duration-200 group-hover:scale-105"
            priority
          />
          <span
            className="font-bold text-[16px] text-[var(--color-text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
          >
            YERO
          </span>
        </Link>
      </div>

      {/* ── Navigation Links ── */}
      <div className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] transition-colors duration-150",
                  isActive
                    ? "bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold"
                    : "text-[var(--color-text-secondary)] hover:bg-gray-100 hover:text-[var(--color-text-primary)] font-medium"
                )}
              >
                <Icon
                  icon={item.icon}
                  size="md"
                  className={cn(
                    "shrink-0 transition-colors duration-150",
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"
                  )}
                />
                <span className="truncate">{item.label}</span>

                {/* Show unread badge on Notifications item ONLY when hasUnread is true */}
                {item.isNotification && hasUnread && (
                  <span
                    aria-hidden="true"
                    className="ml-auto min-w-[18px] h-[18px] px-1 rounded-md bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center leading-none select-none shadow-[var(--shadow-xs)]"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Sidebar Footer (Sign Out) ── */}
      <div className="p-2.5 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors duration-150 cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Icon icon={Loading03Icon} size="sm" className="animate-spin text-[var(--color-danger)]" />
          ) : (
            <Icon icon={LogOutIcon} size="sm" />
          )}
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}
