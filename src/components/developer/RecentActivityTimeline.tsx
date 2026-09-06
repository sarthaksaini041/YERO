"use client";

import * as React from "react";
import type { DeveloperActivityItem } from "@/lib/developer/developer-analytics";
import { formatRelativeTime } from "@/lib/developer/developer-analytics";
import { Icon } from "@/components/ui/icon";
import {
  GitCommitIcon,
  GitPullRequestIcon,
  AlertCircleIcon,
  StarIcon,
  GitBranchIcon,
  Folder01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";

interface RecentActivityTimelineProps {
  activity: DeveloperActivityItem[];
}

export function RecentActivityTimeline({ activity }: RecentActivityTimelineProps) {
  const [showAll, setShowAll] = React.useState(false);

  if (!activity || activity.length === 0) {
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-[var(--shadow-xs)] flex flex-col justify-center min-h-[360px]">
        <h3 className="text-base sm:text-heading font-semibold text-[var(--color-text-primary)]">
          Recent Activity Feed
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          No recent public GitHub activity found for this account.
        </p>
      </div>
    );
  }

  const displayedItems = showAll ? activity : activity.slice(0, 6);

  const getEventIcon = (type: DeveloperActivityItem["type"]) => {
    switch (type) {
      case "push":
        return <Icon icon={GitCommitIcon} size={13} className="text-indigo-600" />;
      case "pr":
        return <Icon icon={GitPullRequestIcon} size={13} className="text-purple-600" />;
      case "issue":
        return <Icon icon={AlertCircleIcon} size={13} className="text-emerald-600" />;
      case "watch":
        return <Icon icon={StarIcon} size={13} className="text-amber-600" />;
      case "fork":
        return <Icon icon={GitBranchIcon} size={13} className="text-blue-600" />;
      case "create":
        return <Icon icon={Folder01Icon} size={13} className="text-teal-600" />;
      default:
        return <Icon icon={GitCommitIcon} size={13} className="text-slate-600" />;
    }
  };

  const getBadgeStyle = (type: DeveloperActivityItem["type"]) => {
    switch (type) {
      case "push":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "pr":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "issue":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "watch":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "fork":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "create":
        return "bg-teal-50 text-teal-700 border-teal-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 sm:p-5 shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-border)]">
          <h3 className="text-[15px] sm:text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            Recent Activity Feed
          </h3>
          <span className="text-xs font-mono text-[var(--color-text-faint)]">
            {activity.length} events
          </span>
        </div>

        {/* Timeline Items */}
        <div className="relative mt-3 ml-2 sm:ml-2.5 pl-3.5 sm:pl-4 border-l-2 border-[var(--color-border)] space-y-2">
          {displayedItems.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline Bullet */}
              <div className="absolute -left-[25px] sm:-left-[27px] top-2 w-5 h-5 rounded-full bg-white border-2 border-[var(--color-border-strong)] flex items-center justify-center group-hover:border-[var(--color-accent)] transition-colors shadow-[var(--shadow-xs)]">
                {getEventIcon(item.type)}
              </div>

              {/* Event Card */}
              <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] hover:bg-white hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-xs)] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getBadgeStyle(
                        item.type
                      )}`}
                    >
                      {item.badgeText}
                    </span>

                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] flex items-center gap-1 group-hover:underline"
                    >
                      <span className="truncate max-w-[200px]">{item.repoName}</span>
                      <Icon
                        icon={LinkSquare01Icon}
                        size={10}
                        className="text-[var(--color-text-faint)] group-hover:text-[var(--color-accent)]"
                      />
                    </a>
                  </div>

                  <span className="text-[10.5px] font-mono text-[var(--color-text-faint)] shrink-0">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>

                {/* Event Description */}
                <div className="mt-1 text-xs text-[var(--color-text-secondary)] font-medium leading-snug">
                  {item.title}
                </div>

                {/* Commits list (if push event) */}
                {item.commits && item.commits.length > 0 && (
                  <div className="mt-1.5 space-y-1 pt-1.5 border-t border-[var(--color-border)]/60">
                    {item.commits.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 text-[10.5px] font-mono text-[var(--color-text-muted)]"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] text-[9.5px] font-bold shrink-0">
                          {c.sha}
                        </span>
                        <span className="truncate leading-tight">{c.message}</span>
                      </div>
                    ))}
                    {item.commits.length > 3 && (
                      <div className="text-[10px] font-mono text-[var(--color-text-faint)] pt-0.5">
                        +{item.commits.length - 3} more commits in this push
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show more toggle */}
      {activity.length > 6 && (
        <div className="mt-2.5 pt-2 border-t border-[var(--color-border)] text-center">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer"
          >
            {showAll ? "Show Fewer Activity Items" : `View All ${activity.length} Activity Items`}
          </button>
        </div>
      )}
    </div>
  );
}
