// LeetCode raw GraphQL API response types (2026 schema)
// Source: LeetCode public GraphQL endpoint

export interface LeetCodeUserProfile {
  ranking?: number;
  userAvatar?: string | null;
  realName?: string | null;
  aboutMe?: string | null;
  countryName?: string | null;
  reputation?: number;
  solutionCount?: number;
  categoryDiscussCount?: number;
  skillTags?: string[];
}

export interface LeetCodeSubmitStats {
  acSubmissionNum: {
    difficulty: "All" | "Easy" | "Medium" | "Hard";
    count: number;
    submissions: number;
  }[];
  totalSubmissionNum: {
    difficulty: "All" | "Easy" | "Medium" | "Hard";
    count: number;
    submissions: number;
  }[];
}

export interface LeetCodeUserContestRanking {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  totalParticipants: number;
  topPercentage: number;
  badge: {
    name: string;
  } | null;
}

export interface LeetCodeBadge {
  id: string;
  name: string;
  shortName?: string;
  displayName: string;
  icon: string;
  creationDate?: string | null;
}

export interface LeetCodeMatchedUser {
  username: string;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  profile?: LeetCodeUserProfile | null;
  submitStats?: LeetCodeSubmitStats;
  badges?: LeetCodeBadge[];
  activeBadge?: {
    id: string;
    displayName: string;
  } | null;
}

export interface LeetCodeGraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
}

export interface LeetCodeGraphQLResponse {
  data?: {
    matchedUser?: LeetCodeMatchedUser | null;
    userContestRanking?: LeetCodeUserContestRanking | null;
  } | null;
  errors?: LeetCodeGraphQLError[];
}
