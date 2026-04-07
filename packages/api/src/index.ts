import { createApp } from "./app";

async function main() {
  const app = await createApp();
  const host = process.env.HOST ?? "0.0.0.0";
  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ host, port });
  console.log(`LifePulse API running on http://${host}:${port}`);
}

main().catch(console.error);
