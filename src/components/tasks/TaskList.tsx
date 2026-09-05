"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskItem } from "./TaskItem";
import { createTask, toggleTask, deleteTask } from "@/actions/tasks";
import type { Task } from "@/db/schema";
import { Plus, ListTodo, Sparkles, Calendar, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskListProps {
  initialTasks: Task[];
  todayDate?: string;
}

type FilterType = "all" | "active" | "completed";

// Premium 220-250ms transition with out-expo easing
const transitionConfig = {
  enter: {
    height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
    opacity: { duration: 0.2, ease: "easeOut" as const },
    y: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
    opacity: { duration: 0.15, ease: "easeIn" as const },
    y: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// Refined cubic-bezier(0.22, 1, 0.36, 1) category tab content transition (200ms)
const tabContentVariants = {
  initial: { opacity: 0, y: 4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.12,
      ease: "easeIn" as const,
    },
  },
};


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


  // Autofocus input when expanded
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to collapse
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setTitle("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? res.task! : t))
      );
      setTitle("");
      setIsOpen(false);
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      alert(res.error || "Failed to add task.");
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );

    const res = await toggleTask(id, completed);
    if (!res.success) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    const res = await deleteTask(id);
    if (!res.success) {
      setTasks(originalTasks);
    }
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Row: Title with Plus icon on right side & Date badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Daily Tasks
          </h1>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-controls="task-expandable-box"
            aria-label={isOpen ? "Close task creation box" : "Add daily task"}
            className="w-6 h-6 rounded-md bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title={isOpen ? "Close" : "Add daily task"}
          >
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center pointer-events-none"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.div>
          </button>
        </div>

        {todayDate && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-slate-200/70 text-xs font-medium text-slate-600 backdrop-blur-xs shadow-2xs">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{todayDate}</span>
          </div>
        )}
      </div>

      {/* Smooth Framer Motion Expand / Collapse Box */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="task-expandable-box"
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{
              height: "auto",
              opacity: 1,
              y: 0,
              transition: transitionConfig.enter,
            }}
            exit={{
              height: 0,
              opacity: 0,
              y: -6,
              transition: transitionConfig.exit,
            }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-1">
              <form
                onSubmit={handleSubmit}
                className="p-4 rounded-2xl bg-white/85 backdrop-blur-2xl shadow-lg shadow-slate-900/5 border-0 space-y-3"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="task-name-input"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Task Name
                  </label>
                  <input
                    id="task-name-input"
                    ref={inputRef}
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you want to accomplish today?"
                    disabled={isSubmitting}
                    className="flex h-11 w-full rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-100/70 border-none outline-none focus:outline-none focus:ring-0 shadow-none transition-all"
                    style={{ outline: "none", boxShadow: "none" }}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      setTitle("");
                    }}
                    disabled={isSubmitting}
                    className="h-8 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!title.trim() || isSubmitting}
                    className="h-8 px-3.5 text-xs rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
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

      {/* Compact Progress & Filter Controls Bar */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs">
          {/* Filters with Smooth Sliding Active Capsule */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/70 border border-slate-200/50 relative">
            {(
              [
                { key: "all", label: "All", count: totalCount },
                { key: "active", label: "Active", count: activeCount },
                { key: "completed", label: "Done", count: completedCount },
              ] as const
            ).map((tab) => {
              const isSelected = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setFilter(tab.key);
                  }}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer select-none transition-colors duration-150 border-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none [-webkit-tap-highlight-color:transparent]",
                    isSelected
                      ? "text-slate-900 font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeTaskTab"
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs border-0"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 32,
                      }}
                    />
                  )}

                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={cn(
                      "relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-medium transition-colors duration-150",
                      isSelected
                        ? "bg-slate-100 text-slate-700"
                        : "bg-slate-200/60 text-slate-400"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Compact Progress summary */}
          <div className="text-slate-500 text-xs font-medium">
            {completedCount}/{totalCount} done ({progressPercent}%)
          </div>
        </div>

        {/* Slim progress bar */}
        <div className="w-full h-1 bg-slate-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tasks List Content Area with Smooth, PopLayout GPU Transition */}
      <div className="pt-1 min-h-[160px] relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={filter}
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full space-y-2"
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
              <div className="text-center py-10 px-4 rounded-2xl liquid-glass-card-subtle border border-slate-200/60">
                {filter === "completed" ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-slate-100/90 border border-slate-200/70 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Check className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      No completed tasks yet
                    </p>
                  </>
                ) : filter === "active" ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-slate-100/90 border border-slate-200/70 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Sparkles className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      All active tasks completed!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-slate-100/90 border border-slate-200/70 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <ListTodo className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      No tasks for today yet
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click the + icon next to Daily Tasks to add one.
                    </p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
