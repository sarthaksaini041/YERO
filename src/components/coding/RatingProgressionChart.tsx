"use client";

import * as React from "react";
import type { NormalizedPlatformData } from "@/lib/coding/coding-analytics";
import { filterRatingHistoryByTimeframe } from "@/lib/coding/coding-analytics";
import type { TimeframeFilter } from "@/lib/coding/coding-analytics";
import { Icon } from "@/components/ui/icon";
import {
  Chart01Icon,
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
} from "@hugeicons/core-free-icons";

interface RatingProgressionChartProps {
  platforms: NormalizedPlatformData[];
}

interface PlatformSeries {
  platform: string;
  platformName: string;
  color: string;
  currentRating?: number;
  deltaThisMonth?: number;
  points: Array<{
    contest: string;
    rating: number;
    delta?: number;
    rank?: number;
    date: string;
    timestamp: number;
  }>;
}

export function RatingProgressionChart({ platforms }: RatingProgressionChartProps) {
  const [timeframe, setTimeframe] = React.useState<TimeframeFilter>("ALL");
  const [activePlatform, setActivePlatform] = React.useState<string>("all");
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    x: number;
    y: number;
    platformName: string;
    contest: string;
    rating: number;
    rank?: number;
    delta?: number;
    date: string;
  } | null>(null);

  // Build series for platforms that have rating data
  const seriesList: PlatformSeries[] = React.useMemo(() => {
    const list: PlatformSeries[] = [];

    for (const p of platforms) {
      if (p.ratingHistory && p.ratingHistory.length > 0) {
        list.push({
          platform: p.platform,
          platformName: p.platformName,
          color:
            p.platform === "codeforces"
              ? "#3B82F6"
              : p.platform === "codechef"
              ? "#D97706"
              : "#F59E0B",
          currentRating: p.rating,
          deltaThisMonth: p.deltaRecent,
          points: p.ratingHistory,
        });
      }
    }
    return list;
  }, [platforms]);

  // Filter series according to selected timeframe and platform toggle
  const visibleSeries = React.useMemo(() => {
    return seriesList
      .filter((s) => activePlatform === "all" || s.platform === activePlatform)
      .map((s) => ({
        ...s,
        filteredPoints: filterRatingHistoryByTimeframe(s.points, timeframe),
      }))
      .filter((s) => s.filteredPoints.length > 0);
  }, [seriesList, activePlatform, timeframe]);

  // Calculate total points available
  const totalPointsCount = visibleSeries.reduce((acc, s) => acc + s.filteredPoints.length, 0);

  // Compute bounding box for coordinates
  const { minRating, maxRating, minTs, maxTs } = React.useMemo(() => {
    let minR = Infinity;
    let maxR = -Infinity;
    let minT = Infinity;
    let maxT = -Infinity;

    for (const s of visibleSeries) {
      for (const pt of s.filteredPoints) {
        if (pt.rating < minR) minR = pt.rating;
        if (pt.rating > maxR) maxR = pt.rating;
        if (pt.timestamp < minT) minT = pt.timestamp;
        if (pt.timestamp > maxT) maxT = pt.timestamp;
      }
    }

    if (minR === Infinity) {
      return { minRating: 1000, maxRating: 2000, minTs: 0, maxTs: 1 };
    }

    // Add padding to rating domain
    const rPadding = Math.max(50, Math.round((maxR - minR) * 0.1));
    const padMinR = Math.max(0, minR - rPadding);
    const padMaxR = maxR + rPadding;

    return {
      minRating: padMinR,
      maxRating: padMaxR,
      minTs: minT === maxT ? minT - 86400000 : minT,
      maxTs: minT === maxT ? maxT + 86400000 : maxT,
    };
  }, [visibleSeries]);

  // Chart dimensions
  const width = 800;
  const height = 280;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (ts: number) => {
    if (maxTs <= minTs) return padLeft + chartW / 2;
    return padLeft + ((ts - minTs) / (maxTs - minTs)) * chartW;
  };

  const getY = (rating: number) => {
    if (maxRating <= minRating) return padTop + chartH / 2;
    return padTop + chartH - ((rating - minRating) / (maxRating - minRating)) * chartH;
  };

  // Generate 4-5 nice Y-axis grid ticks
  const yTicks = React.useMemo(() => {
    const count = 4;
    const step = (maxRating - minRating) / count;
    return Array.from({ length: count + 1 }, (_, i) => Math.round(minRating + i * step));
  }, [minRating, maxRating]);

  // Timeframe filter chips
  const TIMEFRAMES: Array<{ label: string; value: TimeframeFilter }> = [
    { label: "30D", value: "30D" },
    { label: "3M", value: "3M" },
    { label: "6M", value: "6M" },
    { label: "1Y", value: "1Y" },
    { label: "All", value: "ALL" },
  ];

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-xs)]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon icon={Chart01Icon} size={14} />
          </div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Rating & Performance
          </h3>
        </div>

        {/* Controls: Platform selector & Timeframe chips */}
        <div className="flex flex-wrap items-center gap-2">
          {seriesList.length > 1 && (
            <div className="flex items-center bg-[var(--color-surface-muted)] rounded-lg p-0.5 border border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setActivePlatform("all")}
                className={`px-2 py-1 text-[11.5px] font-medium rounded-md transition-colors cursor-pointer ${
                  activePlatform === "all"
                    ? "bg-white text-[var(--color-text-primary)] shadow-xs"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                All
              </button>
              {seriesList.map((s) => (
                <button
                  key={s.platform}
                  type="button"
                  onClick={() => setActivePlatform(s.platform)}
                  className={`px-2 py-1 text-[11.5px] font-medium rounded-md transition-colors cursor-pointer ${
                    activePlatform === s.platform
                      ? "bg-white text-[var(--color-text-primary)] shadow-xs"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {s.platformName}
                </button>
              ))}
            </div>
          )}

          {/* Timeframe Chips */}
          <div className="flex items-center bg-[var(--color-surface-muted)] rounded-lg p-0.5 border border-[var(--color-border)]">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                type="button"
                onClick={() => setTimeframe(tf.value)}
                className={`px-2 py-1 text-[11.5px] font-medium rounded-md transition-colors cursor-pointer ${
                  timeframe === tf.value
                    ? "bg-white text-[var(--color-text-primary)] shadow-xs"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Rating Mini-Cards */}
      {(() => {
        const ratedPlatforms = platforms.filter(
          (p) => typeof p.rating === "number" && p.rating > 0
        );
        if (ratedPlatforms.length === 0) return null;

        const gridCols =
          ratedPlatforms.length === 1
            ? "grid-cols-1 sm:max-w-xs"
            : ratedPlatforms.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-3";

        return (
          <div className={`grid ${gridCols} gap-3 my-4`}>
            {ratedPlatforms.map((p) => {
              const series = seriesList.find((s) => s.platform === p.platform);
              const delta = series?.deltaThisMonth;

              return (
                <div
                  key={p.id}
                  className="bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            p.platform === "codeforces"
                              ? "#3B82F6"
                              : p.platform === "codechef"
                              ? "#D97706"
                              : "#F59E0B",
                        }}
                      />
                      <span className="text-[12px] font-medium text-[var(--color-text-muted)] truncate">
                        {p.platformName}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
                      {p.rating?.toLocaleString()}
                    </div>
                  </div>

                  {delta !== undefined && (
                    <div
                      className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-md shrink-0 ${
                        delta > 0
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                          : delta < 0
                          ? "text-red-700 bg-red-50 border border-red-200"
                          : "text-gray-600 bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <Icon
                        icon={delta >= 0 ? ArrowUpRight01Icon : ArrowDownRight01Icon}
                        size={13}
                      />
                      <span>
                        {delta > 0 ? `+${delta}` : delta}
                      </span>
                      <span className="text-[10px] font-normal text-[var(--color-text-faint)] ml-0.5">
                        30d
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* SVG Line Chart or Insufficient Data State */}
      {totalPointsCount < 2 ? (
        <div className="h-[220px] rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-dashed border-[var(--color-border)] flex flex-col items-center justify-center p-6 text-center">
          <Icon icon={Chart01Icon} size={28} className="text-[var(--color-text-faint)] mb-2" />
          <p className="text-[13.5px] font-medium text-[var(--color-text-secondary)]">
            Insufficient Historical Contest Data
          </p>
          <p className="text-[12px] text-[var(--color-text-muted)] max-w-md mt-1">
            Historical rating progression requires participation in 2 or more rated contests on Codeforces or CodeChef. Keep competing to visualize your rating trajectory.
          </p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Horizontal Grid lines and Y labels */}
            {yTicks.map((val) => {
              const y = getY(val);
              return (
                <g key={val} className="text-[var(--color-text-faint)]">
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="var(--color-border)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="10.5"
                    fontFamily="monospace"
                    fill="currentColor"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* X Axis bottom baseline */}
            <line
              x1={padLeft}
              y1={height - padBottom}
              x2={width - padRight}
              y2={height - padBottom}
              stroke="var(--color-border-strong)"
              strokeWidth="1"
            />

            {/* Draw lines for each series */}
            {visibleSeries.map((s) => {
              const pts = s.filteredPoints;
              if (pts.length < 1) return null;

              const pathPoints = pts.map((p) => `${getX(p.timestamp)},${getY(p.rating)}`);
              const pathD = `M ${pathPoints.join(" L ")}`;

              // Area fill under the line
              const areaD = `${pathD} L ${getX(pts[pts.length - 1].timestamp)},${
                height - padBottom
              } L ${getX(pts[0].timestamp)},${height - padBottom} Z`;

              return (
                <g key={s.platform}>
                  {/* Subtle area gradient fill */}
                  <defs>
                    <linearGradient id={`grad-${s.platform}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={s.color} stopOpacity="0.12" />
                      <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={areaD} fill={`url(#grad-${s.platform})`} />

                  {/* Main Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Dots with interactive hover detection */}
                  {pts.map((pt, idx) => {
                    const cx = getX(pt.timestamp);
                    const cy = getY(pt.rating);

                    return (
                      <g key={idx} className="cursor-pointer">
                        {/* Invisible larger hit target */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={10}
                          fill="transparent"
                          onMouseEnter={() =>
                            setHoveredPoint({
                              x: cx,
                              y: cy,
                              platformName: s.platformName,
                              contest: pt.contest,
                              rating: pt.rating,
                              rank: pt.rank,
                              delta: pt.delta,
                              date: pt.date,
                            })
                          }
                        />
                        {/* Visible dot */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3.5}
                          fill="#FFFFFF"
                          stroke={s.color}
                          strokeWidth="2"
                          className="transition-transform duration-100 hover:scale-150"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none z-20 bg-[var(--color-text-primary)] text-white text-xs rounded-lg p-2.5 shadow-lg max-w-xs transition-all duration-75 -translate-x-1/2 -translate-y-full mb-2"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100}%`,
              }}
            >
              <div className="font-semibold text-white/90 text-[11px] truncate">
                {hoveredPoint.contest}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm font-bold text-white">
                  {hoveredPoint.rating}
                </span>
                {hoveredPoint.delta !== undefined && (
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      hoveredPoint.delta >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {hoveredPoint.delta >= 0 ? `+${hoveredPoint.delta}` : hoveredPoint.delta}
                  </span>
                )}
                {hoveredPoint.rank && (
                  <span className="text-white/60 text-[11px]">
                    Rank #{hoveredPoint.rank.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-white/50 mt-0.5">
                {hoveredPoint.platformName} · {hoveredPoint.date}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
