"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { connectPlatform } from "@/actions/connectors";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  GitBranchIcon,
  SparklesIcon,
  Folder01Icon,
  StarIcon,
  GitPullRequestIcon,
  Loading03Icon,
  LinkSquare01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";

export function DeveloperEmptyState() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await connectPlatform("github", username.trim());
      if (result.success) {
        router.refresh();
      } else {
        setErrorMsg(result.error || "Failed to connect GitHub profile.");
      }
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: "52-Week Contribution Heatmap",
      desc: "Daily commit & contribution grid, live streak calculation, and annual velocity",
      icon: SparklesIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Repository & Star Analytics",
      desc: "Track public repos, star growth, fork counts, and open issues across projects",
      icon: Folder01Icon,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Languages & Activity Stream",
      desc: "Language distribution percentages, push commits with messages, PRs, and issues",
      icon: GitPullRequestIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Audience & Network Reach",
      desc: "Followers, following count, and developer network metrics verified directly via GitHub",
      icon: StarIcon,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-3.5 sm:space-y-4 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Developer Intelligence
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            GitHub Connector
          </span>
        </div>

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
      </div>

      {/* Hero Connect Box */}
      <div className="max-w-2xl mx-auto my-4 space-y-6">
        <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-xl)] p-7 sm:p-10 shadow-[var(--shadow-sm)] text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-xs)]">
            <Icon icon={GitBranchIcon} size={28} />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Connect Your GitHub Profile
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
            Link your GitHub username to unlock your complete developer intelligence dashboard — including real contribution heatmaps, repository stars, PRs, and language distributions.
          </p>

          {/* Inline Quick Connect Form */}
          <form onSubmit={handleConnect} className="mt-6 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Enter GitHub username (e.g. octocat)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 text-xs rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:bg-white transition-colors"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading || !username.trim()}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 font-semibold text-xs py-2.5 px-4"
              >
                {isLoading ? (
                  <>
                    <Icon icon={Loading03Icon} size={14} className="animate-spin" />
                    <span>Connecting…</span>
                  </>
                ) : (
                  <span>Connect GitHub</span>
                )}
              </Button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-[var(--radius-md)] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left">
                <Icon icon={AlertCircleIcon} size={15} className="text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-3.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] flex items-start gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${f.bg} ${f.color}`}
                >
                  <Icon icon={f.icon} size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {f.title}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-[var(--color-border)] flex items-center justify-center gap-1 text-xs text-[var(--color-text-muted)]">
            <span>Looking to manage all platforms?</span>
            <Link
              href="/connectors"
              className="text-[var(--color-accent)] hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>Go to Connectors</span>
              <Icon icon={LinkSquare01Icon} size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
