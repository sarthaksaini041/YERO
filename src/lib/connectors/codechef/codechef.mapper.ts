import type { CodeChefUserProfile } from "./codechef.types";
import type { ConnectorProfile } from "../types";

/**
 * Parses CodeChef star string (e.g. "5★") into a number.
 */
function parseStars(starsStr: string | undefined): number | undefined {
  if (!starsStr) return undefined;
  const match = starsStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Maps the CodeChef profile data to the normalized ConnectorProfile.
 * Only maps fields that are present — never fabricates data.
 */
export function mapCodeChefResponse(
  username: string,
  data: CodeChefUserProfile
): ConnectorProfile {
  const stars = parseStars(data.stars);

  // Build star label for rank field (e.g. "7-star")
  const rankLabel = data.stars ? data.stars.replace("★", "-star").trim() : undefined;

  // Count contests from rating history
  const contestsParticipated = data.ratingData?.length;

  return {
    platform: "codechef",
    username,
    profileUrl: `https://www.codechef.com/users/${username}`,
    displayName: data.name ?? undefined,
    avatarUrl: data.avatarUrl ?? undefined,
    country: data.countryName ?? undefined,
    stars,

    stats: {
      rating: data.currentRating ?? undefined,
      maxRating: data.highestRating ?? undefined,
      rank: rankLabel,
      globalRank: data.globalRank ?? undefined,
      countryRank: data.countryRank ?? undefined,
      problemsSolved: data.userDetails?.fullySolved ?? undefined,
      contestsParticipated,
    },

    lastSyncedAt: new Date().toISOString(),

    metadata: {
      starsLabel: data.stars ?? undefined,
      partiallySolved: data.userDetails?.partiallySolved ?? undefined,
      city: data.city ?? undefined,
      ratingHistory: data.ratingData?.slice(-10)?.map((r) => ({
        contest: r.name,
        rating: parseInt(r.rating, 10),
        rank: parseInt(r.rank, 10),
        date: r.end_date,
      })) ?? undefined,
    },
  };
}
