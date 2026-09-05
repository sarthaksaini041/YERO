import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title cannot be empty.")
    .max(255, "Task title is too long (max 255 characters).")
    .transform((str) => str.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "").trim()),
});


export const updateTaskStatusSchema = z.object({
  id: z.string().uuid("Invalid task ID."),
  completed: z.boolean(),
});

export const deleteTaskSchema = z.object({
  id: z.string().uuid("Invalid task ID."),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
