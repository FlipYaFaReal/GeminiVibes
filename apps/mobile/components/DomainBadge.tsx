import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { domainColors, domainIcons } from "@/lib/theme";

interface DomainBadgeProps {
  domain: string;
  size?: "small" | "medium";
}

export function DomainBadge({ domain, size = "small" }: DomainBadgeProps) {
  const color = domainColors[domain] ?? "#7B8CA8";
  const iconName = domainIcons[domain] ?? "pin-outline";
  const isSmall = size === "small";

  return (
    <View style={[styles.badge, { backgroundColor: color + "26", borderColor: color }, isSmall && styles.small]}>
      <Ionicons name={iconName as any} size={isSmall ? 12 : 14} color={color} style={styles.icon} />
      <Text style={[styles.text, { color }, isSmall && styles.smallText]}>
        {domain}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, alignSelf: "flex-start" },
  small: { paddingHorizontal: 8, paddingVertical: 2 },
  icon: { marginRight: 4 },
  text: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  smallText: { fontSize: 11 },
});
