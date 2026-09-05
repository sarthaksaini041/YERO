"use client";

import * as React from "react";
import type { DeveloperOverviewMetrics } from "@/lib/developer/developer-analytics";
import { Icon } from "@/components/ui/icon";
import {
  Folder01Icon,
  SparklesIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  AlertCircleIcon,
  StarIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";

interface DeveloperOverviewCardsProps {
  overview: DeveloperOverviewMetrics;
  totalThisYear?: number;
}

export function DeveloperOverviewCards({
  overview,
  totalThisYear,
}: DeveloperOverviewCardsProps) {
  const metricCards = [
    {
      id: "contributions",
      label: "Contributions",
      value: overview.totalContributions.toLocaleString(),
      subtitle: totalThisYear ? `${totalThisYear.toLocaleString()} in ${new Date().getFullYear()}` : null,
      icon: SparklesIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "commits",
      label: "Commits",
      value: overview.totalCommitsRecorded > 0
        ? overview.totalCommitsRecorded.toLocaleString()
        : overview.totalContributions.toLocaleString(),
      subtitle: null,
      icon: GitCommitIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "repositories",
      label: "Repositories",
      value: overview.totalRepos.toLocaleString(),
      subtitle: null,
      icon: Folder01Icon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "stars",
      label: "Stars Earned",
      value: overview.totalStars.toLocaleString(),
      subtitle: null,
      icon: StarIcon,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: "pull-requests",
      label: "Pull Requests",
      value: overview.totalPullRequests.toLocaleString(),
      subtitle: null,
      icon: GitPullRequestIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      id: "issues",
      label: "Issues",
      value: overview.totalIssues.toLocaleString(),
      subtitle: null,
      icon: AlertCircleIcon,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      id: "followers",
      label: "Followers",
      value: overview.followers.toLocaleString(),
      subtitle: `${overview.following.toLocaleString()} following`,
      icon: UserAccountIcon,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3">
      {metricCards.map((card) => {
        const isContributions = card.id === "contributions";

        // Span logic:
        // Mobile (2 cols): Contributions spans 2 (entire row), remaining 6 cards take 1 col each (3 rows of 2). Perfect 8 slots!
        // Tablet/Laptop (4 cols): Contributions spans 2, Commits + Repos = 4 (row 1). Stars + PRs + Issues + Followers = 4 (row 2). Perfect 8 slots!
        // Desktop xl+ (7 cols): Every card takes 1 col (xl:col-span-1). Single sleek row with 0 orphaned cards!
        const spanClass = isContributions
          ? "col-span-2 sm:col-span-2 xl:col-span-1"
          : "col-span-1";

        return (
          <div
            key={card.id}
            className={`bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3 sm:p-3.5 shadow-[var(--shadow-xs)] flex flex-col justify-between min-h-[82px] sm:min-h-[86px] transition-all duration-150 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-sm)] ${spanClass} ${
              isContributions
                ? "bg-gradient-to-br from-white via-white to-emerald-50/20 border-emerald-200/70"
                : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] truncate">
                {card.label}
              </span>
              <div
                className={`w-6 h-6 rounded-md ${card.bg} ${card.color} flex items-center justify-center shrink-0`}
              >
                <Icon icon={card.icon} size={13} />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[var(--color-text-primary)] leading-none">
                {card.value}
              </div>
              {card.subtitle && (
                <p className="text-[10px] text-[var(--color-text-faint)] mt-1 truncate font-sans">
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
