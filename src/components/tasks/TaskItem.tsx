"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import type { Task } from "@/db/schema";
import {
  Tick02Icon,
  Delete02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { TIMEZONE_IST } from "@/lib/time/ist";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const taskTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_IST,
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});

export const TaskItem = React.memo(function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleToggle = async () => {
    if (isUpdating || isDeleting) return;
    setIsUpdating(true);
    await onToggle(task.id, !task.completed);
    setIsUpdating(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    await onDelete(task.id);
  };

  const formattedTime = taskTimeFormatter.format(new Date(task.createdAt));

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between",
        "px-3.5 py-2 sm:px-4 sm:py-2.5",
        "rounded-xl bg-white border border-[var(--color-border)]",
        "shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]",
        "hover:border-[var(--color-border-strong)]",
        "transition-[box-shadow,border-color,opacity] duration-150",
        task.completed && "opacity-70",
        isDeleting && "opacity-40 pointer-events-none"
      )}
    >
      {/* Left: Checkbox + Title */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
        {/* Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          onClick={handleToggle}
          disabled={isUpdating || isDeleting}
          className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer",
            "transition-[background-color,border-color,transform] duration-150 active:scale-90",
            task.completed
              ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
              : "bg-white border-[var(--color-border-strong)] hover:border-[var(--color-accent)]",
            isUpdating && "opacity-50"
          )}
        >
          {isUpdating ? (
            <Icon icon={Loading03Icon} size="xs" className="animate-spin text-white" />
          ) : task.completed ? (
            <Icon icon={Tick02Icon} size="xs" className="text-white" strokeWidth={2.5} />
          ) : null}
        </button>

        {/* Task Title */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isUpdating || isDeleting}
          className={cn(
            "text-left text-[13.5px] sm:text-[14px] leading-snug select-none cursor-pointer",
            "transition-colors duration-150 flex-1 min-w-0",
            "disabled:cursor-default focus:outline-none",
            task.completed
              ? "text-[var(--color-text-faint)] line-through decoration-[var(--color-border-strong)]"
              : "text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]"
          )}
        >
          {task.title}
        </button>
      </div>

      {/* Right: Meta + Delete */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          suppressHydrationWarning
          className="text-[12px] text-[var(--color-text-faint)] font-medium hidden sm:block"
        >
          {formattedTime}
        </span>

        <IconButton
          aria-label="Delete task"
          onClick={handleDelete}
          disabled={isDeleting}
          variant="danger"
          size="sm"
          rounded="md"
          className={cn(
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            "sm:opacity-0 sm:group-hover:opacity-100",
            // Always visible on mobile (touch devices don't hover)
            "max-sm:opacity-60"
          )}
        >
          {isDeleting ? (
            <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
          ) : (
            <Icon icon={Delete02Icon} size="sm" />
          )}
        </IconButton>
      </div>
    </div>
  );
});
