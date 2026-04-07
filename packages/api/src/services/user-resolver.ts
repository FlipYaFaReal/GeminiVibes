import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * Resolves a Clerk user ID to an internal database user ID.
 * Creates the user record if it doesn't exist yet.
 */
export async function resolveUserId(clerkUserId: string): Promise<string> {
  // Look up by Clerk ID
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Auto-create user on first interaction
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: clerkUserId,
      email: `${clerkUserId}@clerk.placeholder`,
      name: "User",
    })
    .returning({ id: users.id });

  return newUser.id;
}
