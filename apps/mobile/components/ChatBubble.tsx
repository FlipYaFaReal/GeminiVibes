import { View, Text, StyleSheet } from "react-native";

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
  userBubble: { backgroundColor: "#4F46E5", borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: "#F3F4F6", borderBottomLeftRadius: 4 },
  text: { fontSize: 16, lineHeight: 22 },
  userText: { color: "#FFFFFF" },
  assistantText: { color: "#1F2937" },
  timestamp: { fontSize: 11, marginTop: 2, color: "#9CA3AF" },
  userTimestamp: { marginRight: 4 },
  assistantTimestamp: { marginLeft: 4 },
});
