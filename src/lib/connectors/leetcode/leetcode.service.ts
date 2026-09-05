import type { ConnectorService, ConnectorFetchResult } from "../types";
import type { LeetCodeGraphQLResponse } from "./leetcode.types";
import { mapLeetCodeResponse } from "./leetcode.mapper";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

/** GraphQL query combining all public profile data in one round-trip */
const PROFILE_QUERY = `
  query GetUserProfile($username: String!) {
    userPublicProfile(username: $username) {
      username
      githubUrl
      twitterUrl
      linkedinUrl
      profile {
        ranking
        userAvatar
        realName
        aboutMe
        countryName
        reputation
        solutionCount
        categoryDiscussCount
        skillTags
      }
    }
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      badges {
        id
        name
        shortName
        displayName
        icon
        creationDate
        isDisplayed
        timestamp
      }
      activeBadge {
        id
        displayName
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
      badge {
        name
      }
    }
  }
`;

/**
 * LeetCode connector service.
 * Uses LeetCode's public GraphQL API — no authentication required.
 * All data fetched is publicly visible on the LeetCode user profile page.
 */
export const leetcodeService: ConnectorService = {
  platform: "leetcode",

  async fetchProfile(username: string): Promise<ConnectorFetchResult> {
    try {
      const response = await fetch(LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // LeetCode requires a valid Origin/Referer for their GraphQL endpoint
          "Origin": "https://leetcode.com",
          "Referer": `https://leetcode.com/${username}/`,
        },
        body: JSON.stringify({
          query: PROFILE_QUERY,
          variables: { username },
        }),
        next: { revalidate: 0 }, // Always fetch fresh data
      });

      if (response.status === 429) {
        return {
          success: false,
          error: "LeetCode is rate limiting requests. Please try again in a few minutes.",
          rateLimited: true,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: `LeetCode API returned an unexpected error (HTTP ${response.status}). Please try again later.`,
        };
      }

      const json = (await response.json()) as LeetCodeGraphQLResponse;

      // If both userPublicProfile and matchedUser are null, the user doesn't exist
      if (!json.data?.userPublicProfile && !json.data?.matchedUser) {
        return {
          success: false,
          error: `LeetCode user "${username}" was not found. Please check the username and try again.`,
          notFound: true,
        };
      }

      const profile = mapLeetCodeResponse(username, json);
      return { success: true, profile };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to connect to LeetCode. ${message}`,
      };
    }
  },
};
