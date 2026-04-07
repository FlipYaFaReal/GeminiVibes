import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildNudgePrompt } from "../services/nudge-generator";

// Mock external dependencies so unit tests don't touch the DB or Claude API
vi.mock("../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn(),
      };
    },
  };
});

describe("buildNudgePrompt", () => {
  it("includes domain health data in the prompt", () => {
    const prompt = buildNudgePrompt({
      domainHealth: "  - family: healthy (last activity: Today, overdue: 0)",
      overdueItems: "  None",
      upcomingItems: "  None",
      recentNudges: "  None",
    });

    expect(prompt).toContain("family: healthy");
    expect(prompt).toContain("Current domain health:");
  });

  it("includes overdue items in the prompt", () => {
    const prompt = buildNudgePrompt({
      domainHealth: "  - work: drifting",
      overdueItems:
        "  - [work] Finish quarterly report (due: 2026-04-01T00:00:00Z) [high]",
      upcomingItems: "  None",
      recentNudges: "  None",
    });

    expect(prompt).toContain("Finish quarterly report");
    expect(prompt).toContain("Overdue items:");
  });

  it("includes upcoming items in the prompt", () => {
    const prompt = buildNudgePrompt({
      domainHealth: "  - health: healthy",
      overdueItems: "  None",
      upcomingItems:
        "  - [health] Doctor appointment (due: 2026-04-07T14:00:00Z) [medium]",
      recentNudges: "  None",
    });

    expect(prompt).toContain("Doctor appointment");
    expect(prompt).toContain("Upcoming deadlines (next 48h):");
  });

  it("includes recent nudges in the prompt", () => {
    const prompt = buildNudgePrompt({
      domainHealth: "  - faith: neglected",
      overdueItems: "  None",
      upcomingItems: "  None",
      recentNudges:
        "  - [drift_alert] [faith] You haven't logged any faith activities recently",
    });

    expect(prompt).toContain("drift_alert");
    expect(prompt).toContain("don't repeat these");
  });

  it("includes instructions for nudge types", () => {
    const prompt = buildNudgePrompt({
      domainHealth: "",
      overdueItems: "  None",
      upcomingItems: "  None",
      recentNudges: "  None",
    });

    expect(prompt).toContain("time_sensitive");
    expect(prompt).toContain("drift_alert");
    expect(prompt).toContain("opportunity");
    expect(prompt).toContain("Generate 0-3 nudges");
  });

  it("handles empty state gracefully", () => {
    const prompt = buildNudgePrompt({
      domainHealth: "",
      overdueItems: "  None",
      upcomingItems: "  None",
      recentNudges: "  None",
    });

    // Should still be a valid prompt string, not throw
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });
});

describe("generateNudges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is exported as a function", async () => {
    // Dynamic import to verify the module shape
    const mod = await import("../services/nudge-generator");
    expect(typeof mod.generateNudges).toBe("function");
  });

  it("exports buildNudgePrompt as a function", async () => {
    const mod = await import("../services/nudge-generator");
    expect(typeof mod.buildNudgePrompt).toBe("function");
  });
});
