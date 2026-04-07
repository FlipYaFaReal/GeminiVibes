import Anthropic from "@anthropic-ai/sdk";

const LIFE_DOMAINS = [
  "family",
  "work",
  "home",
  "relationships",
  "faith",
  "health",
  "growth",
] as const;

const domainProperty = {
  type: "string" as const,
  enum: [...LIFE_DOMAINS],
  description: "The life domain this item belongs to.",
};

export const aiTools: Anthropic.Tool[] = [
  {
    name: "create_event",
    description:
      "Create a calendar event extracted from the user's message. Use when the user mentions a meeting, appointment, date, or any time-bound activity.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "Short, descriptive title for the event.",
        },
        start: {
          type: "string",
          description: "ISO 8601 datetime string for when the event starts.",
        },
        end: {
          type: "string",
          description:
            "ISO 8601 datetime string for when the event ends. Omit if unknown.",
        },
        location: {
          type: "string",
          description: "Location or venue for the event, if mentioned.",
        },
        domain: domainProperty,
        participants: {
          type: "array",
          items: { type: "string" },
          description: "Names of other people involved in this event.",
        },
      },
      required: ["title", "start", "domain"],
    },
  },
  {
    name: "create_task",
    description:
      "Create a task or to-do item extracted from the user's message. Use when the user mentions something they need to do, a chore, an errand, or an action item.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "Clear, actionable title for the task.",
        },
        due: {
          type: "string",
          description:
            "ISO 8601 datetime string for when the task is due, if mentioned.",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Priority level for the task.",
        },
        domain: domainProperty,
        reminder_at: {
          type: "string",
          description:
            "ISO 8601 datetime string for when to remind the user about this task.",
        },
        notes: {
          type: "string",
          description: "Additional context or details about the task.",
        },
      },
      required: ["title", "priority", "domain"],
    },
  },
  {
    name: "create_nudge",
    description:
      "Create a proactive nudge for the user. Use when you notice the user might benefit from a gentle reminder, when they mention time-sensitive information, or when a life domain seems to be drifting.",
    input_schema: {
      type: "object" as const,
      properties: {
        message: {
          type: "string",
          description:
            "The nudge message to deliver to the user. Should be warm and helpful.",
        },
        type: {
          type: "string",
          enum: ["time_sensitive", "drift_alert", "opportunity"],
          description:
            "The type of nudge: time_sensitive for urgent items, drift_alert when a domain is being neglected, opportunity for positive suggestions.",
        },
        domain: domainProperty,
        priority: {
          type: "string",
          enum: ["gentle", "normal", "urgent"],
          description: "How urgently this nudge should be delivered.",
        },
      },
      required: ["message", "type", "domain", "priority"],
    },
  },
  {
    name: "capture_note",
    description:
      "Capture a freeform note or piece of information the user shares. Use when the user shares something worth remembering that is not an event or task.",
    input_schema: {
      type: "object" as const,
      properties: {
        content: {
          type: "string",
          description: "The note content to capture.",
        },
        domain: domainProperty,
      },
      required: ["content", "domain"],
    },
  },
];
