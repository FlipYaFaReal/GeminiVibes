import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockSendPushNotificationsAsync = vi.fn();

vi.mock("expo-server-sdk", () => {
  return {
    Expo: class MockExpo {
      sendPushNotificationsAsync = mockSendPushNotificationsAsync;
      static isExpoPushToken(token: string) {
        return typeof token === "string" && token.startsWith("ExponentPushToken[");
      }
    },
  };
});

const mockDbSelect = vi.fn();
const mockDbUpdate = vi.fn();

vi.mock("../db", () => ({
  db: {
    select: (...args: unknown[]) => mockDbSelect(...args),
    update: (...args: unknown[]) => mockDbUpdate(...args),
  },
}));

// Chaining helpers that mirror drizzle's fluent API
function chainableSelect(result: unknown[]) {
  return () => ({
    from: () => ({
      where: () => ({
        limit: () => result,
      }),
    }),
  });
}

function chainableUpdate() {
  const setFn = vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  });
  return () => ({
    set: setFn,
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("deliverNudgeNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when user has no push token", async () => {
    mockDbSelect.mockImplementation(
      chainableSelect([{ pushToken: null }]),
    );

    const { deliverNudgeNotification } = await import(
      "../services/notification-delivery"
    );
    const result = await deliverNudgeNotification("nudge-1", "user-1");
    expect(result).toBe(false);
    expect(mockSendPushNotificationsAsync).not.toHaveBeenCalled();
  });

  it("returns false when push token is invalid (not an Expo token)", async () => {
    mockDbSelect.mockImplementation(
      chainableSelect([{ pushToken: "invalid-token-format" }]),
    );

    const { deliverNudgeNotification } = await import(
      "../services/notification-delivery"
    );
    const result = await deliverNudgeNotification("nudge-1", "user-1");
    expect(result).toBe(false);
    expect(mockSendPushNotificationsAsync).not.toHaveBeenCalled();
  });

  it("returns false when nudge is not found", async () => {
    let callCount = 0;
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => {
            callCount++;
            // First call: user lookup (valid token)
            if (callCount === 1) {
              return [{ pushToken: "ExponentPushToken[abc123]" }];
            }
            // Second call: nudge lookup (not found)
            return [];
          },
        }),
      }),
    }));

    const { deliverNudgeNotification } = await import(
      "../services/notification-delivery"
    );
    const result = await deliverNudgeNotification("nudge-1", "user-1");
    expect(result).toBe(false);
    expect(mockSendPushNotificationsAsync).not.toHaveBeenCalled();
  });

  it("sends notification and marks nudge as delivered on success", async () => {
    let selectCall = 0;
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => {
            selectCall++;
            if (selectCall === 1) {
              return [{ pushToken: "ExponentPushToken[abc123]" }];
            }
            return [
              {
                id: "nudge-1",
                message: "Time to exercise!",
                domain: "health",
                type: "drift_alert",
              },
            ];
          },
        }),
      }),
    }));

    const mockSetWhere = vi.fn().mockResolvedValue(undefined);
    const mockSet = vi.fn().mockReturnValue({ where: mockSetWhere });
    mockDbUpdate.mockReturnValue({ set: mockSet });

    mockSendPushNotificationsAsync.mockResolvedValue([{ status: "ok" }]);

    const { deliverNudgeNotification } = await import(
      "../services/notification-delivery"
    );
    const result = await deliverNudgeNotification("nudge-1", "user-1");

    expect(result).toBe(true);
    expect(mockSendPushNotificationsAsync).toHaveBeenCalledWith([
      expect.objectContaining({
        to: "ExponentPushToken[abc123]",
        title: "LifePulse",
        body: "Time to exercise!",
        data: { nudgeId: "nudge-1", domain: "health", type: "drift_alert" },
      }),
    ]);
    expect(mockDbUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        delivered: true,
      }),
    );
  });

  it("returns false when Expo returns error status", async () => {
    let selectCall = 0;
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => {
            selectCall++;
            if (selectCall === 1) {
              return [{ pushToken: "ExponentPushToken[abc123]" }];
            }
            return [
              {
                id: "nudge-2",
                message: "Check in with family",
                domain: "family",
                type: "opportunity",
              },
            ];
          },
        }),
      }),
    }));

    mockSendPushNotificationsAsync.mockResolvedValue([
      { status: "error", message: "DeviceNotRegistered" },
    ]);

    const { deliverNudgeNotification } = await import(
      "../services/notification-delivery"
    );
    const result = await deliverNudgeNotification("nudge-2", "user-1");

    expect(result).toBe(false);
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns false and logs when sendPushNotificationsAsync throws", async () => {
    let selectCall = 0;
    mockDbSelect.mockImplementation(() => ({
      from: () => ({
        where: () => ({
          limit: () => {
            selectCall++;
            if (selectCall === 1) {
              return [{ pushToken: "ExponentPushToken[abc123]" }];
            }
            return [
              {
                id: "nudge-3",
                message: "Focus on growth",
                domain: "growth",
                type: "drift_alert",
              },
            ];
          },
        }),
      }),
    }));

    mockSendPushNotificationsAsync.mockRejectedValue(
      new Error("Network error"),
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { deliverNudgeNotification } = await import(
      "../services/notification-delivery"
    );
    const result = await deliverNudgeNotification("nudge-3", "user-1");

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
