"use client";

import * as React from "react";
import type { NormalizedPlatformData } from "@/lib/coding/coding-analytics";
import { formatRelativeDate } from "@/lib/coding/coding-analytics";
import type { Platform } from "@/lib/connectors/types";
import { Icon } from "@/components/ui/icon";
import { PlatformLogo } from "@/components/connectors/PlatformLogos";
import {
  LinkSquare01Icon,
  RefreshIcon,
  AlertCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface PlatformBreakdownCardProps {
  data: NormalizedPlatformData;
  onRetrySync?: (platform: Platform) => Promise<void>;
  isSyncing?: boolean;
}

export function PlatformBreakdownCard({
  data,
  onRetrySync,
  isSyncing = false,
}: PlatformBreakdownCardProps) {
  const [retrying, setRetrying] = React.useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = React.useState<string | null>(null);
  const isAvatarBroken = Boolean(data.avatarUrl && failedAvatarUrl === data.avatarUrl);

  // Route avatar through our proxy to handle Cloudflare 503, CORS, and hotlinking restrictions
  const proxyAvatarUrl = React.useMemo(() => {
    if (!data.avatarUrl) return null;
    if (data.avatarUrl.startsWith("/api/avatar")) return data.avatarUrl;
    return `/api/avatar?url=${encodeURIComponent(data.avatarUrl)}`;
  }, [data.avatarUrl]);

  const handleRetry = async () => {
    if (!onRetrySync || retrying || isSyncing) return;
    setRetrying(true);
    try {
      await onRetrySync(data.platform);
    } finally {
      setRetrying(false);
    }
  };

  const isSyncActive = isSyncing || retrying;

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-[var(--shadow-xs)] flex flex-col justify-between transition-all duration-150 hover:border-[var(--color-border-strong)]">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar or Platform Badge */}
            {proxyAvatarUrl && !isAvatarBroken ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proxyAvatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailedAvatarUrl(data.avatarUrl || "")}
                className="w-9 h-9 rounded-lg object-cover border border-[var(--color-border)] shrink-0 bg-[var(--color-surface-alt)]"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-[var(--color-border)]"
                style={{
                  backgroundColor:
                    data.platform === "leetcode"
                      ? "#FFFBEB"
                      : data.platform === "codeforces"
                      ? "#EFF6FF"
                      : data.platform === "codechef"
                      ? "#FEF3C7"
                      : "#F1F5F9",
                }}
              >
                <PlatformLogo platform={data.platform} size={22} />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-[14.5px] text-[var(--color-text-primary)] truncate">
                  {data.platformName}
                </h4>
                {data.stars && (
                  <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    {data.stars}★
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] truncate">
                <span>@{data.username}</span>
                {data.profileUrl && (
                  <a
                    href={data.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--color-accent)] transition-colors inline-flex items-center"
                    title={`View ${data.platformName} profile`}
                  >
                    <Icon icon={LinkSquare01Icon} size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sync status / Quick action */}
          <div className="flex flex-col items-end shrink-0">
            {data.status === "error" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Icon icon={AlertCircleIcon} size={12} />
                Sync Issue
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-faint)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {formatRelativeDate(data.lastSyncedAt)}
              </span>
            )}

            {onRetrySync && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={isSyncActive}
                className="mt-1 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Refresh stats"
              >
                <Icon
                  icon={isSyncActive ? Loading03Icon : RefreshIcon}
                  size={12}
                  className={isSyncActive ? "animate-spin text-[var(--color-accent)]" : ""}
                />
                <span>{isSyncActive ? "Syncing..." : "Sync"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync Failure Notice (Fault Isolation) */}
        {data.status === "error" && (
          <div className="mt-3 p-2.5 rounded-md bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-2 text-xs text-amber-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon icon={AlertCircleIcon} size={14} className="shrink-0 text-amber-600" />
              <span className="truncate">
                {data.errorMessage || "Latest sync failed. Showing cached data."}
              </span>
            </div>
            {onRetrySync && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={isSyncActive}
                className="font-semibold text-amber-900 underline hover:no-underline shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSyncActive ? "Retrying..." : "Retry"}
              </button>
            )}
          </div>
        )}

        {/* Platform Specific Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4">
          {/* LEETCODE */}
          {data.platform === "leetcode" && (
            <>
              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Problems Solved
                </div>
                <div className="text-lg font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.problemsSolved?.toLocaleString() ?? "—"}
                </div>
                <div className="text-[10.5px] text-[var(--color-text-faint)] mt-0.5">
                  {data.easySolved ?? 0}E · {data.mediumSolved ?? 0}M · {data.hardSolved ?? 0}H
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Contest Rating
                </div>
                <div className="text-lg font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.rating?.toLocaleString() ?? "—"}
                </div>
                <div className="text-[10.5px] text-[var(--color-text-faint)] mt-0.5">
                  {data.contestsParticipated !== undefined
                    ? `${data.contestsParticipated} contests`
                    : "No contests attended"}
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Global Ranking
                </div>
                <div className="text-base font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.globalRank ? `#${data.globalRank.toLocaleString()}` : "—"}
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Contests Attended
                </div>
                <div className="text-base font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.contestsParticipated ?? "—"}
                </div>
              </div>
            </>
          )}

          {/* CODEFORCES */}
          {data.platform === "codeforces" && (
            <>
              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Current Rating
                </div>
                <div className="text-lg font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.rating?.toLocaleString() ?? "—"}
                </div>
                <div className="text-[10.5px] text-[var(--color-text-faint)] mt-0.5 truncate">
                  Max: {data.maxRating?.toLocaleString() ?? "—"}
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Rank Tier
                </div>
                <div className="text-sm font-semibold capitalize text-[var(--color-text-primary)] mt-0.5 truncate">
                  {data.rank || "—"}
                </div>
                <div className="text-[10.5px] text-[var(--color-text-faint)] mt-0.5 truncate">
                  Peak: {data.maxRank || "—"}
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Problems Solved
                </div>
                <div className="text-base font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.problemsSolved?.toLocaleString() ?? "—"}
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Contests Attended
                </div>
                <div className="text-base font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.contestsParticipated ?? "—"}
                </div>
              </div>
            </>
          )}

          {/* CODECHEF */}
          {data.platform === "codechef" && (
            <>
              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Current Rating
                </div>
                <div className="text-lg font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.rating?.toLocaleString() ?? "—"}
                </div>
                <div className="text-[10.5px] text-[var(--color-text-faint)] mt-0.5 truncate">
                  Max: {data.maxRating?.toLocaleString() ?? "—"}
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Global / Country Rank
                </div>
                <div className="text-sm font-semibold font-mono text-[var(--color-text-primary)] mt-0.5 truncate">
                  {data.globalRank ? `#${data.globalRank.toLocaleString()}` : "—"}
                </div>
                <div className="text-[10.5px] text-[var(--color-text-faint)] mt-0.5 font-mono truncate">
                  Country: {data.countryRank ? `#${data.countryRank.toLocaleString()}` : "—"}
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Problems Solved
                </div>
                <div className="text-base font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.problemsSolved?.toLocaleString() ?? "—"}
                </div>
              </div>

              <div className="bg-[var(--color-surface-alt)] rounded-lg p-2.5 border border-[var(--color-border)]">
                <div className="text-[11px] text-[var(--color-text-muted)] font-medium">
                  Contests Attended
                </div>
                <div className="text-base font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                  {data.contestsParticipated ?? "—"}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
