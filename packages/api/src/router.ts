import { router, publicProcedure } from "./trpc";
import { chatRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  chat: chatRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
