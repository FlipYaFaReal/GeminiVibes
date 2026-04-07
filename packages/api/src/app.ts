import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "./router";

export async function createApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter },
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
