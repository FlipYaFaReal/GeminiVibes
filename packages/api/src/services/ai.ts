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
  executeToolFn?: (toolCall: ToolCall) => Promise<{ success: boolean; type: string; id?: string }>,
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

  // If Claude only returned tool_use (no text) and we have a tool executor,
  // execute tools and send results back to get a text response
  if (response.stop_reason === "tool_use" && toolCalls.length > 0 && executeToolFn) {
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tc of toolCalls) {
      const result = await executeToolFn(tc);
      toolResults.push({
        type: "tool_result",
        tool_use_id: tc.id,
        content: JSON.stringify(result),
      });
    }

    // Send tool results back to get a conversational response
    const followUp = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      tools: aiTools,
      messages: [
        ...messages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ],
    });

    for (const block of followUp.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }
  }

  // Fallback if still no text
  if (!text && toolCalls.length > 0) {
    const actions = toolCalls.map(tc => tc.name.replace("_", " ")).join(", ");
    text = `Got it — I've noted that down. (${actions})`;
  }

  return { text, toolCalls };
}
