"use client";

import * as React from "react";
import type { Note } from "@/db/schema";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import {
  Pin02Icon,
  Edit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { TIMEZONE_IST } from "@/lib/time/ist";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
}

const noteDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_IST,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export const NoteCard = React.memo(function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    onDelete(note.id);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin(note.id, !note.pinned);
  };

  const formattedDate = noteDateFormatter.format(new Date(note.updatedAt));

  return (
    <div
      onClick={() => onEdit(note)}
      className={cn(
        "group relative flex flex-col h-full min-h-[120px]",
        "p-4 rounded-[var(--radius-lg)] bg-white cursor-pointer select-none",
        "border transition-all duration-150",
        "hover:shadow-[var(--shadow-md)]",
        note.pinned
          ? "border-[var(--color-accent-border)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-accent-light)]"
          : "border-[var(--color-border)] shadow-[var(--shadow-xs)] hover:border-[var(--color-border-strong)]"
      )}
    >
      {/* Pinned accent stripe */}
      {note.pinned && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--color-accent)] rounded-t-[var(--radius-lg)]" />
      )}

      {/* Top: title + actions */}
      <div className="flex items-start justify-between gap-2">
        <h3 className={cn(
          "font-semibold text-[14.5px] leading-snug text-[var(--color-text-primary)] break-words flex-1 min-w-0",
          note.pinned && "mt-1"
        )}>
          {note.title}
        </h3>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity duration-150">
          <IconButton
            type="button"
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            onClick={handleTogglePin}
            variant={note.pinned ? "default" : "ghost"}
            size="sm"
            rounded="md"
            className={cn(
              "w-7 h-7",
              note.pinned
                ? "bg-[var(--color-accent-light)] text-[var(--color-accent)] border-[var(--color-accent-border)]"
                : "text-[var(--color-text-faint)]"
            )}
          >
            <Icon
              icon={Pin02Icon}
              size="xs"
              className={cn(note.pinned && "rotate-45")}
            />
          </IconButton>

          <IconButton
            type="button"
            aria-label="Edit note"
            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
            variant="ghost"
            size="sm"
            rounded="md"
            className="w-7 h-7 text-[var(--color-text-faint)]"
          >
            <Icon icon={Edit02Icon} size="xs" />
          </IconButton>

          <IconButton
            type="button"
            aria-label="Delete note"
            onClick={handleDelete}
            disabled={isDeleting}
            variant="danger"
            size="sm"
            rounded="md"
            className="w-7 h-7"
          >
            <Icon icon={Delete02Icon} size="xs" />
          </IconButton>
        </div>
      </div>

      {/* Content preview */}
      {note.content && (
        <p className="mt-2 text-[13px] text-[var(--color-text-muted)] leading-relaxed line-clamp-4 whitespace-pre-wrap break-words flex-1">
          {note.content}
        </p>
      )}

      {/* Footer: timestamp */}
      <div className="mt-3 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between">
        <span
          suppressHydrationWarning
          className="text-[11px] text-[var(--color-text-faint)] font-medium"
        >
          {formattedDate}
        </span>

        {note.pinned && (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[var(--color-accent)]">
            <Icon icon={Pin02Icon} size="xs" className="rotate-45" />
            Pinned
          </span>
        )}
      </div>
    </div>
  );
});
