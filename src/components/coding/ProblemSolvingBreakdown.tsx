"use client";

import * as React from "react";
import type { DifficultyBreakdown, NormalizedPlatformData } from "@/lib/coding/coding-analytics";
import { Icon } from "@/components/ui/icon";
import { CheckListIcon } from "@hugeicons/core-free-icons";

interface ProblemSolvingBreakdownProps {
  difficulty: DifficultyBreakdown;
  platforms: NormalizedPlatformData[];
  totalProblemsSolved: number;
}

export function ProblemSolvingBreakdown({
  difficulty,
  platforms,
  totalProblemsSolved,
}: ProblemSolvingBreakdownProps) {
  // Competitive programming platforms that have problems solved count
  const cpPlatforms = platforms.filter(
    (p) => typeof p.problemsSolved === "number" && p.problemsSolved > 0
  );

  const easyPercent = difficulty.totalWithDifficulty > 0
    ? Math.round((difficulty.easy / difficulty.totalWithDifficulty) * 100)
    : 0;

  const mediumPercent = difficulty.totalWithDifficulty > 0
    ? Math.round((difficulty.medium / difficulty.totalWithDifficulty) * 100)
    : 0;

  const hardPercent = difficulty.totalWithDifficulty > 0
    ? Math.round((difficulty.hard / difficulty.totalWithDifficulty) * 100)
    : 0;

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-[var(--shadow-xs)] flex flex-col justify-between">
      {/* Header */}
      <div className="pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Icon icon={CheckListIcon} size={14} />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)] truncate">
              Problem-Solving Breakdown
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] shrink-0 whitespace-nowrap">
            {totalProblemsSolved.toLocaleString()} Solved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 mt-4">
        {/* Left: Difficulty Breakdown (LeetCode verified tiers) */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] truncate">
              Difficulty Tiers (LeetCode)
            </span>
            {difficulty.hasDifficultyData && (
              <span className="text-[11px] text-[var(--color-text-faint)] font-mono shrink-0">
                {difficulty.totalWithDifficulty.toLocaleString()} categorized
              </span>
            )}
          </div>

          {difficulty.hasDifficultyData ? (
            <div className="space-y-3">
              {/* Stacked Proportional Bar */}
              <div className="w-full h-2 rounded-full bg-[var(--color-surface-muted)] overflow-hidden flex">
                <div
                  style={{ width: `${easyPercent}%` }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                  title={`Easy: ${difficulty.easy} (${easyPercent}%)`}
                />
                <div
                  style={{ width: `${mediumPercent}%` }}
                  className="h-full bg-amber-500 transition-all duration-300"
                  title={`Medium: ${difficulty.medium} (${mediumPercent}%)`}
                />
                <div
                  style={{ width: `${hardPercent}%` }}
                  className="h-full bg-rose-500 transition-all duration-300"
                  title={`Hard: ${difficulty.hard} (${hardPercent}%)`}
                />
              </div>

              {/* Easy Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    Easy
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-[var(--color-text-primary)]">
                      {difficulty.easy.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-faint)] font-mono w-8 text-right">
                      {easyPercent}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${easyPercent}%` }}
                  />
                </div>
              </div>

              {/* Medium Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-amber-700 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    Medium
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-[var(--color-text-primary)]">
                      {difficulty.medium.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-faint)] font-mono w-8 text-right">
                      {mediumPercent}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${mediumPercent}%` }}
                  />
                </div>
              </div>

              {/* Hard Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-rose-700 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    Hard
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-[var(--color-text-primary)]">
                      {difficulty.hard.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-faint)] font-mono w-8 text-right">
                      {hardPercent}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${hardPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[var(--color-surface-alt)] border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
              Connect LeetCode to see verified Easy / Medium / Hard problem breakdown.
            </div>
          )}
        </div>

        {/* Right: Solved per Platform */}
        <div className="border-t border-[var(--color-border)] pt-4 md:border-t-0 md:pt-0 lg:border-t lg:pt-4">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] truncate">
              By Platform
            </span>
            <span className="text-[11px] text-[var(--color-text-faint)] font-mono shrink-0">
              {cpPlatforms.length} {cpPlatforms.length === 1 ? "platform" : "platforms"}
            </span>
          </div>

          {cpPlatforms.length > 0 ? (
            <div className="space-y-3">
              {cpPlatforms.map((p) => {
                const solved = p.problemsSolved || 0;
                const pct = totalProblemsSolved > 0
                  ? Math.round((solved / totalProblemsSolved) * 100)
                  : 0;

                const color =
                  p.platform === "leetcode"
                    ? "#F59E0B"
                    : p.platform === "codeforces"
                    ? "#3B82F6"
                    : "#D97706";

                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-[var(--color-text-secondary)] shrink-0">
                          {p.platformName}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-faint)] truncate max-w-[90px] sm:max-w-[120px]">
                          (@{p.username})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-[var(--color-text-primary)]">
                          {solved.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-faint)] font-mono w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[var(--color-surface-alt)] border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
              No problem-solving metrics available from connected platforms yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
