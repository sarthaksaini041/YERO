import { z } from "zod";

export const pushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .url("Invalid push service endpoint.")
    .startsWith("https://", "Push endpoint must use HTTPS."),
  keys: z.object({
    p256dh: z
      .string()
      .min(10, "Invalid p256dh key.")
      .max(256, "p256dh key is too long."),
    auth: z
      .string()
      .min(5, "Invalid auth key.")
      .max(128, "auth key is too long."),
  }),
});

export const unsubscribeSchema = z.object({
  endpoint: z.string().url("Invalid push service endpoint."),
});

export const userPreferencesSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  activeHoursStartIst: z.number().int().min(0).max(23).optional(),
  activeHoursEndIst: z.number().int().min(0).max(23).optional(),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
