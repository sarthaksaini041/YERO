"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SourceCodeIcon, LinkSquare01Icon } from "@hugeicons/core-free-icons";

export function CodingEmptyState() {
  const supported = [
    {
      name: "LeetCode",
      desc: "Problem counts, difficulty distribution, contest rating & rank",
      color: "#F59E0B",
      bg: "#FFFBEB",
    },
    {
      name: "Codeforces",
      desc: "Official rating, rank tier, max rating, submissions & contest history",
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      name: "CodeChef",
      desc: "Current & peak rating, star tier, global & country rankings",
      color: "#D97706",
      bg: "#FEF3C7",
    },
    {
      name: "AtCoder",
      desc: "Algorithm & heuristic contests, color rankings, and rated progression",
      color: "#374151",
      bg: "#F3F4F6",
    },
  ];

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 sm:p-12 shadow-[var(--shadow-sm)] text-center max-w-2xl mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-xs)]">
        <Icon icon={SourceCodeIcon} size={28} />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
        Track Your Competitive Programming
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
        Connect your competitive programming accounts to aggregate your problem counts, contest ratings, and progression curves into a unified analytics dashboard.
      </p>

      {/* Supported Platforms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left">
        {supported.map((p) => (
          <div
            key={p.name}
            className="p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] flex items-start gap-3"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5"
              style={{ backgroundColor: p.bg, color: p.color }}
            >
              {p.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                {p.name}
              </h4>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-snug">
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href="/connectors">
          <Button size="lg" className="px-6 font-semibold flex items-center gap-2">
            <span>Connect Platforms</span>
            <Icon icon={LinkSquare01Icon} size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
