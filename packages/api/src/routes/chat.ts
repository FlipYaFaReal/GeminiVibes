import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { chat } from "../services/ai";
import { executeToolCall } from "../services/tool-executor";
import { getUpcomingEvents } from "../services/google-calendar";
import { computeDomainHealth } from "../services/domain-health";
import { db } from "../db";
import { messages as messagesTable } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const chatRouter = router({
  send: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        message: z.string().min(1),
      }),
    )
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

      // Fetch upcoming Google Calendar events (best-effort)
      const upcomingEvents = await getUpcomingEvents(input.userId);

      // Compute real domain health from life item activity
      let domainHealthMap: Record<string, string> = {};
      try {
        const healthResults = await computeDomainHealth(input.userId);
        for (const h of healthResults) {
          domainHealthMap[h.domain] = h.status === "healthy" ? "active" : h.status;
        }
      } catch {
        // Fall back to unknown if domain health computation fails
        domainHealthMap = {
          family: "unknown", work: "unknown", home: "unknown",
          relationships: "unknown", faith: "unknown", health: "unknown", growth: "unknown",
        };
      }

      // Call Claude and execute tool calls
      let aiResponse;
      try {
        aiResponse = await chat(conversationMessages, {
          userName: "Paul", // TODO: fetch from user record
          currentDateTime: new Date().toISOString(),
          upcomingEvents,
          recentNudges: [], // TODO: fetch recent nudges
          domainHealth: domainHealthMap,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown AI service error";
        return {
          text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
          toolResults: [],
          error: message,
        };
      }

      // Execute any tool calls
      const toolResults = [];
      try {
        for (const toolCall of aiResponse.toolCalls) {
          const result = await executeToolCall(toolCall, input.userId, db);
          toolResults.push(result);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown tool execution error";
        toolResults.push({ success: false, type: "execution", error: message });
      }

      // Store assistant response
      await db.insert(messagesTable).values({
        userId: input.userId,
        role: "assistant",
        content: aiResponse.text,
        toolCalls:
          aiResponse.toolCalls.length > 0 ? aiResponse.toolCalls : undefined,
      });

      return {
        text: aiResponse.text,
        toolResults,
      };
    }),

  history: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
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
