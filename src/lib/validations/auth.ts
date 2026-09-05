import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Please enter your email or username.")
    .transform((val) => {
      const trimmed = val.trim();
      // If user typed username 'sarthak' without @, format as sarthak@yero.app
      if (!trimmed.includes("@")) {
        return `${trimmed.toLowerCase()}@yero.app`;
      }
      return trimmed.toLowerCase();
    })
    .pipe(z.string().email("Please enter a valid email address.")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
