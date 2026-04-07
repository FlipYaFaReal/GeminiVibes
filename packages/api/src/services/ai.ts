import Anthropic from "@anthropic-ai/sdk";
import { aiTools } from "./ai-tools";
import { buildSystemPrompt, type SystemPromptContext } from "./system-prompt";

const anthropic = new Anthropic();

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  id: string;
}

export interface AIResponse {
  text: string;
  toolCalls: ToolCall[];
}

export async function chat(
  messages: Anthropic.MessageParam[],
  context: SystemPromptContext,
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(context);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    tools: aiTools,
    messages,
  });

  let text = "";
  const toolCalls: ToolCall[] = [];

  for (const block of response.content) {
    if (block.type === "text") {
      text += block.text;
    } else if (block.type === "tool_use") {
      toolCalls.push({
        name: block.name,
        input: block.input as Record<string, unknown>,
        id: block.id,
      });
    }
  }

  return { text, toolCalls };
}
