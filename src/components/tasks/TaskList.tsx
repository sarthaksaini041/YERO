"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskItem } from "./TaskItem";
import { createTask, toggleTask, deleteTask } from "@/actions/tasks";
import type { Task } from "@/db/schema";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Add01Icon,
  Calendar03Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  ListViewIcon,
  MagicWand01Icon,
} from "@hugeicons/core-free-icons";

interface TaskListProps {
  initialTasks: Task[];
  todayDate?: string;
}

type FilterType = "all" | "active" | "completed";

/* ── Animation configs ──────────────────────────────────────────── */
const expandVariants = {
  hidden:  { height: 0, opacity: 0, y: -8 },
  visible: {
    height: "auto",
    opacity: 1,
    y: 0,
    transition: {
      height:   { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
      opacity:  { duration: 0.2, ease: "easeOut" as const },
      y:        { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    y: -8,
    transition: {
      height:   { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
      opacity:  { duration: 0.15, ease: "easeIn" as const },
    },
  },
};

const tabContentVariants = {
  initial:  { opacity: 0, y: 6 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } },
  exit:     { opacity: 0, y: -4, transition: { duration: 0.12, ease: "easeIn" as const } },
};

/* ── TaskList ───────────────────────────────────────────────────── */
export function TaskList({ initialTasks, todayDate }: TaskListProps) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [prevInitialTasks, setPrevInitialTasks] = React.useState<Task[]>(initialTasks);

  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  const [filter, setFilter] = React.useState<FilterType>("all");
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setTitle("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    const tempId = crypto.randomUUID();
    const optimisticTask: Task = {
      id: tempId,
      userId: "optimistic",
      title: trimmed,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTasks((prev) => [optimisticTask, ...prev]);

    const res = await createTask(trimmed);
    setIsSubmitting(false);

    if (res.success && res.task) {
      setTasks((prev) => prev.map((t) => (t.id === tempId ? res.task! : t)));
      setTitle("");
      setIsOpen(false);
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      alert(res.error || "Failed to add task.");
    }
  };

  const handleToggleTask = React.useCallback(async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
    const res = await toggleTask(id, completed);
    if (!res.success) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
    }
  }, []);

  const handleDeleteTask = React.useCallback(async (id: string) => {
    let originalTasks: Task[] = [];
    setTasks((prev) => {
      originalTasks = prev;
      return prev.filter((t) => t.id !== id);
    });
    const res = await deleteTask(id);
    if (!res.success) setTasks(originalTasks);
  }, []);

  const totalCount = tasks.length;
  const completedCount = React.useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    });
  }, [tasks, filter]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-3.5 sm:space-y-4">

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-heading-lg">Daily Tasks</h1>
          {todayDate && (
            <span className="text-[12px] text-[var(--color-text-muted)] font-medium bg-black/5 px-2 py-0.5 rounded-md hidden sm:inline-flex items-center gap-1">
              <Icon icon={Calendar03Icon} size="xs" className="text-[var(--color-text-faint)]" />
              {todayDate}
            </span>
          )}
        </div>

        {/* Add Task toggle button */}
        <button
          type="button"
          onClick={() => setIsOpen((p) => !p)}
          aria-expanded={isOpen}
          aria-controls="task-add-form"
          aria-label={isOpen ? "Close add task form" : "Add a new task"}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl text-[12.5px] font-semibold cursor-pointer",
            "w-8.5 h-8.5 sm:w-auto sm:px-3 sm:py-1.5",
            "border transition-all duration-150 active:scale-95 shrink-0",
            isOpen
              ? "bg-gray-100 text-[var(--color-text-secondary)] border-[var(--color-border)]"
              : "bg-[var(--color-accent)] text-white border-transparent shadow-[var(--shadow-xs)] hover:bg-[var(--color-accent-hover)]"
          )}
        >
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex"
          >
            <Icon icon={Add01Icon} size="sm" />
          </motion.span>
          <span className="hidden sm:inline">{isOpen ? "Cancel" : "Add Task"}</span>
        </button>
      </div>

      {/* ── Add Task Form (Expandable) ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="task-add-form"
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="pb-1">
              <form
                onSubmit={handleSubmit}
                className="p-3.5 sm:p-4 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-sm)] space-y-3"
              >
                <div>
                  <label
                    htmlFor="task-name-input"
                    className="sr-only"
                  >
                    Task name
                  </label>
                  <Input
                    id="task-name-input"
                    ref={inputRef}
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you want to accomplish today?"
                    disabled={isSubmitting}
                    className="h-9.5 text-[14px]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsOpen(false); setTitle(""); }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!title.trim() || isSubmitting}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Task"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats + Filter Bar ── */}
      <div className="space-y-2">
        {/* Desktop: side-by-side. Mobile: stacked */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          {/* Filter Tabs */}
          <Tabs
            tabs={[
              { key: "all",       label: "All",    count: totalCount },
              { key: "active",    label: "Active", count: activeCount },
              { key: "completed", label: "Done",   count: completedCount },
            ] as const}
            activeKey={filter}
            onChange={(k) => setFilter(k as FilterType)}
            layoutId="taskFilter"
            fullWidth
            className="w-full sm:w-auto"
          />

          {/* Progress summary */}
          {totalCount > 0 && (
            <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-text-muted)]">
              <span>{completedCount} of {totalCount} completed</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="w-full h-1 bg-gray-100 rounded-md overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-md",
                progressPercent === 100
                  ? "bg-[var(--color-success)]"
                  : "bg-[var(--color-accent)]"
              )}
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        )}
      </div>

      {/* ── Task List ── */}
      <div className="min-h-[100px] relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={filter}
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full space-y-1.5 sm:space-y-2"
          >
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))
            ) : (
              <EmptyState
                icon={
                  filter === "completed" ? (
                    <Icon icon={CheckmarkCircle01Icon} size="lg" />
                  ) : filter === "active" ? (
                    <Icon icon={MagicWand01Icon} size="lg" />
                  ) : (
                    <Icon icon={ListViewIcon} size="lg" />
                  )
                }
                title={
                  filter === "completed"
                    ? "No completed tasks"
                    : filter === "active"
                    ? "All tasks completed"
                    : "No tasks for today"
                }
                description={
                  filter === "completed"
                    ? "Tasks you complete will appear here."
                    : filter === "active"
                    ? "You've finished everything on your list."
                    : "Add a task above to plan your day."
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
