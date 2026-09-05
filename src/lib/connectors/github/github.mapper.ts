import type {
  GitHubUserResponse,
  GitHubRepoItem,
  GitHubEventItem,
  GitHubContributionsData,
  GitHubSearchItem,
} from "./github.types";
import type { ConnectorProfile } from "../types";

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#DEA584",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Java: "#B07219",
  HTML: "#E34C26",
  CSS: "#563D7C",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89E051",
  Vue: "#41B883",
  Svelte: "#FF3E00",
  SCSS: "#C6538C",
  Jupyter: "#DA5B0B",
  Markdown: "#083FA1",
};

export function getLanguageColor(lang: string | null | undefined): string {
  if (!lang) return "#94A3B8";
  return LANGUAGE_COLORS[lang] || "#6366F1";
}

/**
 * Calculates current and longest streaks from an array of contribution days.
 */
export function calculateStreaks(
  contributions: Array<{ date: string; count: number }>
): { currentStreak: number; longestStreak: number } {
  if (!contributions || contributions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort chronologically ascending
  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));

  let longestStreak = 0;
  let tempStreak = 0;

  for (const day of sorted) {
    if (day.count > 0) {
      tempStreak += 1;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Current streak: Walk backwards from the most recent day
  let currentStreak = 0;
  const len = sorted.length;

  let startIndex = len - 1;
  // If the last day has 0 contributions, check if yesterday was active
  if (startIndex >= 0 && sorted[startIndex].count === 0 && startIndex > 0) {
    startIndex -= 1;
  }

  for (let i = startIndex; i >= 0; i--) {
    if (sorted[i].count > 0) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Maps GitHub REST API user, repos, events, contributions, and PR/issue data
 * to the normalized ConnectorProfile.
 */
export function mapGitHubResponse(
  username: string,
  user: GitHubUserResponse,
  repos: GitHubRepoItem[] = [],
  events: GitHubEventItem[] = [],
  contribData?: GitHubContributionsData | null,
  pullRequestsData?: { total: number; items: GitHubSearchItem[] } | null,
  issuesData?: { total: number; items: GitHubSearchItem[] } | null
): ConnectorProfile {
  // 1. Owned Repositories & Stars
  const ownerRepos = repos.filter((r) => !r.fork);
  const totalStars = ownerRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  // 2. Languages breakdown
  const languageCounts: Record<string, number> = {};
  let totalReposWithLang = 0;
  for (const repo of ownerRepos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      totalReposWithLang += 1;
    }
  }

  const languages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({
      name: lang,
      count,
      percentage: totalReposWithLang > 0 ? Math.round((count / totalReposWithLang) * 100) : 0,
      color: getLanguageColor(lang),
    }));

  const topLanguages = languages.slice(0, 6).map((l) => l.name);

  // 3. Normalized Repositories list
  const repositories = ownerRepos.map((r) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    url: r.html_url,
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    language: r.language,
    openIssues: r.open_issues_count || 0,
    isFork: r.fork,
    updatedAt: r.updated_at,
  }));

  // 4. Most Active Repositories (based on recent events + stars)
  const repoEventCounts: Record<string, number> = {};
  for (const ev of events) {
    if (ev.repo?.name) {
      repoEventCounts[ev.repo.name] = (repoEventCounts[ev.repo.name] || 0) + 1;
    }
  }

  const mostActiveRepositories = [...repositories]
    .map((r) => {
      const eventHits = repoEventCounts[r.fullName] || repoEventCounts[r.name] || 0;
      const activityScore = eventHits * 10 + r.stars * 2 + (r.forks || 0);
      return {
        ...r,
        activityScore,
        activityCount: eventHits,
      };
    })
    .sort((a, b) => b.activityScore - a.activityScore || b.stars - a.stars)
    .slice(0, 6);

  // 5. Contributions and Streaks
  let totalContributions = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let contributionsCalendar: Array<{ date: string; count: number; level: number }> = [];
  const contributionYears: Record<string, number> = contribData?.total || {};

  if (contribData?.contributions && Array.isArray(contribData.contributions)) {
    const rawCalendar = contribData.contributions;
    const streakResult = calculateStreaks(rawCalendar);
    currentStreak = streakResult.currentStreak;
    longestStreak = streakResult.longestStreak;

    // Filter to last 365 days for the 52-week heatmap
    const sortedCal = [...rawCalendar].sort((a, b) => a.date.localeCompare(b.date));
    contributionsCalendar = sortedCal.slice(-371); // ~53 weeks (371 days)

    // Calculate sum of last year contributions
    totalContributions = contributionsCalendar.reduce((sum, day) => sum + (day.count || 0), 0);

    // If current year total is in contributionYears, use that or totalContributions
    const currentYear = new Date().getFullYear().toString();
    if (contributionYears[currentYear]) {
      totalContributions = Math.max(totalContributions, contributionYears[currentYear]);
    }
  } else {
    // Fallback: estimate from events
    const eventDayCounts: Record<string, number> = {};
    for (const ev of events) {
      const dayStr = ev.created_at.slice(0, 10);
      eventDayCounts[dayStr] = (eventDayCounts[dayStr] || 0) + 1;
    }
    const dayEntries = Object.entries(eventDayCounts).map(([date, count]) => ({
      date,
      count,
      level: count >= 10 ? 4 : count >= 5 ? 3 : count >= 2 ? 2 : 1,
    }));
    const fallbackStreak = calculateStreaks(dayEntries);
    currentStreak = fallbackStreak.currentStreak;
    longestStreak = fallbackStreak.longestStreak;
    totalContributions = Object.values(eventDayCounts).reduce((a, b) => a + b, 0);
    contributionsCalendar = dayEntries;
  }

  // 6. Recent Activity Timeline
  const recentActivity = events.slice(0, 30).map((ev) => {
    let type: "push" | "pr" | "issue" | "create" | "watch" | "fork" | "other" = "other";
    let title = "";
    let badgeText = "Activity";
    let commits: Array<{ sha: string; message: string }> | undefined;
    let state: string | undefined;
    let url: string | undefined = `https://github.com/${ev.repo.name}`;

    switch (ev.type) {
      case "PushEvent":
        type = "push";
        badgeText = "Push";
        const commitCount = ev.payload.commits?.length || ev.payload.size || 1;
        const branchName = (ev.payload.ref || "").replace("refs/heads/", "");
        title = `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"}${
          branchName ? ` to ${branchName}` : ""
        }`;
        commits = ev.payload.commits?.slice(0, 3).map((c) => ({
          sha: c.sha.slice(0, 7),
          message: c.message.split("\n")[0],
        }));
        break;

      case "PullRequestEvent":
        type = "pr";
        badgeText = "PR";
        const prAction = ev.payload.action || "opened";
        const isMerged = ev.payload.pull_request?.merged;
        state = isMerged ? "merged" : ev.payload.pull_request?.state || "open";
        title = `${prAction.charAt(0).toUpperCase() + prAction.slice(1)} PR #${
          ev.payload.pull_request?.number
        }: ${ev.payload.pull_request?.title || "Pull Request"}`;
        url = ev.payload.pull_request?.html_url || url;
        break;

      case "IssuesEvent":
        type = "issue";
        badgeText = "Issue";
        const issueAction = ev.payload.action || "opened";
        state = ev.payload.issue?.state || "open";
        title = `${issueAction.charAt(0).toUpperCase() + issueAction.slice(1)} Issue #${
          ev.payload.issue?.number
        }: ${ev.payload.issue?.title || "Issue"}`;
        url = ev.payload.issue?.html_url || url;
        break;

      case "CreateEvent":
        type = "create";
        badgeText = "Created";
        const refType = ev.payload.ref_type || "repository";
        const refName = ev.payload.ref ? ` '${ev.payload.ref}'` : "";
        title = `Created ${refType}${refName}`;
        break;

      case "WatchEvent":
        type = "watch";
        badgeText = "Star";
        title = `Starred ${ev.repo.name}`;
        break;

      case "ForkEvent":
        type = "fork";
        badgeText = "Fork";
        title = `Forked ${ev.repo.name}`;
        break;

      default:
        title = `${ev.type.replace("Event", "")} in ${ev.repo.name}`;
    }

    return {
      id: ev.id,
      type,
      repoName: ev.repo.name,
      repoUrl: `https://github.com/${ev.repo.name}`,
      title,
      timestamp: new Date(ev.created_at).getTime(),
      date: ev.created_at,
      badgeText,
      commits,
      state,
      url,
    };
  });

  // 7. Pull Requests & Issues
  const totalPullRequests =
    pullRequestsData?.total ??
    events.filter((e) => e.type === "PullRequestEvent").length;

  const pullRequests = (pullRequestsData?.items || []).map((item) => {
    const isMerged = Boolean(item.pull_request?.merged_at);
    return {
      id: item.id,
      number: item.number,
      title: item.title,
      url: item.html_url,
      state: (isMerged ? "merged" : item.state) as "open" | "closed" | "merged",
      repo: item.repository_url.replace("https://api.github.com/repos/", ""),
      createdAt: item.created_at,
    };
  });

  const totalIssues =
    issuesData?.total ??
    events.filter((e) => e.type === "IssuesEvent").length;

  const issues = (issuesData?.items || []).map((item) => ({
    id: item.id,
    number: item.number,
    title: item.title,
    url: item.html_url,
    state: item.state as "open" | "closed",
    repo: item.repository_url.replace("https://api.github.com/repos/", ""),
    createdAt: item.created_at,
  }));

  // 8. Commit count
  const totalCommits = events
    .filter((e) => e.type === "PushEvent")
    .reduce((sum, e) => sum + (e.payload.commits?.length || e.payload.size || 1), 0);

  return {
    platform: "github",
    username: user.login,
    profileUrl: user.html_url || `https://github.com/${user.login}`,
    displayName: user.name?.trim() || undefined,
    avatarUrl: user.avatar_url || undefined,
    country: user.location?.trim() || undefined,

    stats: {
      repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      starsReceived: totalStars,
      totalContributions,
      currentStreak,
      longestStreak,
      totalPullRequests,
      totalIssues,
      totalCommits,
      // Map public_repos to problemsSolved for backwards compatibility
      problemsSolved: user.public_repos,
    },

    lastSyncedAt: new Date().toISOString(),

    metadata: {
      bio: user.bio?.trim() || undefined,
      company: user.company?.trim() || undefined,
      blog: user.blog?.trim() || undefined,
      publicGists: user.public_gists,
      topLanguages,
      languages,
      repositories,
      mostActiveRepositories,
      contributionsCalendar,
      contributionYears,
      currentStreak,
      longestStreak,
      totalContributions,
      pullRequests,
      issues,
      recentActivity,
      memberSince: user.created_at,
    },
  };
}
