import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const authRouter = router({
  /**
   * Sync a Clerk-authenticated user into our local database.
   * Called after the user signs in via Clerk to ensure we have a local record.
   */
  syncUser: publicProcedure
    .input(
      z.object({
        clerkUserId: z.string(),
        email: z.string().email(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        return { userId: existing[0].id };
      }

      const [newUser] = await db
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
        })
        .returning();

      return { userId: newUser.id };
    }),
});
