"use client";

import * as React from "react";
import Link from "next/link";
import type { ConnectorRecord } from "@/actions/connectors";
import { syncConnector } from "@/actions/connectors";
import { processCodingAnalytics } from "@/lib/coding/coding-analytics";
import type { Platform } from "@/lib/connectors/types";
import { CodingOverviewCards } from "./CodingOverviewCards";
import { RatingProgressionChart } from "./RatingProgressionChart";
import { ProblemSolvingBreakdown } from "./ProblemSolvingBreakdown";
import { PlatformBreakdownCard } from "./PlatformBreakdownCard";
import { ContestPerformanceSection } from "./ContestPerformanceSection";
import { PlatformComparisonTable } from "./PlatformComparisonTable";
import { CodingEmptyState } from "./CodingEmptyState";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  RefreshIcon,
  Loading03Icon,
  LinkSquare01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";

interface CodingDashboardProps {
  initialConnectors: ConnectorRecord[];
}

export function CodingDashboard({ initialConnectors }: CodingDashboardProps) {
  const [connectors, setConnectors] = React.useState<ConnectorRecord[]>(() =>
    initialConnectors.filter((c) => c.platform !== "github")
  );
  const [syncingPlatforms, setSyncingPlatforms] = React.useState<Record<string, boolean>>({});
  const [isSyncingAll, setIsSyncingAll] = React.useState(false);
  const [globalMessage, setGlobalMessage] = React.useState<{
    type: "info" | "warning" | "success";
    text: string;
  } | null>(null);

  // Compute normalized analytics using our pure pipeline
  const analytics = React.useMemo(() => processCodingAnalytics(connectors), [connectors]);

  // Sync a single platform with error isolation
  const handleSyncPlatform = async (platform: Platform) => {
    setSyncingPlatforms((prev) => ({ ...prev, [platform]: true }));
    setGlobalMessage(null);

    try {
      const result = await syncConnector(platform);

      if (result.success && result.connector) {
        const updated = result.connector;
        setConnectors((prev) =>
          prev.map((c) => (c.platform === platform ? updated : c))
        );
      } else {
        // Platform sync failed, isolate the error and update that connector's error message
        setConnectors((prev) =>
          prev.map((c) =>
            c.platform === platform
              ? {
                  ...c,
                  status: "error",
                  errorMessage: result.error || "Failed to synchronize profile data.",
                }
              : c
          )
        );
      }
    } catch {
      setConnectors((prev) =>
        prev.map((c) =>
          c.platform === platform
            ? {
                ...c,
                status: "error",
                errorMessage: "Network error occurred while syncing.",
              }
            : c
        )
      );
    } finally {
      setSyncingPlatforms((prev) => ({ ...prev, [platform]: false }));
    }
  };

  // Sync all connected platforms in parallel using Promise.allSettled
  const handleSyncAll = async () => {
    if (isSyncingAll || connectors.length === 0) return;
    setIsSyncingAll(true);
    setGlobalMessage(null);

    const platformsToSync = connectors.map((c) => c.platform);

    const promises = platformsToSync.map(async (platform) => {
      setSyncingPlatforms((prev) => ({ ...prev, [platform]: true }));
      try {
        const res = await syncConnector(platform);
        return { platform, ...res };
      } catch (err: unknown) {
        return {
          platform,
          success: false,
          error: err instanceof Error ? err.message : "Sync request failed.",
        };
      } finally {
        setSyncingPlatforms((prev) => ({ ...prev, [platform]: false }));
      }
    });

    const results = await Promise.allSettled(promises);

    let anySuccess = false;
    let anyFailure = false;

    setConnectors((prev) => {
      let updatedList = [...prev];
      for (const res of results) {
        if (res.status === "fulfilled") {
          const outcome = res.value;
          if (outcome.success && outcome.connector) {
            anySuccess = true;
            updatedList = updatedList.map((c) =>
              c.platform === outcome.platform ? outcome.connector! : c
            );
          } else {
            anyFailure = true;
            updatedList = updatedList.map((c) =>
              c.platform === outcome.platform
                ? {
                    ...c,
                    status: "error",
                    errorMessage: outcome.error || "Sync failed.",
                  }
                : c
            );
          }
        }
      }
      return updatedList;
    });

    setIsSyncingAll(false);

    if (anySuccess && !anyFailure) {
      setGlobalMessage({
        type: "success",
        text: "All connected platforms synchronized successfully.",
      });
    } else if (anyFailure && anySuccess) {
      setGlobalMessage({
        type: "warning",
        text: "Some platforms failed to synchronize. Showing latest cached data.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-heading-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Coding Analytics
          </h1>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Link href="/connectors">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-medium"
            >
              <span>Manage Connectors</span>
              <Icon icon={LinkSquare01Icon} size={13} />
            </Button>
          </Link>

          {analytics.hasAnyConnected && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Icon
                icon={isSyncingAll ? Loading03Icon : RefreshIcon}
                size={13}
                className={isSyncingAll ? "animate-spin" : ""}
              />
              <span>{isSyncingAll ? "Syncing All..." : "Sync All"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Global Sync Notification Banner */}
      {globalMessage && (
        <div
          className={`p-3 rounded-[var(--radius-md)] border text-xs flex items-center justify-between gap-3 ${
            globalMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              icon={AlertCircleIcon}
              size={15}
              className={globalMessage.type === "success" ? "text-emerald-600" : "text-amber-600"}
            />
            <span>{globalMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setGlobalMessage(null)}
            className="font-bold cursor-pointer text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main View: Empty State vs Full Dashboard */}
      {!analytics.hasAnyConnected ? (
        <CodingEmptyState />
      ) : (
        <div className="space-y-6">
          {/* 1. Overview KPI Cards */}
          <CodingOverviewCards analytics={analytics} />

          {/* 2. Rating Progression & Problem-Solving Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <RatingProgressionChart platforms={analytics.platforms} />
            </div>
            <div>
              <ProblemSolvingBreakdown
                difficulty={analytics.difficultyBreakdown}
                platforms={analytics.platforms}
                totalProblemsSolved={analytics.overview.totalProblemsSolved}
              />
            </div>
          </div>

          {/* 3. Platform Breakdown Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  Platform Breakdowns
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Verified metrics directly reported by each platform integration
                </p>
              </div>
              <span className="text-xs font-mono text-[var(--color-text-faint)]">
                {analytics.platforms.length} connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.platforms.map((p) => (
                <PlatformBreakdownCard
                  key={p.id}
                  data={p}
                  onRetrySync={handleSyncPlatform}
                  isSyncing={Boolean(syncingPlatforms[p.platform])}
                />
              ))}
            </div>
          </div>

          {/* 4. Contest Performance & Recent Coding Activity */}
          <ContestPerformanceSection
            contests={analytics.recentContests}
            totalContests={analytics.overview.totalContests}
          />

          {/* 5. Platform Comparison Matrix */}
          <PlatformComparisonTable platforms={analytics.platforms} />
        </div>
      )}
    </div>
  );
}
