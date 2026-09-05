"use client";

import * as React from "react";
import type {
  DeveloperPRItem,
  DeveloperIssueItem,
  DeveloperRepoItem,
  ContributionDay,
} from "@/lib/developer/developer-analytics";
import { Icon } from "@/components/ui/icon";
import {
  GitPullRequestIcon,
  AlertCircleIcon,
  GitBranchIcon,
  SparklesIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";

interface DeveloperVelocityInsightsProps {
  pullRequests: DeveloperPRItem[];
  issues: DeveloperIssueItem[];
  repositories: DeveloperRepoItem[];
  calendar: ContributionDay[];
  totalStars: number;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DeveloperVelocityInsights({
  pullRequests,
  issues,
  repositories,
  calendar,
  totalStars,
}: DeveloperVelocityInsightsProps) {
  // 1. PR Merge Rate calculation
  const prStats = React.useMemo(() => {
    const total = pullRequests.length;
    if (total === 0) {
      return { total: 0, merged: 0, open: 0, closed: 0, mergeRate: 0 };
    }
    const merged = pullRequests.filter((p) => p.state === "merged").length;
    const open = pullRequests.filter((p) => p.state === "open").length;
    const closed = pullRequests.filter((p) => p.state === "closed").length;
    const mergeRate = Math.round((merged / total) * 100);
    return { total, merged, open, closed, mergeRate };
  }, [pullRequests]);

  // 2. Issue Resolution Ratio
  const issueStats = React.useMemo(() => {
    const total = issues.length;
    if (total === 0) return { total: 0, closed: 0, open: 0, resolutionRate: 0 };
    const closed = issues.filter((i) => i.state === "closed").length;
    const open = issues.filter((i) => i.state === "open").length;
    const resolutionRate = Math.round((closed / total) * 100);
    return { total, closed, open, resolutionRate };
  }, [issues]);

  // 3. Original vs Forked Repos
  const repoStats = React.useMemo(() => {
    const total = repositories.length;
    if (total === 0) return { total: 0, original: 0, forks: 0, originalPct: 100 };
    const forks = repositories.filter((r) => r.isFork).length;
    const original = total - forks;
    const originalPct = Math.round((original / total) * 100);
    return { total, original, forks, originalPct };
  }, [repositories]);

  // 4. Most Productive Day of Week from Calendar
  const mostProductiveDay = React.useMemo(() => {
    if (!calendar || calendar.length === 0) return "Midweek";
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    for (const d of calendar) {
      if ((d.count || 0) > 0) {
        const dayIdx = new Date(`${d.date}T00:00:00Z`).getUTCDay();
        dayTotals[dayIdx] += d.count;
      }
    }
    let maxIdx = 1; // default to Monday
    let maxVal = dayTotals[1];
    for (let i = 0; i < 7; i++) {
      if (dayTotals[i] > maxVal) {
        maxVal = dayTotals[i];
        maxIdx = i;
      }
    }
    return DAYS_OF_WEEK[maxIdx];
  }, [calendar]);

  const avgStarsPerRepo = React.useMemo(() => {
    if (repoStats.total === 0) return "0";
    return (totalStars / repoStats.total).toFixed(1);
  }, [totalStars, repoStats.total]);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-[var(--shadow-xs)] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-base sm:text-heading font-semibold text-[var(--color-text-primary)]">
              Repository & Activity Velocity
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Pull request efficiency, repo composition, and cadence insights
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-faint)] hidden sm:inline">
            Insights
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Card 1: PR Merge Velocity */}
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                PR Merge Rate
              </span>
              <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Icon icon={GitPullRequestIcon} size={13} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
                {prStats.total > 0 ? `${prStats.mergeRate}%` : "—"}
              </span>
              <span className="text-[11px] text-[var(--color-text-faint)]">
                {prStats.merged} of {prStats.total} merged
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-muted)] overflow-hidden mt-2.5">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${prStats.total > 0 ? prStats.mergeRate : 0}%` }}
              />
            </div>
          </div>

          {/* Card 2: Original Repos Ratio */}
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                Repository Types
              </span>
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Icon icon={GitBranchIcon} size={13} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-[var(--color-text-primary)]">
                {repoStats.originalPct}%
              </span>
              <span className="text-[11px] text-[var(--color-text-faint)]">
                {repoStats.original} source · {repoStats.forks} forks
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-muted)] overflow-hidden mt-2.5">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${repoStats.originalPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Insights Strip */}
        <div className="mt-3.5 space-y-2">
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Icon icon={CheckmarkCircle01Icon} size={13} />
              </div>
              <span className="text-[var(--color-text-secondary)] font-medium truncate">
                Most Active Day of Week
              </span>
            </div>
            <span className="font-bold font-mono text-[var(--color-text-primary)] shrink-0">
              {mostProductiveDay}s
            </span>
          </div>

          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Icon icon={SparklesIcon} size={13} />
              </div>
              <span className="text-[var(--color-text-secondary)] font-medium truncate">
                Average Stars per Repository
              </span>
            </div>
            <span className="font-bold font-mono text-[var(--color-text-primary)] shrink-0">
              ★ {avgStarsPerRepo}
            </span>
          </div>

          {issueStats.total > 0 && (
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Icon icon={AlertCircleIcon} size={13} />
                </div>
                <span className="text-[var(--color-text-secondary)] font-medium truncate">
                  Issue Resolution Rate
                </span>
              </div>
              <span className="font-bold font-mono text-[var(--color-text-primary)] shrink-0">
                {issueStats.resolutionRate}% ({issueStats.closed}/{issueStats.total})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
