"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { ConnectorRecord } from "@/actions/connectors";
import { syncConnector } from "@/actions/connectors";
import { processDeveloperAnalytics, formatRelativeTime } from "@/lib/developer/developer-analytics";
import { DeveloperOverviewCards } from "./DeveloperOverviewCards";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { LanguageDistributionCard } from "./LanguageDistributionCard";
import { DeveloperVelocityInsights } from "./DeveloperVelocityInsights";
import { RepositoriesSection } from "./RepositoriesSection";
import { PullRequestsAndIssuesSection } from "./PullRequestsAndIssuesSection";
import { RecentActivityTimeline } from "./RecentActivityTimeline";
import { DeveloperEmptyState } from "./DeveloperEmptyState";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  RefreshIcon,
  Loading03Icon,
  LinkSquare01Icon,
  AlertCircleIcon,
  UserAccountIcon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";

interface DeveloperDashboardProps {
  initialConnector: ConnectorRecord | null;
}

export function DeveloperDashboard({ initialConnector }: DeveloperDashboardProps) {
  const [connector, setConnector] = React.useState<ConnectorRecord | null>(initialConnector);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [bannerMessage, setBannerMessage] = React.useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);
  const [avatarFailed, setAvatarFailed] = React.useState(false);

  const analytics = React.useMemo(() => processDeveloperAnalytics(connector), [connector]);

  // Sync GitHub profile data with isolated error handling
  const handleSync = async () => {
    if (isSyncing || !connector) return;
    setIsSyncing(true);
    setBannerMessage(null);

    try {
      const result = await syncConnector("github");
      if (result.success && result.connector) {
        setConnector(result.connector);
        setBannerMessage({
          type: "success",
          text: "GitHub metrics synchronized successfully.",
        });
      } else {
        setBannerMessage({
          type: "warning",
          text: result.error || "Failed to synchronize GitHub data.",
        });
      }
    } catch {
      setBannerMessage({
        type: "error",
        text: "Network error occurred while syncing with GitHub.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!analytics.hasConnected) {
    return <DeveloperEmptyState />;
  }

  const { profile } = analytics;
  const primaryLanguage = analytics.languages[0]?.name;

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-3.5 sm:space-y-4 pb-10">
      {/* ── Page Header & Global Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Developer Intelligence
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            GitHub Verified
          </span>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link href="/connectors">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-medium"
            >
              <span>Manage Connectors</span>
              <Icon icon={LinkSquare01Icon} size={13} />
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Icon
              icon={isSyncing ? Loading03Icon : RefreshIcon}
              size={13}
              className={isSyncing ? "animate-spin" : ""}
            />
            <span>{isSyncing ? "Syncing GitHub…" : "Sync GitHub"}</span>
          </Button>
        </div>
      </div>

      {/* ── Sync Notification Banner ── */}
      {bannerMessage && (
        <div
          className={`py-2 px-3 rounded-[var(--radius-md)] border text-xs flex items-center justify-between gap-3 ${
            bannerMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : bannerMessage.type === "warning"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              icon={AlertCircleIcon}
              size={14}
              className={
                bannerMessage.type === "success"
                  ? "text-emerald-600"
                  : bannerMessage.type === "warning"
                  ? "text-amber-600"
                  : "text-rose-600"
              }
            />
            <span>{bannerMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="font-bold cursor-pointer text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 1. Developer Overview Hero Card ── */}
      <div className="p-4 sm:p-4.5 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Profile Info */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {profile.avatarUrl && !avatarFailed ? (
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[var(--color-border)] shadow-[var(--shadow-xs)] shrink-0">
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName || profile.username}
                fill
                sizes="64px"
                className="object-cover"
                priority
                onError={() => setAvatarFailed(true)}
              />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg shrink-0 border-2 border-[var(--color-border)]">
              <Icon icon={UserAccountIcon} size={26} />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
                {profile.displayName || profile.username}
              </h2>
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] inline-flex items-center gap-1 transition-colors"
              >
                <span>@{profile.username}</span>
                <Icon icon={LinkSquare01Icon} size={11} />
              </a>
            </div>

            {profile.bio && (
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Profile Meta Tags */}
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--color-text-faint)] flex-wrap">
              {profile.company && (
                <span className="flex items-center gap-1 font-medium text-[var(--color-text-secondary)]">
                  🏢 {profile.company}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1">
                  📍 {profile.location}
                </span>
              )}
              {profile.blog && (
                <a
                  href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-accent)] truncate max-w-[180px] transition-colors"
                >
                  🔗 {profile.blog.replace(/^https?:\/\//, "")}
                </a>
              )}
              {profile.memberSince && (
                <span>
                  Member since {new Date(profile.memberSince).getFullYear()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Overview Quick Highlights */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-3 xl:pt-0 border-t xl:border-t-0 border-[var(--color-border)] shrink-0">
          {/* Primary Language */}
          {primaryLanguage && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Icon icon={Folder01Icon} size={13} />
              </div>
              <div>
                <div className="text-[10px] font-medium text-[var(--color-text-muted)] leading-tight">Top Stack</div>
                <div className="text-xs font-bold font-mono text-[var(--color-text-primary)]">
                  {primaryLanguage}
                </div>
              </div>
            </div>
          )}

          {/* Last Synced & GitHub Profile Button */}
          <div className="flex flex-col items-start sm:items-end justify-center min-w-[110px]">
            <span className="text-[10px] font-mono text-[var(--color-text-faint)]">
              Synced {profile.lastSyncedAt ? formatRelativeTime(profile.lastSyncedAt) : "Recently"}
            </span>
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] inline-flex items-center gap-1 transition-colors"
            >
              <span>Open GitHub</span>
              <Icon icon={LinkSquare01Icon} size={11} />
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. GitHub Metrics Grid (7 KPI Cards) ── */}
      <DeveloperOverviewCards
        overview={analytics.overview}
        totalThisYear={analytics.contributions.totalThisYear}
      />

      {/* ── 3. Contribution Activity (52-Week Heatmap & Velocity) ── */}
      <ContributionHeatmap
        calendar={analytics.contributions.calendar}
        currentStreak={analytics.overview.currentStreak}
        longestStreak={analytics.overview.longestStreak}
        totalThisYear={analytics.contributions.totalThisYear}
        username={profile.username}
        years={analytics.contributions.years}
        mostActiveDay={analytics.contributions.mostActiveDay}
      />

      {/* ── 4. Engineering Analytics & Activity Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <LanguageDistributionCard
            languages={analytics.languages}
            totalRepos={analytics.overview.totalRepos}
          />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <DeveloperVelocityInsights
            pullRequests={analytics.pullRequests}
            issues={analytics.issues}
            repositories={analytics.repositories}
            calendar={analytics.contributions.calendar}
            totalStars={analytics.overview.totalStars}
          />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <RecentActivityTimeline activity={analytics.recentActivity} />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <PullRequestsAndIssuesSection
            pullRequests={analytics.pullRequests}
            issues={analytics.issues}
            totalPRs={analytics.overview.totalPullRequests}
            totalIssues={analytics.overview.totalIssues}
          />
        </div>
      </div>

      {/* ── 6. Repositories Section ── */}
      <RepositoriesSection
        repositories={analytics.repositories}
        mostActiveRepositories={analytics.mostActiveRepositories}
      />
    </div>
  );
}
