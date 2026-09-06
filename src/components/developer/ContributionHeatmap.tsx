"use client";

import * as React from "react";
import type { ContributionDay } from "@/lib/developer/developer-analytics";
import { Icon } from "@/components/ui/icon";
import {
  FireIcon,
  SparklesIcon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";

interface ContributionHeatmapProps {
  calendar: ContributionDay[];
  currentStreak: number;
  longestStreak: number;
  totalThisYear?: number;
  username: string;
  years?: Record<string, number>;
  mostActiveDay?: { date: string; count: number };
}

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-[#F0F2F5] border-[#E2E5E9]/80 hover:border-slate-400/60",
  1: "bg-[#9BE9A8] border-[#7BC96F]/70 hover:border-[#57A54C]",
  2: "bg-[#40C463] border-[#30A14E]/70 hover:border-[#216E39]",
  3: "bg-[#30A14E] border-[#216E39]/80 hover:border-[#196127]",
  4: "bg-[#216E39] border-[#144622] shadow-[0_1px_2px_rgba(33,110,57,0.25)] hover:border-[#0D3017]",
};

export function ContributionHeatmap({
  calendar,
  currentStreak,
  longestStreak,
  username,
}: ContributionHeatmapProps) {
  const [hoveredCell, setHoveredCell] = React.useState<{
    date: string;
    count: number;
    targetRect?: DOMRect;
  } | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Filter calendar to show only current year (from Jan 1 up to today)
  const filteredCalendar = React.useMemo(() => {
    if (!calendar || calendar.length === 0) return [];
    const sorted = [...calendar].sort((a, b) => a.date.localeCompare(b.date));

    const now = new Date();
    const currentYearStr = now.getFullYear().toString();
    const utcToday = now.toISOString().slice(0, 10);
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const effectiveToday = localToday > utcToday ? localToday : utcToday;

    const thisYearDays = sorted.filter(
      (d) => d.date.startsWith(currentYearStr) && d.date <= effectiveToday
    );

    if (thisYearDays.length > 0) {
      return thisYearDays;
    }

    return sorted.filter((d) => d.date <= effectiveToday).slice(-180);
  }, [calendar]);

  // Active days count
  const activeDaysCount = React.useMemo(() => {
    return filteredCalendar.filter((d) => (d.count || 0) > 0).length;
  }, [filteredCalendar]);

  // Group into columns of 7 days
  const { weeks, monthLabels } = React.useMemo(() => {
    if (!filteredCalendar || filteredCalendar.length === 0) {
      return { weeks: [], monthLabels: [] };
    }

    const weekColumns: Array<Array<ContributionDay | null>> = [];
    const months: Array<{ label: string; colIndex: number }> = [];

    let currentWeek: Array<ContributionDay | null> = [];
    let lastSeenMonth = -1;

    // Pad first week to start with Sunday (day 0)
    const firstDate = new Date(`${filteredCalendar[0].date}T00:00:00Z`);
    const firstDayOfWeek = firstDate.getUTCDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let i = 0; i < filteredCalendar.length; i++) {
      const day = filteredCalendar[i];
      const d = new Date(`${day.date}T00:00:00Z`);
      const monthIdx = d.getUTCMonth();

      if (lastSeenMonth === -1 || (monthIdx !== lastSeenMonth && currentWeek.length < 4)) {
        lastSeenMonth = monthIdx;
        const monthName = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
        months.push({ label: monthName, colIndex: weekColumns.length });
      }

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weekColumns.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weekColumns.push(currentWeek);
    }

    return { weeks: weekColumns, monthLabels: months };
  }, [filteredCalendar]);

  // Auto-scroll to the rightmost (latest) days on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks]);

  const formatDateTooltip = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00Z`);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 sm:p-5 shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] transition-all duration-200 relative w-full h-full flex flex-col justify-between">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-[15px] sm:text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            Contribution Activity
          </h3>

          {/* Premium Streak Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-orange-50/80 text-amber-900 border border-amber-200/90 shadow-[0_1px_2px_rgba(245,158,11,0.06)]">
            <Icon icon={FireIcon} size={13} className="text-amber-500 shrink-0" />
            <span>{currentStreak} {currentStreak === 1 ? "day streak" : "days streak"}</span>
            {longestStreak > 0 && (
              <span className="text-amber-700/90 font-medium text-[10.5px] bg-amber-100/70 px-1.5 py-0.5 rounded-full border border-amber-200/60">
                Peak: {longestStreak}d
              </span>
            )}
          </div>

          <span className="text-xs font-medium text-[var(--color-text-muted)] hidden sm:inline-flex items-center gap-1.5 ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              <strong className="font-semibold font-mono text-[var(--color-text-primary)]">{activeDaysCount}</strong> active days
            </span>
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] shrink-0">
          {new Date().getFullYear()}
        </span>
      </div>

      {/* 2. Heatmap Grid Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pt-2 pb-2 -mx-1 px-1 select-none scroll-smooth"
      >
        <div className="inline-block min-w-max">
          {/* Month Labels */}
          <div className="relative h-4 text-[10px] font-bold text-[var(--color-text-muted)] mb-2 w-full uppercase tracking-wider">
            {monthLabels.map((m, idx) => (
              <span
                key={`${m.label}-${idx}`}
                style={{
                  position: "absolute",
                  left: `${m.colIndex * 14 + 32}px`,
                }}
                className="select-none pointer-events-none"
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-2 items-start">
            {/* Day of Week Labels (pixel-perfect aligned with rows) */}
            <div className="flex flex-col gap-[3px] text-[9px] font-semibold text-[var(--color-text-faint)] select-none shrink-0 pr-1">
              <span className="h-[11px] leading-[11px] opacity-0 select-none">Sun</span>
              <span className="h-[11px] leading-[11px]">Mon</span>
              <span className="h-[11px] leading-[11px] opacity-0 select-none">Tue</span>
              <span className="h-[11px] leading-[11px]">Wed</span>
              <span className="h-[11px] leading-[11px] opacity-0 select-none">Thu</span>
              <span className="h-[11px] leading-[11px]">Fri</span>
              <span className="h-[11px] leading-[11px] opacity-0 select-none">Sat</span>
            </div>

            {/* Weeks Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${dIdx}`}
                          className="w-[11px] h-[11px] rounded-[2.5px] opacity-0 pointer-events-none"
                        />
                      );
                    }

                    const level = Math.min(Math.max(day.level, 0), 4);
                    const colorClass = LEVEL_COLORS[level] || LEVEL_COLORS[0];

                    return (
                      <div
                        key={day.date}
                        className={`w-[11px] h-[11px] rounded-[2.5px] border cursor-pointer transition-all duration-150 hover:scale-135 hover:z-20 hover:shadow-sm ${colorClass}`}
                        onMouseEnter={(e) => {
                          setHoveredCell({
                            date: day.date,
                            count: day.count,
                            targetRect: e.currentTarget.getBoundingClientRect(),
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-[var(--radius-md)] bg-slate-900/95 backdrop-blur-md text-white text-[11.5px] shadow-xl border border-slate-700/60 transform -translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center leading-tight transition-opacity"
          style={{
            top: (hoveredCell.targetRect?.top || 0) - 6,
            left: (hoveredCell.targetRect?.left || 0) + (hoveredCell.targetRect?.width || 0) / 2,
          }}
        >
          <span className="font-semibold text-white">
            {hoveredCell.count === 0
              ? "No contributions"
              : `${hoveredCell.count} contribution${hoveredCell.count === 1 ? "" : "s"}`}
          </span>
          <span className="text-[10px] text-slate-300 font-mono mt-0.5">
            {formatDateTooltip(hoveredCell.date)}
          </span>
          <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 absolute -bottom-0.5 border-r border-b border-slate-700/60" />
        </div>
      )}

      {/* 3. Footer & Legend */}
      <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-3">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 font-semibold text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          >
            <Icon icon={SparklesIcon} size={13} className="text-emerald-600 group-hover:rotate-12 transition-transform duration-200" />
            <span>View GitHub Profile</span>
            <Icon icon={LinkSquare01Icon} size={11} className="text-[var(--color-text-faint)] group-hover:text-[var(--color-accent)] transition-colors" />
          </a>
        </div>

        {/* Level Legend */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
          <span className="text-[var(--color-text-faint)]">Less</span>
          <div className="w-[10px] h-[10px] rounded-[2.5px] bg-[#F0F2F5] border border-[#E2E5E9]/80" />
          <div className="w-[10px] h-[10px] rounded-[2.5px] bg-[#9BE9A8] border border-[#7BC96F]/70" />
          <div className="w-[10px] h-[10px] rounded-[2.5px] bg-[#40C463] border border-[#30A14E]/70" />
          <div className="w-[10px] h-[10px] rounded-[2.5px] bg-[#30A14E] border border-[#216E39]/80" />
          <div className="w-[10px] h-[10px] rounded-[2.5px] bg-[#216E39] border border-[#144622]" />
          <span className="text-[var(--color-text-faint)]">More</span>
        </div>
      </div>
    </div>
  );
}
