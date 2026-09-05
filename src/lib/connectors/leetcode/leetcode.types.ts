// LeetCode raw GraphQL API response types
// Source: LeetCode's public GraphQL endpoint (no auth required for public profiles)

export interface LeetCodeUserPublicProfile {
  username: string;
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  profile: {
    ranking: number;
    userAvatar: string | null;
    realName: string | null;
    aboutMe: string | null;
    school: string | null;
    websites: string[];
    countryName: string | null;
    company: string | null;
    jobTitle: string | null;
    skillTags: string[];
    postViewCount: number;
    postViewCountDiff: number;
    reputation: number;
    reputationDiff: number;
    solutionCount: number;
    solutionCountDiff: number;
    categoryDiscussCount: number;
    categoryDiscussCountDiff: number;
  };
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
  shortName: string;
  displayName: string;
  icon: string;
  hoverText: string | null;
  medal: {
    slug: string;
    config: { iconGif: string; iconGifBackground: string } | null;
  } | null;
  creationDate: string | null;
  isDisplayed: boolean;
  timestamp: number;
}

export interface LeetCodeGraphQLResponse {
  data: {
    userPublicProfile: LeetCodeUserPublicProfile | null;
    matchedUser: {
      username: string;
      submitStats: LeetCodeSubmitStats;
      badges: LeetCodeBadge[];
      activeBadge: LeetCodeBadge | null;
    } | null;
    userContestRanking: LeetCodeUserContestRanking | null;
  };
}
