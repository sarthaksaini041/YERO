import type { ConnectorService, ConnectorFetchResult } from "../types";
import type { LeetCodeGraphQLResponse } from "./leetcode.types";
import { mapLeetCodeResponse } from "./leetcode.mapper";
import {
  fetchWithTimeout,
  withTransientRetry,
  createConnectorError,
  logConnectorRequest,
} from "../http";
import { getCachedProfile, setCachedProfile, deduplicateRequest } from "../cache";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

/**
 * GraphQL query matching LeetCode's active schema.
 * All public fields are fetched in a single round-trip.
 */
const PROFILE_QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
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
 * Uses LeetCode's public GraphQL API.
 */
export const leetcodeService: ConnectorService = {
  platform: "leetcode",

  async fetchProfile(username: string): Promise<ConnectorFetchResult> {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      return {
        success: false,
        error: createConnectorError("INVALID_INPUT", "Username cannot be empty."),
      };
    }

    // Check in-memory cache first
    const cached = getCachedProfile("leetcode", cleanUsername);
    if (cached) return cached;

    return deduplicateRequest("leetcode", cleanUsername, async () => {
      const startTime = Date.now();
      try {
        const result = await withTransientRetry(
          async () => {
            const response = await fetchWithTimeout(
              LEETCODE_GRAPHQL_URL,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                  "Origin": "https://leetcode.com",
                  "Referer": `https://leetcode.com/${encodeURIComponent(cleanUsername)}/`,
                },
                body: JSON.stringify({
                  query: PROFILE_QUERY,
                  variables: { username: cleanUsername },
                }),
              },
              8000
            );

            if (response.status === 429) {
              logConnectorRequest({
                platform: "leetcode",
                identifier: cleanUsername,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "RATE_LIMITED",
                upstreamStatus: 429,
                message: "LeetCode rate limit reached",
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "RATE_LIMITED",
                  "LeetCode rate limit reached. Please wait a few moments and try again.",
                  429
                ),
                rateLimited: true,
              };
            }

            if (!response.ok) {
              const status = response.status;
              const is5xx = status >= 500;
              logConnectorRequest({
                platform: "leetcode",
                identifier: cleanUsername,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: is5xx ? "UPSTREAM_UNAVAILABLE" : "UPSTREAM_BAD_REQUEST",
                upstreamStatus: status,
              });
              return {
                success: false as const,
                error: createConnectorError(
                  is5xx ? "UPSTREAM_UNAVAILABLE" : "UPSTREAM_BAD_REQUEST",
                  is5xx
                    ? "LeetCode service is temporarily unavailable. Please try again later."
                    : "LeetCode could not process this request. Please verify the username.",
                  status
                ),
              };
            }

            const json = (await response.json()) as LeetCodeGraphQLResponse;

            // Check if user was not found
            const userNotFound =
              !json.data?.matchedUser ||
              json.errors?.some((e) =>
                e.message.toLowerCase().includes("does not exist")
              );

            if (userNotFound) {
              logConnectorRequest({
                platform: "leetcode",
                identifier: cleanUsername,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "PROFILE_NOT_FOUND",
                upstreamStatus: 200,
                message: "User not found",
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "PROFILE_NOT_FOUND",
                  `LeetCode user "${cleanUsername}" was not found. Please check the username.`,
                  404
                ),
                notFound: true,
              };
            }

            const profile = mapLeetCodeResponse(cleanUsername, json);
            logConnectorRequest({
              platform: "leetcode",
              identifier: cleanUsername,
              durationMs: Date.now() - startTime,
              success: true,
            });

            return { success: true as const, profile };
          },
          { platform: "leetcode", maxRetries: 1 }
        );

        if (result.success) {
          setCachedProfile("leetcode", cleanUsername, result);
        }
        return result;
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const message = err instanceof Error ? err.message : "Unknown error";
        const isTimeout = message.includes("UPSTREAM_TIMEOUT");
        const errorCode = isTimeout ? "TIMEOUT" : "NETWORK_ERROR";

        logConnectorRequest({
          platform: "leetcode",
          identifier: cleanUsername,
          durationMs,
          success: false,
          errorCode,
          message,
        });

        return {
          success: false,
          error: createConnectorError(
            errorCode,
            isTimeout
              ? "LeetCode connection timed out. Please try again."
              : `Failed to connect to LeetCode. Please check your internet connection.`
          ),
        };
      }
    });
  },
};
