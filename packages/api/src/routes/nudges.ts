import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "../db";
import { nudges } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const nudgesRouter = router({
  /** Fetch undelivered nudges for a user and mark them as delivered. */
  pending: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      const pending = await db
        .select()
        .from(nudges)
        .where(
          and(
            eq(nudges.userId, input.userId),
            eq(nudges.delivered, false),
          ),
        );

      // Mark fetched nudges as delivered
      if (pending.length > 0) {
        const now = new Date();
        for (const nudge of pending) {
          await db
            .update(nudges)
            .set({ delivered: true, deliveredAt: now })
            .where(eq(nudges.id, nudge.id));
        }
      }

      return pending.map((n) => ({
        id: n.id,
        message: n.message,
        domain: n.domain,
        type: n.type,
        priority: n.priority,
        createdAt: n.createdAt.toISOString(),
      }));
    }),
});
