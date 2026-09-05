import type {
  CodeforcesUser,
  CodeforcesRatingChange,
  CodeforcesSubmission,
} from "./codeforces.types";
import type { ConnectorProfile } from "../types";

/**
 * Counts unique accepted problems from submission list.
 * A problem is identified by its contestId + index combination.
 */
function countUniqueAccepted(submissions: CodeforcesSubmission[]): number {
  const solved = new Set<string>();
  for (const sub of submissions) {
    if (sub.verdict === "OK") {
      const key = `${sub.problem.contestId ?? "0"}-${sub.problem.index}`;
      solved.add(key);
    }
  }
  return solved.size;
}

/**
 * Maps official Codeforces API responses to the normalized ConnectorProfile.
 * Only maps fields that are present in the response — never fabricates data.
 */
export function mapCodeforcesResponse(
  username: string,
  user: CodeforcesUser,
  ratingHistory: CodeforcesRatingChange[],
  submissions: CodeforcesSubmission[]
): ConnectorProfile {
  const problemsSolved = submissions.length > 0
    ? countUniqueAccepted(submissions)
    : undefined;

  // Recent submissions = submitted in the last 30 days
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const recentSubmissions = submissions.filter(
    (s) => s.creationTimeSeconds >= thirtyDaysAgo
  ).length;

  return {
    platform: "codeforces",
    username: user.handle,
    profileUrl: `https://codeforces.com/profile/${user.handle}`,
    displayName:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`.trim()
        : undefined,
    avatarUrl: user.titlePhoto
      ? `https://codeforces.com${user.titlePhoto}`
      : user.avatar
      ? `https://codeforces.com${user.avatar}`
      : undefined,
    country: user.country ?? undefined,

    stats: {
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      maxRank: user.maxRank,
      problemsSolved,
      contestsParticipated: ratingHistory.length || undefined,
    },

    activity: {
      recentSubmissions: recentSubmissions > 0 ? recentSubmissions : undefined,
    },

    metadata: {
      contribution: user.contribution,
      organization: user.organization ?? undefined,
      city: user.city ?? undefined,
      friendOfCount: user.friendOfCount,
      registrationYear: user.registrationTimeSeconds
        ? new Date(user.registrationTimeSeconds * 1000).getFullYear()
        : undefined,
      ratingHistory: ratingHistory.slice(-10).map((r) => ({
        contest: r.contestName,
        rank: r.rank,
        oldRating: r.oldRating,
        newRating: r.newRating,
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().split("T")[0],
      })),
    },
  };
}
