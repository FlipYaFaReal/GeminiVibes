import type { ToolCall } from "./ai";
import type { Database } from "../db";
import { lifeItems, nudges, lifeDomainEnum } from "../db/schema";
import { createCalendarEvent } from "./google-calendar";
import { eq } from "drizzle-orm";

type LifeDomain = (typeof lifeDomainEnum.enumValues)[number];

export interface ToolResult {
  success: boolean;
  type: string;
  id?: string;
  error?: string;
}

export async function executeToolCall(
  toolCall: ToolCall,
  userId: string,
  db: Database,
): Promise<ToolResult> {
  const { name, input } = toolCall;

  switch (name) {
    case "create_event": {
      try {
        const [item] = await db
          .insert(lifeItems)
          .values({
            userId,
            content: input.title as string,
            domain: input.domain as LifeDomain,
            type: "event",
            dueAt: input.start ? new Date(input.start as string) : undefined,
            metadata: {
              end: input.end,
              location: input.location,
              participants: input.participants,
            },
          })
          .returning();

        // Push event to Google Calendar (best-effort — don't fail the tool call)
        try {
          const calendarEventId = await createCalendarEvent(userId, {
            title: input.title as string,
            start: input.start as string,
            end: input.end as string | undefined,
            location: input.location as string | undefined,
          });
          if (calendarEventId) {
            await db
              .update(lifeItems)
              .set({ calendarEventId, updatedAt: new Date() })
              .where(eq(lifeItems.id, item.id));
          }
        } catch (calErr) {
          console.error("Google Calendar sync failed (non-blocking):", calErr);
        }

        return { success: true, type: "event", id: item.id };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown error creating event";
        return { success: false, type: "event", error: message };
      }
    }

    case "create_task": {
      try {
        const [item] = await db
          .insert(lifeItems)
          .values({
            userId,
            content: input.title as string,
            domain: input.domain as LifeDomain,
            type: "task",
            priority: input.priority as string,
            dueAt: input.due ? new Date(input.due as string) : undefined,
            metadata: { notes: input.notes, reminder_at: input.reminder_at },
          })
          .returning();
        return { success: true, type: "task", id: item.id };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown error creating task";
        return { success: false, type: "task", error: message };
      }
    }

    case "create_nudge": {
      try {
        const [nudge] = await db
          .insert(nudges)
          .values({
            userId,
            message: input.message as string,
            domain: input.domain as LifeDomain,
            type: input.type as string,
            priority: input.priority as string,
          })
          .returning();
        return { success: true, type: "nudge", id: nudge.id };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unknown error creating nudge";
        return { success: false, type: "nudge", error: message };
      }
    }

    case "capture_note": {
      try {
        const [item] = await db
          .insert(lifeItems)
          .values({
            userId,
            content: input.content as string,
            domain: input.domain as LifeDomain,
            type: "note",
          })
          .returning();
        return { success: true, type: "note", id: item.id };
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Unknown error capturing note";
        return { success: false, type: "note", error: message };
      }
    }

    default:
      return {
        success: false,
        type: "unknown",
        error: `Unknown tool: ${name}`,
      };
  }
}
