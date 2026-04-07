# LifePulse Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an AI-native personal life command center with conversational capture, proactive nudges, and auto-generated dashboard views across life domains.

**Architecture:** Turborepo monorepo with an Expo (React Native) frontend using Expo Router for file-based navigation, and a Fastify + tRPC backend. Claude API powers AI parsing/nudges. PostgreSQL + Drizzle ORM for data. Google OAuth for auth. expo-notifications for push.

**Tech Stack:** Expo SDK 52+, Expo Router, TypeScript, Fastify, tRPC v11, Drizzle ORM, PostgreSQL, @anthropic-ai/sdk, expo-notifications, expo-auth-session, @tanstack/react-query

**Design doc:** `docs/plans/2026-04-06-lifepulse-design.md`

---

## Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json` (root workspace config)
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `apps/mobile/` (Expo app)
- Create: `packages/api/` (backend)

**Step 1: Initialize root monorepo**

```bash
cd /c/Users/paulm/Documents/Products/GeminiVibes
npm init -y
```

Edit `package.json`:
```json
{
  "name": "lifepulse",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

**Step 2: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": {}
  }
}
```

**Step 3: Create shared tsconfig.base.json**

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ES2022",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**Step 4: Create Expo app**

```bash
npx create-expo-app@latest apps/mobile --template tabs
```

Verify it runs:
```bash
cd apps/mobile && npx expo start --web
```
Expected: Expo dev server starts, default tabs app loads in browser.

**Step 5: Scaffold backend package**

```bash
mkdir -p packages/api/src
cd packages/api
npm init -y
```

Create `packages/api/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

Create `packages/api/src/index.ts`:
```typescript
console.log("API server placeholder");
```

**Step 6: Install Turborepo and verify**

```bash
cd /c/Users/paulm/Documents/Products/GeminiVibes
npm install turbo --save-dev
npx turbo build
```

Expected: Both apps/mobile and packages/api build without errors.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold monorepo with Expo frontend and API backend"
```

---

## Task 2: Backend API Foundation

**Files:**
- Modify: `packages/api/package.json` (add dependencies)
- Create: `packages/api/src/index.ts` (Fastify server)
- Create: `packages/api/src/trpc.ts` (tRPC init)
- Create: `packages/api/src/router.ts` (root router)
- Test: `packages/api/src/__tests__/health.test.ts`

**Step 1: Install backend dependencies**

```bash
cd packages/api
npm install fastify @trpc/server@^11 zod
npm install -D tsx @types/node vitest
```

**Step 2: Write the failing test for health endpoint**

Create `packages/api/src/__tests__/health.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { createApp } from "../app";

describe("Health endpoint", () => {
  it("returns ok status", async () => {
    const app = await createApp();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});
```

**Step 3: Run test to verify it fails**

Add to `packages/api/package.json` scripts: `"test": "vitest run"`

```bash
cd packages/api && npm test
```

Expected: FAIL — `createApp` not found.

**Step 4: Implement Fastify app with health endpoint**

Create `packages/api/src/app.ts`:
```typescript
import Fastify from "fastify";

export async function createApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
```

Update `packages/api/src/index.ts`:
```typescript
import { createApp } from "./app";

async function main() {
  const app = await createApp();
  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ host, port });
  console.log(`LifePulse API running on http://${host}:${port}`);
}

main().catch(console.error);
```

**Step 5: Run test to verify it passes**

```bash
cd packages/api && npm test
```

Expected: PASS

**Step 6: Set up tRPC**

Create `packages/api/src/trpc.ts`:
```typescript
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

Create `packages/api/src/router.ts`:
```typescript
import { router, publicProcedure } from "./trpc";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});

export type AppRouter = typeof appRouter;
```

**Step 7: Write test for tRPC health procedure**

Add to `packages/api/src/__tests__/health.test.ts`:
```typescript
import { appRouter } from "../router";

describe("tRPC router", () => {
  it("health procedure returns ok", async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.health();
    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
  });
});
```

**Step 8: Run tests**

```bash
cd packages/api && npm test
```

Expected: All PASS

**Step 9: Add dev script and verify server starts**

Add to `packages/api/package.json` scripts: `"dev": "tsx watch src/index.ts"`

```bash
cd packages/api && npm run dev
```

Expected: Server starts on port 3000, `GET /health` returns `{"status":"ok"}`

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: add Fastify API server with tRPC and health endpoint"
```

---

## Task 3: Database Schema with Drizzle ORM

**Files:**
- Create: `packages/api/src/db/schema.ts`
- Create: `packages/api/src/db/index.ts`
- Create: `packages/api/drizzle.config.ts`
- Test: `packages/api/src/__tests__/schema.test.ts`

**Step 1: Install Drizzle and PostgreSQL driver**

```bash
cd packages/api
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

**Step 2: Write the schema test (failing)**

Create `packages/api/src/__tests__/schema.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import * as schema from "../db/schema";

describe("Database schema", () => {
  it("exports users table", () => {
    expect(schema.users).toBeDefined();
    expect(schema.users._.name).toBe("users");
  });

  it("exports life_items table", () => {
    expect(schema.lifeItems).toBeDefined();
    expect(schema.lifeItems._.name).toBe("life_items");
  });

  it("exports messages table", () => {
    expect(schema.messages).toBeDefined();
    expect(schema.messages._.name).toBe("messages");
  });

  it("exports nudges table", () => {
    expect(schema.nudges).toBeDefined();
    expect(schema.nudges._.name).toBe("nudges");
  });

  it("exports domain enum with all 7 domains", () => {
    expect(schema.lifeDomainEnum.enumValues).toEqual([
      "family", "work", "home", "relationships", "faith", "health", "growth"
    ]);
  });
});
```

**Step 3: Run test to verify it fails**

```bash
cd packages/api && npm test
```

Expected: FAIL — schema module not found.

**Step 4: Implement the database schema**

Create `packages/api/src/db/schema.ts`:
```typescript
import {
  pgTable, text, timestamp, uuid, pgEnum, jsonb, boolean, integer
} from "drizzle-orm/pg-core";

export const lifeDomainEnum = pgEnum("life_domain", [
  "family", "work", "home", "relationships", "faith", "health", "growth"
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
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
```

**Step 5: Run test to verify it passes**

```bash
cd packages/api && npm test
```

Expected: All PASS

**Step 6: Create database connection module**

Create `packages/api/src/db/index.ts`:
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
export { schema };
```

**Step 7: Create Drizzle config**

Create `packages/api/drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 8: Add migration script**

Add to `packages/api/package.json` scripts:
```
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: add database schema with Drizzle ORM — users, life items, messages, nudges"
```

---

## Task 4: Claude AI Conversation Service

**Files:**
- Create: `packages/api/src/services/ai.ts`
- Create: `packages/api/src/services/ai-tools.ts`
- Create: `packages/api/src/services/system-prompt.ts`
- Test: `packages/api/src/__tests__/ai-tools.test.ts`

**Step 1: Install Claude SDK**

```bash
cd packages/api
npm install @anthropic-ai/sdk
```

**Step 2: Write failing test for AI tool schemas**

Create `packages/api/src/__tests__/ai-tools.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { aiTools } from "../services/ai-tools";

describe("AI tool definitions", () => {
  it("defines create_event tool", () => {
    const tool = aiTools.find(t => t.name === "create_event");
    expect(tool).toBeDefined();
    expect(tool!.input_schema.properties).toHaveProperty("title");
    expect(tool!.input_schema.properties).toHaveProperty("start");
    expect(tool!.input_schema.properties).toHaveProperty("domain");
  });

  it("defines create_task tool", () => {
    const tool = aiTools.find(t => t.name === "create_task");
    expect(tool).toBeDefined();
    expect(tool!.input_schema.properties).toHaveProperty("title");
    expect(tool!.input_schema.properties).toHaveProperty("priority");
    expect(tool!.input_schema.properties).toHaveProperty("domain");
  });

  it("defines create_nudge tool", () => {
    const tool = aiTools.find(t => t.name === "create_nudge");
    expect(tool).toBeDefined();
    expect(tool!.input_schema.properties).toHaveProperty("message");
    expect(tool!.input_schema.properties).toHaveProperty("type");
  });

  it("all tools have valid domain enum", () => {
    const domains = ["family", "work", "home", "relationships", "faith", "health", "growth"];
    for (const tool of aiTools) {
      const domainProp = tool.input_schema.properties.domain;
      if (domainProp) {
        expect(domainProp.enum).toEqual(domains);
      }
    }
  });
});
```

**Step 3: Run test to verify it fails**

```bash
cd packages/api && npm test
```

Expected: FAIL — ai-tools module not found.

**Step 4: Implement AI tool definitions**

Create `packages/api/src/services/ai-tools.ts`:
```typescript
import type Anthropic from "@anthropic-ai/sdk";

const DOMAINS = ["family", "work", "home", "relationships", "faith", "health", "growth"] as const;

export const aiTools: Anthropic.Tool[] = [
  {
    name: "create_event",
    description: "Create a calendar event from the user's natural language input. Use when the user mentions a time-bound activity, appointment, or scheduled occurrence.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Event title" },
        start: { type: "string", description: "ISO 8601 datetime for event start" },
        end: { type: "string", description: "ISO 8601 datetime for event end (optional)" },
        location: { type: "string", description: "Event location (optional)" },
        domain: { type: "string", enum: [...DOMAINS], description: "Life domain this event belongs to" },
        participants: {
          type: "array",
          items: { type: "string" },
          description: "Names of people involved (optional)"
        },
      },
      required: ["title", "start", "domain"],
    },
  },
  {
    name: "create_task",
    description: "Create a task or reminder from the user's input. Use when the user mentions something that needs to be done, remembered, or followed up on.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Task description" },
        due: { type: "string", description: "ISO 8601 datetime for when this is due (optional)" },
        priority: { type: "string", enum: ["low", "medium", "high"], description: "Task priority" },
        domain: { type: "string", enum: [...DOMAINS], description: "Life domain this task belongs to" },
        reminder_at: { type: "string", description: "ISO 8601 datetime for reminder (optional)" },
        notes: { type: "string", description: "Additional context or notes (optional)" },
      },
      required: ["title", "priority", "domain"],
    },
  },
  {
    name: "create_nudge",
    description: "Generate a proactive nudge for the user. Use when you notice something the user should be aware of — a conflict, a neglected area, or an opportunity.",
    input_schema: {
      type: "object" as const,
      properties: {
        message: { type: "string", description: "The nudge message to show the user" },
        type: {
          type: "string",
          enum: ["time_sensitive", "drift_alert", "opportunity"],
          description: "Type of nudge"
        },
        domain: { type: "string", enum: [...DOMAINS], description: "Related life domain" },
        priority: {
          type: "string",
          enum: ["gentle", "normal", "urgent"],
          description: "Nudge urgency level"
        },
      },
      required: ["message", "type", "domain", "priority"],
    },
  },
  {
    name: "capture_note",
    description: "Store a general note, thought, or piece of information that isn't a task or event. Use for reflections, ideas, observations, or information the user wants to remember.",
    input_schema: {
      type: "object" as const,
      properties: {
        content: { type: "string", description: "The note content" },
        domain: { type: "string", enum: [...DOMAINS], description: "Life domain this relates to" },
      },
      required: ["content", "domain"],
    },
  },
];
```

**Step 5: Run test to verify it passes**

```bash
cd packages/api && npm test
```

Expected: All PASS

**Step 6: Implement system prompt**

Create `packages/api/src/services/system-prompt.ts`:
```typescript
export function buildSystemPrompt(context: {
  userName: string;
  currentDateTime: string;
  upcomingEvents: string[];
  recentNudges: string[];
  domainHealth: Record<string, string>;
  conversationSummary?: string;
}): string {
  const domainHealthLines = Object.entries(context.domainHealth)
    .map(([domain, status]) => `  - ${domain}: ${status}`)
    .join("\n");

  const eventsBlock = context.upcomingEvents.length > 0
    ? context.upcomingEvents.map(e => `  - ${e}`).join("\n")
    : "  (no upcoming events)";

  const nudgesBlock = context.recentNudges.length > 0
    ? context.recentNudges.map(n => `  - ${n}`).join("\n")
    : "  (none recently)";

  return `You are LifePulse, ${context.userName}'s personal life copilot. You are warm, perceptive, and concise. You speak like a trusted friend who happens to have perfect memory and great judgment — not like a productivity robot.

TONE RULES:
- Use ${context.userName}'s name occasionally, not every message
- Be concise — confirm what you did, flag what matters, move on
- Acknowledge emotions before jumping to logistics
- When you notice something important (a conflict, a neglected area), speak up naturally
- Never use corporate jargon or bullet-point-heavy responses in conversation

EXTRACTION RULES:
- On EVERY user message, determine if it contains actionable items (events, tasks, reminders, notes)
- If it does, you MUST call the appropriate tool(s) BEFORE composing your conversational reply
- Assign the most fitting life domain: family, work, home, relationships, faith, health, growth
- If a message is purely conversational (venting, reflecting, asking a question), respond naturally without tool calls

DOMAIN DEFINITIONS:
- family: kids, parenting, school events, family activities, co-parenting
- work: job tasks, meetings, projects, career goals, professional development
- home: housing, maintenance, errands, home sale/purchase, household management
- relationships: partner, dating, friendships, social plans, quality time
- faith: church, prayer, devotionals, spiritual reading, religious community
- health: meals, exercise, medical appointments, sleep, mental health
- growth: personal goals, learning, vacations, life direction, self-improvement

CURRENT CONTEXT:
- Current date/time: ${context.currentDateTime}
- Upcoming events (48h):
${eventsBlock}
- Recently delivered nudges:
${nudgesBlock}
- Domain health:
${domainHealthLines}
${context.conversationSummary ? `\nCONVERSATION CONTEXT:\n${context.conversationSummary}` : ""}

NUDGE GUIDELINES:
- Generate drift_alert nudges when a domain has been neglected for 7+ days
- Generate opportunity nudges when you spot free time that aligns with a neglected domain
- Generate time_sensitive nudges for approaching deadlines or conflicts
- Don't re-nudge about something you've already nudged about recently (check recent nudges above)`;
}
```

**Step 7: Implement AI conversation service**

Create `packages/api/src/services/ai.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk";
import { aiTools } from "./ai-tools";
import { buildSystemPrompt } from "./system-prompt";

const anthropic = new Anthropic();

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIContext {
  userName: string;
  currentDateTime: string;
  upcomingEvents: string[];
  recentNudges: string[];
  domainHealth: Record<string, string>;
  conversationSummary?: string;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  id: string;
}

export interface AIResponse {
  text: string;
  toolCalls: ToolCall[];
}

export async function chat(
  messages: ConversationMessage[],
  context: AIContext,
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(context);

  const anthropicMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    tools: aiTools,
    messages: anthropicMessages,
  });

  const toolCalls: ToolCall[] = [];
  let text = "";

  for (const block of response.content) {
    if (block.type === "text") {
      text += block.text;
    } else if (block.type === "tool_use") {
      toolCalls.push({
        name: block.name,
        input: block.input as Record<string, unknown>,
        id: block.id,
      });
    }
  }

  return { text, toolCalls };
}
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Claude AI conversation service with tool definitions and system prompt"
```

---

## Task 5: Chat tRPC Endpoint

**Files:**
- Create: `packages/api/src/routes/chat.ts`
- Create: `packages/api/src/services/tool-executor.ts`
- Modify: `packages/api/src/router.ts`
- Test: `packages/api/src/__tests__/tool-executor.test.ts`

**Step 1: Write failing test for tool executor**

Create `packages/api/src/__tests__/tool-executor.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { executeToolCall } from "../services/tool-executor";

describe("Tool executor", () => {
  it("handles create_task tool call", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
        }),
      }),
    };

    const result = await executeToolCall(
      {
        name: "create_task",
        input: {
          title: "Call the realtor",
          priority: "high",
          domain: "home",
        },
        id: "tool-1",
      },
      "user-123",
      mockDb as any,
    );

    expect(result.success).toBe(true);
    expect(result.type).toBe("task");
  });

  it("handles create_event tool call", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
        }),
      }),
    };

    const result = await executeToolCall(
      {
        name: "create_event",
        input: {
          title: "Soccer practice",
          start: "2026-04-08T17:00:00Z",
          domain: "family",
        },
        id: "tool-2",
      },
      "user-123",
      mockDb as any,
    );

    expect(result.success).toBe(true);
    expect(result.type).toBe("event");
  });

  it("handles unknown tool name", async () => {
    const result = await executeToolCall(
      { name: "unknown_tool", input: {}, id: "tool-3" },
      "user-123",
      {} as any,
    );

    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/api && npm test
```

Expected: FAIL — tool-executor module not found.

**Step 3: Implement tool executor**

Create `packages/api/src/services/tool-executor.ts`:
```typescript
import type { ToolCall } from "./ai";
import { lifeItems, nudges } from "../db/schema";

interface ToolResult {
  success: boolean;
  type: string;
  id?: string;
  error?: string;
}

export async function executeToolCall(
  toolCall: ToolCall,
  userId: string,
  db: any,
): Promise<ToolResult> {
  const { name, input } = toolCall;

  switch (name) {
    case "create_event": {
      const [item] = await db.insert(lifeItems).values({
        userId,
        content: input.title as string,
        domain: input.domain as string,
        type: "event",
        dueAt: input.start ? new Date(input.start as string) : undefined,
        metadata: {
          end: input.end,
          location: input.location,
          participants: input.participants,
        },
      }).returning();
      return { success: true, type: "event", id: item.id };
    }

    case "create_task": {
      const [item] = await db.insert(lifeItems).values({
        userId,
        content: input.title as string,
        domain: input.domain as string,
        type: "task",
        priority: input.priority as string,
        dueAt: input.due ? new Date(input.due as string) : undefined,
        metadata: { notes: input.notes, reminder_at: input.reminder_at },
      }).returning();
      return { success: true, type: "task", id: item.id };
    }

    case "create_nudge": {
      const [nudge] = await db.insert(nudges).values({
        userId,
        message: input.message as string,
        domain: input.domain as string,
        type: input.type as string,
        priority: input.priority as string,
      }).returning();
      return { success: true, type: "nudge", id: nudge.id };
    }

    case "capture_note": {
      const [item] = await db.insert(lifeItems).values({
        userId,
        content: input.content as string,
        domain: input.domain as string,
        type: "note",
      }).returning();
      return { success: true, type: "note", id: item.id };
    }

    default:
      return { success: false, type: "unknown", error: `Unknown tool: ${name}` };
  }
}
```

**Step 4: Run tests**

```bash
cd packages/api && npm test
```

Expected: All PASS

**Step 5: Create chat route**

Create `packages/api/src/routes/chat.ts`:
```typescript
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { chat } from "../services/ai";
import { executeToolCall } from "../services/tool-executor";
import { db } from "../db";
import { messages as messagesTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const chatRouter = router({
  send: publicProcedure
    .input(z.object({
      userId: z.string().uuid(),
      message: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      // Store user message
      await db.insert(messagesTable).values({
        userId: input.userId,
        role: "user",
        content: input.message,
      });

      // Fetch recent conversation history (last 15 messages)
      const history = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.userId, input.userId))
        .orderBy(desc(messagesTable.createdAt))
        .limit(15);

      const conversationMessages = history.reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Call Claude
      const aiResponse = await chat(conversationMessages, {
        userName: "Paul", // TODO: fetch from user record
        currentDateTime: new Date().toISOString(),
        upcomingEvents: [], // TODO: fetch from calendar
        recentNudges: [], // TODO: fetch recent nudges
        domainHealth: {
          family: "active",
          work: "active",
          home: "active",
          relationships: "unknown",
          faith: "unknown",
          health: "unknown",
          growth: "unknown",
        },
      });

      // Execute any tool calls
      const toolResults = [];
      for (const toolCall of aiResponse.toolCalls) {
        const result = await executeToolCall(toolCall, input.userId, db);
        toolResults.push(result);
      }

      // Store assistant response
      await db.insert(messagesTable).values({
        userId: input.userId,
        role: "assistant",
        content: aiResponse.text,
        toolCalls: aiResponse.toolCalls.length > 0 ? aiResponse.toolCalls : undefined,
      });

      return {
        text: aiResponse.text,
        toolResults,
      };
    }),

  history: publicProcedure
    .input(z.object({
      userId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const history = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.userId, input.userId))
        .orderBy(desc(messagesTable.createdAt))
        .limit(input.limit);

      return history.reverse();
    }),
});
```

**Step 6: Wire chat router into app router**

Modify `packages/api/src/router.ts`:
```typescript
import { router, publicProcedure } from "./trpc";
import { chatRouter } from "./routes/chat";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add chat endpoint with Claude AI integration and tool execution"
```

---

## Task 6: Expo Frontend — Chat Screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/index.tsx` (chat home screen)
- Create: `apps/mobile/lib/trpc.ts` (tRPC client setup)
- Create: `apps/mobile/components/ChatBubble.tsx`
- Create: `apps/mobile/components/ChatInput.tsx`

**Step 1: Install frontend dependencies**

```bash
cd apps/mobile
npx expo install @trpc/client@^11 @trpc/react-query@^11 @tanstack/react-query@^5
```

**Step 2: Set up tRPC client**

Create `apps/mobile/lib/trpc.ts`:
```typescript
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../packages/api/src/router";

export const trpc = createTRPCReact<AppRouter>();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
    }),
  ],
});
```

**Step 3: Create ChatBubble component**

Create `apps/mobile/components/ChatBubble.tsx`:
```tsx
import { View, Text, StyleSheet } from "react-native";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {content}
        </Text>
      </View>
      {timestamp && (
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  assistantContainer: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#4F46E5",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#1F2937",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
    color: "#9CA3AF",
  },
  userTimestamp: {
    marginRight: 4,
  },
  assistantTimestamp: {
    marginLeft: 4,
  },
});
```

**Step 4: Create ChatInput component**

Create `apps/mobile/components/ChatInput.tsx`:
```tsx
import { useState, useRef } from "react";
import {
  View, TextInput, TouchableOpacity, StyleSheet, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="What's on your mind?"
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={2000}
        editable={!disabled}
        onSubmitEditing={Platform.OS === "web" ? handleSend : undefined}
        blurOnSubmit={Platform.OS === "web"}
      />
      <TouchableOpacity
        style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Ionicons
          name="arrow-up-circle"
          size={36}
          color={text.trim() && !disabled ? "#4F46E5" : "#D1D5DB"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1F2937",
    marginRight: 8,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
```

**Step 5: Build the chat home screen**

Modify `apps/mobile/app/(tabs)/index.tsx`:
```tsx
import { useState, useRef, useCallback } from "react";
import {
  View, FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  SafeAreaView, Text,
} from "react-native";
import { ChatBubble } from "../../components/ChatBubble";
import { ChatInput } from "../../components/ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// Temporary local-only chat until tRPC is wired up with auth
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm LifePulse, your personal life copilot. Tell me what's going on — I'll help you stay on top of things.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    // TODO: Replace with tRPC mutation once auth is in place
    // For now, echo back a placeholder response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Got it — I'll keep track of that. (AI integration coming soon!)`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setSending(false);
    }, 500);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LifePulse</Text>
          <Text style={styles.headerSubtitle}>Your life copilot</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble
              role={item.role}
              content={item.content}
              timestamp={item.createdAt}
            />
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <ChatInput onSend={handleSend} disabled={sending} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  messageList: {
    paddingVertical: 12,
  },
});
```

**Step 6: Verify the chat screen renders**

```bash
cd apps/mobile && npx expo start --web
```

Expected: Chat screen loads with welcome message, text input works, placeholder responses appear.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add chat UI with message bubbles and input component"
```

---

## Task 7: Today View Screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/today.tsx`
- Create: `apps/mobile/components/TimelineItem.tsx`
- Create: `apps/mobile/components/DomainBadge.tsx`

**Step 1: Create DomainBadge component**

Create `apps/mobile/components/DomainBadge.tsx`:
```tsx
import { View, Text, StyleSheet } from "react-native";

const DOMAIN_COLORS: Record<string, string> = {
  family: "#8B5CF6",
  work: "#3B82F6",
  home: "#F59E0B",
  relationships: "#EC4899",
  faith: "#10B981",
  health: "#EF4444",
  growth: "#6366F1",
};

const DOMAIN_ICONS: Record<string, string> = {
  family: "👨‍👧‍👦",
  work: "💼",
  home: "🏠",
  relationships: "❤️",
  faith: "✝️",
  health: "🏃",
  growth: "🌱",
};

interface DomainBadgeProps {
  domain: string;
  size?: "small" | "medium";
}

export function DomainBadge({ domain, size = "small" }: DomainBadgeProps) {
  const color = DOMAIN_COLORS[domain] ?? "#6B7280";
  const icon = DOMAIN_ICONS[domain] ?? "📌";
  const isSmall = size === "small";

  return (
    <View style={[styles.badge, { backgroundColor: color + "20", borderColor: color }, isSmall && styles.small]}>
      <Text style={[styles.text, { color }, isSmall && styles.smallText]}>
        {icon} {domain}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  smallText: {
    fontSize: 11,
  },
});
```

**Step 2: Create TimelineItem component**

Create `apps/mobile/components/TimelineItem.tsx`:
```tsx
import { View, Text, StyleSheet } from "react-native";
import { DomainBadge } from "./DomainBadge";

interface TimelineItemProps {
  time?: string;
  title: string;
  domain: string;
  type: "event" | "task" | "reminder" | "note";
  priority?: string;
}

export function TimelineItem({ time, title, domain, type, priority }: TimelineItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{time ?? "--:--"}</Text>
      </View>
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text style={[styles.title, priority === "high" && styles.highPriority]}>
          {title}
        </Text>
        <View style={styles.meta}>
          <DomainBadge domain={domain} size="small" />
          <Text style={styles.type}>{type}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timeColumn: {
    width: 52,
    alignItems: "flex-end",
    paddingRight: 12,
  },
  time: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4F46E5",
    marginTop: 5,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    marginBottom: 4,
  },
  highPriority: {
    color: "#DC2626",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  type: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "capitalize",
  },
});
```

**Step 3: Build the Today screen**

Modify `apps/mobile/app/(tabs)/today.tsx`:
```tsx
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { TimelineItem } from "../../components/TimelineItem";

// Placeholder data until backend is connected
const MOCK_TODAY = [
  { time: "8:00", title: "Morning devotional", domain: "faith", type: "event" as const },
  { time: "9:00", title: "Team standup", domain: "work", type: "event" as const },
  { time: "10:30", title: "Call mortgage broker re: rate lock", domain: "home", type: "task" as const, priority: "high" },
  { time: "12:00", title: "Lunch — prep crockpot chili", domain: "health", type: "task" as const },
  { time: "15:00", title: "Emma soccer practice pickup", domain: "family", type: "event" as const, priority: "high" },
  { time: "18:00", title: "Family dinner", domain: "family", type: "event" as const },
  { time: "20:00", title: "Review Q2 initiative roadmap", domain: "work", type: "task" as const },
];

export default function TodayScreen() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, Paul</Text>
          <Text style={styles.date}>{dateStr}</Text>
          <Text style={styles.summary}>7 items today — 2 need attention</Text>
        </View>

        <View style={styles.timeline}>
          {MOCK_TODAY.map((item, i) => (
            <TimelineItem key={i} {...item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  date: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  summary: {
    fontSize: 14,
    color: "#4F46E5",
    marginTop: 8,
    fontWeight: "500",
  },
  timeline: {
    paddingVertical: 8,
  },
});
```

**Step 4: Verify Today screen renders**

```bash
cd apps/mobile && npx expo start --web
```

Expected: Today tab shows timeline with mock items, domain badges render correctly.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Today view with timeline and domain badges"
```

---

## Task 8: Life Domain Radar Screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/radar.tsx`
- Create: `apps/mobile/components/DomainCard.tsx`

**Step 1: Create DomainCard component**

Create `apps/mobile/components/DomainCard.tsx`:
```tsx
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const STATUS_COLORS = {
  healthy: "#10B981",
  drifting: "#F59E0B",
  neglected: "#EF4444",
  unknown: "#9CA3AF",
};

const DOMAIN_META: Record<string, { icon: string; label: string }> = {
  family: { icon: "👨‍👧‍👦", label: "Family" },
  work: { icon: "💼", label: "Work" },
  home: { icon: "🏠", label: "Home" },
  relationships: { icon: "❤️", label: "Relationships" },
  faith: { icon: "✝️", label: "Faith" },
  health: { icon: "🏃", label: "Health" },
  growth: { icon: "🌱", label: "Growth" },
};

interface DomainCardProps {
  domain: string;
  status: "healthy" | "drifting" | "neglected" | "unknown";
  lastActivity?: string;
  itemCount: number;
}

export function DomainCard({ domain, status, lastActivity, itemCount }: DomainCardProps) {
  const router = useRouter();
  const meta = DOMAIN_META[domain] ?? { icon: "📌", label: domain };
  const statusColor = STATUS_COLORS[status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/domain/${domain}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{meta.icon}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      <Text style={styles.label}>{meta.label}</Text>
      <Text style={styles.itemCount}>{itemCount} items</Text>
      {lastActivity && (
        <Text style={styles.lastActivity}>Last: {lastActivity}</Text>
      )}
      <Text style={[styles.statusText, { color: statusColor }]}>
        {status}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    width: "47%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  itemCount: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  lastActivity: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    marginTop: 6,
  },
});
```

**Step 2: Build the Radar screen**

Modify `apps/mobile/app/(tabs)/radar.tsx`:
```tsx
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { DomainCard } from "../../components/DomainCard";

// Placeholder until backend computes real health scores
const MOCK_DOMAINS = [
  { domain: "family", status: "healthy" as const, lastActivity: "Today", itemCount: 12 },
  { domain: "work", status: "healthy" as const, lastActivity: "Today", itemCount: 8 },
  { domain: "faith", status: "neglected" as const, lastActivity: "12 days ago", itemCount: 2 },
  { domain: "home", status: "drifting" as const, lastActivity: "3 days ago", itemCount: 5 },
  { domain: "relationships", status: "drifting" as const, lastActivity: "5 days ago", itemCount: 3 },
  { domain: "health", status: "neglected" as const, lastActivity: "8 days ago", itemCount: 1 },
  { domain: "growth", status: "unknown" as const, lastActivity: undefined, itemCount: 0 },
];

export default function RadarScreen() {
  const healthyCount = MOCK_DOMAINS.filter(d => d.status === "healthy").length;
  const needsAttention = MOCK_DOMAINS.filter(d => d.status === "neglected" || d.status === "drifting").length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Life Radar</Text>
          <Text style={styles.subtitle}>
            {healthyCount} domains healthy — {needsAttention} need attention
          </Text>
        </View>

        <View style={styles.grid}>
          {MOCK_DOMAINS.map((d) => (
            <DomainCard key={d.domain} {...d} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
```

**Step 3: Create domain drilldown screen**

Create `apps/mobile/app/domain/[id].tsx`:
```tsx
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { DomainBadge } from "../../components/DomainBadge";

const DOMAIN_LABELS: Record<string, string> = {
  family: "Family",
  work: "Work",
  home: "Home",
  relationships: "Relationships",
  faith: "Faith",
  health: "Health",
  growth: "Growth",
};

export default function DomainDrilldown() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const label = DOMAIN_LABELS[id] ?? id;

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: label }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <DomainBadge domain={id} size="medium" />
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.subtitle}>Recent activity and items</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Domain drilldown coming soon — will show stream of items, upcoming events, and patterns for {label}.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  placeholder: {
    padding: 20,
    margin: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
});
```

**Step 4: Verify Radar screen and drilldown render**

```bash
cd apps/mobile && npx expo start --web
```

Expected: Radar tab shows domain cards in a grid, tapping a card navigates to drilldown.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Life Radar screen with domain cards and drilldown"
```

---

## Task 9: Google OAuth Authentication

**Files:**
- Create: `packages/api/src/services/auth.ts`
- Create: `packages/api/src/routes/auth.ts`
- Create: `apps/mobile/lib/auth.ts`
- Create: `apps/mobile/app/(auth)/sign-in.tsx`
- Modify: `apps/mobile/app/_layout.tsx`
- Test: `packages/api/src/__tests__/auth.test.ts`

**Step 1: Install auth dependencies**

Backend:
```bash
cd packages/api
npm install arctic jose
```

Frontend:
```bash
cd apps/mobile
npx expo install expo-auth-session expo-web-browser expo-secure-store
```

**Step 2: Write failing test for token verification**

Create `packages/api/src/__tests__/auth.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { verifyToken, createToken } from "../services/auth";

describe("Auth service", () => {
  it("creates and verifies a JWT token", async () => {
    const token = await createToken({ userId: "test-user-id", email: "test@example.com" });
    expect(typeof token).toBe("string");

    const payload = await verifyToken(token);
    expect(payload.userId).toBe("test-user-id");
    expect(payload.email).toBe("test@example.com");
  });

  it("rejects invalid tokens", async () => {
    await expect(verifyToken("invalid-token")).rejects.toThrow();
  });
});
```

**Step 3: Run test to verify it fails**

```bash
cd packages/api && npm test
```

Expected: FAIL — auth service not found.

**Step 4: Implement JWT auth service**

Create `packages/api/src/services/auth.ts`:
```typescript
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "lifepulse-dev-secret-change-in-prod"
);

interface TokenPayload {
  userId: string;
  email: string;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return {
    userId: payload.userId as string,
    email: payload.email as string,
  };
}
```

**Step 5: Run tests**

```bash
cd packages/api && npm test
```

Expected: All PASS

**Step 6: Create auth route (Google OAuth callback)**

Create `packages/api/src/routes/auth.ts`:
```typescript
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { Google } from "arctic";
import { createToken } from "../services/auth";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/auth/callback",
);

export const authRouter = router({
  googleCallback: publicProcedure
    .input(z.object({
      code: z.string(),
      codeVerifier: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Exchange code for tokens
      const tokens = await google.validateAuthorizationCode(input.code, input.codeVerifier);
      const accessToken = tokens.accessToken();
      const refreshToken = tokens.refreshToken();

      // Get user info from Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoRes.json();

      // Upsert user
      const existing = await db.select().from(users).where(eq(users.email, userInfo.email)).limit(1);

      let userId: string;
      if (existing.length > 0) {
        userId = existing[0].id;
        await db.update(users).set({
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
          updatedAt: new Date(),
        }).where(eq(users.id, userId));
      } else {
        const [newUser] = await db.insert(users).values({
          email: userInfo.email,
          name: userInfo.name,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
        }).returning();
        userId = newUser.id;
      }

      // Create JWT
      const jwt = await createToken({ userId, email: userInfo.email });

      return { token: jwt, userId, name: userInfo.name };
    }),
});
```

**Step 7: Create frontend auth module and sign-in screen**

Create `apps/mobile/lib/auth.ts`:
```typescript
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "lifepulse_token";
const USER_KEY = "lifepulse_user";

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

export const discovery = AuthSession.useAutoDiscovery("https://accounts.google.com");
```

Create `apps/mobile/app/(auth)/sign-in.tsx`:
```tsx
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";

export default function SignInScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>LifePulse</Text>
        <Text style={styles.tagline}>Your AI-powered life copilot</Text>

        <View style={styles.features}>
          <Text style={styles.feature}>Capture anything in natural language</Text>
          <Text style={styles.feature}>Proactive nudges when things drift</Text>
          <Text style={styles.feature}>See your whole life at a glance</Text>
        </View>

        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your data is private and encrypted. We connect to Google Calendar to help manage your schedule.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: "#4F46E5",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 48,
  },
  features: {
    alignSelf: "stretch",
    marginBottom: 48,
  },
  feature: {
    fontSize: 16,
    color: "#374151",
    paddingVertical: 8,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#4F46E5",
    marginBottom: 8,
  },
  googleButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },
});
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Google OAuth auth flow with JWT tokens and sign-in screen"
```

---

## Task 10: Wire tRPC Client to Backend & End-to-End Chat

**Files:**
- Modify: `apps/mobile/app/_layout.tsx` (add tRPC + QueryClient providers)
- Modify: `apps/mobile/app/(tabs)/index.tsx` (connect to real backend)
- Modify: `packages/api/src/app.ts` (mount tRPC handler)

**Step 1: Mount tRPC on Fastify**

Install adapter:
```bash
cd packages/api
npm install @trpc/server@^11
npm install @fastify/cors
```

Modify `packages/api/src/app.ts`:
```typescript
import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./router";

export async function createApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter },
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
```

**Step 2: Add providers to root layout**

Modify `apps/mobile/app/_layout.tsx` — wrap the app with tRPC and React Query providers:
```tsx
import { useState } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "../lib/trpc";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="domain/[id]" options={{ headerShown: true }} />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

**Step 3: Connect chat screen to tRPC**

Update `apps/mobile/app/(tabs)/index.tsx` — replace the setTimeout placeholder with the real tRPC mutation:
```tsx
// Replace the handleSend function body:
const sendMutation = trpc.chat.send.useMutation({
  onSuccess: (data) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: data.text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMessage]);
    setSending(false);
  },
  onError: (error) => {
    console.error("Chat error:", error);
    setSending(false);
  },
});

const handleSend = useCallback((text: string) => {
  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: text,
    createdAt: new Date().toISOString(),
  };
  setMessages((prev) => [...prev, userMessage]);
  setSending(true);

  sendMutation.mutate({
    userId: "placeholder-user-id", // TODO: from auth context
    message: text,
  });
}, [sendMutation]);
```

**Step 4: Verify end-to-end**

Terminal 1:
```bash
cd packages/api && DATABASE_URL="postgresql://..." ANTHROPIC_API_KEY="sk-..." npm run dev
```

Terminal 2:
```bash
cd apps/mobile && npx expo start --web
```

Expected: Type a message in chat, see AI response from Claude.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire tRPC client to backend for end-to-end chat"
```

---

## Task 11: Environment Configuration & Dev Setup

**Files:**
- Create: `packages/api/.env.example`
- Create: `apps/mobile/.env.example`
- Create: `.gitignore`
- Update: `README.md`

**Step 1: Create env examples**

`packages/api/.env.example`:
```
DATABASE_URL=postgresql://localhost:5432/lifepulse
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=change-this-to-a-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
PORT=3000
```

`apps/mobile/.env.example`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**Step 2: Create .gitignore**

```
node_modules/
dist/
.expo/
*.env
.env.*
!*.env.example
```

**Step 3: Update README.md**

Write a basic README with setup instructions: install dependencies, set up PostgreSQL, copy .env files, run migrations, start dev servers.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add environment configuration, gitignore, and setup docs"
```

---

## Summary

| Task | What it builds | Key files |
|------|---------------|-----------|
| 1 | Monorepo scaffolding | turbo.json, package.json, apps/mobile, packages/api |
| 2 | Backend API foundation | Fastify + tRPC server, health endpoint |
| 3 | Database schema | Drizzle ORM schema — users, life items, messages, nudges |
| 4 | AI conversation service | Claude SDK integration, tool definitions, system prompt |
| 5 | Chat tRPC endpoint | Chat route, tool executor, message persistence |
| 6 | Chat UI (home screen) | ChatBubble, ChatInput, chat screen |
| 7 | Today view | TimelineItem, DomainBadge, daily agenda |
| 8 | Life Domain Radar | DomainCard, radar grid, domain drilldown |
| 9 | Google OAuth auth | JWT auth, Google OAuth flow, sign-in screen |
| 10 | End-to-end wiring | tRPC client, providers, live chat with backend |
| 11 | Dev setup & config | .env, .gitignore, README |

**Dependency order:** 1 → 2 → 3 → 4 → 5 (backend chain), 1 → 6 → 7 → 8 (frontend chain), 9 and 10 depend on both chains, 11 is independent.
