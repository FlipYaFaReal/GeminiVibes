export const colors = {
  background: "#0B0F1A",      // deep space black-blue
  surface: "#141B2D",          // cards, inputs, elevated
  surfaceBright: "#1E2940",    // hover, selected states
  primary: "#06D6A0",          // aurora teal - primary actions
  secondary: "#9B5DE5",        // aurora purple - secondary accents
  accent: "#00F5D4",           // bright cyan glow
  textPrimary: "#E8ECF4",      // main text - soft white
  textSecondary: "#7B8CA8",    // subtitles, metadata
  textMuted: "#4A5568",        // disabled, placeholder
  danger: "#FF6B6B",           // neglected, overdue
  warning: "#FFD93D",          // drifting
  userBubble: "#9B5DE5",       // user chat messages
  aiBubbleBg: "#1E2940",       // AI chat message background
  aiBubbleBorder: "#06D6A0",   // AI chat message left border
};

export const domainColors: Record<string, string> = {
  family: "#C77DFF",
  work: "#48BFE3",
  home: "#FFD93D",
  relationships: "#FF6B9D",
  faith: "#06D6A0",
  health: "#FF6B6B",
  growth: "#9B5DE5",
};

// Use Ionicons names instead of emojis
export const domainIcons: Record<string, string> = {
  family: "people-outline",
  work: "briefcase-outline",
  home: "home-outline",
  relationships: "heart-outline",
  faith: "star-outline",
  health: "pulse-outline",
  growth: "trending-up-outline",
};
