import { describe, it, expect, vi } from "vitest";
import { executeToolCall } from "../services/tool-executor";

describe("Tool executor", () => {
  it("handles create_task tool call", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
        }),
      }),
    };

    const result = await executeToolCall(
      {
        name: "create_task",
        input: {
          title: "Call the realtor",
          priority: "high",
          domain: "home",
        },
        id: "tool-1",
      },
      "user-123",
      mockDb as any,
    );

    expect(result.success).toBe(true);
    expect(result.type).toBe("task");
  });

  it("handles create_event tool call", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
        }),
      }),
    };

    const result = await executeToolCall(
      {
        name: "create_event",
        input: {
          title: "Soccer practice",
          start: "2026-04-08T17:00:00Z",
          domain: "family",
        },
        id: "tool-2",
      },
      "user-123",
      mockDb as any,
    );

    expect(result.success).toBe(true);
    expect(result.type).toBe("event");
  });

  it("handles create_nudge tool call", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
        }),
      }),
    };

    const result = await executeToolCall(
      {
        name: "create_nudge",
        input: {
          message: "You haven't prayed in 2 weeks",
          type: "drift_alert",
          domain: "faith",
          priority: "normal",
        },
        id: "tool-3",
      },
      "user-123",
      mockDb as any,
    );

    expect(result.success).toBe(true);
    expect(result.type).toBe("nudge");
  });

  it("handles capture_note tool call", async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "test-id" }]),
        }),
      }),
    };

    const result = await executeToolCall(
      {
        name: "capture_note",
        input: {
          content: "Feeling grateful today",
          domain: "faith",
        },
        id: "tool-4",
      },
      "user-123",
      mockDb as any,
    );

    expect(result.success).toBe(true);
    expect(result.type).toBe("note");
  });

  it("handles unknown tool name", async () => {
    const result = await executeToolCall(
      { name: "unknown_tool", input: {}, id: "tool-5" },
      "user-123",
      {} as any,
    );

    expect(result.success).toBe(false);
  });
});
