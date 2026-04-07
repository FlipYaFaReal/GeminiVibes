import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { lifeItems, nudges, lifeDomainEnum } from "../db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { computeDomainHealth } from "./domain-health";
import { aiTools } from "./ai-tools";
import { deliverNudgeNotification } from "./notification-delivery";

type LifeDomain = (typeof lifeDomainEnum.enumValues)[number];

const anthropic = new Anthropic();

/** The create_nudge tool schema, extracted for the nudge-generation call. */
const nudgeTool = aiTools.find((t) => t.name === "create_nudge")!;

/**
 * Build the system prompt that instructs Claude to review user state and
 * generate 0-3 proactive nudges via the create_nudge tool.
 */
export function buildNudgePrompt(opts: {
  domainHealth: string;
  overdueItems: string;
  upcomingItems: string;
  recentNudges: string;
}): string {
  return `You are reviewing a user's life state to generate proactive nudges.

Current domain health:
${opts.domainHealth}

Overdue items:
${opts.overdueItems}

Upcoming deadlines (next 48h):
${opts.upcomingItems}

Recently delivered nudges (don't repeat these):
${opts.recentNudges}

Generate 0-3 nudges using the create_nudge tool. Only generate a nudge if it's genuinely helpful. Types:
- time_sensitive: approaching deadlines or conflicts
- drift_alert: domain neglected for 7+ days
- opportunity: free time that could be used for a neglected domain

If there is nothing worth nudging about, do not call the tool at all.`;
}

/**
 * Fetch overdue life items for a user (status = "active", dueAt < now).
 */
async function getOverdueItems(userId: string) {
  const now = new Date();
  return db
    .select({
      id: lifeItems.id,
      content: lifeItems.content,
      domain: lifeItems.domain,
      dueAt: lifeItems.dueAt,
      priority: lifeItems.priority,
    })
    .from(lifeItems)
    .where(
      and(
        eq(lifeItems.userId, userId),
        eq(lifeItems.status, "active"),
        lt(lifeItems.dueAt, now),
      ),
    );
}

/**
 * Fetch items due within the next 48 hours for a user.
 */
async function getUpcomingItems(userId: string) {
  const now = new Date();
  const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  return db
    .select({
      id: lifeItems.id,
      content: lifeItems.content,
      domain: lifeItems.domain,
      dueAt: lifeItems.dueAt,
      priority: lifeItems.priority,
    })
    .from(lifeItems)
    .where(
      and(
        eq(lifeItems.userId, userId),
        eq(lifeItems.status, "active"),
        gte(lifeItems.dueAt, now),
        lt(lifeItems.dueAt, fortyEightHoursLater),
      ),
    );
}

/**
 * Fetch nudges created for a user in the last 24 hours.
 */
async function getRecentNudges(userId: string) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return db
    .select({
      id: nudges.id,
      message: nudges.message,
      type: nudges.type,
      domain: nudges.domain,
    })
    .from(nudges)
    .where(
      and(
        eq(nudges.userId, userId),
        gte(nudges.createdAt, twentyFourHoursAgo),
      ),
    )
    .orderBy(desc(nudges.createdAt));
}

function formatItems(
  items: { content: string; domain: string | null; dueAt: Date | null; priority: string | null }[],
): string {
  if (items.length === 0) return "  None";
  return items
    .map(
      (i) =>
        `  - [${i.domain ?? "unknown"}] ${i.content}${i.dueAt ? ` (due: ${i.dueAt.toISOString()})` : ""}${i.priority ? ` [${i.priority}]` : ""}`,
    )
    .join("\n");
}

/**
 * Generate proactive nudges for a user by assembling their current state and
 * calling Claude (haiku) with a nudge-specific prompt.
 *
 * Returns the list of nudge IDs that were created.
 */
export async function generateNudges(userId: string): Promise<string[]> {
  // 1. Gather user state in parallel
  const [domainHealth, overdueItems, upcomingItems, recentNudges] =
    await Promise.all([
      computeDomainHealth(userId),
      getOverdueItems(userId),
      getUpcomingItems(userId),
      getRecentNudges(userId),
    ]);

  // 2. Format data for the prompt
  const domainHealthStr = domainHealth
    .map(
      (d) =>
        `  - ${d.domain}: ${d.status} (last activity: ${d.lastActivity ?? "never"}, overdue: ${d.overdueCount})`,
    )
    .join("\n");

  const overdueStr = formatItems(overdueItems);
  const upcomingStr = formatItems(upcomingItems);

  const recentNudgesStr =
    recentNudges.length === 0
      ? "  None"
      : recentNudges
          .map((n) => `  - [${n.type}] [${n.domain ?? "unknown"}] ${n.message}`)
          .join("\n");

  const prompt = buildNudgePrompt({
    domainHealth: domainHealthStr,
    overdueItems: overdueStr,
    upcomingItems: upcomingStr,
    recentNudges: recentNudgesStr,
  });

  // 3. Call Claude with the nudge tool
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: prompt,
    tools: [nudgeTool],
    messages: [
      {
        role: "user",
        content: "Review the current state and generate any warranted nudges.",
      },
    ],
  });

  // 4. Extract tool_use blocks and insert nudges
  const createdIds: string[] = [];

  for (const block of response.content) {
    if (block.type !== "tool_use" || block.name !== "create_nudge") continue;

    const input = block.input as {
      message: string;
      type: string;
      domain: string;
      priority: string;
    };

    const [nudge] = await db
      .insert(nudges)
      .values({
        userId,
        message: input.message,
        domain: input.domain as LifeDomain,
        type: input.type,
        priority: input.priority,
      })
      .returning();

    createdIds.push(nudge.id);

    // Deliver push notification immediately
    deliverNudgeNotification(nudge.id, userId).catch((err) =>
      console.error(`[nudge-generator] Failed to deliver notification for nudge ${nudge.id}:`, err),
    );
  }

  return createdIds;
}
