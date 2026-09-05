"use client";

import * as React from "react";
import type { DeveloperPRItem, DeveloperIssueItem } from "@/lib/developer/developer-analytics";
import { formatRelativeTime } from "@/lib/developer/developer-analytics";
import { Icon } from "@/components/ui/icon";
import {
  GitPullRequestIcon,
  AlertCircleIcon,
  LinkSquare01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

interface PullRequestsAndIssuesSectionProps {
  pullRequests: DeveloperPRItem[];
  issues: DeveloperIssueItem[];
  totalPRs: number;
  totalIssues: number;
}

export function PullRequestsAndIssuesSection({
  pullRequests,
  issues,
  totalPRs,
  totalIssues,
}: PullRequestsAndIssuesSectionProps) {
  const [activeTab, setActiveTab] = React.useState<"prs" | "issues">("prs");

  const displayedPRs = pullRequests.slice(0, 6);
  const displayedIssues = issues.slice(0, 6);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-[var(--shadow-xs)] flex flex-col justify-between">
      <div>
        {/* Header & Tab Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-base sm:text-heading font-semibold text-[var(--color-text-primary)]">
              PRs & Issues
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Contributions and open-source discussions
            </p>
          </div>

          <div className="inline-flex items-center p-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("prs")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "prs"
                  ? "bg-white text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon icon={GitPullRequestIcon} size={13} className="text-purple-600 shrink-0" />
              <span>PRs</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "prs"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-black/5 text-[var(--color-text-faint)]"
                }`}
              >
                {totalPRs}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("issues")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "issues"
                  ? "bg-white text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon icon={AlertCircleIcon} size={13} className="text-emerald-600 shrink-0" />
              <span>Issues</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === "issues"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-black/5 text-[var(--color-text-faint)]"
                }`}
              >
                {totalIssues}
              </span>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="mt-4">
          {activeTab === "prs" ? (
            displayedPRs.length === 0 ? (
              <div className="text-center py-12 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)]">
                No recent pull requests recorded.
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayedPRs.map((pr) => {
                  const isMerged = pr.state === "merged";
                  const isOpen = pr.state === "open";

                  return (
                    <div
                      key={pr.id}
                      className="group p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] hover:bg-white hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-xs)] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Status Icon */}
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isMerged
                              ? "bg-purple-50 text-purple-600 border border-purple-200"
                              : isOpen
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-rose-50 text-rose-600 border border-rose-200"
                          }`}
                        >
                          <Icon icon={GitPullRequestIcon} size={13} />
                        </div>

                        {/* PR Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              <span className="text-[11.5px] font-mono font-medium text-[var(--color-text-secondary)] truncate">
                                {pr.repo} <span className="text-[var(--color-text-muted)] font-normal">#{pr.number}</span>
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold capitalize ${
                                  isMerged
                                    ? "bg-purple-100 text-purple-800"
                                    : isOpen
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {pr.state}
                              </span>
                            </div>

                            <span className="text-[10.5px] font-mono text-[var(--color-text-faint)] shrink-0">
                              {formatRelativeTime(pr.createdAt)}
                            </span>
                          </div>

                          <div className="mt-1">
                            <a
                              href={pr.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 leading-snug line-clamp-1 transition-colors group-hover:underline"
                            >
                              <span>{pr.title}</span>
                              <Icon
                                icon={LinkSquare01Icon}
                                size={10}
                                className="shrink-0 text-[var(--color-text-faint)] group-hover:text-[var(--color-accent)] transition-colors opacity-0 group-hover:opacity-100"
                              />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : displayedIssues.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)]">
              No recent issues recorded.
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedIssues.map((issue) => {
                const isOpen = issue.state === "open";

                return (
                  <div
                    key={issue.id}
                    className="group p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] hover:bg-white hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-xs)] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          isOpen
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-purple-50 text-purple-600 border border-purple-200"
                        }`}
                      >
                        <Icon icon={isOpen ? AlertCircleIcon : Tick02Icon} size={13} />
                      </div>

                      {/* Issue Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <span className="text-[11.5px] font-mono font-medium text-[var(--color-text-secondary)] truncate">
                              {issue.repo} <span className="text-[var(--color-text-muted)] font-normal">#{issue.number}</span>
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold capitalize ${
                                isOpen
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {issue.state}
                            </span>
                          </div>

                          <span className="text-[10.5px] font-mono text-[var(--color-text-faint)] shrink-0">
                            {formatRelativeTime(issue.createdAt)}
                          </span>
                        </div>

                        <div className="mt-1">
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 leading-snug line-clamp-1 transition-colors group-hover:underline"
                          >
                            <span>{issue.title}</span>
                            <Icon
                              icon={LinkSquare01Icon}
                              size={10}
                              className="shrink-0 text-[var(--color-text-faint)] group-hover:text-[var(--color-accent)] transition-colors opacity-0 group-hover:opacity-100"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {((activeTab === "prs" && pullRequests.length > 6) ||
        (activeTab === "issues" && issues.length > 6)) && (
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-center">
          <span className="text-[11px] font-mono text-[var(--color-text-faint)]">
            Showing top 6 of {activeTab === "prs" ? pullRequests.length : issues.length} items
          </span>
        </div>
      )}
    </div>
  );
}
