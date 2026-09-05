import type { ConnectorService, ConnectorFetchResult } from "../types";
import { mapCodeChefResponse } from "./codechef.mapper";
import { parseCodeChefProfileHtml } from "./codechef.scraper";
import {
  fetchWithTimeout,
  withTransientRetry,
  createConnectorError,
  logConnectorRequest,
} from "../http";
import { getCachedProfile, setCachedProfile, deduplicateRequest } from "../cache";

const CODECHEF_USER_URL = "https://www.codechef.com/users";

/**
 * CodeChef connector service.
 * CodeChef does not provide an official public REST/GraphQL API.
 * This service securely fetches and parses public profile HTML directly from CodeChef,
 * isolating scraping logic and converting data to the normalized model.
 */
export const codechefService: ConnectorService = {
  platform: "codechef",

  async fetchProfile(username: string): Promise<ConnectorFetchResult> {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      return {
        success: false,
        error: createConnectorError("INVALID_INPUT", "CodeChef username cannot be empty."),
      };
    }

    const cached = getCachedProfile("codechef", cleanUsername);
    if (cached) return cached;

    return deduplicateRequest("codechef", cleanUsername, async () => {
      const startTime = Date.now();
      try {
        const result = await withTransientRetry(
          async () => {
            const url = `${CODECHEF_USER_URL}/${encodeURIComponent(cleanUsername)}`;
            const response = await fetchWithTimeout(
              url,
              {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                  "Accept":
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                  "Accept-Language": "en-US,en;q=0.5",
                },
              },
              8000
            );

            if (response.status === 429) {
              logConnectorRequest({
                platform: "codechef",
                identifier: cleanUsername,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "RATE_LIMITED",
                upstreamStatus: 429,
                message: "CodeChef rate limit reached",
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "RATE_LIMITED",
                  "CodeChef rate limit reached. Please wait a few moments and try again.",
                  429
                ),
                rateLimited: true,
              };
            }

            // If CodeChef 404s or redirects to home page, the user does not exist
            const isRedirectedToHome =
              response.url.endsWith("codechef.com/") ||
              response.url.endsWith("codechef.com");

            if (response.status === 404 || isRedirectedToHome) {
              logConnectorRequest({
                platform: "codechef",
                identifier: cleanUsername,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "PROFILE_NOT_FOUND",
                upstreamStatus: response.status,
                message: "User redirected or 404",
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "PROFILE_NOT_FOUND",
                  `CodeChef user "${cleanUsername}" was not found. Please check the username.`,
                  404
                ),
                notFound: true,
              };
            }

            if (!response.ok) {
              const status = response.status;
              const is5xx = status >= 500;
              logConnectorRequest({
                platform: "codechef",
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
                    ? "CodeChef service is temporarily unavailable. Please try again later."
                    : "Could not retrieve CodeChef profile data. Please try again later.",
                  status
                ),
              };
            }

            const html = await response.text();
            const rawProfile = parseCodeChefProfileHtml(cleanUsername, html);

            if (!rawProfile) {
              logConnectorRequest({
                platform: "codechef",
                identifier: cleanUsername,
                durationMs: Date.now() - startTime,
                success: false,
                errorCode: "PROFILE_NOT_FOUND",
                upstreamStatus: 200,
                message: "Profile container missing in HTML",
              });
              return {
                success: false as const,
                error: createConnectorError(
                  "PROFILE_NOT_FOUND",
                  `CodeChef user "${cleanUsername}" was not found. Please check the username.`,
                  404
                ),
                notFound: true,
              };
            }

            const profile = mapCodeChefResponse(cleanUsername, rawProfile);
            logConnectorRequest({
              platform: "codechef",
              identifier: cleanUsername,
              durationMs: Date.now() - startTime,
              success: true,
            });

            return { success: true as const, profile };
          },
          { platform: "codechef", maxRetries: 1 }
        );

        if (result.success) {
          setCachedProfile("codechef", cleanUsername, result);
        }
        return result;
      } catch (err) {
        const durationMs = Date.now() - startTime;
        const message = err instanceof Error ? err.message : "Unknown error";
        const isTimeout = message.includes("UPSTREAM_TIMEOUT");
        const errorCode = isTimeout ? "TIMEOUT" : "NETWORK_ERROR";

        logConnectorRequest({
          platform: "codechef",
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
              ? "CodeChef request timed out. Please try again."
              : "Failed to connect to CodeChef. Please check your internet connection."
          ),
        };
      }
    });
  },
};
