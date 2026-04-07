import { verifyToken, createClerkClient } from "@clerk/backend";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ?? "";

const clerk = createClerkClient({
  secretKey: CLERK_SECRET_KEY,
});

interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Verify a Clerk-issued JWT token.
 * Returns the userId (Clerk's `sub` claim) and email.
 */
export async function verifyClerkToken(token: string): Promise<TokenPayload> {
  const payload = await verifyToken(token, {
    secretKey: CLERK_SECRET_KEY,
  });
  return {
    userId: payload.sub,
    email: (payload as Record<string, unknown>).email as string ?? "",
  };
}

export { clerk };
