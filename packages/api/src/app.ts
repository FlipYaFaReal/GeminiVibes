import Fastify from "fastify";

export async function createApp() {
  const app = Fastify({ logger: true });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
