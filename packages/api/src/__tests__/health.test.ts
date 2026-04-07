import { describe, it, expect } from "vitest";
import { createApp } from "../app";
import { appRouter } from "../router";

describe("Health endpoint", () => {
  it("returns ok status", async () => {
    const app = await createApp();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});

describe("tRPC router", () => {
  it("health procedure returns ok", async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.health();
    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
  });
});
