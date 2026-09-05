"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { disconnectPlatform, syncConnector } from "@/actions/connectors";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  CheckmarkCircle01Icon,
  Alert01Icon,
  Loading03Icon,
  RefreshIcon,
  LinkOffIcon,
  Link01Icon,
} from "@hugeicons/core-free-icons";
import { PlatformLogo } from "./PlatformLogos";
import type { Platform } from "@/lib/connectors/types";
import type { ConnectorRecord } from "@/actions/connectors";

interface ConnectorCardProps {
  platform: Platform;
  label: string;
  description: string;
  connector: ConnectorRecord | null;
  onConnect: () => void;
  onConnectorUpdate: (connector: ConnectorRecord | null) => void;
}

/** Platform accent colors */
const PLATFORM_COLORS: Record<Platform, { bg: string; text: string; border: string }> = {
  leetcode: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  codechef: {
    bg: "bg-[#5B4638]/10",
    text: "text-[#5B4638]",
    border: "border-[#5B4638]/20",
  },
  codeforces: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
};

export function ConnectorCard({
  platform,
  label,
  description,
  connector,
  onConnect,
  onConnectorUpdate,
}: ConnectorCardProps) {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const isConnected = connector?.status === "connected";
  const hasError = connector?.status === "error";
  const colors = PLATFORM_COLORS[platform];

  const profile = connector?.profileData;
  const stats = profile?.stats;

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setLocalError(null);
    const result = await syncConnector(platform);
    setIsSyncing(false);
    if (result.success && result.connector) {
      onConnectorUpdate(result.connector);
    } else {
      setLocalError(result.error ?? "Sync failed. Please try again.");
    }
  };

  const handleDisconnect = async () => {
    if (isDisconnecting) return;
    setIsDisconnecting(true);
    const result = await disconnectPlatform(platform);
    setIsDisconnecting(false);
    if (result.success) {
      onConnectorUpdate(null);
    } else {
      setLocalError(result.error ?? "Failed to disconnect.");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-2xl bg-white border transition-shadow duration-200",
        isConnected
          ? "border-[var(--color-border)] shadow-[var(--shadow-sm)]"
          : "border-[var(--color-border)] shadow-[var(--shadow-xs)]"
      )}
    >
      {/* Card Header */}
      <div className="flex items-start gap-3.5 px-4 sm:px-5 py-4">
        {/* Logo */}
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border",
            colors.bg,
            colors.border
          )}
        >
          <PlatformLogo platform={platform} size={26} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14.5px] font-semibold text-[var(--color-text-primary)]">
              {label}
            </h3>

            {/* Status badge */}
            <AnimatePresence mode="wait">
              {isConnected && (
                <motion.span
                  key="connected"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--color-success-light)] text-[var(--color-success)] text-[11px] font-semibold border border-emerald-200"
                >
                  <Icon icon={CheckmarkCircle01Icon} size="xs" />
                  Connected
                </motion.span>
              )}
              {hasError && (
                <motion.span
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--color-danger-light)] text-[var(--color-danger)] text-[11px] font-semibold border border-red-200"
                >
                  <Icon icon={Alert01Icon} size="xs" />
                  Error
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[12.5px] text-[var(--color-text-muted)] mt-0.5 leading-snug">
            {isConnected && connector?.platformUsername
              ? `@${connector.platformUsername}`
              : description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {isConnected ? (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSync}
                disabled={isSyncing || isDisconnecting}
                aria-label="Sync connector"
                title="Refresh data"
              >
                <Icon
                  icon={RefreshIcon}
                  size="sm"
                  className={cn(isSyncing && "animate-spin")}
                />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting || isSyncing}
                loading={isDisconnecting}
              >
                {isDisconnecting ? (
                  <>
                    <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Icon icon={LinkOffIcon} size="xs" />
                    Disconnect
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onConnect}>
              <Icon icon={Link01Icon} size="xs" />
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Connected Stats */}
      <AnimatePresence>
        {isConnected && stats && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-4 sm:mx-5 mb-4 pt-3 border-t border-[var(--color-border)]/60">
              <div className="grid grid-cols-3 gap-2">
                <StatPill
                  label="Solved"
                  value={stats.problemsSolved}
                  platform={platform}
                />
                <StatPill
                  label={platform === "codeforces" ? "Rating" : platform === "codechef" ? "Rating" : "Contest Rating"}
                  value={stats.rating}
                  platform={platform}
                />
                <StatPill
                  label="Contests"
                  value={stats.contestsParticipated}
                  platform={platform}
                />
                {platform === "leetcode" && stats.easySolved !== undefined && (
                  <>
                    <StatPill label="Easy" value={stats.easySolved} platform={platform} color="text-emerald-600" />
                    <StatPill label="Medium" value={stats.mediumSolved} platform={platform} color="text-amber-600" />
                    <StatPill label="Hard" value={stats.hardSolved} platform={platform} color="text-rose-600" />
                  </>
                )}
                {platform === "codeforces" && (
                  <StatPill label="Max Rating" value={stats.maxRating} platform={platform} />
                )}
                {platform === "codechef" && (
                  <StatPill label="Global Rank" value={stats.globalRank} platform={platform} />
                )}
              </div>

              {/* Rank label */}
              {stats.rank && (
                <p className="mt-2 text-[11.5px] text-[var(--color-text-muted)]">
                  Rank:{" "}
                  <span className={cn("font-semibold", colors.text)}>
                    {stats.rank}
                  </span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state (connector has error from last sync) */}
      <AnimatePresence>
        {(hasError || localError) && (
          <motion.div
            key="error-msg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 sm:mx-5 mb-4 px-3 py-2 rounded-xl bg-[var(--color-danger-light)] border border-red-200">
              <p className="text-[12px] text-[var(--color-danger)]">
                {localError ?? connector?.errorMessage ?? "Last sync failed. Try reconnecting."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last synced */}
      {isConnected && connector?.lastSyncedAt && (
        <div className="px-4 sm:px-5 pb-3 -mt-2">
          <p className="text-[11px] text-[var(--color-text-faint)]">
            Last synced {formatRelativeTime(connector.lastSyncedAt)}
          </p>
        </div>
      )}
    </motion.div>
  );
}

/** Small stat display pill */
function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value?: number;
  platform: Platform;
  color?: string;
}) {
  if (value === undefined || value === null) return null;

  return (
    <div className="flex flex-col items-center px-2 py-2 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
      <span className={cn("text-[13px] font-bold text-[var(--color-text-primary)]", color)}>
        {value.toLocaleString()}
      </span>
      <span className="text-[10.5px] text-[var(--color-text-faint)] mt-0.5 leading-none">
        {label}
      </span>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}
