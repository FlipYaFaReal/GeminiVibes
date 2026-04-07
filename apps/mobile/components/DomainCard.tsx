import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, domainColors, domainIcons } from "@/lib/theme";

const STATUS_COLORS = {
  healthy: colors.primary,
  drifting: colors.warning,
  neglected: colors.danger,
  unknown: colors.textMuted,
};

const DOMAIN_LABELS: Record<string, string> = {
  family: "Family",
  work: "Work",
  home: "Home",
  relationships: "Relationships",
  faith: "Faith",
  health: "Health",
  growth: "Growth",
};

interface DomainCardProps {
  domain: string;
  status: "healthy" | "drifting" | "neglected" | "unknown";
  lastActivity?: string;
  itemCount: number;
}

export function DomainCard({ domain, status, lastActivity, itemCount }: DomainCardProps) {
  const router = useRouter();
  const label = DOMAIN_LABELS[domain] ?? domain;
  const iconName = domainIcons[domain] ?? "pin-outline";
  const domainColor = domainColors[domain] ?? colors.textSecondary;
  const statusColor = STATUS_COLORS[status];
  const isHealthy = status === "healthy";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isHealthy && styles.healthyGlow,
      ]}
      onPress={() => router.push(`/domain/${domain}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Ionicons name={iconName as any} size={28} color={domainColor} />
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      <Text style={styles.label}>{label}</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    width: "47%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBright,
  },
  healthyGlow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  label: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  itemCount: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  lastActivity: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    marginTop: 6,
  },
});
