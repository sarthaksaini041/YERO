import type { ConnectorService, ConnectorFetchResult } from "../types";
import type {
  CodeforcesUserInfoResponse,
  CodeforcesUserRatingResponse,
  CodeforcesUserStatusResponse,
  CodeforcesRatingChange,
  CodeforcesSubmission,
} from "./codeforces.types";
import { mapCodeforcesResponse } from "./codeforces.mapper";

const CF_API_BASE = "https://codeforces.com/api";

/**
 * Codeforces connector service.
 * Uses the official Codeforces REST API — fully public, no authentication required.
 * Fetches user info, rating history, and submissions in parallel for efficiency.
 */
export const codeforcesService: ConnectorService = {
  platform: "codeforces",

  async fetchProfile(username: string): Promise<ConnectorFetchResult> {
    try {
      // Fetch user info, rating history, and recent submissions in parallel
      const [infoRes, ratingRes, statusRes] = await Promise.allSettled([
        fetch(
          `${CF_API_BASE}/user.info?handles=${encodeURIComponent(username)}`,
          { next: { revalidate: 0 } }
        ),
        fetch(
          `${CF_API_BASE}/user.rating?handle=${encodeURIComponent(username)}`,
          { next: { revalidate: 0 } }
        ),
        // Fetch last 500 submissions for problem counting (sufficient for most users)
        fetch(
          `${CF_API_BASE}/user.status?handle=${encodeURIComponent(username)}&from=1&count=500`,
          { next: { revalidate: 0 } }
        ),
      ]);

      // user.info is the primary endpoint — if it fails, the whole connector fails
      if (infoRes.status === "rejected") {
        return {
          success: false,
          error: "Failed to connect to Codeforces. Please check your internet connection.",
        };
      }

      const infoResponse = infoRes.value;

      if (infoResponse.status === 429) {
        return {
          success: false,
          error: "Codeforces is rate limiting requests. Please try again in a few minutes.",
          rateLimited: true,
        };
      }

      if (!infoResponse.ok) {
        return {
          success: false,
          error: `Codeforces API returned an unexpected error (HTTP ${infoResponse.status}).`,
        };
      }

      const infoData = (await infoResponse.json()) as CodeforcesUserInfoResponse;

      if (infoData.status === "FAILED") {
        // The official API returns status: "FAILED" for non-existent handles
        if (infoData.comment?.toLowerCase().includes("not found")) {
          return {
            success: false,
            error: `Codeforces user "${username}" was not found. Please check the handle and try again.`,
            notFound: true,
          };
        }
        return {
          success: false,
          error: infoData.comment ?? "Codeforces returned an error. Please try again.",
        };
      }

      const user = infoData.result?.[0];
      if (!user) {
        return {
          success: false,
          error: `Codeforces user "${username}" was not found.`,
          notFound: true,
        };
      }

      // Rating history (optional — fail gracefully)
      let ratingHistory: CodeforcesRatingChange[] = [];
      if (ratingRes.status === "fulfilled" && ratingRes.value.ok) {
        const ratingData = (await ratingRes.value.json()) as CodeforcesUserRatingResponse;
        if (ratingData.status === "OK") {
          ratingHistory = ratingData.result ?? [];
        }
      }

      // Submissions (optional — fail gracefully)
      let submissions: CodeforcesSubmission[] = [];
      if (statusRes.status === "fulfilled" && statusRes.value.ok) {
        const statusData = (await statusRes.value.json()) as CodeforcesUserStatusResponse;
        if (statusData.status === "OK") {
          submissions = statusData.result ?? [];
        }
      }

      const profile = mapCodeforcesResponse(username, user, ratingHistory, submissions);
      return { success: true, profile };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to connect to Codeforces. ${message}`,
      };
    }
  },
};
