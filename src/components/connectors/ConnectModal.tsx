"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectPlatform } from "@/actions/connectors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
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

  // Focus input on mount
  React.useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  // Close on Escape
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

    const result = await connectPlatform(platform, trimmed);
    setIsSubmitting(false);

    if (result.success && result.connector) {
      onSuccess(result.connector);
    } else {
      setError(result.error ?? "An unexpected error occurred. Please try again.");
    }
  };

  return (
    // Backdrop
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      {/* Modal Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-white rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Connect ${platformLabel}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              {platformIcon}
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-tight">
                Connect {platformLabel}
              </h2>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                Your public profile will be linked
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--color-text-muted)] hover:bg-gray-100 hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Icon icon={Cancel01Icon} size="sm" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[var(--color-danger-light)] border border-red-200 text-[12.5px] text-[var(--color-danger)]">
                  <Icon icon={Alert01Icon} size="sm" className="shrink-0 mt-px" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label
              htmlFor="connector-username"
              className="block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
            >
              {platformLabel} Username
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
              placeholder={`Enter your ${platformLabel} username`}
              className={cn("text-[13.5px]", error && "border-[var(--color-danger)]")}
              error={!!error}
            />
          </div>

          <div className="flex gap-2.5">
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
              loading={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                  Connecting...
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
