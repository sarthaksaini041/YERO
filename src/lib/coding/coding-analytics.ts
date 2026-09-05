// ─────────────────────────────────────────────────────────────────────────────
// Coding Analytics Aggregation Engine
// Aggregates real data from connected competitive programming platforms and GitHub.
// Never fabricates fake statistics. Handles errors, missing data, and unexposed metrics.
// ─────────────────────────────────────────────────────────────────────────────

import type { Platform } from "@/lib/connectors/types";
import type { ConnectorRecord } from "@/actions/connectors";

export interface PlatformConfig {
  platform: Platform;
  name: string;
  shortName: string;
  isCompetitive: boolean;
  color: string;
  bgLight: string;
  borderColor: string;
  profileUrlTemplate?: (username: string) => string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  leetcode: {
    platform: "leetcode",
    name: "LeetCode",
    shortName: "LC",
    isCompetitive: true,
    color: "#F59E0B", // Warm Amber
    bgLight: "#FFFBEB",
    borderColor: "#FDE68A",
    profileUrlTemplate: (u) => `https://leetcode.com/${u}`,
  },
  codeforces: {
    platform: "codeforces",
    name: "Codeforces",
    shortName: "CF",
    isCompetitive: true,
    color: "#3B82F6", // Bright Blue
    bgLight: "#EFF6FF",
    borderColor: "#BFDBFE",
    profileUrlTemplate: (u) => `https://codeforces.com/profile/${u}`,
  },
  codechef: {
    platform: "codechef",
    name: "CodeChef",
    shortName: "CC",
    isCompetitive: true,
    color: "#D97706", // Deep Amber/Bronze
    bgLight: "#FEF3C7",
    borderColor: "#FDE68A",
    profileUrlTemplate: (u) => `https://www.codechef.com/users/${u}`,
  },
  github: {
    platform: "github",
    name: "GitHub",
    shortName: "GH",
    isCompetitive: false,
    color: "#0F172A", // Dark Slate
    bgLight: "#F1F5F9",
    borderColor: "#CBD5E1",
    profileUrlTemplate: (u) => `https://github.com/${u}`,
  },
};

export interface NormalizedPlatformData {
  id: string;
  platform: Platform;
  platformName: string;
  username: string;
  profileUrl?: string;
  avatarUrl?: string;
  displayName?: string;
  status: "connected" | "error" | "syncing";
  lastSyncedAt: string | null;
  errorMessage: string | null;

  // Rating & Tier
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  globalRank?: number;
  countryRank?: number;
  stars?: number;

  // Problems Solved
  problemsSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;

  // Contests
  contestsParticipated?: number;

  // Rating progression items
  ratingHistory: Array<{
    contest: string;
    rating: number;
    oldRating?: number;
    delta?: number;
    rank?: number;
    date: string;
    timestamp: number;
  }>;
  deltaRecent?: number;

  // GitHub specific
  repos?: number;
  starsReceived?: number;
  followers?: number;
  topLanguages?: string[];
}

export interface RecentContestItem {
  id: string;
  platform: Platform;
  platformName: string;
  contestName: string;
  date: string;
  timestamp: number;
  rank?: number;
  rating?: number;
  ratingDelta?: number;
}

export interface DifficultyBreakdown {
  easy: number;
  medium: number;
  hard: number;
  totalWithDifficulty: number;
  hasDifficultyData: boolean;
}

export interface CodingDashboardAnalytics {
  overview: {
    totalProblemsSolved: number;
    totalContests: number;
    bestRating: {
      rating: number;
      platform: Platform;
      platformName: string;
    } | null;
    allRatings: Array<{
      platform: Platform;
      platformName: string;
      rating: number;
      maxRating?: number;
    }>;
    yeroScore: number;
    connectedPlatformsCount: number;
    competitivePlatformsCount: number;
  };

  platforms: NormalizedPlatformData[];
  difficultyBreakdown: DifficultyBreakdown;
  recentContests: RecentContestItem[];
  hasAnyConnected: boolean;
  hasSyncErrors: boolean;
  lastSyncedTimestamp: string | null;
}

/** Parse ISO or date string to timestamp safely */
export function safeParseDateToTimestamp(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  const parsed = new Date(dateStr).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/** Formats a date relative to now or as a concise short string */
export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  const ts = safeParseDateToTimestamp(dateStr);
  if (ts === 0) return dateStr;

  const now = Date.now();
  const diffMs = now - ts;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;

  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Normalizes a single ConnectorRecord into a standardized coding stats view.
 */
export function normalizeConnectorRecord(record: ConnectorRecord): NormalizedPlatformData {
  const cfg = PLATFORM_CONFIGS[record.platform] || {
    platform: record.platform,
    name: record.platform,
    shortName: record.platform.slice(0, 2).toUpperCase(),
    isCompetitive: true,
    color: "#64748B",
    bgLight: "#F8FAFC",
    borderColor: "#E2E8F0",
  };

  const profile = record.profileData;
  const stats = profile?.stats;
  const meta = profile?.metadata || {};

  // Extract rating history points
  const ratingHistory: NormalizedPlatformData["ratingHistory"] = [];

  if (Array.isArray(meta.ratingHistory)) {
    for (const item of meta.ratingHistory) {
      if (item && typeof item === "object") {
        const rawItem = item as Record<string, unknown>;
        const contest = String(rawItem.contest || "Contest");
        const rating = typeof rawItem.rating === "number"
          ? rawItem.rating
          : typeof rawItem.newRating === "number"
          ? rawItem.newRating
          : 0;

        const oldRating = typeof rawItem.oldRating === "number" ? rawItem.oldRating : undefined;
        const delta = oldRating !== undefined ? rating - oldRating : undefined;
        const rank = typeof rawItem.rank === "number" ? rawItem.rank : undefined;
        const dateStr = String(rawItem.date || "");
        const timestamp = safeParseDateToTimestamp(dateStr);

        if (rating > 0) {
          ratingHistory.push({
            contest,
            rating,
            oldRating,
            delta,
            rank,
            date: dateStr,
            timestamp,
          });
        }
      }
    }
  }

  // Sort rating history chronologically ascending
  ratingHistory.sort((a, b) => a.timestamp - b.timestamp);

  // Competitive problems solved (competitive platforms only)
  const isCompetitive = cfg.isCompetitive;
  const competitiveSolved = isCompetitive ? stats?.problemsSolved : undefined;

  // Calculate recent rating delta from historical points
  let deltaRecent: number | undefined;
  if (ratingHistory.length >= 2) {
    const last = ratingHistory[ratingHistory.length - 1];
    if (last.delta !== undefined) {
      deltaRecent = last.delta;
    } else {
      deltaRecent = last.rating - ratingHistory[ratingHistory.length - 2].rating;
    }
  } else if (ratingHistory.length === 1 && ratingHistory[0].delta !== undefined) {
    deltaRecent = ratingHistory[0].delta;
  }

  let normalizedAvatar = profile?.avatarUrl;
  if (normalizedAvatar && normalizedAvatar.includes("userpic.codeforces.org/")) {
    normalizedAvatar = normalizedAvatar.replace("userpic.codeforces.org/", "codeforces.com/userpic/");
  }

  return {
    id: record.id,
    platform: record.platform,
    platformName: cfg.name,
    username: record.platformUsername,
    profileUrl: profile?.profileUrl || (cfg.profileUrlTemplate ? cfg.profileUrlTemplate(record.platformUsername) : undefined),
    avatarUrl: normalizedAvatar,
    displayName: profile?.displayName,
    status: record.status,
    lastSyncedAt: record.lastSyncedAt,
    errorMessage: record.errorMessage,

    rating: typeof stats?.rating === "number" ? stats.rating : undefined,
    maxRating: typeof stats?.maxRating === "number" ? stats.maxRating : undefined,
    rank: stats?.rank,
    maxRank: stats?.maxRank,
    globalRank: typeof stats?.globalRank === "number" ? stats.globalRank : undefined,
    countryRank: typeof stats?.countryRank === "number" ? stats.countryRank : undefined,
    stars: typeof profile?.stars === "number" ? profile.stars : undefined,

    problemsSolved: competitiveSolved,
    easySolved: typeof stats?.easySolved === "number" ? stats.easySolved : undefined,
    mediumSolved: typeof stats?.mediumSolved === "number" ? stats.mediumSolved : undefined,
    hardSolved: typeof stats?.hardSolved === "number" ? stats.hardSolved : undefined,

    contestsParticipated: typeof stats?.contestsParticipated === "number" ? stats.contestsParticipated : undefined,

    ratingHistory,
    deltaRecent,

    // GitHub specific
    repos: typeof stats?.repos === "number" ? stats.repos : undefined,
    starsReceived: typeof stats?.starsReceived === "number" ? stats.starsReceived : undefined,
    followers: typeof stats?.followers === "number" ? stats.followers : undefined,
    topLanguages: Array.isArray(meta?.topLanguages) ? (meta.topLanguages as string[]) : undefined,
  };
}

/**
 * Calculates a transparent, composite YERO Competitive Programming Score.
 * This is explicitly a YERO metric, never presented as an official rating.
 */
export function calculateYeroScore(platforms: NormalizedPlatformData[]): number {
  let score = 0;

  for (const p of platforms) {
    if (p.status === "error" && !p.problemsSolved && !p.rating) {
      continue;
    }

    if (p.platform === "github") {
      // GitHub contribution: repos, stars, followers
      if (p.repos) score += Math.min(p.repos * 5, 150);
      if (p.starsReceived) score += Math.min(p.starsReceived * 3, 300);
      if (p.followers) score += Math.min(p.followers * 2, 100);
      continue;
    }

    // LeetCode difficulty weighting
    if (p.easySolved || p.mediumSolved || p.hardSolved) {
      score += (p.easySolved || 0) * 2;
      score += (p.mediumSolved || 0) * 5;
      score += (p.hardSolved || 0) * 10;
    } else if (p.problemsSolved) {
      // General competitive programming problems without difficulty metadata
      score += p.problemsSolved * 4;
    }

    // Contest participation bonus
    if (p.contestsParticipated) {
      score += Math.min(p.contestsParticipated * 12, 600);
    }

    // Peak rating contribution (scaled to prevent single-platform skew)
    const peak = p.maxRating || p.rating;
    if (peak) {
      score += Math.round(peak * 0.35);
    }
  }

  return Math.round(score);
}

/**
 * Main analytics pipeline: processes all raw ConnectorRecords into dashboard-ready analytics.
 */
export function processCodingAnalytics(records: ConnectorRecord[]): CodingDashboardAnalytics {
  const normalized = records.map(normalizeConnectorRecord);

  let totalProblemsSolved = 0;
  let totalContests = 0;
  let bestRating: CodingDashboardAnalytics["overview"]["bestRating"] = null;
  const allRatings: CodingDashboardAnalytics["overview"]["allRatings"] = [];

  let easyTotal = 0;
  let mediumTotal = 0;
  let hardTotal = 0;
  let hasDifficultyData = false;

  const recentContests: RecentContestItem[] = [];
  let hasSyncErrors = false;
  let latestSyncTs = 0;
  let latestSyncDateStr: string | null = null;

  for (const p of normalized) {
    if (p.status === "error") {
      hasSyncErrors = true;
    }

    // Track latest sync time
    if (p.lastSyncedAt) {
      const ts = safeParseDateToTimestamp(p.lastSyncedAt);
      if (ts > latestSyncTs) {
        latestSyncTs = ts;
        latestSyncDateStr = p.lastSyncedAt;
      }
    }

    // 1. Total Problems Solved (competitive programming only)
    if (PLATFORM_CONFIGS[p.platform]?.isCompetitive && typeof p.problemsSolved === "number" && p.problemsSolved > 0) {
      totalProblemsSolved += p.problemsSolved;
    }

    // 2. Total Contests (competitive programming only)
    if (PLATFORM_CONFIGS[p.platform]?.isCompetitive && typeof p.contestsParticipated === "number" && p.contestsParticipated > 0) {
      totalContests += p.contestsParticipated;
    }

    // 3. Best Rating
    if (typeof p.rating === "number" && p.rating > 0) {
      allRatings.push({
        platform: p.platform,
        platformName: p.platformName,
        rating: p.rating,
        maxRating: p.maxRating,
      });

      if (!bestRating || p.rating > bestRating.rating) {
        bestRating = {
          rating: p.rating,
          platform: p.platform,
          platformName: p.platformName,
        };
      }
    }

    // 4. Difficulty Breakdown
    if (typeof p.easySolved === "number" || typeof p.mediumSolved === "number" || typeof p.hardSolved === "number") {
      easyTotal += p.easySolved || 0;
      mediumTotal += p.mediumSolved || 0;
      hardTotal += p.hardSolved || 0;
      hasDifficultyData = true;
    }

    // 5. Recent Contests aggregation
    for (const h of p.ratingHistory) {
      recentContests.push({
        id: `${p.platform}-${h.contest}-${h.timestamp}`,
        platform: p.platform,
        platformName: p.platformName,
        contestName: h.contest,
        date: h.date,
        timestamp: h.timestamp,
        rank: h.rank,
        rating: h.rating,
        ratingDelta: h.delta,
      });
    }
  }

  // Sort recent contests descending by date
  recentContests.sort((a, b) => b.timestamp - a.timestamp);

  // Compute composite YERO score
  const yeroScore = calculateYeroScore(normalized);

  const competitivePlatformsCount = normalized.filter(
    (p) => PLATFORM_CONFIGS[p.platform]?.isCompetitive
  ).length;

  return {
    overview: {
      totalProblemsSolved,
      totalContests,
      bestRating,
      allRatings,
      yeroScore,
      connectedPlatformsCount: normalized.length,
      competitivePlatformsCount,
    },
    platforms: normalized,
    difficultyBreakdown: {
      easy: easyTotal,
      medium: mediumTotal,
      hard: hardTotal,
      totalWithDifficulty: easyTotal + mediumTotal + hardTotal,
      hasDifficultyData,
    },
    recentContests: recentContests.slice(0, 15), // Top 15 recent contests
    hasAnyConnected: normalized.length > 0,
    hasSyncErrors,
    lastSyncedTimestamp: latestSyncDateStr,
  };
}

export type TimeframeFilter = "30D" | "3M" | "6M" | "1Y" | "ALL";

/**
 * Filter rating history points by timeframe.
 */
export function filterRatingHistoryByTimeframe<T extends { timestamp: number }>(
  points: T[],
  timeframe: TimeframeFilter,
  referenceTimestamp?: number
): T[] {
  if (timeframe === "ALL" || points.length === 0) return points;

  // Use reference timestamp, or fallback to the latest point in the series to keep function pure
  const refTime = referenceTimestamp !== undefined
    ? referenceTimestamp
    : (points[points.length - 1]?.timestamp || 0);

  const dayMs = 24 * 60 * 60 * 1000;
  let cutoffMs = refTime;

  switch (timeframe) {
    case "30D":
      cutoffMs = refTime - 30 * dayMs;
      break;
    case "3M":
      cutoffMs = refTime - 90 * dayMs;
      break;
    case "6M":
      cutoffMs = refTime - 180 * dayMs;
      break;
    case "1Y":
      cutoffMs = refTime - 365 * dayMs;
      break;
  }

  const filtered = points.filter((p) => p.timestamp >= cutoffMs);
  // If filtering resulted in < 2 points but original had >= 2 points, return at least the last 5 points so the chart doesn't collapse
  if (filtered.length < 2 && points.length >= 2) {
    return points.slice(-5);
  }
  return filtered;
}
