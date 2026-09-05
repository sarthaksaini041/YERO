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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-8 gap-2.5 sm:gap-3">
      {metricCards.map((card) => {
        const isContributions = card.id === "contributions";
        const isFollowers = card.id === "followers";

        // Bento grid responsive column spans
        const spanClass = isContributions
          ? "col-span-2 sm:col-span-2 lg:col-span-2 2xl:col-span-2"
          : isFollowers
          ? "col-span-1 sm:col-span-2 lg:col-span-1 2xl:col-span-2"
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
            {isContributions ? (
              <div className="flex items-center justify-between gap-3 h-full">
                <div className="flex flex-col justify-between h-full min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-[var(--color-text-muted)] truncate">
                      {card.label}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Headline
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[var(--color-text-primary)] leading-none">
                      {card.value}
                    </div>
                    {card.subtitle && (
                      <p className="text-[10px] text-[var(--color-text-faint)] mt-1 truncate">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <Icon icon={card.icon} size={16} />
                </div>
              </div>
            ) : isFollowers ? (
              <div className="flex flex-col justify-between h-full">
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
                  <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[var(--color-text-primary)] leading-none flex items-baseline gap-2">
                    <span>{card.value}</span>
                    <span className="text-[10.5px] font-normal text-[var(--color-text-faint)] font-sans hidden 2xl:inline">
                      ({overview.following.toLocaleString()} following)
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-faint)] mt-1 truncate 2xl:hidden">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            ) : (
              <>
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
                    <p className="text-[10px] text-[var(--color-text-faint)] mt-1 truncate">
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
