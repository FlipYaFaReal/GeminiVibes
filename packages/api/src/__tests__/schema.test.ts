import { describe, it, expect } from "vitest";
import { getTableName } from "drizzle-orm";
import * as schema from "../db/schema";

describe("Database schema", () => {
  it("exports users table", () => {
    expect(schema.users).toBeDefined();
    expect(getTableName(schema.users)).toBe("users");
  });

  it("exports life_items table", () => {
    expect(schema.lifeItems).toBeDefined();
    expect(getTableName(schema.lifeItems)).toBe("life_items");
  });

  it("exports messages table", () => {
    expect(schema.messages).toBeDefined();
    expect(getTableName(schema.messages)).toBe("messages");
  });

  it("exports nudges table", () => {
    expect(schema.nudges).toBeDefined();
    expect(getTableName(schema.nudges)).toBe("nudges");
  });

  it("exports conversation_summaries table", () => {
    expect(schema.conversationSummaries).toBeDefined();
    expect(getTableName(schema.conversationSummaries)).toBe("conversation_summaries");
  });

  it("exports domain enum with all 7 domains", () => {
    expect(schema.lifeDomainEnum.enumValues).toEqual([
      "family", "work", "home", "relationships", "faith", "health", "growth"
    ]);
  });
});
