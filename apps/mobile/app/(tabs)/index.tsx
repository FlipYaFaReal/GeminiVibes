import { useState, useRef, useCallback } from "react";
import {
  View, FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  SafeAreaView, Text,
} from "react-native";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@clerk/clerk-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function ChatScreen() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm LifePulse, your personal life copilot. Tell me what's going on — I'll help you stay on top of things.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setSending(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I had trouble processing that. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setSending(false);
    },
  });

  const handleSend = useCallback((text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    sendMutation.mutate({
      userId: userId!,
      message: text,
    });
  }, [sendMutation]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LifePulse</Text>
          <Text style={styles.headerSubtitle}>Your life copilot</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble role={item.role} content={item.content} timestamp={item.createdAt} />
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <ChatInput onSend={handleSend} disabled={sending} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#1F2937" },
  headerSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  messageList: { paddingVertical: 12 },
});
