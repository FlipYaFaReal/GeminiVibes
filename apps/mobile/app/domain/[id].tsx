import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

const DOMAIN_LABELS: Record<string, string> = {
  family: "Family",
  work: "Work",
  home: "Home",
  relationships: "Relationships",
  faith: "Faith",
  health: "Health",
  growth: "Growth",
};

export default function DomainDrilldown() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const label = DOMAIN_LABELS[id] ?? id;

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: label }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.subtitle}>Recent activity and items</Text>
        </View>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Domain drilldown coming soon — will show stream of items, upcoming
            events, and patterns for {label}.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 28, fontWeight: "700", color: "#1F2937", marginTop: 12 },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  placeholder: {
    padding: 20,
    margin: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  placeholderText: { fontSize: 15, color: "#6B7280", lineHeight: 22 },
});
