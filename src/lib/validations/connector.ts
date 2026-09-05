import { z } from "zod";

export const SUPPORTED_PLATFORMS = ["leetcode", "codechef", "codeforces"] as const;

export const platformSchema = z.enum(SUPPORTED_PLATFORMS);

export const connectConnectorSchema = z.object({
  platform: platformSchema,
  username: z
    .string()
    .min(1, "Username is required.")
    .max(50, "Username cannot exceed 50 characters.")
    .regex(
      /^[a-zA-Z0-9_\-\.]+$/,
      "Username can only contain letters, numbers, underscores, hyphens, and dots."
    )
    .transform((val) => val.trim()),
});

export type ConnectConnectorInput = z.infer<typeof connectConnectorSchema>;
