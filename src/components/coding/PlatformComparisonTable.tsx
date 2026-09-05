"use client";

import * as React from "react";
import type { NormalizedPlatformData } from "@/lib/coding/coding-analytics";
import { formatRelativeDate } from "@/lib/coding/coding-analytics";
import { Icon } from "@/components/ui/icon";
import { LinkSquare01Icon } from "@hugeicons/core-free-icons";

interface PlatformComparisonTableProps {
  platforms: NormalizedPlatformData[];
}

export function PlatformComparisonTable({ platforms }: PlatformComparisonTableProps) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-5 shadow-[var(--shadow-xs)]">
      {/* Header */}
      <div className="pb-3 border-b border-[var(--color-border)]">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Platform Comparison Matrix
        </h3>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto mt-3 -mx-4 px-4 sm:-mx-5 sm:px-5">
        <table className="w-full text-left border-collapse text-xs min-w-[580px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)]">
              <th className="py-2.5 px-3">Platform</th>
              <th className="py-2.5 px-3">Rating</th>
              <th className="py-2.5 px-3">Max Rating</th>
              <th className="py-2.5 px-3">Problems</th>
              <th className="py-2.5 px-3">Contests</th>
              <th className="py-2.5 px-3">Rank / Tier</th>
              <th className="py-2.5 px-3 text-right">Last Synced</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {platforms.map((p) => {
              return (
                <tr
                  key={p.id}
                  className="hover:bg-[var(--color-surface-alt)]/70 transition-colors"
                >
                  {/* Platform + Handle */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            p.platform === "leetcode"
                              ? "#F59E0B"
                              : p.platform === "codeforces"
                              ? "#3B82F6"
                              : "#D97706",
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] text-[var(--color-text-primary)]">
                          {p.platformName}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                          <span>@{p.username}</span>
                          {p.profileUrl && (
                            <a
                              href={p.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[var(--color-accent)] inline-flex items-center"
                              title="Visit Profile"
                            >
                              <Icon icon={LinkSquare01Icon} size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-3 font-mono font-semibold text-[13px] text-[var(--color-text-primary)]">
                    {p.rating ? p.rating.toLocaleString() : "—"}
                  </td>

                  {/* Max Rating */}
                  <td className="py-3 px-3 font-mono text-[var(--color-text-muted)]">
                    {p.maxRating ? p.maxRating.toLocaleString() : "—"}
                  </td>

                  {/* Problems Solved */}
                  <td className="py-3 px-3 font-mono font-medium text-[var(--color-text-secondary)]">
                    {p.problemsSolved !== undefined
                      ? p.problemsSolved.toLocaleString()
                      : "—"}
                  </td>

                  {/* Contests */}
                  <td className="py-3 px-3 font-mono font-medium text-[var(--color-text-secondary)]">
                    {p.contestsParticipated !== undefined
                      ? p.contestsParticipated.toLocaleString()
                      : "—"}
                  </td>

                  {/* Rank / Tier */}
                  <td className="py-3 px-3 text-[var(--color-text-secondary)] font-medium">
                    {p.rank ? (
                      <span className="capitalize">{p.rank}</span>
                    ) : p.globalRank ? (
                      <span className="font-mono">#{p.globalRank.toLocaleString()}</span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Last Synced */}
                  <td className="py-3 px-3 text-right text-[11px] text-[var(--color-text-faint)] whitespace-nowrap">
                    {formatRelativeDate(p.lastSyncedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
