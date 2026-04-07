import { describe, it, expect, vi } from "vitest";

// Mock @clerk/backend before importing the module under test
vi.mock("@clerk/backend", () => ({
  verifyToken: vi.fn(async (token: string) => {
    if (token === "valid-clerk-token") {
      return {
        sub: "user_abc123",
        email: "test@example.com",
      };
    }
    throw new Error("Invalid token");
  }),
  createClerkClient: () => ({}),
}));

import { verifyClerkToken } from "../services/auth";

describe("Auth service (Clerk)", () => {
  it("verifies a valid Clerk token and returns userId and email", async () => {
    const payload = await verifyClerkToken("valid-clerk-token");
    expect(payload.userId).toBe("user_abc123");
    expect(payload.email).toBe("test@example.com");
  });

  it("rejects invalid tokens", async () => {
    await expect(verifyClerkToken("invalid-token")).rejects.toThrow("Invalid token");
  });
});
