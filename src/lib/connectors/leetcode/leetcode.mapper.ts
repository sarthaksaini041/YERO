import type { LeetCodeGraphQLResponse } from "./leetcode.types";
import type { ConnectorProfile } from "../types";

/**
 * Maps the LeetCode GraphQL API response to the normalized ConnectorProfile shape.
 * Only maps fields that are present in the response — never fabricates data.
 */
export function mapLeetCodeResponse(
  username: string,
  response: LeetCodeGraphQLResponse
): ConnectorProfile {
  const data = response.data;
  const matchedUser = data?.matchedUser;
  const userContestRanking = data?.userContestRanking;
  const profile = matchedUser?.profile;

  // Solved counts by difficulty
  const acStats = matchedUser?.submitStats?.acSubmissionNum ?? [];
  const totalSolved = acStats.find((s) => s.difficulty === "All")?.count;
  const easySolved = acStats.find((s) => s.difficulty === "Easy")?.count;
  const mediumSolved = acStats.find((s) => s.difficulty === "Medium")?.count;
  const hardSolved = acStats.find((s) => s.difficulty === "Hard")?.count;

  const actualUsername = matchedUser?.username ?? username;

  return {
    platform: "leetcode",
    username: actualUsername,
    profileUrl: `https://leetcode.com/${actualUsername}`,
    displayName: profile?.realName?.trim() || undefined,
    avatarUrl: profile?.userAvatar || undefined,
    country: profile?.countryName?.trim() || undefined,

    stats: {
      rating: userContestRanking?.rating
        ? Math.round(userContestRanking.rating)
        : undefined,
      rank: undefined, // LeetCode doesn't have a named rank tier
      globalRank: profile?.ranking ?? undefined,
      problemsSolved: totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      contestsParticipated: userContestRanking?.attendedContestsCount ?? undefined,
    },

    lastSyncedAt: new Date().toISOString(),

    metadata: {
      aboutMe: profile?.aboutMe || undefined,
      reputation: profile?.reputation ?? undefined,
      contestRating: userContestRanking?.rating ?? undefined,
      contestGlobalRanking: userContestRanking?.globalRanking ?? undefined,
      contestTopPercentage: userContestRanking?.topPercentage ?? undefined,
      badges: matchedUser?.badges?.map((b) => b.displayName) ?? [],
      activeBadge: matchedUser?.activeBadge?.displayName ?? undefined,
      solutionCount: profile?.solutionCount ?? undefined,
    },
  };
}
