"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { getUnreadNotificationCount } from "@/actions/notifications";

// Module-level shared singleton state
let unreadCount = 0;
const subscribers = new Set<() => void>();
let isInitialized = false;
let inFlightPromise: Promise<void> | null = null;

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

export function fetchUnreadCount(): Promise<void> {
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = getUnreadNotificationCount()
    .then((count) => {
      if (unreadCount !== count) {
        unreadCount = count;
        notifySubscribers();
      }
    })
    .catch(() => {
      // Retain existing state on transient network error
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}

function initListeners() {
  if (typeof window === "undefined" || isInitialized) return;
  isInitialized = true;

  // Initial fetch
  fetchUnreadCount();

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      fetchUnreadCount();
    }
  };

  const handleSwMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === "NOTIFICATION_RECEIVED") {
      fetchUnreadCount();
    }
  };

  window.addEventListener("focus", fetchUnreadCount);
  window.addEventListener("yero:notification-update", fetchUnreadCount);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", handleSwMessage);
  }

  window.setInterval(() => {
    if (document.visibilityState === "visible") {
      fetchUnreadCount();
    }
  }, 30000);
}

function subscribe(callback: () => void): () => void {
  initListeners();
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot(): number {
  return unreadCount;
}

function getServerSnapshot(): number {
  return 0;
}

export function useUnreadNotifications() {
  const pathname = usePathname();
  const rawCount = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const displayCount = pathname === "/notifications" ? 0 : rawCount;
  const hasUnread = typeof displayCount === "number" && displayCount > 0;

  return {
    unreadCount: displayCount,
    hasUnread,
  };
}
