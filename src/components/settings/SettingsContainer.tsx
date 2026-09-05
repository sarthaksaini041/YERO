"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { PlatformLogo } from "@/components/connectors/PlatformLogos";
import { NotificationToggle } from "@/components/dashboard/NotificationToggle";
import type { Platform } from "@/lib/connectors/types";
import type { ConnectorRecord } from "@/actions/connectors";
import { cn } from "@/lib/utils";

const PLATFORM_LABELS: Record<Platform, string> = {
  leetcode: "LeetCode",
  codechef: "CodeChef",
  codeforces: "Codeforces",
  github: "GitHub",
};

interface SettingsContainerProps {
  initialConnectors: ConnectorRecord[];
}

export function SettingsContainer({ initialConnectors }: SettingsContainerProps) {
  const connectedPlatforms = initialConnectors.filter((c) => c.status === "connected");
  const hasConnectors = connectedPlatforms.length > 0;

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-heading-xl">Settings</h1>
      </div>

      {/* ── Connectors Card ── */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
              Connectors
            </h2>
            {hasConnectors && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-accent-light)] text-[var(--color-accent)] text-[11px] font-semibold border border-[var(--color-accent-border)]">
                <Icon icon={CheckmarkCircle01Icon} size="xs" />
                {connectedPlatforms.length} active
              </span>
            )}
          </div>

          <Link
            href="/connectors"
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            Manage
            <Icon icon={ArrowRight01Icon} size="xs" />
          </Link>
        </div>

        <div className="p-5">
          {!hasConnectors ? (
            <div className="space-y-3">
              <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">
                Connect your LeetCode, CodeChef, or Codeforces accounts to sync your competitive programming stats.
              </p>
              <Link
                href="/connectors"
                className="inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-[var(--radius-md)] text-[12.5px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-[var(--shadow-xs)]"
              >
                <Icon icon={Add01Icon} size="xs" />
                Connect Platform
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {connectedPlatforms.map((c) => (
                <ConnectedRow key={c.platform} connector={c} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Daily Reminders Card ── */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            Daily Reminders
          </h2>

          <Link
            href="/notifications"
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            History
            <Icon icon={ArrowRight01Icon} size="xs" />
          </Link>
        </div>

        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13.5px] font-medium text-[var(--color-text-primary)]">
              Browser Push Notifications
            </p>
            <p className="text-[12.5px] text-[var(--color-text-muted)] mt-0.5">
              Receive automated reminders for active daily tasks.
            </p>
          </div>

          <div className="shrink-0">
            <NotificationToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectedRow({ connector }: { connector: ConnectorRecord }) {
  const label = PLATFORM_LABELS[connector.platform];
  const stats = connector.profileData?.stats;

  return (
    <div className={cn(
      "flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)]",
      "bg-[var(--color-surface-muted)] border border-[var(--color-border)]"
    )}>
      <div className="w-7 h-7 flex items-center justify-center shrink-0">
        <PlatformLogo platform={connector.platform} size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{label}</span>
          <span className="text-[12px] text-[var(--color-text-muted)]">@{connector.platformUsername}</span>
        </div>
        {stats?.problemsSolved !== undefined && (
          <p className="text-[11.5px] text-[var(--color-text-faint)]">
            {stats.problemsSolved.toLocaleString()} solved
            {stats.rating !== undefined ? ` · ${stats.rating} rating` : ""}
          </p>
        )}
      </div>

      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-success-light)] text-[var(--color-success)] text-[11px] font-semibold border border-[var(--color-success-border)] shrink-0">
        <Icon icon={CheckmarkCircle01Icon} size="xs" />
        Connected
      </span>
    </div>
  );
}
