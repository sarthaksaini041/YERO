import type { ConnectorService, ConnectorFetchResult } from "../types";
import type { CodeChefUserProfile } from "./codechef.types";
import { mapCodeChefResponse } from "./codechef.mapper";

// CodeChef exposes a public JSON endpoint used by their own profile pages.
// No authentication is required for public profiles.
const CODECHEF_API_URL = "https://www.codechef.com/users";

/**
 * CodeChef connector service.
 * Uses CodeChef's public user profile API (JSON endpoint).
 * All fetched data is publicly visible on the CodeChef user profile page.
 */
export const codechefService: ConnectorService = {
  platform: "codechef",

  async fetchProfile(username: string): Promise<ConnectorFetchResult> {
    try {
      const response = await fetch(`${CODECHEF_API_URL}/${encodeURIComponent(username)}`, {
        headers: {
          Accept: "application/json",
          // CodeChef requires valid headers to serve JSON instead of HTML
          "X-Requested-With": "XMLHttpRequest",
        },
        next: { revalidate: 0 },
      });

      if (response.status === 429) {
        return {
          success: false,
          error: "CodeChef is rate limiting requests. Please try again in a few minutes.",
          rateLimited: true,
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: `CodeChef user "${username}" was not found. Please check the username and try again.`,
          notFound: true,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: `CodeChef returned an unexpected error (HTTP ${response.status}). Please try again later.`,
        };
      }

      const contentType = response.headers.get("content-type") ?? "";

      // If CodeChef returns HTML instead of JSON, the endpoint has changed or blocked us
      if (!contentType.includes("application/json")) {
        return {
          success: false,
          error:
            "Could not retrieve CodeChef profile data. The service may be temporarily unavailable.",
        };
      }

      const data = (await response.json()) as CodeChefUserProfile;

      if (!data.success) {
        // API returned a success:false payload (e.g. user not found)
        return {
          success: false,
          error:
            data.message ??
            `CodeChef user "${username}" was not found. Please check the username.`,
          notFound: true,
        };
      }

      const profile = mapCodeChefResponse(username, data);
      return { success: true, profile };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to connect to CodeChef. ${message}`,
      };
    }
  },
};
