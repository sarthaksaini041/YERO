"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import {
  Cancel01Icon,
  Pin02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

interface NoteEditorModalProps {
  isOpen: boolean;
  noteToEdit?: Note | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    content: string;
    pinned: boolean;
  }) => Promise<void>;
}

function NoteForm({
  noteToEdit,
  onClose,
  onSave,
}: {
  noteToEdit?: Note | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    content: string;
    pinned: boolean;
  }) => Promise<void>;
}) {
  const [title, setTitle] = React.useState(noteToEdit?.title || "");
  const [content, setContent] = React.useState(noteToEdit?.content || "");
  const [pinned, setPinned] = React.useState(noteToEdit?.pinned ?? false);
  const [isSaving, setIsSaving] = React.useState(false);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => titleInputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = React.useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmedTitle = title.trim();
      if (!trimmedTitle || isSaving) return;

      setIsSaving(true);
      try {
        await onSave({
          id: noteToEdit?.id,
          title: trimmedTitle,
          content: content.trim(),
          pinned,
        });
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    },
    [title, content, pinned, isSaving, noteToEdit, onSave, onClose]
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, onClose]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <label
          htmlFor="note-title"
          className="block text-[12px] font-semibold text-[var(--color-text-muted)]"
        >
          Title
        </label>
        <Input
          id="note-title"
          ref={titleInputRef}
          type="text"
          required
          placeholder="Note title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
          className="text-[15px] font-medium"
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <label
          htmlFor="note-content"
          className="block text-[12px] font-semibold text-[var(--color-text-muted)]"
        >
          Content
        </label>
        <textarea
          id="note-content"
          rows={5}
          placeholder="Write your thoughts, checklist, or details…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSaving}
          className={cn(
            "w-full px-3.5 py-3 rounded-[var(--radius-md)] border border-[var(--color-border)]",
            "bg-white text-[13.5px] text-[var(--color-text-primary)]",
            "placeholder:text-[var(--color-text-faint)]",
            "focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)] focus:outline-none",
            "transition-[border-color,box-shadow] duration-[var(--duration-base)]",
            "resize-none leading-relaxed shadow-[var(--shadow-xs)]"
          )}
        />
      </div>

      {/* Footer: pin toggle + buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[12.5px] font-medium transition-colors cursor-pointer",
            pinned
              ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-secondary)]"
          )}
        >
          <Icon icon={Pin02Icon} size="sm" className={cn(pinned && "rotate-45")} />
          <span>{pinned ? "Pinned to top" : "Pin to top"}</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!title.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                Saving…
              </>
            ) : noteToEdit ? (
              "Save Changes"
            ) : (
              "Create Note"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function NoteEditorModal({
  isOpen,
  noteToEdit,
  onClose,
  onSave,
}: NoteEditorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[3px]"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-editor-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-0">
              <h2
                id="note-editor-title"
                className="text-[17px] font-bold text-[var(--color-text-primary)] tracking-tight"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
              >
                {noteToEdit ? "Edit Note" : "New Note"}
              </h2>
              <IconButton
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                variant="ghost"
                size="sm"
                rounded="md"
              >
                <Icon icon={Cancel01Icon} size="sm" />
              </IconButton>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <NoteForm
                key={noteToEdit?.id || "new"}
                noteToEdit={noteToEdit}
                onClose={onClose}
                onSave={onSave}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
