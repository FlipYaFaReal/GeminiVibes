import { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="What's on your mind?"
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={2000}
        editable={!disabled}
        onSubmitEditing={Platform.OS === "web" ? handleSend : undefined}
        blurOnSubmit={Platform.OS === "web"}
      />
      <TouchableOpacity
        style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Ionicons
          name="arrow-up-circle"
          size={36}
          color={text.trim() && !disabled ? "#4F46E5" : "#D1D5DB"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: "#F9FAFB",
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16,
    color: "#1F2937", marginRight: 8,
  },
  sendButton: { justifyContent: "center", alignItems: "center", paddingBottom: 2 },
  sendButtonDisabled: { opacity: 0.5 },
});
