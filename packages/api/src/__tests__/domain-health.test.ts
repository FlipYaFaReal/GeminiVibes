import { describe, it, expect } from "vitest";
import { classifyHealth, formatRelativeTime } from "../services/domain-health";

describe("classifyHealth", () => {
  it("returns 'healthy' for activity within last 3 days", () => {
    expect(classifyHealth(0)).toBe("healthy");
    expect(classifyHealth(1)).toBe("healthy");
    expect(classifyHealth(2)).toBe("healthy");
    expect(classifyHealth(3)).toBe("healthy");
  });

  it("returns 'drifting' for activity 4-7 days ago", () => {
    expect(classifyHealth(4)).toBe("drifting");
    expect(classifyHealth(5)).toBe("drifting");
    expect(classifyHealth(6)).toBe("drifting");
    expect(classifyHealth(7)).toBe("drifting");
  });

  it("returns 'neglected' for activity more than 7 days ago", () => {
    expect(classifyHealth(8)).toBe("neglected");
    expect(classifyHealth(14)).toBe("neglected");
    expect(classifyHealth(30)).toBe("neglected");
    expect(classifyHealth(100)).toBe("neglected");
  });

  it("returns 'unknown' when daysSinceActivity is null", () => {
    expect(classifyHealth(null)).toBe("unknown");
  });
});

describe("formatRelativeTime", () => {
  it("returns null for null input", () => {
    expect(formatRelativeTime(null)).toBeNull();
  });

  it("returns 'Today' for a date within today", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("Today");
  });

  it("returns 'Yesterday' for a date 1 day ago", () => {
    const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday)).toBe("Yesterday");
  });

  it("returns 'N days ago' for dates further in the past", () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(fiveDaysAgo)).toBe("5 days ago");

    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(tenDaysAgo)).toBe("10 days ago");
  });
});
