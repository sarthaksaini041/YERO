import test from "node:test";
import assert from "node:assert/strict";

// We import via tsx runtime or dynamic imports
const { extractPlatformUsername } = await import("../src/lib/validations/connector.ts");
const { leetcodeService } = await import("../src/lib/connectors/leetcode/leetcode.service.ts");
const { codeforcesService } = await import("../src/lib/connectors/codeforces/codeforces.service.ts");
const { codechefService } = await import("../src/lib/connectors/codechef/codechef.service.ts");
const { githubService } = await import("../src/lib/connectors/github/github.service.ts");
const { parseCodeChefProfileHtml } = await import("../src/lib/connectors/codechef/codechef.scraper.ts");

test("Username Normalization & URL Extraction", async (t) => {
  await t.test("extracts LeetCode username from full URLs", () => {
    assert.deepEqual(extractPlatformUsername("leetcode", "https://leetcode.com/u/example/"), {
      success: true,
      username: "example",
    });
    assert.deepEqual(extractPlatformUsername("leetcode", "https://leetcode.com/example"), {
      success: true,
      username: "example",
    });
    assert.deepEqual(extractPlatformUsername("leetcode", "https://leetcode.cn/u/cn_user"), {
      success: true,
      username: "cn_user",
    });
  });

  await t.test("extracts Codeforces handle from full URLs", () => {
    assert.deepEqual(extractPlatformUsername("codeforces", "https://codeforces.com/profile/tourist"), {
      success: true,
      username: "tourist",
    });
    assert.deepEqual(extractPlatformUsername("codeforces", "https://codeforces.com/tourist/"), {
      success: true,
      username: "tourist",
    });
  });

  await t.test("extracts CodeChef username from full URLs", () => {
    assert.deepEqual(
      extractPlatformUsername("codechef", "https://www.codechef.com/users/gennady.korotkevich/"),
      {
        success: true,
        username: "gennady.korotkevich",
      }
    );
  });

  await t.test("extracts GitHub username from full URLs", () => {
    assert.deepEqual(
      extractPlatformUsername("github", "https://github.com/torvalds/"),
      {
        success: true,
        username: "torvalds",
      }
    );
    assert.deepEqual(
      extractPlatformUsername("github", "github.com/octocat"),
      {
        success: true,
        username: "octocat",
      }
    );
  });

  await t.test("strips leading @ and whitespace", () => {
    assert.deepEqual(extractPlatformUsername("leetcode", "  @tourist  "), {
      success: true,
      username: "tourist",
    });
    assert.deepEqual(extractPlatformUsername("codeforces", "@tourist"), {
      success: true,
      username: "tourist",
    });
    assert.deepEqual(extractPlatformUsername("codechef", "@gennady.korotkevich"), {
      success: true,
      username: "gennady.korotkevich",
    });
    assert.deepEqual(extractPlatformUsername("github", "  @octocat  "), {
      success: true,
      username: "octocat",
    });
  });

  await t.test("rejects invalid inputs", () => {
    assert.equal(extractPlatformUsername("leetcode", "").success, false);
    assert.equal(extractPlatformUsername("leetcode", "   ").success, false);
    assert.equal(extractPlatformUsername("leetcode", "invalid username with spaces").success, false);
    assert.equal(extractPlatformUsername("codeforces", "bad$user").success, false);
    assert.equal(extractPlatformUsername("github", "bad/nested/path/user").success, false);
  });
});

test("CodeChef HTML Scraper Parser Unit Tests", async (t) => {
  await t.test("returns null for non-user page", () => {
    const html = `<html><head><title>Home</title></head><body>Welcome to CodeChef</body></html>`;
    const result = parseCodeChefProfileHtml("fake", html);
    assert.equal(result, null);
  });

  await t.test("parses user details correctly", () => {
    const html = `
      <div class="user-details-container plr10">
        <header>
          <img class="profileImage" src="https://cdn.codechef.com/thumb.jpg" />
          <h1 class="h2-style">Test Coder</h1>
        </header>
        <span class="user-country-name">India</span>
        <div class="rating-number">2150</div>
        <small>(Highest Rating 2200)</small>
        <div class="rating-star">
          <span style="background-color:#D0011B">&#9733;</span>
          <span style="background-color:#D0011B">&#9733;</span>
          <span style="background-color:#D0011B">&#9733;</span>
          <span style="background-color:#D0011B">&#9733;</span>
          <span style="background-color:#D0011B">&#9733;</span>
        </div>
        <a href="/ratings/all"><strong>105</strong></a> Global Rank
        <a href="/ratings/all?filterBy=Country%3D"><strong>12</strong></a> Country Rank
        <h3>Total Problems Solved: 450</h3>
        <script>
          all_rating = [{"rating":"2150","name":"Contest 1"}];
        </script>
      </div>
    `;
    const result = parseCodeChefProfileHtml("testcoder", html);
    assert.notEqual(result, null);
    assert.equal(result?.name, "Test Coder");
    assert.equal(result?.currentRating, 2150);
    assert.equal(result?.highestRating, 2200);
    assert.equal(result?.globalRank, 105);
    assert.equal(result?.countryRank, 12);
    assert.equal(result?.stars, "5★");
    assert.equal(result?.userDetails?.fullySolved, 450);
    assert.equal(result?.ratingData?.length, 1);
  });
});

test("LeetCode Connector Integration", async (t) => {
  await t.test("fetches real public profile for valid user", async () => {
    const result = await leetcodeService.fetchProfile("tourist");
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.profile.platform, "leetcode");
      assert.equal(result.profile.username, "tourist");
      assert.ok(typeof result.profile.stats.problemsSolved === "number");
      assert.ok(result.profile.stats.problemsSolved > 0);
    }
  });

  await t.test("returns PROFILE_NOT_FOUND for non-existent user", async () => {
    const result = await leetcodeService.fetchProfile("this_user_definitely_does_not_exist_987654");
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.code, "PROFILE_NOT_FOUND");
      assert.equal(result.notFound, true);
    }
  });
});

test("Codeforces Connector Integration", async (t) => {
  await t.test("fetches real public profile for valid user", async () => {
    const result = await codeforcesService.fetchProfile("tourist");
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.profile.platform, "codeforces");
      assert.equal(result.profile.username, "tourist");
      assert.ok(typeof result.profile.stats.rating === "number");
      assert.ok(result.profile.stats.rating > 3000);
      assert.ok(result.profile.avatarUrl?.startsWith("http"));
    }
  });

  await t.test("returns PROFILE_NOT_FOUND (not raw HTTP 400) for non-existent user", async () => {
    const result = await codeforcesService.fetchProfile("this_user_definitely_does_not_exist_987654");
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.code, "PROFILE_NOT_FOUND");
      assert.equal(result.notFound, true);
    }
  });
});

test("CodeChef Connector Integration", async (t) => {
  await t.test("fetches real public profile for valid rated user", async () => {
    const result = await codechefService.fetchProfile("gennady.korotkevich");
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.profile.platform, "codechef");
      assert.equal(result.profile.username, "gennady.korotkevich");
      assert.ok(typeof result.profile.stats.rating === "number");
      assert.ok(result.profile.stats.rating > 3000);
      assert.ok(typeof result.profile.stats.problemsSolved === "number");
    }
  });

  await t.test("returns PROFILE_NOT_FOUND for non-existent user", async () => {
    const result = await codechefService.fetchProfile("this_user_definitely_does_not_exist_987654");
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.code, "PROFILE_NOT_FOUND");
      assert.equal(result.notFound, true);
    }
  });
});

test("GitHub Connector Integration", async (t) => {
  await t.test("fetches real public profile and repos for valid user", async () => {
    const result = await githubService.fetchProfile("octocat");
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.profile.platform, "github");
      assert.equal(result.profile.username, "octocat");
      assert.ok(typeof result.profile.stats.repos === "number");
      assert.ok(result.profile.stats.repos > 0);
      assert.ok(typeof result.profile.stats.followers === "number");
      assert.ok(result.profile.stats.followers > 0);
      assert.ok(result.profile.avatarUrl?.startsWith("http"));
      assert.equal(result.profile.profileUrl, "https://github.com/octocat");
    }
  });

  await t.test("returns PROFILE_NOT_FOUND for non-existent GitHub user", async () => {
    const result = await githubService.fetchProfile("this_user_definitely_does_not_exist_987654321");
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.error.code, "PROFILE_NOT_FOUND");
      assert.equal(result.notFound, true);
    }
  });
});

test("Parallel Connector Execution & Fault Isolation", async (t) => {
  await t.test("all four platforms run in parallel and isolate errors", async () => {
    const [cfRes, lcRes, ccRes, ghRes] = await Promise.allSettled([
      codeforcesService.fetchProfile("tourist"), // valid
      leetcodeService.fetchProfile("this_user_does_not_exist_xyz123"), // invalid
      codechefService.fetchProfile("gennady.korotkevich"), // valid
      githubService.fetchProfile("octocat"), // valid
    ]);

    assert.equal(cfRes.status, "fulfilled");
    assert.equal(lcRes.status, "fulfilled");
    assert.equal(ccRes.status, "fulfilled");
    assert.equal(ghRes.status, "fulfilled");

    if (cfRes.status === "fulfilled") {
      assert.equal(cfRes.value.success, true);
    }
    if (lcRes.status === "fulfilled") {
      assert.equal(lcRes.value.success, false);
      if (!lcRes.value.success) {
        assert.equal(lcRes.value.error.code, "PROFILE_NOT_FOUND");
      }
    }
    if (ccRes.status === "fulfilled") {
      assert.equal(ccRes.value.success, true);
    }
    if (ghRes.status === "fulfilled") {
      assert.equal(ghRes.value.success, true);
    }
  });
});
