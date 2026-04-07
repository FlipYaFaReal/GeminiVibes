import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/lib/theme";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {content}
        </Text>
      </View>
      {timestamp && (
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4, marginHorizontal: 16 },
  userContainer: { alignItems: "flex-end" },
  assistantContainer: { alignItems: "flex-start" },
  bubble: { maxWidth: "80%", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  userBubble: { backgroundColor: colors.userBubble, borderBottomRightRadius: 4 },
  assistantBubble: {
    backgroundColor: colors.aiBubbleBg,
    borderBottomLeftRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.aiBubbleBorder,
  },
  text: { fontSize: 16, lineHeight: 22 },
  userText: { color: "#FFFFFF" },
  assistantText: { color: colors.textPrimary },
  timestamp: { fontSize: 11, marginTop: 2, color: colors.textSecondary },
  userTimestamp: { marginRight: 4 },
  assistantTimestamp: { marginLeft: 4 },
});
