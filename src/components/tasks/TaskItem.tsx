"use client";

import * as React from "react";
import { Check, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/db/schema";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
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

  // Format created time cleanly
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(task.createdAt));

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl liquid-glass-card-subtle transition-all duration-150 hover:bg-white/80 hover:shadow-2xs",
        task.completed && "bg-white/40 border-slate-200/50",
        isDeleting && "opacity-40 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
        {/* Custom liquid glass checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          onClick={handleToggle}
          disabled={isUpdating || isDeleting}
          className={cn(
            "w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer",
            task.completed
              ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
              : "bg-white/90 border-slate-300/80 hover:border-slate-500 hover:bg-white",
            isUpdating && "opacity-50"
          )}
        >
          {isUpdating ? (
            <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
          ) : task.completed ? (
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : null}
        </button>

        {/* Task Title */}
        <span
          onClick={handleToggle}
          className={cn(
            "text-sm select-none cursor-pointer transition-all duration-200 break-words flex-1",
            task.completed
              ? "text-slate-400 line-through decoration-slate-300"
              : "text-slate-700 font-normal hover:text-slate-900"
          )}
        >
          {task.title}
        </span>
      </div>

      {/* Meta & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
          {formattedTime}
        </span>

        {/* Delete button */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete task"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50/80 opacity-60 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 cursor-pointer"
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
