// ─────────────────────────────────────────────────────────────────────────────
// Developer Analytics Processing Engine
// Normalizes GitHub connector data into rich, UI-ready developer intelligence.
// ─────────────────────────────────────────────────────────────────────────────

import type { ConnectorRecord } from "@/actions/connectors";
import { getLanguageColor, calculateStreaks } from "@/lib/connectors/github/github.mapper";

export interface DeveloperProfileInfo {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  memberSince?: string;
  lastSyncedAt: string | null;
  status: "connected" | "error" | "syncing";
  errorMessage: string | null;
}

export interface DeveloperOverviewMetrics {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  totalRepos: number;
  totalStars: number;
  followers: number;
  following: number;
  totalPullRequests: number;
  totalIssues: number;
  totalCommitsRecorded: number;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0 (none), 1 (light), 2 (medium), 3 (deep), 4 (intense)
}

export interface DeveloperLanguageItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DeveloperRepoItem {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  openIssues: number;
  isFork: boolean;
  updatedAt: string;
  activityScore?: number;
  activityCount?: number;
}

export interface DeveloperPRItem {
  id: number;
  number: number;
  title: string;
  url: string;
  state: "open" | "closed" | "merged";
  repo: string;
  createdAt: string;
}

export interface DeveloperIssueItem {
  id: number;
  number: number;
  title: string;
  url: string;
  state: "open" | "closed";
  repo: string;
  createdAt: string;
}

export interface DeveloperActivityItem {
  id: string;
  type: "push" | "pr" | "issue" | "create" | "watch" | "fork" | "other";
  repoName: string;
  repoUrl: string;
  title: string;
  timestamp: number;
  date: string;
  badgeText: string;
  commits?: Array<{ sha: string; message: string }>;
  state?: string;
  url?: string;
}

export interface DeveloperDashboardAnalytics {
  hasConnected: boolean;
  profile: DeveloperProfileInfo;
  overview: DeveloperOverviewMetrics;
  contributions: {
    calendar: ContributionDay[];
    totalThisYear: number;
    years: Record<string, number>;
    currentStreak: number;
    longestStreak: number;
    mostActiveDay?: { date: string; count: number };
  };
  languages: DeveloperLanguageItem[];
  repositories: DeveloperRepoItem[];
  mostActiveRepositories: DeveloperRepoItem[];
  pullRequests: DeveloperPRItem[];
  issues: DeveloperIssueItem[];
  recentActivity: DeveloperActivityItem[];
}

/**
 * Format relative date (e.g. "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(dateStr: string | number | null | undefined): string {
  if (!dateStr) return "Recently";
  const ts = typeof dateStr === "number" ? dateStr : new Date(dateStr).getTime();
  if (isNaN(ts) || ts === 0) return "Recently";

  const diffMs = Date.now() - ts;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;

  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Main analytics pipeline for GitHub developer intelligence.
 */
export function processDeveloperAnalytics(
  connector: ConnectorRecord | null | undefined
): DeveloperDashboardAnalytics {
  if (!connector || connector.platform !== "github" || !connector.profileData) {
    return {
      hasConnected: false,
      profile: {
        username: connector?.platformUsername || "",
        profileUrl: `https://github.com/${connector?.platformUsername || ""}`,
        lastSyncedAt: connector?.lastSyncedAt || null,
        status: connector?.status || "connected",
        errorMessage: connector?.errorMessage || null,
      },
      overview: {
        totalContributions: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalRepos: 0,
        totalStars: 0,
        followers: 0,
        following: 0,
        totalPullRequests: 0,
        totalIssues: 0,
        totalCommitsRecorded: 0,
      },
      contributions: {
        calendar: [],
        totalThisYear: 0,
        years: {},
        currentStreak: 0,
        longestStreak: 0,
      },
      languages: [],
      repositories: [],
      mostActiveRepositories: [],
      pullRequests: [],
      issues: [],
      recentActivity: [],
    };
  }

  const profile = connector.profileData;
  const stats = profile.stats || {};
  const meta = (profile.metadata || {}) as Record<string, unknown>;

  // 1. Profile Info
  const profileInfo: DeveloperProfileInfo = {
    username: profile.username || connector.platformUsername,
    displayName: profile.displayName || undefined,
    avatarUrl: profile.avatarUrl || undefined,
    profileUrl: profile.profileUrl || `https://github.com/${profile.username}`,
    bio: typeof meta.bio === "string" ? meta.bio : undefined,
    company: typeof meta.company === "string" ? meta.company : undefined,
    location: profile.country || (typeof meta.location === "string" ? meta.location : undefined),
    blog: typeof meta.blog === "string" ? meta.blog : undefined,
    memberSince: typeof meta.memberSince === "string" ? meta.memberSince : undefined,
    lastSyncedAt: connector.lastSyncedAt,
    status: connector.status,
    errorMessage: connector.errorMessage,
  };

  // 2. Contributions Calendar & Streaks
  const rawCalendar = Array.isArray(meta.contributionsCalendar)
    ? (meta.contributionsCalendar as ContributionDay[])
    : [];

  const contributionYears = (meta.contributionYears as Record<string, number>) || {};
  const currentYearStr = new Date().getFullYear().toString();
  const totalThisYear =
    contributionYears[currentYearStr] ??
    rawCalendar.reduce((sum, d) => sum + (d.count || 0), 0);

  // Dynamically compute streaks from rawCalendar if available
  const calculatedStreaks = rawCalendar.length > 0 ? calculateStreaks(rawCalendar) : null;

  const currentStreak =
    calculatedStreaks?.currentStreak ??
    (typeof stats.currentStreak === "number"
      ? stats.currentStreak
      : typeof meta.currentStreak === "number"
      ? meta.currentStreak
      : 0);

  const longestStreak =
    calculatedStreaks?.longestStreak ??
    (typeof stats.longestStreak === "number"
      ? stats.longestStreak
      : typeof meta.longestStreak === "number"
      ? meta.longestStreak
      : 0);

  let mostActiveDay: { date: string; count: number } | undefined;
  for (const d of rawCalendar) {
    if (!mostActiveDay || (d.count || 0) > mostActiveDay.count) {
      mostActiveDay = { date: d.date, count: d.count || 0 };
    }
  }

  // 3. Languages
  let languages: DeveloperLanguageItem[] = [];
  if (Array.isArray(meta.languages) && meta.languages.length > 0) {
    languages = meta.languages as DeveloperLanguageItem[];
  } else if (Array.isArray(meta.topLanguages)) {
    languages = (meta.topLanguages as string[]).map((name) => ({
      name,
      count: 1,
      percentage: 0,
      color: getLanguageColor(name),
    }));
  }

  // 4. Repositories
  const repositories: DeveloperRepoItem[] = Array.isArray(meta.repositories)
    ? (meta.repositories as DeveloperRepoItem[])
    : [];

  const mostActiveRepositories: DeveloperRepoItem[] = Array.isArray(meta.mostActiveRepositories)
    ? (meta.mostActiveRepositories as DeveloperRepoItem[])
    : repositories.slice(0, 6);

  // 5. Pull Requests & Issues
  const pullRequests: DeveloperPRItem[] = Array.isArray(meta.pullRequests)
    ? (meta.pullRequests as DeveloperPRItem[])
    : [];

  const issues: DeveloperIssueItem[] = Array.isArray(meta.issues)
    ? (meta.issues as DeveloperIssueItem[])
    : [];

  // 6. Recent Activity
  const recentActivity: DeveloperActivityItem[] = Array.isArray(meta.recentActivity)
    ? (meta.recentActivity as DeveloperActivityItem[])
    : [];

  // 7. Overview numbers
  const totalContributions =
    typeof stats.totalContributions === "number"
      ? stats.totalContributions
      : typeof meta.totalContributions === "number"
      ? (meta.totalContributions as number)
      : totalThisYear;

  const totalRepos = stats.repos ?? repositories.length;
  const totalStars = stats.starsReceived ?? repositories.reduce((acc, r) => acc + (r.stars || 0), 0);
  const followers = stats.followers ?? 0;
  const following = stats.following ?? 0;
  const totalPullRequests = stats.totalPullRequests ?? pullRequests.length;
  const totalIssues = stats.totalIssues ?? issues.length;
  const totalCommitsRecorded = stats.totalCommits ?? 0;

  return {
    hasConnected: true,
    profile: profileInfo,
    overview: {
      totalContributions,
      currentStreak,
      longestStreak,
      totalRepos,
      totalStars,
      followers,
      following,
      totalPullRequests,
      totalIssues,
      totalCommitsRecorded,
    },
    contributions: {
      calendar: rawCalendar,
      totalThisYear,
      years: contributionYears,
      currentStreak,
      longestStreak,
      mostActiveDay,
    },
    languages,
    repositories,
    mostActiveRepositories,
    pullRequests,
    issues,
    recentActivity,
  };
}
