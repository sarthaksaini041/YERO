"use client";

import * as React from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { getNotificationStatus } from "@/actions/notifications";
import { LogOut, Loader2, Bell } from "lucide-react";
import Image from "next/image";
import { InstallButton } from "./InstallButton";

function NotificationBellLink() {
  const [hasActive, setHasActive] = React.useState(false);

  React.useEffect(() => {
    getNotificationStatus()
      .then((s) => setHasActive(s.hasActiveSubscription && s.notificationsEnabled))
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label="View notifications"
      title="Notifications"
      className="relative w-8 h-8 rounded-full liquid-glass-card border border-white/90 shadow-2xs flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white/90 active:scale-95 transition-all cursor-pointer"
    >
      <Bell className="w-3.5 h-3.5" />
      {hasActive && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
      )}
    </Link>
  );
}

export function Header() {
  const [isLoggingOut, startTransition] = React.useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header className="w-full bg-transparent sticky top-0 z-30 pt-3 pb-1">
      <div className="max-w-xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Dedicated liquid glass capsule for YERO */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full liquid-glass-card border border-white/90 shadow-2xs">
          <Image
            src="/logo-sm.webp"
            alt="YERO Logo"
            width={20}
            height={20}
            className="w-5 h-5 rounded-md object-cover"
            priority
          />
          <span className="font-semibold text-slate-900 tracking-tight text-xs">
            YERO
          </span>
        </div>

        {/* Action Controls: Install PWA, Notifications Link, Sign Out */}
        <div className="flex items-center gap-2">
          <InstallButton />
          <NotificationBellLink />

          {/* Dedicated liquid glass circle for Sign Out icon button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Sign out"
            title="Sign out"
            className="w-8 h-8 rounded-full liquid-glass-card border border-white/90 shadow-2xs flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white/90 active:scale-95 transition-all cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

