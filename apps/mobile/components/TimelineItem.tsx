import { View, Text, StyleSheet } from "react-native";
import { DomainBadge } from "./DomainBadge";
import { colors } from "@/lib/theme";

interface TimelineItemProps {
  time?: string;
  title: string;
  domain: string;
  type: "event" | "task" | "reminder" | "note";
  priority?: string;
}

export function TimelineItem({ time, title, domain, type, priority }: TimelineItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{time ?? "--:--"}</Text>
      </View>
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text style={[styles.title, priority === "high" && styles.highPriority]}>{title}</Text>
        <View style={styles.meta}>
          <DomainBadge domain={domain} size="small" />
          <Text style={styles.type}>{type}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 12, paddingHorizontal: 16 },
  timeColumn: { width: 52, alignItems: "flex-end", paddingRight: 12 },
  time: { fontSize: 13, color: colors.textSecondary, fontWeight: "500", fontVariant: ["tabular-nums"] },
  dot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary,
    marginTop: 5, marginRight: 12,
    shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  content: { flex: 1 },
  title: { fontSize: 16, color: colors.textPrimary, fontWeight: "500", marginBottom: 4 },
  highPriority: { color: colors.danger },
  meta: { flexDirection: "row", alignItems: "center", gap: 8 },
  type: { fontSize: 12, color: colors.textMuted, textTransform: "capitalize" },
});
