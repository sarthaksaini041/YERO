import { z } from "zod";
import type { Platform } from "@/lib/connectors/types";

export const SUPPORTED_PLATFORMS = ["leetcode", "codechef", "codeforces", "github"] as const;

export const platformSchema = z.enum(SUPPORTED_PLATFORMS);

export interface UsernameExtractionResult {
  success: boolean;
  username: string;
  error?: string;
}

/**
 * Extracts and normalizes a platform username or handle from user input.
 * Handles:
 * - Leading and trailing whitespace
 * - Accidental `@username` format
 * - Full profile URLs (e.g. `https://leetcode.com/u/example/`, `https://codeforces.com/profile/tourist`, `https://github.com/username`)
 * - Domain-relative links
 * - Validates length and allowed characters
 */
export function extractPlatformUsername(
  platform: Platform,
  rawInput: string
): UsernameExtractionResult {
  if (typeof rawInput !== "string") {
    return { success: false, username: "", error: "Username must be a string." };
  }

  let val = rawInput.trim();
  if (!val) {
    return { success: false, username: "", error: "Username or profile URL cannot be empty." };
  }

  // Strip leading @ if present
  if (val.startsWith("@")) {
    val = val.slice(1).trim();
  }

  // Handle URL inputs
  const hasUrlScheme = val.startsWith("http://") || val.startsWith("https://");
  const hasDomain =
    val.includes(".com") || val.includes(".cn") || val.includes(".org");

  if (hasUrlScheme || hasDomain) {
    try {
      const urlStr = hasUrlScheme ? val : `https://${val}`;
      const url = new URL(urlStr);
      const segments = url.pathname.split("/").filter(Boolean);

      if (platform === "leetcode") {
        // Formats: /u/username or /username
        if (segments[0] === "u" && segments[1]) {
          val = segments[1];
        } else if (segments[0]) {
          val = segments[0];
        }
      } else if (platform === "codeforces") {
        // Formats: /profile/handle or /handle
        if (segments[0] === "profile" && segments[1]) {
          val = segments[1];
        } else if (segments[0]) {
          val = segments[0];
        }
      } else if (platform === "codechef") {
        // Formats: /users/username or /username
        if (segments[0] === "users" && segments[1]) {
          val = segments[1];
        } else if (segments[0]) {
          val = segments[0];
        }
      } else if (platform === "github") {
        // Formats: /username
        if (segments[0]) {
          val = segments[0];
        }
      }
    } catch {
      return { success: false, username: "", error: "Invalid profile URL format." };
    }
  } else if (val.includes("/")) {
    return {
      success: false,
      username: "",
      error: "Username cannot contain slashes.",
    };
  }

  val = val.trim();

  if (!val) {
    return { success: false, username: "", error: "Username cannot be empty." };
  }

  if (val.length > 50) {
    return { success: false, username: "", error: "Username cannot exceed 50 characters." };
  }

  if (!/^[a-zA-Z0-9_\-\.]+$/.test(val)) {
    return {
      success: false,
      username: "",
      error: "Username can only contain letters, numbers, underscores, hyphens, and dots.",
    };
  }

  return { success: true, username: val };
}

export const connectConnectorSchema = z.object({
  platform: platformSchema,
  username: z.string().superRefine((val, ctx) => {
    if (!val || !val.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Username is required.",
      });
    }
  }),
}).transform((data, ctx) => {
  const result = extractPlatformUsername(data.platform, data.username);
  if (!result.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.error ?? "Invalid username or profile link.",
      path: ["username"],
    });
    return z.NEVER;
  }
  return {
    platform: data.platform,
    username: result.username,
  };
});

export type ConnectConnectorInput = z.infer<typeof connectConnectorSchema>;
