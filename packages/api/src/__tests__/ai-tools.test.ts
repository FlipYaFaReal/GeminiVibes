import { describe, it, expect } from "vitest";
import { aiTools } from "../services/ai-tools";

describe("AI tool definitions", () => {
  it("defines create_event tool", () => {
    const tool = aiTools.find(t => t.name === "create_event");
    expect(tool).toBeDefined();
    expect(tool!.input_schema.properties).toHaveProperty("title");
    expect(tool!.input_schema.properties).toHaveProperty("start");
    expect(tool!.input_schema.properties).toHaveProperty("domain");
  });

  it("defines create_task tool", () => {
    const tool = aiTools.find(t => t.name === "create_task");
    expect(tool).toBeDefined();
    expect(tool!.input_schema.properties).toHaveProperty("title");
    expect(tool!.input_schema.properties).toHaveProperty("priority");
    expect(tool!.input_schema.properties).toHaveProperty("domain");
  });

  it("defines create_nudge tool", () => {
    const tool = aiTools.find(t => t.name === "create_nudge");
    expect(tool).toBeDefined();
    expect(tool!.input_schema.properties).toHaveProperty("message");
    expect(tool!.input_schema.properties).toHaveProperty("type");
  });

  it("defines capture_note tool", () => {
    const tool = aiTools.find(t => t.name === "capture_note");
    expect(tool).toBeDefined();
    expect(tool!.input_schema.properties).toHaveProperty("content");
    expect(tool!.input_schema.properties).toHaveProperty("domain");
  });

  it("all tools have valid domain enum", () => {
    const domains = ["family", "work", "home", "relationships", "faith", "health", "growth"];
    for (const tool of aiTools) {
      const domainProp = (tool.input_schema.properties as any).domain;
      if (domainProp) {
        expect(domainProp.enum).toEqual(domains);
      }
    }
  });
});
