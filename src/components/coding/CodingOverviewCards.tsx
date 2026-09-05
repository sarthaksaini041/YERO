"use client";

import * as React from "react";
import type { CodingDashboardAnalytics } from "@/lib/coding/coding-analytics";
import { Icon } from "@/components/ui/icon";
import {
  CheckListIcon,
  TrophyIcon,
  Medal01Icon,
  Award01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

interface CodingOverviewCardsProps {
  analytics: CodingDashboardAnalytics;
}

export function CodingOverviewCards({ analytics }: CodingOverviewCardsProps) {
  const [showScoreInfo, setShowScoreInfo] = React.useState(false);
  const { overview } = analytics;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* 1. Total Problems Solved */}
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 shadow-[var(--shadow-xs)] flex flex-col justify-between transition-all duration-150 hover:border-[var(--color-border-strong)]">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-[12px] font-semibold text-[var(--color-text-muted)] truncate">
              Problems Solved
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
              <Icon icon={CheckListIcon} size={14} />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
              {overview.totalProblemsSolved.toLocaleString()}
            </div>
            <p className="text-[11px] sm:text-[11.5px] text-[var(--color-text-faint)] mt-0.5 truncate">
              Across {overview.competitivePlatformsCount} CP platform{overview.competitivePlatformsCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* 2. Total Contests Participated */}
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 shadow-[var(--shadow-xs)] flex flex-col justify-between transition-all duration-150 hover:border-[var(--color-border-strong)]">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-[12px] font-semibold text-[var(--color-text-muted)] truncate">
              Contests
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Icon icon={TrophyIcon} size={14} />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
              {overview.totalContests.toLocaleString()}
            </div>
            <p className="text-[11px] sm:text-[11.5px] text-[var(--color-text-faint)] mt-0.5 truncate">
              Rated rounds participated
            </p>
          </div>
        </div>

        {/* 3. Best Rating */}
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 shadow-[var(--shadow-xs)] flex flex-col justify-between transition-all duration-150 hover:border-[var(--color-border-strong)]">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-[12px] font-semibold text-[var(--color-text-muted)] truncate">
              Peak Rating
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Icon icon={Medal01Icon} size={14} />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
              {overview.bestRating ? overview.bestRating.rating.toLocaleString() : "—"}
            </div>
            <p className="text-[11px] sm:text-[11.5px] text-[var(--color-text-faint)] mt-0.5 truncate">
              {overview.bestRating ? (
                <span className="inline-flex items-center gap-1 font-medium text-[var(--color-text-secondary)]">
                  {overview.bestRating.platformName}
                </span>
              ) : (
                "No rated contests"
              )}
            </p>
          </div>
        </div>

        {/* 4. YERO Score (Composite Index) */}
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 shadow-[var(--shadow-xs)] flex flex-col justify-between transition-all duration-150 hover:border-[var(--color-border-strong)]">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[11px] sm:text-[12px] font-semibold text-[var(--color-text-muted)] truncate">
                YERO Score
              </span>
              <button
                type="button"
                onClick={() => setShowScoreInfo((prev) => !prev)}
                className="text-[var(--color-text-faint)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer shrink-0"
                title="YERO Composite Score Info"
                aria-label="How YERO score is calculated"
              >
                <Icon icon={InformationCircleIcon} size={13} />
              </button>
            </div>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Icon icon={Award01Icon} size={14} />
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-purple-700">
              {overview.yeroScore.toLocaleString()}
            </div>
            <p className="text-[11px] text-[var(--color-text-faint)] mt-0.5 truncate">
              YERO developer metric
            </p>
          </div>
        </div>

        {/* 5. Connected Platforms */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 shadow-[var(--shadow-xs)] flex flex-col justify-between transition-all duration-150 hover:border-[var(--color-border-strong)]">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-[12px] font-semibold text-[var(--color-text-muted)] truncate">
              Connected
            </span>
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="mt-2.5 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
              {overview.connectedPlatformsCount}
            </div>
            <div className="flex items-center gap-1 mt-1 truncate">
              {analytics.platforms.map((p) => (
                <span
                  key={p.id}
                  title={`${p.platformName} (${p.status})`}
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    p.status === "connected"
                      ? "bg-emerald-500"
                      : p.status === "syncing"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
              ))}
              <span className="text-[11px] text-[var(--color-text-muted)] ml-1 truncate">
                Platforms active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transparent YERO Score Explanation Banner */}
      {showScoreInfo && (
        <div className="p-3 bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[12.5px] text-[var(--color-text-secondary)] flex items-start justify-between gap-3 animate-in fade-in duration-150">
          <div>
            <span className="font-semibold text-[var(--color-text-primary)]">
              About the YERO Score:
            </span>{" "}
            A composite developer score calculated transparently from verified problems solved (weighted by Easy: 2, Medium: 5, Hard: 10), contest attendance, peak platform ratings, and open-source contributions. It is a YERO metric designed to reflect overall breadth and consistency, and is separate from official platform ratings.
          </div>
          <button
            type="button"
            onClick={() => setShowScoreInfo(false)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-xs font-semibold px-1.5 py-0.5 cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
