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
  CheckmarkCircle01Icon,
  Loading03Icon,
  ListViewIcon,
  MagicWand01Icon,
} from "@hugeicons/core-free-icons";

interface TaskListProps {
  initialTasks: Task[];
  todayDate?: string;
  totalCompletedAllTime?: number;
}

type FilterType = "all" | "active" | "completed";

const expandVariants = {
  hidden:  { height: 0, opacity: 0, y: -6 },
  visible: {
    height: "auto", opacity: 1, y: 0,
    transition: {
      height:  { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
      opacity: { duration: 0.18, ease: "easeOut" as const },
      y:       { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
  exit: {
    height: 0, opacity: 0,
    transition: {
      height:  { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
      opacity: { duration: 0.12, ease: "easeIn" as const },
    },
  },
};

const tabContentVariants = {
  initial:  { opacity: 0, y: 4 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const } },
  exit:     { opacity: 0, y: -2, transition: { duration: 0.1, ease: "easeIn" as const } },
};

export function TaskList({ initialTasks, todayDate, totalCompletedAllTime }: TaskListProps) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [prevInitialTasks, setPrevInitialTasks] = React.useState<Task[]>(initialTasks);
  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  const [allTimeCompleted, setAllTimeCompleted] = React.useState(
    totalCompletedAllTime ?? initialTasks.filter((t) => t.completed).length
  );
  const [prevInitialAllTime, setPrevInitialAllTime] = React.useState(totalCompletedAllTime);
  if (totalCompletedAllTime !== prevInitialAllTime) {
    setPrevInitialAllTime(totalCompletedAllTime);
    if (totalCompletedAllTime !== undefined) setAllTimeCompleted(totalCompletedAllTime);
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
    setAllTimeCompleted((prev) => (completed ? prev + 1 : Math.max(0, prev - 1)));
    const res = await toggleTask(id, completed);
    if (!res.success) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
      setAllTimeCompleted((prev) => (!completed ? prev + 1 : Math.max(0, prev - 1)));
    }
  }, []);

  const handleDeleteTask = React.useCallback(async (id: string) => {
    let originalTasks: Task[] = [];
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => {
      originalTasks = prev;
      return prev.filter((t) => t.id !== id);
    });
    if (taskToDelete?.completed) {
      setAllTimeCompleted((prev) => Math.max(0, prev - 1));
    }
    const res = await deleteTask(id);
    if (!res.success) {
      setTasks(originalTasks);
      if (taskToDelete?.completed) {
        setAllTimeCompleted((prev) => prev + 1);
      }
    }
  }, [tasks]);

  const totalCount = tasks.length;
  const completedCount = React.useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = React.useMemo(() => tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  }), [tasks, filter]);

  return (
    <div className="w-full">
      {/* ── Mobile / Tablet Summary Banner (< lg) ── */}
      <div className="lg:hidden mb-6 p-4 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
            <Icon icon={CheckmarkCircle01Icon} size="md" />
          </div>
          <div>
            <div
              className="text-xl font-bold leading-tight text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
            >
              {allTimeCompleted.toLocaleString()}
            </div>
            <div className="text-[12px] text-[var(--color-text-muted)] font-medium">
              total tasks completed
            </div>
          </div>
        </div>
        {totalCount > 0 && (
          <div className="text-right">
            <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              {completedCount} / {totalCount} done
            </div>
            <div className="text-[11.5px] text-[var(--color-text-muted)]">
              today ({progressPercent}%)
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop Grid Layout (>= lg) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start w-full">
        {/* ── Left Column: Tasks Stream (lg:col-span-8) ── */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          {/* ── Page Header ── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-heading-xl">Daily Tasks</h1>
              <p className="mt-1 text-[13.5px] text-[var(--color-text-muted)]">
                {todayDate ? `${todayDate}` : ""}
                {totalCount > 0 && ` · ${completedCount} of ${totalCount} completed (${progressPercent}%)`}
              </p>
            </div>

            {/* Add Task Button */}
            <button
              type="button"
              onClick={() => setIsOpen((p) => !p)}
              aria-expanded={isOpen}
              aria-controls="task-add-form"
              aria-label={isOpen ? "Close add task form" : "Add a new task"}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] text-[13px] font-semibold cursor-pointer shrink-0",
                "h-[38px] px-4 border transition-all duration-150 active:scale-[0.97]",
                isOpen
                  ? "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                  : "bg-[var(--color-accent)] text-white border-transparent shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-hover)]"
              )}
            >
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex"
              >
                <Icon icon={Add01Icon} size="sm" />
              </motion.span>
              <span>{isOpen ? "Cancel" : "Add Task"}</span>
            </button>
          </div>

          {/* ── Add Task Form ── */}
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
                    className="p-4 sm:p-5 rounded-[var(--radius-lg)] bg-white border border-[var(--color-border)] shadow-[var(--shadow-sm)] space-y-3"
                  >
                    <Input
                      id="task-name-input"
                      ref={inputRef}
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What do you want to accomplish today?"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsOpen(false);
                          setTitle("");
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!title.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                            Adding…
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

          {/* ── Filter Tabs ── */}
          <div>
            <Tabs
              tabs={[
                { key: "all",       label: "All",    count: totalCount },
                { key: "active",    label: "Active", count: activeCount },
                { key: "completed", label: "Done",   count: completedCount },
              ] as const}
              activeKey={filter}
              onChange={(k) => setFilter(k as FilterType)}
              layoutId="taskFilter"
            />
          </div>

          {/* ── Task List ── */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={filter}
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-2"
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
                      ? "All tasks done!"
                      : "No tasks yet"
                  }
                  description={
                    filter === "completed"
                      ? "Tasks you complete will appear here."
                      : filter === "active"
                      ? "You've finished everything for today."
                      : "Add your first task to get started."
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right Column: Counter & Stats Widget (lg:col-span-4) ── */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-4 space-y-4 sticky top-6">
          <div className="rounded-[var(--radius-xl)] bg-white border border-[var(--color-border)] p-6 shadow-[var(--shadow-xs)] space-y-5">
            {/* Header with Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--color-text-muted)] tracking-wider uppercase">
                Productivity
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center">
                <Icon icon={CheckmarkCircle01Icon} size="sm" />
              </div>
            </div>

            {/* Counter Display */}
            <div>
              <div
                className="text-4xl xl:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] leading-none"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
              >
                {allTimeCompleted.toLocaleString()}
              </div>
              <div className="text-[13px] font-medium text-[var(--color-text-muted)] mt-1.5">
                total tasks completed
              </div>
            </div>

            {/* Divider & Today's Progress */}
            <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="font-semibold text-[var(--color-text-secondary)]">
                  Today&apos;s Progress
                </span>
                <span className="font-bold text-[var(--color-accent)]">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[var(--color-surface-muted)] rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    progressPercent === 100
                      ? "bg-[var(--color-success)]"
                      : "bg-[var(--color-accent)]"
                  )}
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-center">
                  <div className="text-base font-bold text-[var(--color-text-primary)] leading-tight">
                    {completedCount}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                    Done Today
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-center">
                  <div className="text-base font-bold text-[var(--color-text-primary)] leading-tight">
                    {activeCount}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                    Remaining
                  </div>
                </div>
              </div>

              {/* Contextual Message */}
              <div className="pt-1 text-[12px] text-[var(--color-text-muted)] text-center">
                {totalCount === 0
                  ? "No tasks scheduled for today yet."
                  : activeCount === 0
                  ? "🎉 All tasks for today completed!"
                  : `${activeCount} task${activeCount === 1 ? "" : "s"} left to complete today.`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
