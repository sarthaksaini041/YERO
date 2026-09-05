import assert from "node:assert/strict";
import {
  processCodingAnalytics,
  filterRatingHistoryByTimeframe,
} from "../src/lib/coding/coding-analytics.ts";

console.log("▶ Running Coding Analytics Engine Unit Tests...\n");

// Test 1: Empty connectors list
{
  const analytics = processCodingAnalytics([]);
  assert.equal(analytics.hasAnyConnected, false);
  assert.equal(analytics.overview.totalProblemsSolved, 0);
  assert.equal(analytics.overview.totalContests, 0);
  assert.equal(analytics.overview.bestRating, null);
  assert.equal(analytics.overview.yeroScore, 0);
  assert.equal(analytics.platforms.length, 0);
  assert.equal(analytics.recentContests.length, 0);
  console.log("✔ Test 1 passed: Empty connectors list returns zeroed baseline.");
}

// Test 2: Single LeetCode connector
{
  const mockLeetCode = {
    id: "lc-1",
    userId: "u-1",
    platform: "leetcode",
    platformUsername: "tourist",
    status: "connected",
    lastSyncedAt: new Date(Date.now() - 3600000).toISOString(),
    lastSyncAttemptedAt: new Date(Date.now() - 3600000).toISOString(),
    errorMessage: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    profileData: {
      platform: "leetcode",
      username: "tourist",
      stats: {
        problemsSolved: 620,
        easySolved: 220,
        mediumSolved: 310,
        hardSolved: 90,
        rating: 1850,
        contestsParticipated: 15,
        globalRank: 12050,
      },
      metadata: {
        badges: ["Knight", "Guardian"],
      },
    },
  };

  const analytics = processCodingAnalytics([mockLeetCode]);
  assert.equal(analytics.hasAnyConnected, true);
  assert.equal(analytics.overview.totalProblemsSolved, 620);
  assert.equal(analytics.overview.totalContests, 15);
  assert.equal(analytics.overview.bestRating?.rating, 1850);
  assert.equal(analytics.overview.bestRating?.platform, "leetcode");
  assert.equal(analytics.difficultyBreakdown.easy, 220);
  assert.equal(analytics.difficultyBreakdown.medium, 310);
  assert.equal(analytics.difficultyBreakdown.hard, 90);
  assert.equal(analytics.difficultyBreakdown.totalWithDifficulty, 620);
  assert.ok(analytics.overview.yeroScore > 0, "YERO score should be > 0");
  console.log("✔ Test 2 passed: Single LeetCode connector analytics correctly computed.");
}

// Test 3: Multiple platforms (LeetCode + Codeforces + CodeChef + GitHub)
{
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const mockLeetCode = {
    id: "lc-1",
    userId: "u-1",
    platform: "leetcode",
    platformUsername: "dev1",
    status: "connected",
    lastSyncedAt: new Date(now - 10 * 60 * 1000).toISOString(),
    lastSyncAttemptedAt: new Date(now - 10 * 60 * 1000).toISOString(),
    errorMessage: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    profileData: {
      platform: "leetcode",
      username: "dev1",
      stats: {
        problemsSolved: 400,
        easySolved: 150,
        mediumSolved: 200,
        hardSolved: 50,
        rating: 1620,
        contestsParticipated: 12,
      },
    },
  };

  const mockCodeforces = {
    id: "cf-1",
    userId: "u-1",
    platform: "codeforces",
    platformUsername: "tourist",
    status: "connected",
    lastSyncedAt: new Date(now - 20 * 60 * 1000).toISOString(),
    lastSyncAttemptedAt: new Date(now - 20 * 60 * 1000).toISOString(),
    errorMessage: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    profileData: {
      platform: "codeforces",
      username: "tourist",
      stats: {
        problemsSolved: 500,
        rating: 2150,
        maxRating: 2200,
        rank: "Master",
        maxRank: "International Master",
        contestsParticipated: 25,
      },
      metadata: {
        ratingHistory: [
          {
            contest: "Codeforces Round 950 (Div. 2)",
            rank: 120,
            oldRating: 2080,
            newRating: 2120,
            date: new Date(now - 15 * day).toISOString(),
          },
          {
            contest: "Codeforces Round 955 (Div. 1)",
            rank: 85,
            oldRating: 2120,
            newRating: 2150,
            date: new Date(now - 5 * day).toISOString(),
          },
        ],
      },
    },
  };

  const mockCodeChef = {
    id: "cc-1",
    userId: "u-1",
    platform: "codechef",
    platformUsername: "chef_coder",
    status: "connected",
    lastSyncedAt: new Date(now - 45 * 60 * 1000).toISOString(),
    lastSyncAttemptedAt: new Date(now - 45 * 60 * 1000).toISOString(),
    errorMessage: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    profileData: {
      platform: "codechef",
      username: "chef_coder",
      stars: 5,
      stats: {
        problemsSolved: 250,
        rating: 1950,
        maxRating: 1980,
        rank: "5-star",
        globalRank: 1420,
        countryRank: 310,
        contestsParticipated: 18,
      },
      metadata: {
        ratingHistory: [
          {
            contest: "Starters 130",
            rating: 1950,
            rank: 210,
            date: new Date(now - 8 * day).toISOString(),
          },
        ],
      },
    },
  };

  const mockGitHub = {
    id: "gh-1",
    userId: "u-1",
    platform: "github",
    platformUsername: "octocat",
    status: "connected",
    lastSyncedAt: new Date(now - 60 * 60 * 1000).toISOString(),
    lastSyncAttemptedAt: new Date(now - 60 * 60 * 1000).toISOString(),
    errorMessage: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    profileData: {
      platform: "github",
      username: "octocat",
      stats: {
        repos: 42,
        followers: 120,
        following: 15,
        starsReceived: 350,
        problemsSolved: 42, // Public repos fallback
      },
      metadata: {
        topLanguages: ["TypeScript", "Rust", "Python"],
      },
    },
  };

  const analytics = processCodingAnalytics([mockLeetCode, mockCodeforces, mockCodeChef, mockGitHub]);

  // Total problems solved should only sum competitive programming (400 + 500 + 250 = 1150)
  // GitHub repos (42) MUST NOT pollute the competitive problems solved sum!
  assert.equal(analytics.overview.totalProblemsSolved, 1150);

  // Total contests: 12 + 25 + 18 = 55
  assert.equal(analytics.overview.totalContests, 55);

  // Best rating: Codeforces 2150
  assert.equal(analytics.overview.bestRating?.rating, 2150);
  assert.equal(analytics.overview.bestRating?.platform, "codeforces");
  assert.equal(analytics.overview.allRatings.length, 3); // LeetCode, Codeforces, CodeChef

  // Recent contests: 3 aggregated, sorted newest first
  assert.equal(analytics.recentContests.length, 3);
  assert.equal(analytics.recentContests[0].contestName, "Codeforces Round 955 (Div. 1)");
  assert.equal(analytics.recentContests[0].ratingDelta, 30); // 2150 - 2120

  // Connected platforms count
  assert.equal(analytics.overview.connectedPlatformsCount, 4);
  assert.equal(analytics.overview.competitivePlatformsCount, 3);

  console.log("✔ Test 3 passed: Multi-platform aggregation and separation of CP vs GitHub repos verified.");
}

// Test 4: Timeframe filtering helper
{
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const samplePoints = [
    { contest: "C1", rating: 1200, timestamp: now - 400 * day },
    { contest: "C2", rating: 1300, timestamp: now - 200 * day },
    { contest: "C3", rating: 1400, timestamp: now - 70 * day },
    { contest: "C4", rating: 1500, timestamp: now - 15 * day },
    { contest: "C5", rating: 1600, timestamp: now - 2 * day },
  ];

  const all = filterRatingHistoryByTimeframe(samplePoints, "ALL");
  assert.equal(all.length, 5);

  const oneYear = filterRatingHistoryByTimeframe(samplePoints, "1Y");
  assert.equal(oneYear.length, 4); // excludes C1 (400 days ago)

  const thirtyDays = filterRatingHistoryByTimeframe(samplePoints, "30D");
  assert.equal(thirtyDays.length, 2); // C4 and C5

  console.log("✔ Test 4 passed: Timeframe filtering accurately slices timestamps.");
}

// Test 5: Error and degraded sync states
{
  const mockFailingConnector = {
    id: "cf-err",
    userId: "u-1",
    platform: "codeforces",
    platformUsername: "unknown_guy",
    status: "error",
    lastSyncedAt: null,
    lastSyncAttemptedAt: new Date().toISOString(),
    errorMessage: "Codeforces handle not found.",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    profileData: null,
  };

  const analytics = processCodingAnalytics([mockFailingConnector]);
  assert.equal(analytics.hasAnyConnected, true);
  assert.equal(analytics.hasSyncErrors, true);
  assert.equal(analytics.overview.totalProblemsSolved, 0);
  assert.equal(analytics.overview.bestRating, null);
  assert.equal(analytics.platforms[0].status, "error");
  assert.equal(analytics.platforms[0].errorMessage, "Codeforces handle not found.");

  console.log("✔ Test 5 passed: Error connector handled gracefully without crashes or NaN.");
}

console.log("\n All 5 Coding Analytics Unit Tests Passed!\n");
