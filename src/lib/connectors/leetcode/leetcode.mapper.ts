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
  const { userPublicProfile, matchedUser, userContestRanking } = response.data;

  // Solved counts by difficulty
  const acStats = matchedUser?.submitStats?.acSubmissionNum ?? [];
  const totalSolved = acStats.find((s) => s.difficulty === "All")?.count;
  const easySolved = acStats.find((s) => s.difficulty === "Easy")?.count;
  const mediumSolved = acStats.find((s) => s.difficulty === "Medium")?.count;
  const hardSolved = acStats.find((s) => s.difficulty === "Hard")?.count;

  return {
    platform: "leetcode",
    username,
    profileUrl: `https://leetcode.com/${username}`,
    displayName: userPublicProfile?.profile?.realName ?? undefined,
    avatarUrl: userPublicProfile?.profile?.userAvatar ?? undefined,
    country: userPublicProfile?.profile?.countryName ?? undefined,

    stats: {
      rating: userContestRanking?.rating
        ? Math.round(userContestRanking.rating)
        : undefined,
      // LeetCode uses globalRanking from profile for overall site rank
      rank: undefined, // LeetCode doesn't have a named rank tier
      globalRank: userPublicProfile?.profile?.ranking ?? undefined,
      problemsSolved: totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      contestsParticipated: userContestRanking?.attendedContestsCount ?? undefined,
    },

    metadata: {
      reputation: userPublicProfile?.profile?.reputation ?? undefined,
      contestRating: userContestRanking?.rating ?? undefined,
      contestGlobalRanking: userContestRanking?.globalRanking ?? undefined,
      contestTopPercentage: userContestRanking?.topPercentage ?? undefined,
      badges: matchedUser?.badges?.map((b) => b.displayName) ?? [],
      activeBadge: matchedUser?.activeBadge?.displayName ?? undefined,
      solutionCount: userPublicProfile?.profile?.solutionCount ?? undefined,
    },
  };
}
