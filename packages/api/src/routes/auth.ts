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
      const tokens = await google.validateAuthorizationCode(input.code, input.codeVerifier);
      const accessToken = tokens.accessToken();
      const refreshToken = tokens.hasRefreshToken() ? tokens.refreshToken() : null;

      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoRes.json();

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

      const jwt = await createToken({ userId, email: userInfo.email });
      return { token: jwt, userId, name: userInfo.name };
    }),
});
