"use client";

import * as React from "react";
import type { DeveloperLanguageItem } from "@/lib/developer/developer-analytics";

interface LanguageDistributionCardProps {
  languages: DeveloperLanguageItem[];
  totalRepos: number;
}

export function LanguageDistributionCard({
  languages,
  totalRepos,
}: LanguageDistributionCardProps) {
  if (!languages || languages.length === 0) {
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-[var(--shadow-xs)] flex flex-col justify-center min-h-[300px]">
        <h3 className="text-base sm:text-heading font-semibold text-[var(--color-text-primary)]">
          Programming Languages
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          No language statistics available yet for this profile.
        </p>
      </div>
    );
  }

  // Calculate sum of detected percentages for normalization if needed
  const topLanguages = languages.slice(0, 8);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-[var(--shadow-xs)] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-base sm:text-heading font-semibold text-[var(--color-text-primary)]">
              Programming Languages
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Code distribution across {totalRepos} owned public repositories
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-faint)]">
            {languages.length} detected
          </span>
        </div>

        {/* Proportional Multi-Color Progress Bar */}
        <div className="h-3 w-full rounded-full overflow-hidden flex mt-4 bg-[var(--color-surface-muted)] p-0.5 gap-0.5 shadow-inner">
          {languages.map((lang) => (
            <div
              key={lang.name}
              style={{
                width: `${Math.max(lang.percentage, 2)}%`,
                backgroundColor: lang.color,
              }}
              className="h-full rounded-sm first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-90"
              title={`${lang.name}: ${lang.percentage}% (${lang.count} repos)`}
            />
          ))}
        </div>

        {/* Language Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {topLanguages.map((lang) => (
            <div
              key={lang.name}
              className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                  {lang.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <span className="text-xs font-bold font-mono text-[var(--color-text-primary)]">
                  {lang.percentage}%
                </span>
                <span className="text-[10.5px] text-[var(--color-text-faint)]">
                  ({lang.count} {lang.count === 1 ? "repo" : "repos"})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {languages.length > 8 && (
        <div className="mt-3 pt-2 text-right">
          <span className="text-[11px] text-[var(--color-text-faint)] font-mono">
            +{languages.length - 8} more languages detected
          </span>
        </div>
      )}
    </div>
  );
}
