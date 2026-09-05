import { z } from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Note title cannot be empty.")
    .max(255, "Note title is too long (max 255 characters).")
    .transform((str) => str.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "").trim()),
  content: z
    .string()
    .max(10000, "Note content is too long (max 10,000 characters).")
    .default(""),
  color: z.string().max(50).default("default"),
  pinned: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  id: z.string().uuid("Invalid note ID."),
  title: z
    .string()
    .trim()
    .min(1, "Note title cannot be empty.")
    .max(255, "Note title is too long (max 255 characters).")
    .transform((str) => str.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "").trim()),
  content: z
    .string()
    .max(10000, "Note content is too long (max 10,000 characters).")
    .default(""),
  color: z.string().max(50).default("default"),
  pinned: z.boolean().optional(),
});

export const togglePinNoteSchema = z.object({
  id: z.string().uuid("Invalid note ID."),
  pinned: z.boolean(),
});

export const deleteNoteSchema = z.object({
  id: z.string().uuid("Invalid note ID."),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
