import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { DomainCard } from "../../components/DomainCard";
import { useAuth } from "@clerk/clerk-react";
import { trpc } from "@/lib/trpc";
import { colors } from "@/lib/theme";

const FALLBACK_DOMAINS = [
  { domain: "family", status: "unknown" as const, lastActivity: undefined, itemCount: 0, overdueCount: 0 },
  { domain: "work", status: "unknown" as const, lastActivity: undefined, itemCount: 0, overdueCount: 0 },
  { domain: "faith", status: "unknown" as const, lastActivity: undefined, itemCount: 0, overdueCount: 0 },
  { domain: "home", status: "unknown" as const, lastActivity: undefined, itemCount: 0, overdueCount: 0 },
  { domain: "relationships", status: "unknown" as const, lastActivity: undefined, itemCount: 0, overdueCount: 0 },
  { domain: "health", status: "unknown" as const, lastActivity: undefined, itemCount: 0, overdueCount: 0 },
  { domain: "growth", status: "unknown" as const, lastActivity: undefined, itemCount: 0, overdueCount: 0 },
];

export default function RadarScreen() {
  const { signOut, userId } = useAuth();

  const { data: domains, isLoading, isError } = trpc.domains.health.useQuery(
    { userId: userId! },
    { enabled: !!userId },
  );

  const displayDomains = domains ?? FALLBACK_DOMAINS;

  const healthyCount = displayDomains.filter((d) => d.status === "healthy").length;
  const needsAttention = displayDomains.filter(
    (d) => d.status === "neglected" || d.status === "drifting"
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Life Radar</Text>
            <TouchableOpacity onPress={() => signOut()} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {healthyCount} domains healthy — {needsAttention} need attention
          </Text>
        </View>
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading domain health...</Text>
          </View>
        )}
        <View style={styles.grid}>
          {displayDomains.map((d) => (
            <DomainCard key={d.domain} domain={d.domain} status={d.status} lastActivity={d.lastActivity ?? undefined} itemCount={d.itemCount} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "700", color: colors.textPrimary },
  signOutButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surfaceBright },
  signOutText: { fontSize: 14, fontWeight: "600", color: colors.danger },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  loading: { alignItems: "center", paddingVertical: 32 },
  loadingText: { fontSize: 14, color: colors.textSecondary, marginTop: 8 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
