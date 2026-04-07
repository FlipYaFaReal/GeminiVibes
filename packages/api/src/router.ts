import { router, publicProcedure } from "./trpc";
import { chatRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";
import { domainsRouter } from "./routes/domains";
import { todayRouter } from "./routes/today";
import { nudgesRouter } from "./routes/nudges";

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  chat: chatRouter,
  auth: authRouter,
  domains: domainsRouter,
  today: todayRouter,
  nudges: nudgesRouter,
});

export type AppRouter = typeof appRouter;
