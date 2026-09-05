import type { CodeChefUserProfile } from "./codechef.types";

/**
 * Parses CodeChef user profile HTML and extracts profile fields safely.
 * Returns null if the page does not represent a valid user profile.
 */
export function parseCodeChefProfileHtml(
  username: string,
  html: string
): CodeChefUserProfile | null {
  // All valid CodeChef user profiles contain the user-details-container section
  if (!html.includes("user-details-container")) {
    return null;
  }

  // Display name: <h1 class="h2-style">Name</h1>
  const nameMatch = html.match(/<h1 class="h2-style">([^<]+)<\/h1>/);
  const name = nameMatch ? nameMatch[1].trim() : undefined;

  // Profile image
  const avatarMatch = html.match(/<img class=['"]profileImage['"]\s+src=['"]([^'"]+)['"]/);
  let avatarUrl = avatarMatch ? avatarMatch[1].trim() : undefined;
  if (avatarUrl?.startsWith("//")) {
    avatarUrl = `https:${avatarUrl}`;
  } else if (avatarUrl?.startsWith("/")) {
    avatarUrl = `https://www.codechef.com${avatarUrl}`;
  }

  // Country
  const countryMatch = html.match(/<span class="user-country-name"[^>]*>([^<]+)<\/span>/);
  const countryName = countryMatch ? countryMatch[1].trim() : undefined;

  // Stars: e.g. "7★" or "7&#9733;"
  let stars: string | undefined;
  const starsMatch = html.match(/class=['"]rating['"][^>]*>([0-9]+)(?:&#9733;|★)?<\/span>/);
  if (starsMatch) {
    stars = `${starsMatch[1]}★`;
  } else {
    // Alternatively count star spans in rating-star container
    const starContainerMatch = html.match(/<div class="rating-star">([\s\S]*?)<\/div>/);
    if (starContainerMatch) {
      const starSpans = starContainerMatch[1].match(/<span[^>]*>/g);
      if (starSpans && starSpans.length > 0) {
        stars = `${starSpans.length}★`;
      }
    }
  }

  // Current Rating: <div class="rating-number">3355</div>
  let currentRating: number | undefined;
  const ratingMatch = html.match(/<div class="rating-number">\s*([0-9]+)\s*<\/div>/);
  if (ratingMatch) {
    const parsed = parseInt(ratingMatch[1], 10);
    if (!isNaN(parsed)) currentRating = parsed;
  }

  // Highest Rating: <small>(Highest Rating 3445)</small>
  let highestRating: number | undefined;
  const highestMatch = html.match(/<small>\s*\(Highest Rating\s*([0-9]+)\)\s*<\/small>/);
  if (highestMatch) {
    const parsed = parseInt(highestMatch[1], 10);
    if (!isNaN(parsed)) highestRating = parsed;
  }

  // Global Rank
  let globalRank: number | undefined;
  const globalMatch = html.match(
    /<a href="\/ratings\/all">\s*<strong>\s*([^<]+)\s*<\/strong>\s*<\/a>\s*Global Rank/
  );
  if (globalMatch) {
    const val = globalMatch[1].trim().replace(/,/g, "");
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) globalRank = parsed;
  }

  // Country Rank
  let countryRank: number | undefined;
  const countryRankMatch = html.match(
    /filterBy=Country[^\x22]*">\s*<strong>\s*([^<]+)\s*<\/strong>\s*<\/a>\s*Country Rank/
  );
  if (countryRankMatch) {
    const val = countryRankMatch[1].trim().replace(/,/g, "");
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) countryRank = parsed;
  }

  // Problems Solved: Total Problems Solved: 632
  let fullySolved: number | undefined;
  const solvedMatch =
    html.match(/Total Problems Solved:\s*([0-9]+)/i) ||
    html.match(/Fully Solved\s*\(([0-9]+)\)/i);
  if (solvedMatch) {
    const parsed = parseInt(solvedMatch[1], 10);
    if (!isNaN(parsed)) fullySolved = parsed;
  }

  // Contests History from embedded script var: all_rating = [...];
  let ratingData: CodeChefUserProfile["ratingData"] = [];
  const allRatingStart = html.indexOf("all_rating = ");
  if (allRatingStart !== -1) {
    const allRatingEnd = html.indexOf(";\n", allRatingStart);
    if (allRatingEnd !== -1) {
      try {
        const jsonStr = html
          .slice(allRatingStart + "all_rating = ".length, allRatingEnd)
          .trim();
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          ratingData = parsed;
        }
      } catch {
        // Fallback gracefully if script json parsing fails
      }
    }
  }

  return {
    success: true,
    status: "OK",
    username,
    name,
    avatarUrl,
    countryName,
    currentRating,
    highestRating,
    globalRank,
    countryRank,
    stars,
    userDetails: {
      fullySolved,
    },
    ratingData,
  };
}
