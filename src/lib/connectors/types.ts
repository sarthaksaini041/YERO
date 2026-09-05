// ─────────────────────────────────────────────────────────────────────────────
// Connector Types — Shared normalized data model
// All platform-specific connector services map their native responses to this.
// ─────────────────────────────────────────────────────────────────────────────

export type Platform = "leetcode" | "codechef" | "codeforces";

export interface ConnectorStats {
  /** Current rating (Codeforces rating, CodeChef rating, LeetCode ranking) */
  rating?: number;
  /** Maximum rating ever achieved */
  maxRating?: number;
  /** Current rank label (e.g. "Specialist", "4-star") */
  rank?: string;
  /** Maximum rank label ever achieved */
  maxRank?: string;
  /** Total problems solved across all difficulties */
  problemsSolved?: number;
  /** Easy problems solved (LeetCode) */
  easySolved?: number;
  /** Medium problems solved (LeetCode) */
  mediumSolved?: number;
  /** Hard problems solved (LeetCode) */
  hardSolved?: number;
  /** Total contests participated in */
  contestsParticipated?: number;
  /** Global rank among all users */
  globalRank?: number;
  /** Country rank */
  countryRank?: number;
}

export interface ConnectorActivity {
  /** Number of recent submissions (last 30 days) */
  recentSubmissions?: number;
  /** Number of recent contest participations */
  recentContests?: number;
}

export interface ConnectorProfile {
  platform: Platform;
  username: string;
  profileUrl?: string;
  displayName?: string;
  avatarUrl?: string;
  country?: string;
  /** Stars/badge for CodeChef (e.g. 5-star) */
  stars?: number;
  stats: ConnectorStats;
  activity?: ConnectorActivity;
  /** Platform-specific extra data — preserved for future use */
  metadata?: Record<string, unknown>;
}

/** Result from a connector service fetch */
export type ConnectorFetchResult =
  | { success: true; profile: ConnectorProfile }
  | { success: false; error: string; notFound?: boolean; rateLimited?: boolean };

/** Interface every connector service must implement */
export interface ConnectorService {
  platform: Platform;
  fetchProfile(username: string): Promise<ConnectorFetchResult>;
}
