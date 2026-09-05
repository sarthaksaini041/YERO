"use client";

import * as React from "react";
import type { RecentContestItem } from "@/lib/coding/coding-analytics";
import { formatRelativeDate } from "@/lib/coding/coding-analytics";
import { Icon } from "@/components/ui/icon";
import {
  TrophyIcon,
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
} from "@hugeicons/core-free-icons";

interface ContestPerformanceSectionProps {
  contests: RecentContestItem[];
  totalContests: number;
}

export function ContestPerformanceSection({
  contests,
  totalContests,
}: ContestPerformanceSectionProps) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-[var(--shadow-xs)]">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Icon icon={TrophyIcon} size={14} />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)] truncate">
            Contest Performance & Activity
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] shrink-0 whitespace-nowrap">
          {totalContests} Contests Total
        </span>
      </div>

      {/* Contest Timeline List */}
      {contests.length === 0 ? (
        <div className="p-8 my-2 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-dashed border-[var(--color-border)] text-center">
          <Icon icon={TrophyIcon} size={24} className="text-[var(--color-text-faint)] mx-auto mb-1.5" />
          <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">
            No Contest Records Found
          </p>
          <p className="text-[11.5px] text-[var(--color-text-muted)] max-w-sm mx-auto mt-0.5">
            Contest performances and rating adjustments will appear here automatically as you compete in rated rounds on Codeforces, CodeChef, or LeetCode.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)] mt-2">
          {contests.map((c) => {
            const isCf = c.platform === "codeforces";
            const isCc = c.platform === "codechef";

            return (
              <div
                key={c.id}
                className="py-3 px-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[var(--color-surface-alt)]/60 rounded-md transition-colors"
              >
                {/* Left: Contest & Platform Info */}
                <div className="min-w-0 flex items-start gap-2.5">
                  <span
                    className="text-[10.5px] font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0 mt-0.5"
                    style={{
                      backgroundColor: isCf ? "#EFF6FF" : isCc ? "#FEF3C7" : "#FFFBEB",
                      color: isCf ? "#1D4ED8" : isCc ? "#92400E" : "#B45309",
                    }}
                  >
                    {c.platformName}
                  </span>
                  <div className="min-w-0">
                    <h5 className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">
                      {c.contestName}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {c.rank !== undefined && (
                        <span>Rank #{c.rank.toLocaleString()}</span>
                      )}
                      {c.rank !== undefined && <span>·</span>}
                      <span>{formatRelativeDate(c.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Rating Outcome */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                  {c.rating !== undefined && (
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
                        {c.rating}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-faint)]">
                        New Rating
                      </div>
                    </div>
                  )}

                  {c.ratingDelta !== undefined && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold px-2 py-1 rounded-md ${
                        c.ratingDelta > 0
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                          : c.ratingDelta < 0
                          ? "text-rose-700 bg-rose-50 border border-rose-200"
                          : "text-gray-600 bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {c.ratingDelta !== 0 && (
                        <Icon
                          icon={c.ratingDelta > 0 ? ArrowUpRight01Icon : ArrowDownRight01Icon}
                          size={12}
                        />
                      )}
                      {c.ratingDelta > 0 ? `+${c.ratingDelta}` : c.ratingDelta}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
