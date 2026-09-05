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

  // Format date
  const formattedDate = noteDateFormatter.format(new Date(note.updatedAt));

  return (
    <div
      onClick={() => onEdit(note)}
      className={cn(
        "group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-white border transition-all duration-150 cursor-pointer select-none",
        note.pinned
          ? "border-[var(--color-accent-border)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--color-accent-light)]"
          : "border-[var(--color-border)] shadow-[var(--shadow-xs)] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-sm)]"
      )}
    >
      {/* Top row: Title and action buttons */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[15px] leading-snug text-[var(--color-text-primary)] break-words">
            {note.title}
          </h3>

          <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <IconButton
              type="button"
              aria-label={note.pinned ? "Unpin note" : "Pin note"}
              title={note.pinned ? "Unpin note" : "Pin note"}
              onClick={handleTogglePin}
              variant={note.pinned ? "default" : "ghost"}
              size="sm"
              rounded="md"
              className={cn(
                "w-7 h-7 transition-colors",
                note.pinned
                  ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-faint)] hover:text-[var(--color-text-secondary)]"
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
              title="Edit note"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              variant="ghost"
              size="sm"
              rounded="md"
              className="w-7 h-7 text-[var(--color-text-faint)] hover:text-[var(--color-text-secondary)]"
            >
              <Icon icon={Edit02Icon} size="xs" />
            </IconButton>

            <IconButton
              type="button"
              aria-label="Delete note"
              title="Delete note"
              onClick={handleDelete}
              disabled={isDeleting}
              variant="ghost"
              size="sm"
              rounded="md"
              className="w-7 h-7 text-[var(--color-text-faint)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
            >
              <Icon icon={Delete02Icon} size="xs" />
            </IconButton>
          </div>
        </div>

        {/* Content body */}
        {note.content && (
          <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-4 whitespace-pre-wrap break-words">
            {note.content}
          </p>
        )}
      </div>

      {/* Card Footer: timestamp */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--color-text-faint)]">
        <span suppressHydrationWarning>{formattedDate}</span>
      </div>
    </div>
  );
});
