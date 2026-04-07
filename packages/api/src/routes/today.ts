import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "../db";
import { lifeItems } from "../db/schema";
import { eq, and, gte, lte, or } from "drizzle-orm";

export const todayRouter = router({
  items: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch life items for today
      const items = await db
        .select()
        .from(lifeItems)
        .where(
          and(
            eq(lifeItems.userId, input.userId),
            eq(lifeItems.status, "active"),
            or(
              // Items due today
              and(
                gte(lifeItems.dueAt, startOfDay),
                lte(lifeItems.dueAt, endOfDay),
              ),
              // Overdue items
              lte(lifeItems.dueAt, startOfDay),
            ),
          ),
        );

      // Format for the frontend
      const todayItems = items.map((item) => ({
        id: item.id,
        time: item.dueAt
          ? new Date(item.dueAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : null,
        title: item.content,
        domain: item.domain ?? "growth",
        type: item.type as "event" | "task" | "reminder" | "note",
        priority: item.priority ?? "medium",
        isOverdue: item.dueAt ? new Date(item.dueAt) < startOfDay : false,
      }));

      // Sort: timed items first (by time), then untimed items
      todayItems.sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;
        return 0;
      });

      // Count items needing attention (high priority or overdue)
      const needsAttention = todayItems.filter(
        (i) => i.priority === "high" || i.isOverdue,
      ).length;

      return { items: todayItems, total: todayItems.length, needsAttention };
    }),
});
