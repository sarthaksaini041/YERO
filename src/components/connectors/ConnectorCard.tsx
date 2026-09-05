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

const PLATFORM_COLORS: Record<Platform, { bg: string; text: string; border: string; iconBg: string }> = {
  leetcode: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    iconBg: "bg-amber-50 border-amber-100",
  },
  codechef: {
    bg: "bg-[#5B4638]/5",
    text: "text-[#5B4638]",
    border: "border-[#5B4638]/20",
    iconBg: "bg-[#5B4638]/8 border-[#5B4638]/15",
  },
  codeforces: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    iconBg: "bg-blue-50 border-blue-100",
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
        "bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden",
        "shadow-[var(--shadow-xs)] transition-shadow duration-200",
        isConnected && "shadow-[var(--shadow-sm)]"
      )}
    >
      {/* ── Card Header ── */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Platform logo */}
        <div
          className={cn(
            "w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 border",
            colors.iconBg
          )}
        >
          <PlatformLogo platform={platform} size={26} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{label}</h3>

            <AnimatePresence mode="wait">
              {isConnected && (
                <motion.span
                  key="connected"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-success-light)] text-[var(--color-success)] text-[11px] font-semibold border border-[var(--color-success-border)]"
                >
                  <Icon icon={CheckmarkCircle01Icon} size="xs" />
                  Connected
                </motion.span>
              )}
              {hasError && (
                <motion.span
                  key="error"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-danger-light)] text-[var(--color-danger)] text-[11px] font-semibold border border-[var(--color-danger-border)]"
                >
                  <Icon icon={Alert01Icon} size="xs" />
                  Error
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[12.5px] text-[var(--color-text-muted)] mt-0.5 leading-snug">
            {isConnected && connector?.platformUsername
              ? `Synced as @${connector.platformUsername}`
              : description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isConnected ? (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSync}
                disabled={isSyncing || isDisconnecting}
                aria-label="Sync stats"
                title="Refresh stats"
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
              >
                {isDisconnecting ? (
                  <>
                    <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                    Removing…
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

      {/* ── Stats Grid ── */}
      <AnimatePresence>
        {isConnected && stats && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-[var(--color-border)]">
              <div className="grid grid-cols-3 gap-2 mt-4">
                <StatPill label="Solved" value={stats.problemsSolved} colors={colors} />
                <StatPill
                  label={platform === "leetcode" ? "Contest Rating" : "Rating"}
                  value={stats.rating}
                  colors={colors}
                />
                <StatPill label="Contests" value={stats.contestsParticipated} colors={colors} />
                {platform === "leetcode" && stats.easySolved !== undefined && (
                  <>
                    <StatPill label="Easy" value={stats.easySolved} colors={{ ...colors, text: "text-emerald-600" }} />
                    <StatPill label="Medium" value={stats.mediumSolved} colors={{ ...colors, text: "text-amber-600" }} />
                    <StatPill label="Hard" value={stats.hardSolved} colors={{ ...colors, text: "text-rose-600" }} />
                  </>
                )}
                {platform === "codeforces" && (
                  <StatPill label="Max Rating" value={stats.maxRating} colors={colors} />
                )}
                {platform === "codechef" && (
                  <StatPill label="Global Rank" value={stats.globalRank} colors={colors} />
                )}
              </div>

              {stats.rank && (
                <p className="mt-3 text-[12px] text-[var(--color-text-muted)]">
                  Rank:{" "}
                  <span className={cn("font-semibold", colors.text)}>{stats.rank}</span>
                </p>
              )}

              {/* Last synced */}
              {connector?.lastSyncedAt && (
                <p className="mt-1.5 text-[11px] text-[var(--color-text-faint)]">
                  Last synced {formatRelativeTime(connector.lastSyncedAt)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error Message ── */}
      <AnimatePresence>
        {(hasError || localError) && (
          <motion.div
            key="error-msg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <div className="px-3.5 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-[var(--color-danger-border)]">
                <p className="text-[12.5px] text-[var(--color-danger)] font-medium">
                  {localError ?? connector?.errorMessage ?? "Last sync failed. Try reconnecting."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatPill({
  label,
  value,
  colors,
}: {
  label: string;
  value?: number;
  colors: { bg: string; text: string; border: string; iconBg: string };
}) {
  if (value === undefined || value === null) return null;

  return (
    <div className="flex flex-col items-center px-2 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
      <span className={cn("text-[14px] font-bold", colors.text)}>
        {value.toLocaleString()}
      </span>
      <span className="text-[10.5px] text-[var(--color-text-faint)] mt-0.5 leading-none text-center">
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
