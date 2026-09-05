"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectPlatform } from "@/actions/connectors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import {
  Alert01Icon,
  Loading03Icon,
  Cancel01Icon,
  Link01Icon,
} from "@hugeicons/core-free-icons";
import type { Platform } from "@/lib/connectors/types";
import type { ConnectorRecord } from "@/actions/connectors";

interface ConnectModalProps {
  platform: Platform;
  platformLabel: string;
  platformIcon: React.ReactNode;
  onClose: () => void;
  onSuccess: (connector: ConnectorRecord) => void;
}

const PLACEHOLDERS: Record<Platform, string> = {
  leetcode: "username or https://leetcode.com/u/username",
  codeforces: "handle or https://codeforces.com/profile/handle",
  codechef: "username or https://codechef.com/users/username",
  github: "username or https://github.com/username",
};

export function ConnectModal({
  platform,
  platformLabel,
  platformIcon,
  onClose,
  onSuccess,
}: ConnectModalProps) {
  const [username, setUsername] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await connectPlatform(platform, trimmed);
      if (result.success && result.connector) {
        onSuccess(result.connector);
      } else {
        const raw = result.error ?? "An unexpected error occurred. Please try again.";
        const friendly = raw.includes("HTTP 400")
          ? "Profile not found or invalid format. Please check your username."
          : raw;
        setError(friendly);
      }
    } catch {
      setError("Failed to connect. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[3px]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Connect ${platformLabel}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              {platformIcon}
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-tight">
                Connect {platformLabel}
              </h2>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                Enter your handle or paste your profile link
              </p>
            </div>
          </div>

          <IconButton
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={isSubmitting}
            variant="ghost"
            size="sm"
            rounded="md"
          >
            <Icon icon={Cancel01Icon} size="sm" />
          </IconButton>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-md)] bg-amber-50/80 border border-amber-200 text-[12.5px] text-amber-900">
                  <Icon icon={Alert01Icon} size="sm" className="shrink-0 mt-0.5 text-amber-600" />
                  <span className="font-medium leading-snug">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label
              htmlFor="connector-username"
              className="block text-[12px] font-semibold text-[var(--color-text-muted)]"
            >
              {platformLabel} Username or URL
            </label>
            <Input
              id="connector-username"
              ref={inputRef}
              type="text"
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              placeholder={PLACEHOLDERS[platform]}
              error={!!error}
            />
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!username.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <Icon icon={Link01Icon} size="xs" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
