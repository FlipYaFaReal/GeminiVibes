import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const STATUS_COLORS = {
  healthy: "#10B981",
  drifting: "#F59E0B",
  neglected: "#EF4444",
  unknown: "#9CA3AF",
};

const DOMAIN_META: Record<string, { icon: string; label: string }> = {
  family: { icon: "\u{1F468}\u200D\u{1F467}\u200D\u{1F466}", label: "Family" },
  work: { icon: "\u{1F4BC}", label: "Work" },
  home: { icon: "\u{1F3E0}", label: "Home" },
  relationships: { icon: "\u2764\uFE0F", label: "Relationships" },
  faith: { icon: "\u271D\uFE0F", label: "Faith" },
  health: { icon: "\u{1F3C3}", label: "Health" },
  growth: { icon: "\u{1F331}", label: "Growth" },
};

interface DomainCardProps {
  domain: string;
  status: "healthy" | "drifting" | "neglected" | "unknown";
  lastActivity?: string;
  itemCount: number;
}

export function DomainCard({ domain, status, lastActivity, itemCount }: DomainCardProps) {
  const router = useRouter();
  const meta = DOMAIN_META[domain] ?? { icon: "\u{1F4CC}", label: domain };
  const statusColor = STATUS_COLORS[status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/domain/${domain}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{meta.icon}</Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      <Text style={styles.label}>{meta.label}</Text>
      <Text style={styles.itemCount}>{itemCount} items</Text>
      {lastActivity && (
        <Text style={styles.lastActivity}>Last: {lastActivity}</Text>
      )}
      <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    width: "47%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: { fontSize: 28 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  label: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  itemCount: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  lastActivity: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    marginTop: 6,
  },
});
