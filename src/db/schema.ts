import { pgTable, uuid, text, boolean, timestamp, integer, date, jsonb, unique } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PushSubscriptionRow = InferSelectModel<typeof pushSubscriptions>;
export type NewPushSubscription = InferInsertModel<typeof pushSubscriptions>;

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id").primaryKey(),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  activeHoursStartIst: integer("active_hours_start_ist").notNull().default(9),
  activeHoursEndIst: integer("active_hours_end_ist").notNull().default(21),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserPreference = InferSelectModel<typeof userPreferences>;
export type NewUserPreference = InferInsertModel<typeof userPreferences>;

export const notificationLogs = pgTable("notification_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  eventType: text("event_type").notNull(),
  targetDateIst: date("target_date_ist").notNull(),
  hourSlotIst: integer("hour_slot_ist").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("SENT"),
  read: boolean("read").notNull().default(false),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NotificationLog = InferSelectModel<typeof notificationLogs>;
export type NewNotificationLog = InferInsertModel<typeof notificationLogs>;

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  color: text("color").default("default"),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Note = InferSelectModel<typeof notes>;
export type NewNote = InferInsertModel<typeof notes>;

// ─── User Connectors ────────────────────────────────────────────────────────

export const userConnectors = pgTable(
  "user_connectors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    platform: text("platform").notNull().$type<"leetcode" | "codechef" | "codeforces" | "github">(),
    platformUsername: text("platform_username").notNull(),
    status: text("status").notNull().default("connected").$type<"connected" | "error" | "syncing">(),
    profileData: jsonb("profile_data"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    lastSyncAttemptedAt: timestamp("last_sync_attempted_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("user_connectors_user_platform_unique").on(table.userId, table.platform)]
);

export type ConnectorRow = InferSelectModel<typeof userConnectors>;
export type NewConnectorRow = InferInsertModel<typeof userConnectors>;
