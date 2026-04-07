import { View, Text, StyleSheet } from "react-native";

const DOMAIN_COLORS: Record<string, string> = {
  family: "#8B5CF6",
  work: "#3B82F6",
  home: "#F59E0B",
  relationships: "#EC4899",
  faith: "#10B981",
  health: "#EF4444",
  growth: "#6366F1",
};

const DOMAIN_ICONS: Record<string, string> = {
  family: "\u{1F468}\u200D\u{1F467}\u200D\u{1F466}",
  work: "\u{1F4BC}",
  home: "\u{1F3E0}",
  relationships: "\u2764\uFE0F",
  faith: "\u271D\uFE0F",
  health: "\u{1F3C3}",
  growth: "\u{1F331}",
};

interface DomainBadgeProps {
  domain: string;
  size?: "small" | "medium";
}

export function DomainBadge({ domain, size = "small" }: DomainBadgeProps) {
  const color = DOMAIN_COLORS[domain] ?? "#6B7280";
  const icon = DOMAIN_ICONS[domain] ?? "\u{1F4CC}";
  const isSmall = size === "small";

  return (
    <View style={[styles.badge, { backgroundColor: color + "20", borderColor: color }, isSmall && styles.small]}>
      <Text style={[styles.text, { color }, isSmall && styles.smallText]}>
        {icon} {domain}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, alignSelf: "flex-start" },
  small: { paddingHorizontal: 8, paddingVertical: 2 },
  text: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  smallText: { fontSize: 11 },
});
