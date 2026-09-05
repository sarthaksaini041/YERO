"use client";

import * as React from "react";
import type { DeveloperRepoItem } from "@/lib/developer/developer-analytics";
import { formatRelativeTime } from "@/lib/developer/developer-analytics";
import { getLanguageColor } from "@/lib/connectors/github/github.mapper";
import { Icon } from "@/components/ui/icon";
import {
  Search01Icon,
  StarIcon,
  GitBranchIcon,
  LinkSquare01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";

interface RepositoriesSectionProps {
  repositories: DeveloperRepoItem[];
  mostActiveRepositories: DeveloperRepoItem[];
}

export function RepositoriesSection({
  repositories,
  mostActiveRepositories,
}: RepositoriesSectionProps) {
  const [tab, setTab] = React.useState<"active" | "all">("active");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"stars" | "updated" | "name">("stars");

  // Extract unique languages
  const availableLanguages = React.useMemo(() => {
    const langs = new Set<string>();
    for (const r of repositories) {
      if (r.language) langs.add(r.language);
    }
    return Array.from(langs).sort();
  }, [repositories]);

  // Filter & sort list
  const filteredRepos = React.useMemo(() => {
    const list = tab === "active" ? mostActiveRepositories : repositories;

    return list
      .filter((repo) => {
        const matchesSearch =
          searchQuery.trim() === "" ||
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLang =
          selectedLanguage === "all" || repo.language === selectedLanguage;

        return matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        if (tab === "active") {
          return (b.activityScore || 0) - (a.activityScore || 0);
        }
        if (sortBy === "stars") return b.stars - a.stars;
        if (sortBy === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [tab, repositories, mostActiveRepositories, searchQuery, selectedLanguage, sortBy]);

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-4.5 shadow-[var(--shadow-xs)]">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[var(--color-border)]">
        <h3 className="text-base sm:text-heading font-semibold text-[var(--color-text-primary)]">
          Repositories
        </h3>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              tab === "active"
                ? "bg-white text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Most Active ({mostActiveRepositories.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              tab === "all"
                ? "bg-white text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            All Repositories ({repositories.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-3">
        <div className="relative flex-1">
          <Icon
            icon={Search01Icon}
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
          />
          <input
            type="text"
            placeholder="Search repositories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-accent)] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Language filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] cursor-pointer truncate font-medium"
          >
            <option value="all">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Sort dropdown (if on "all" tab) */}
          {tab === "all" && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "stars" | "updated" | "name")}
              className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] cursor-pointer truncate font-medium"
            >
              <option value="stars">Most Stars</option>
              <option value="updated">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          )}
        </div>
      </div>

      {/* Repositories Grid */}
      {filteredRepos.length === 0 ? (
        <div className="text-center py-10 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] mt-3">
          No repositories match your search or filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mt-3">
          {filteredRepos.map((repo, idx) => {
            const langColor = getLanguageColor(repo.language);
            const isFeatured = idx === 0 && filteredRepos.length > 1;

            return (
              <div
                key={repo.id}
                className={`group p-3 sm:p-3.5 rounded-[var(--radius-md)] border flex flex-col justify-between hover:border-[var(--color-accent-border)] hover:bg-white hover:shadow-[var(--shadow-sm)] transition-all min-h-[132px] ${
                  isFeatured
                    ? "lg:col-span-2 bg-gradient-to-br from-white via-white to-indigo-50/20 border-indigo-200/60 shadow-[var(--shadow-xs)]"
                    : "bg-[var(--color-surface-alt)] border-[var(--color-border)]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-xs text-[var(--color-text-primary)] hover:text-[var(--color-accent)] flex items-center gap-1.5 truncate group-hover:underline"
                      >
                        <Icon icon={Folder01Icon} size={13} className="text-indigo-500 shrink-0" />
                        <span className="truncate">{repo.name}</span>
                        <Icon
                          icon={LinkSquare01Icon}
                          size={10}
                          className="text-[var(--color-text-faint)] group-hover:text-[var(--color-accent)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </a>

                      {isFeatured && (
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                          {tab === "active" ? "Most Active" : "Top Project"}
                        </span>
                      )}
                    </div>

                    {repo.isFork && (
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        Fork
                      </span>
                    )}
                  </div>

                  <p className={`text-[11.5px] text-[var(--color-text-muted)] mt-1.5 line-clamp-2 leading-relaxed min-h-[30px] ${isFeatured ? "max-w-2xl" : ""}`}>
                    {repo.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[var(--color-border)]/70 text-[10.5px] text-[var(--color-text-faint)]">
                  {/* Language */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    {repo.language ? (
                      <>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: langColor }}
                        />
                        <span className="text-[var(--color-text-secondary)] font-medium truncate">
                          {repo.language}
                        </span>
                      </>
                    ) : (
                      <span className="text-[var(--color-text-faint)]">—</span>
                    )}
                  </div>

                  {/* Stars, Forks, and Updated Date */}
                  <div className="flex items-center gap-2.5 shrink-0 font-mono text-[10.5px]">
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-600 font-semibold" title="Stars">
                        <Icon icon={StarIcon} size={11} />
                        {repo.stars.toLocaleString()}
                      </span>
                    )}

                    {repo.forks > 0 && (
                      <span className="flex items-center gap-0.5 text-[var(--color-text-muted)]" title="Forks">
                        <Icon icon={GitBranchIcon} size={11} />
                        {repo.forks}
                      </span>
                    )}

                    <span className="text-[var(--color-text-faint)]">
                      {formatRelativeTime(repo.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
