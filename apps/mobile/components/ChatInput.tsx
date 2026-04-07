import { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
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
        style={[styles.input, focused && styles.inputFocused]}
        value={text}
        onChangeText={setText}
        placeholder="What's on your mind?"
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={2000}
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
          color={text.trim() && !disabled ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.surfaceBright, backgroundColor: colors.surface,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120, backgroundColor: colors.surfaceBright,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16,
    color: colors.textPrimary, marginRight: 8, borderWidth: 1, borderColor: "transparent",
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  sendButton: { justifyContent: "center", alignItems: "center", paddingBottom: 2 },
  sendButtonDisabled: { opacity: 0.5 },
});
