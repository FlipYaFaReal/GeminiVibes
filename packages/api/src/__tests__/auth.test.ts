import { describe, it, expect } from "vitest";
import { verifyToken, createToken } from "../services/auth";

describe("Auth service", () => {
  it("creates and verifies a JWT token", async () => {
    const token = await createToken({ userId: "test-user-id", email: "test@example.com" });
    expect(typeof token).toBe("string");

    const payload = await verifyToken(token);
    expect(payload.userId).toBe("test-user-id");
    expect(payload.email).toBe("test@example.com");
  });

  it("rejects invalid tokens", async () => {
    await expect(verifyToken("invalid-token")).rejects.toThrow();
  });
});
