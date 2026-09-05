"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  Add01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { PlatformLogo } from "@/components/connectors/PlatformLogos";
import type { Platform } from "@/lib/connectors/types";
import type { ConnectorRecord } from "@/actions/connectors";

const PLATFORM_LABELS: Record<Platform, string> = {
  leetcode: "LeetCode",
  codechef: "CodeChef",
  codeforces: "Codeforces",
};

interface SettingsContainerProps {
  initialConnectors: ConnectorRecord[];
}

export function SettingsContainer({ initialConnectors }: SettingsContainerProps) {
  const connectedPlatforms = initialConnectors.filter((c) => c.status === "connected");
  const hasConnectors = connectedPlatforms.length > 0;

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <h1 className="text-heading-lg">Settings</h1>
      </div>

      {/* Connectors Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)]">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[14.5px] font-semibold text-[var(--color-text-primary)]">
              Connectors
            </h2>
            {hasConnectors && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[var(--color-accent-light)] text-[var(--color-accent)] text-[11px] font-semibold border border-[var(--color-accent-border)]">
                {connectedPlatforms.length} connected
              </span>
            )}
          </div>

          <Link
            href="/connectors"
            aria-label="Manage connectors"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Icon icon={Add01Icon} size="md" />
          </Link>
        </div>

        {!hasConnectors ? (
          /* Empty state */
          <div className="mt-4">
            <p className="text-[12.5px] text-[var(--color-text-muted)] leading-relaxed">
              Link your competitive programming accounts to track your stats.
            </p>
            <Link
              href="/connectors"
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--color-accent)] hover:underline"
            >
              <Icon icon={Add01Icon} size="xs" />
              Add Connector
            </Link>
          </div>
        ) : (
          /* Connected list */
          <div className="mt-3 space-y-1.5">
            {connectedPlatforms.map((c) => (
              <ConnectedPlatformRow key={c.platform} connector={c} />
            ))}

            {/* Link to manage all */}
            <Link
              href="/connectors"
              className="mt-2 flex items-center gap-1 text-[12px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              <Icon icon={Add01Icon} size="xs" />
              Manage connectors
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectedPlatformRow({ connector }: { connector: ConnectorRecord }) {
  const label = PLATFORM_LABELS[connector.platform];
  const stats = connector.profileData?.stats;

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
      <div className="w-7 h-7 flex items-center justify-center shrink-0">
        <PlatformLogo platform={connector.platform} size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
            {label}
          </span>
          <span className="text-[11.5px] text-[var(--color-text-muted)] truncate">
            @{connector.platformUsername}
          </span>
        </div>
        {stats?.problemsSolved !== undefined && (
          <span className="text-[11.5px] text-[var(--color-text-faint)]">
            {stats.problemsSolved.toLocaleString()} solved
            {stats.rating !== undefined ? ` · ${stats.rating} rating` : ""}
          </span>
        )}
      </div>

      <Icon icon={CheckmarkCircle01Icon} size="sm" className="text-[var(--color-success)] shrink-0" />
    </div>
  );
}
