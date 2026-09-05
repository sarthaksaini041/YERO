import type { ConnectorService, ConnectorFetchResult } from "../types";
import type {
  GitHubUserResponse,
  GitHubRepoItem,
  GitHubEventItem,
  GitHubContributionsData,
  GitHubSearchResponse,
} from "./github.types";
import { mapGitHubResponse } from "./github.mapper";
import {
  fetchWithTimeout,
  withTransientRetry,
  createConnectorError,
  logConnectorRequest,
} from "../http";
import { getCachedProfile, setCachedProfile, deduplicateRequest } from "../cache";

const GITHUB_API_BASE = "https://api.github.com";

function getGitHubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "YERO-App",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * GitHub connector service.
 * Uses official GitHub REST API v3.
 */
export const githubService: ConnectorService = {
  platform: "github",

  async fetchProfile(username: string): Promise<ConnectorFetchResult> {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      return {
        success: false,
        error: createConnectorError("INVALID_INPUT", "GitHub username cannot be empty."),
      };
    }

    const cached = getCachedProfile("github", cleanUsername);
    if (cached) return cached;

    return deduplicateRequest("github", cleanUsername, async () => {
      const startTime = Date.now();
      try {
        const result = await withTransientRetry(
          async () => {
            const encoded = encodeURIComponent(cleanUsername);
            const headers = getGitHubHeaders();

            // Fetch user profile, repositories, events, contributions, and PR/issue data in parallel
            const [userRes, reposRes, eventsRes, contribRes, prsRes, issuesRes] = await Promise.allSettled([
              fetchWithTimeout(
                `${GITHUB_API_BASE}/users/${encoded}`,
                { headers },
                8000
              ),
              fetchWithTimeout(
                `${GITHUB_API_BASE}/users/${encoded}/repos?per_page=100&type=owner&sort=updated`,
                { headers },
                8000
              ),
              fetchWithTimeout(
                `${GITHUB_API_BASE}/users/${encoded}/events/public?per_page=100`,
                { headers },
                8000
              ),
              fetchWithTimeout(
                `https://github-contributions-api.jogruber.de/v4/${encoded}`,
                {},
                8000
              ),
              fetchWithTimeout(
                `${GITHUB_API_BASE}/search/issues?q=author:${encoded}+type:pr&per_page=10`,
                { headers },
                8000
              ),
              fetchWithTimeout(
                `${GITHUB_API_BASE}/search/issues?q=author:${encoded}+type:issue&per_page=10`,
                { headers },
                8000
              ),
            ]);

            if (userRes.status === "rejected") {
              throw userRes.reason;
            }

            const response = userRes.value;

            // Handle rate limit
            if (response.status === 403 || response.status === 429) {
              const remaining = response.headers.get("x-ratelimit-remaining");
              if (remaining === "0" || response.status === 429) {
                logConnectorRequest({
                  platform: "github",
                  identifier: cleanUsername,
                  durationMs: Date.now() - startTime,
                  success: false,
                  errorCode: "RATE_LIMITED",
                  upstreamStatus: response.status,
                  message: "GitHub rate limit reached",
                });
                return {
                  success: false as const,
                  error: createConnectorError(
                    "RATE_LIMITED",
                    "GitHub API rate limit reached. Please wait a few moments and try again.",
                    429
                  ),
                  rateLimited: true,
                };
              }
            }

            if (response.status === 404) {
              logConnectorRequest({
                platform: "github",
                identifier: cleanUsername,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "PROFILE_NOT_FOUND",
                upstreamStatus: 404,
                message: "User not found",
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "PROFILE_NOT_FOUND",
                  `GitHub user "${cleanUsername}" was not found. Please check the username.`,
                  404
                ),
                notFound: true,
              };
            }

            if (!response.ok) {
              const status = response.status;
              const is5xx = status >= 500;
              logConnectorRequest({
                platform: "github",
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
                    ? "GitHub service is temporarily unavailable. Please try again later."
                    : `GitHub returned an error (HTTP ${status}). Please try again later.`,
                  status
                ),
              };
            }

            const userData = (await response.json()) as GitHubUserResponse;

            // Repositories are optional (fail gracefully)
            let repos: GitHubRepoItem[] = [];
            if (reposRes.status === "fulfilled" && reposRes.value.ok) {
              try {
                const reposData = (await reposRes.value.json()) as GitHubRepoItem[];
                if (Array.isArray(reposData)) {
                  repos = reposData;
                }
              } catch {
                // Ignore repos parsing failure
              }
            }

            // Events are optional (fail gracefully)
            let events: GitHubEventItem[] = [];
            if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
              try {
                const eventsData = (await eventsRes.value.json()) as GitHubEventItem[];
                if (Array.isArray(eventsData)) {
                  events = eventsData;
                }
              } catch {
                // Ignore events parsing failure
              }
            }

            // Contributions are optional (fail gracefully)
            let contribData: GitHubContributionsData | null = null;
            if (contribRes.status === "fulfilled" && contribRes.value.ok) {
              try {
                contribData = (await contribRes.value.json()) as GitHubContributionsData;
              } catch {
                // Ignore contributions parsing failure
              }
            }

            // Pull requests are optional (fail gracefully)
            let prsData: { total: number; items: GitHubSearchResponse["items"] } | null = null;
            if (prsRes.status === "fulfilled" && prsRes.value.ok) {
              try {
                const prsJson = (await prsRes.value.json()) as GitHubSearchResponse;
                if (typeof prsJson?.total_count === "number") {
                  prsData = { total: prsJson.total_count, items: prsJson.items || [] };
                }
              } catch {
                // Ignore PRs parsing failure
              }
            }

            // Issues are optional (fail gracefully)
            let issuesData: { total: number; items: GitHubSearchResponse["items"] } | null = null;
            if (issuesRes.status === "fulfilled" && issuesRes.value.ok) {
              try {
                const issuesJson = (await issuesRes.value.json()) as GitHubSearchResponse;
                if (typeof issuesJson?.total_count === "number") {
                  issuesData = { total: issuesJson.total_count, items: issuesJson.items || [] };
                }
              } catch {
                // Ignore issues parsing failure
              }
            }

            const profile = mapGitHubResponse(
              cleanUsername,
              userData,
              repos,
              events,
              contribData,
              prsData,
              issuesData
            );
            logConnectorRequest({
              platform: "github",
              identifier: cleanUsername,
              durationMs: Date.now() - startTime,
              success: true,
            });

            return { success: true as const, profile };
          },
          { platform: "github", maxRetries: 1 }
        );

        if (result.success) {
          setCachedProfile("github", cleanUsername, result);
        }
        return result;
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const message = err instanceof Error ? err.message : "Unknown error";
        const isTimeout = message.includes("UPSTREAM_TIMEOUT");
        const errorCode = isTimeout ? "TIMEOUT" : "NETWORK_ERROR";

        logConnectorRequest({
          platform: "github",
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
              ? "GitHub request timed out. Please try again."
              : "Failed to connect to GitHub. Please check your internet connection."
          ),
        };
      }
    });
  },
};
