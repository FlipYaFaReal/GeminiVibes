import { router, publicProcedure } from "./trpc";
import { chatRouter } from "./routes/chat";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
