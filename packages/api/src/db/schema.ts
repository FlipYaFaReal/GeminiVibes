import {
  pgTable, text, timestamp, uuid, pgEnum, jsonb, boolean,
} from "drizzle-orm/pg-core";

export const lifeDomainEnum = pgEnum("life_domain", [
  "family", "work", "home", "relationships", "faith", "health", "growth",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  pushToken: text("push_token"),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lifeItems = pgTable("life_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  domain: lifeDomainEnum("domain"),
  type: text("type").notNull().default("note"), // note, task, event, reminder
  status: text("status").notNull().default("active"), // active, completed, archived
  priority: text("priority").default("medium"), // low, medium, high
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  metadata: jsonb("metadata").default({}),
  calendarEventId: text("calendar_event_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nudges = pgTable("nudges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  domain: lifeDomainEnum("domain"),
  type: text("type").notNull(), // time_sensitive, drift_alert, opportunity
  priority: text("priority").notNull().default("normal"), // gentle, normal, urgent
  delivered: boolean("delivered").notNull().default(false),
  actedOn: boolean("acted_on").notNull().default(false),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationSummaries = pgTable("conversation_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  summary: text("summary").notNull(),
  factsLearned: jsonb("facts_learned").default([]),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
