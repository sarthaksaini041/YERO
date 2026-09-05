"use client";

import * as React from "react";
import type { ContributionDay } from "@/lib/developer/developer-analytics";
import { Icon } from "@/components/ui/icon";
import {
  FireIcon,
  SparklesIcon,
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
  0: "bg-[#EBEDF0] border-[#E1E4E8]/60",
  1: "bg-[#9BE9A8] border-[#85D793]/80",
  2: "bg-[#40C463] border-[#34B055]/80",
  3: "bg-[#30A14E] border-[#258B40]/90",
  4: "bg-[#216E39] border-[#18582C]",
};

type ViewPeriod = "52weeks" | "26weeks" | "currentYear";

export function ContributionHeatmap({
  calendar,
  currentStreak,
  longestStreak,
  username,
  mostActiveDay,
}: ContributionHeatmapProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<ViewPeriod>("52weeks");
  const [hoveredCell, setHoveredCell] = React.useState<{
    date: string;
    count: number;
    targetRect?: DOMRect;
  } | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Filter calendar based on selected period
  const filteredCalendar = React.useMemo(() => {
    if (!calendar || calendar.length === 0) return [];
    const sorted = [...calendar].sort((a, b) => a.date.localeCompare(b.date));

    if (selectedPeriod === "26weeks") {
      return sorted.slice(-182);
    }
    if (selectedPeriod === "currentYear") {
      const currentYearStr = new Date().getFullYear().toString();
      const thisYearDays = sorted.filter((d) => d.date.startsWith(currentYearStr));
      return thisYearDays.length > 0 ? thisYearDays : sorted.slice(-371);
    }
    // Default 52 weeks (~371 days)
    return sorted.slice(-371);
  }, [calendar, selectedPeriod]);

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

      if (monthIdx !== lastSeenMonth && currentWeek.length < 4) {
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

  // Auto-scroll to the rightmost (latest) days on mount or period change
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
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-4.5 shadow-[var(--shadow-xs)] relative">
      {/* 1. Header & Period Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-base sm:text-heading font-semibold text-[var(--color-text-primary)]">
            Contribution Activity
          </h3>

          {/* Compact Streak Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 shadow-[var(--shadow-xs)]">
            <Icon icon={FireIcon} size={13} className="text-amber-600 shrink-0" />
            <span>{currentStreak} {currentStreak === 1 ? "day streak" : "days streak"}</span>
            {longestStreak > 0 && (
              <span className="text-amber-700/80 font-normal ml-0.5 text-[11px]">
                (Peak: {longestStreak}d)
              </span>
            )}
          </div>

          <span className="text-xs font-mono text-[var(--color-text-faint)] hidden sm:inline">
            · {activeDaysCount} active days
          </span>
        </div>

        {/* Period filter buttons */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setSelectedPeriod("52weeks")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedPeriod === "52weeks"
                ? "bg-white text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Past Year
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeriod("currentYear")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedPeriod === "currentYear"
                ? "bg-white text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {new Date().getFullYear()}
          </button>
          <button
            type="button"
            onClick={() => setSelectedPeriod("26weeks")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              selectedPeriod === "26weeks"
                ? "bg-white text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            6 Months
          </button>
        </div>
      </div>

      {/* 3. Heatmap Grid Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pt-1 pb-3 -mx-2 px-2 select-none scroll-smooth"
      >
        <div className="inline-block min-w-max">
          {/* Month Labels */}
          <div className="relative h-4 text-[10.5px] font-medium text-[var(--color-text-faint)] mb-1.5 w-full">
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
            {/* Day of Week Labels */}
            <div className="flex flex-col justify-between text-[9.5px] font-medium text-[var(--color-text-faint)] h-[90px] select-none shrink-0 pr-1 py-0.5">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
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
                          className="w-[11px] h-[11px] rounded-[2px] opacity-0 pointer-events-none"
                        />
                      );
                    }

                    const level = Math.min(Math.max(day.level, 0), 4);
                    const colorClass = LEVEL_COLORS[level] || LEVEL_COLORS[0];

                    return (
                      <div
                        key={day.date}
                        className={`w-[11px] h-[11px] rounded-[2.5px] border cursor-pointer transition-all duration-100 hover:scale-125 hover:z-10 ${colorClass}`}
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
          className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-text-primary)] text-white text-[11px] shadow-lg transform -translate-x-1/2 -translate-y-full mb-1.5 flex flex-col items-center leading-tight transition-opacity"
          style={{
            top: (hoveredCell.targetRect?.top || 0) - 6,
            left: (hoveredCell.targetRect?.left || 0) + (hoveredCell.targetRect?.width || 0) / 2,
          }}
        >
          <span className="font-semibold">
            {hoveredCell.count === 0
              ? "No contributions"
              : `${hoveredCell.count} contribution${hoveredCell.count === 1 ? "" : "s"}`}
          </span>
          <span className="text-[10px] text-slate-300">
            {formatDateTooltip(hoveredCell.date)}
          </span>
          <div className="w-1.5 h-1.5 bg-[var(--color-text-primary)] rotate-45 absolute -bottom-0.5" />
        </div>
      )}

      {/* 4. Footer & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3.5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-3">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-accent)] inline-flex items-center gap-1.5 font-medium transition-colors"
          >
            <Icon icon={SparklesIcon} size={12} className="text-emerald-600" />
            <span>View GitHub Profile</span>
          </a>

          {mostActiveDay && mostActiveDay.count > 0 && (
            <span className="text-[11px] text-[var(--color-text-faint)] hidden sm:inline">
              Peak day: {formatDateTooltip(mostActiveDay.date)} ({mostActiveDay.count} events)
            </span>
          )}
        </div>

        {/* Level Legend */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[var(--color-text-faint)]">Less</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#EBEDF0] border border-[#E1E4E8]/60" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#9BE9A8] border border-[#85D793]/80" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#40C463] border border-[#34B055]/80" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#30A14E] border border-[#258B40]/90" />
          <div className="w-[10px] h-[10px] rounded-[2px] bg-[#216E39] border border-[#18582C]" />
          <span className="text-[var(--color-text-faint)]">More</span>
        </div>
      </div>
    </div>
  );
}
