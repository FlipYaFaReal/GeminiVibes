import type { ToolCall } from "./ai";
import { lifeItems, nudges } from "../db/schema";

export interface ToolResult {
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
      const [item] = await db
        .insert(lifeItems)
        .values({
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
        })
        .returning();
      return { success: true, type: "event", id: item.id };
    }

    case "create_task": {
      const [item] = await db
        .insert(lifeItems)
        .values({
          userId,
          content: input.title as string,
          domain: input.domain as string,
          type: "task",
          priority: input.priority as string,
          dueAt: input.due ? new Date(input.due as string) : undefined,
          metadata: { notes: input.notes, reminder_at: input.reminder_at },
        })
        .returning();
      return { success: true, type: "task", id: item.id };
    }

    case "create_nudge": {
      const [nudge] = await db
        .insert(nudges)
        .values({
          userId,
          message: input.message as string,
          domain: input.domain as string,
          type: input.type as string,
          priority: input.priority as string,
        })
        .returning();
      return { success: true, type: "nudge", id: nudge.id };
    }

    case "capture_note": {
      const [item] = await db
        .insert(lifeItems)
        .values({
          userId,
          content: input.content as string,
          domain: input.domain as string,
          type: "note",
        })
        .returning();
      return { success: true, type: "note", id: item.id };
    }

    default:
      return {
        success: false,
        type: "unknown",
        error: `Unknown tool: ${name}`,
      };
  }
}
