import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { DomainCard } from "../../components/DomainCard";
import { useAuth } from "@/lib/AuthContext";

const MOCK_DOMAINS = [
  { domain: "family", status: "healthy" as const, lastActivity: "Today", itemCount: 12 },
  { domain: "work", status: "healthy" as const, lastActivity: "Today", itemCount: 8 },
  { domain: "faith", status: "neglected" as const, lastActivity: "12 days ago", itemCount: 2 },
  { domain: "home", status: "drifting" as const, lastActivity: "3 days ago", itemCount: 5 },
  { domain: "relationships", status: "drifting" as const, lastActivity: "5 days ago", itemCount: 3 },
  { domain: "health", status: "neglected" as const, lastActivity: "8 days ago", itemCount: 1 },
  { domain: "growth", status: "unknown" as const, lastActivity: undefined, itemCount: 0 },
];

export default function RadarScreen() {
  const { signOut } = useAuth();
  const healthyCount = MOCK_DOMAINS.filter((d) => d.status === "healthy").length;
  const needsAttention = MOCK_DOMAINS.filter(
    (d) => d.status === "neglected" || d.status === "drifting"
  ).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Life Radar</Text>
            <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {healthyCount} domains healthy — {needsAttention} need attention
          </Text>
        </View>
        <View style={styles.grid}>
          {MOCK_DOMAINS.map((d) => (
            <DomainCard key={d.domain} {...d} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "700", color: "#1F2937" },
  signOutButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#F3F4F6" },
  signOutText: { fontSize: 14, fontWeight: "600", color: "#EF4444" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
