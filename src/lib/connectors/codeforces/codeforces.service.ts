import type { ConnectorService, ConnectorFetchResult } from "../types";
import type {
  CodeforcesUserInfoResponse,
  CodeforcesUserRatingResponse,
  CodeforcesUserStatusResponse,
  CodeforcesRatingChange,
  CodeforcesSubmission,
} from "./codeforces.types";
import { mapCodeforcesResponse } from "./codeforces.mapper";
import {
  fetchWithTimeout,
  withTransientRetry,
  createConnectorError,
  logConnectorRequest,
} from "../http";
import { getCachedProfile, setCachedProfile, deduplicateRequest } from "../cache";

const CF_API_BASE = "https://codeforces.com/api";

/**
 * Codeforces connector service.
 * Uses the official Codeforces REST API (https://codeforces.com/apiHelp).
 */
export const codeforcesService: ConnectorService = {
  platform: "codeforces",

  async fetchProfile(username: string): Promise<ConnectorFetchResult> {
    const handle = username.trim();
    if (!handle) {
      return {
        success: false,
        error: createConnectorError("INVALID_INPUT", "Codeforces handle cannot be empty."),
      };
    }

    const cached = getCachedProfile("codeforces", handle);
    if (cached) return cached;

    return deduplicateRequest("codeforces", handle, async () => {
      const startTime = Date.now();
      try {
        const result = await withTransientRetry(
          async () => {
            const encodedHandle = encodeURIComponent(handle);

            // Fetch user info, rating history, and recent submissions in parallel
            const [infoRes, ratingRes, statusRes] = await Promise.allSettled([
              fetchWithTimeout(
                `${CF_API_BASE}/user.info?handles=${encodedHandle}`,
                {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                  },
                },
                8000
              ),
              fetchWithTimeout(
                `${CF_API_BASE}/user.rating?handle=${encodedHandle}`,
                {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                  },
                },
                8000
              ),
              fetchWithTimeout(
                `${CF_API_BASE}/user.status?handle=${encodedHandle}&from=1&count=200`,
                {
                  headers: {
                    "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                  },
                },
                8000
              ),
            ]);

            // user.info is mandatory
            if (infoRes.status === "rejected") {
              throw infoRes.reason;
            }

            const infoResponse = infoRes.value;

            if (infoResponse.status === 429) {
              logConnectorRequest({
                platform: "codeforces",
                identifier: handle,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "RATE_LIMITED",
                upstreamStatus: 429,
                message: "Codeforces rate limit reached",
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "RATE_LIMITED",
                  "Codeforces rate limit reached. Please wait a few moments and try again.",
                  429
                ),
                rateLimited: true,
              };
            }

            // Always try reading JSON response even on HTTP 400 (Codeforces returns { status: "FAILED", comment: "..." })
            let infoData: CodeforcesUserInfoResponse | null = null;
            try {
              infoData = (await infoResponse.json()) as CodeforcesUserInfoResponse;
            } catch {
              // Non-JSON response
            }

            if (!infoData) {
              logConnectorRequest({
                platform: "codeforces",
                identifier: handle,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "UPSTREAM_UNAVAILABLE",
                upstreamStatus: infoResponse.status,
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "UPSTREAM_UNAVAILABLE",
                  `Codeforces API returned an unexpected response (HTTP ${infoResponse.status}). Please try again later.`,
                  infoResponse.status
                ),
              };
            }

            if (infoData.status === "FAILED") {
              const comment = infoData.comment ?? "";
              const isNotFound = comment.toLowerCase().includes("not found");
              const errorCode = isNotFound ? "PROFILE_NOT_FOUND" : "INVALID_INPUT";

              logConnectorRequest({
                platform: "codeforces",
                identifier: handle,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode,
                upstreamStatus: infoResponse.status,
                message: comment,
              });

              return {
                success: false as const,
                error: createConnectorError(
                  errorCode,
                  isNotFound
                    ? `Codeforces user "${handle}" was not found. Please check the handle and try again.`
                    : comment || "Codeforces returned an error for this handle.",
                  isNotFound ? 404 : 400
                ),
                notFound: isNotFound,
              };
            }

            const user = infoData.result?.[0];
            if (!user) {
              logConnectorRequest({
                platform: "codeforces",
                identifier: handle,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "PROFILE_NOT_FOUND",
                upstreamStatus: 200,
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "PROFILE_NOT_FOUND",
                  `Codeforces user "${handle}" was not found.`,
                  404
                ),
                notFound: true,
              };
            }

            // Rating history (optional — fail gracefully)
            let ratingHistory: CodeforcesRatingChange[] = [];
            if (ratingRes.status === "fulfilled" && ratingRes.value.ok) {
              try {
                const ratingData = (await ratingRes.value.json()) as CodeforcesUserRatingResponse;
                if (ratingData.status === "OK") {
                  ratingHistory = ratingData.result ?? [];
                }
              } catch {
                // Ignore optional endpoint failure
              }
            }

            // Submissions (optional — fail gracefully)
            let submissions: CodeforcesSubmission[] = [];
            if (statusRes.status === "fulfilled" && statusRes.value.ok) {
              try {
                const statusData = (await statusRes.value.json()) as CodeforcesUserStatusResponse;
                if (statusData.status === "OK") {
                  submissions = statusData.result ?? [];
                }
              } catch {
                // Ignore optional endpoint failure
              }
            }

            const profile = mapCodeforcesResponse(handle, user, ratingHistory, submissions);
            logConnectorRequest({
              platform: "codeforces",
              identifier: handle,
              durationMs: Date.now() - startTime,
              success: true,
            });

            return { success: true as const, profile };
          },
          { platform: "codeforces", maxRetries: 1 }
        );

        if (result.success) {
          setCachedProfile("codeforces", handle, result);
        }
        return result;
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const message = err instanceof Error ? err.message : "Unknown error";
        const isTimeout = message.includes("UPSTREAM_TIMEOUT");
        const errorCode = isTimeout ? "TIMEOUT" : "NETWORK_ERROR";

        logConnectorRequest({
          platform: "codeforces",
          identifier: handle,
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
              ? "Codeforces request timed out. Please try again."
              : "Failed to connect to Codeforces. Please check your internet connection."
          ),
        };
      }
    });
  },
};
