import { describe, it, expect, vi } from "vitest";

// Mock the db module before importing the service
vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

// Mock googleapis to avoid real HTTP calls
vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        setCredentials: vi.fn(),
        on: vi.fn(),
      })),
    },
    calendar: vi.fn().mockReturnValue({
      events: {
        list: vi.fn().mockResolvedValue({ data: { items: [] } }),
        insert: vi.fn().mockResolvedValue({ data: { id: "gcal-123" } }),
      },
    }),
  },
}));

import { getUpcomingEvents, createCalendarEvent } from "../services/google-calendar";

describe("Google Calendar service", () => {
  it("getUpcomingEvents returns empty array when user has no Google credentials", async () => {
    // The mocked db returns an empty user array, so getAuthenticatedClient
    // will throw "No Google credentials for user" which is caught and returns []
    const events = await getUpcomingEvents("user-without-credentials");
    expect(events).toEqual([]);
  });

  it("createCalendarEvent returns null when user has no Google credentials", async () => {
    const result = await createCalendarEvent("user-without-credentials", {
      title: "Test Event",
      start: "2026-04-08T10:00:00Z",
    });
    expect(result).toBeNull();
  });

  it("getUpcomingEvents is a function with correct signature", () => {
    expect(typeof getUpcomingEvents).toBe("function");
    expect(getUpcomingEvents.length).toBe(1); // userId required, hours optional
  });

  it("createCalendarEvent is a function with correct signature", () => {
    expect(typeof createCalendarEvent).toBe("function");
    expect(createCalendarEvent.length).toBe(2); // userId, event
  });
});
