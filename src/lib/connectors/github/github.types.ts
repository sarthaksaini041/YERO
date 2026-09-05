// GitHub official REST API v3 response types

export interface GitHubUserResponse {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  message?: string;
  documentation_url?: string;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  updated_at: string;
}

export interface GitHubEventCommit {
  sha: string;
  message: string;
  author?: {
    name?: string;
    email?: string;
  };
}

export interface GitHubEventItem {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    action?: string;
    ref?: string;
    ref_type?: string;
    size?: number;
    head?: string;
    commits?: GitHubEventCommit[];
    pull_request?: {
      id?: number;
      title: string;
      html_url: string;
      number: number;
      state: string;
      merged?: boolean;
      created_at?: string;
    };
    issue?: {
      id?: number;
      title: string;
      html_url: string;
      number: number;
      state: string;
      created_at?: string;
    };
  };
  public: boolean;
  created_at: string;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface GitHubContributionsData {
  total: Record<string, number>;
  contributions: GitHubContributionDay[];
}

export interface GitHubSearchItem {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  repository_url: string;
  pull_request?: {
    html_url: string;
    merged_at?: string | null;
  };
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchItem[];
}
