"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex items-center gap-3",
        "px-4 py-3 sm:py-3.5",
        "rounded-[var(--radius-md)] bg-white border border-[var(--color-border)]",
        "shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]",
        "hover:border-[var(--color-border-strong)]",
        "transition-[box-shadow,border-color,opacity] duration-150",
        task.completed && "opacity-60",
        isDeleting && "pointer-events-none"
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        onClick={handleToggle}
        disabled={isUpdating || isDeleting}
        className={cn(
          "w-[20px] h-[20px] rounded-md border-[1.75px] flex items-center justify-center shrink-0 cursor-pointer",
          "transition-all duration-150 active:scale-90",
          task.completed
            ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
            : "bg-white border-[var(--color-border-strong)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)]",
          isUpdating && "opacity-60"
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
          "text-left text-[13.5px] leading-snug select-none cursor-pointer flex-1 min-w-0",
          "transition-colors duration-150",
          "disabled:cursor-default focus:outline-none",
          task.completed
            ? "text-[var(--color-text-faint)] line-through decoration-[var(--color-border-strong)]"
            : "text-[var(--color-text-primary)] font-medium"
        )}
      >
        {task.title}
      </button>

      {/* Right: time + delete */}
      <div className="flex items-center gap-2 shrink-0 ml-auto pl-2">
        <span
          suppressHydrationWarning
          className="text-[11.5px] text-[var(--color-text-faint)] font-medium hidden sm:block whitespace-nowrap"
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
            "transition-opacity duration-150",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          )}
        >
          {isDeleting ? (
            <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
          ) : (
            <Icon icon={Delete02Icon} size="sm" />
          )}
        </IconButton>
      </div>
    </motion.div>
  );
});
