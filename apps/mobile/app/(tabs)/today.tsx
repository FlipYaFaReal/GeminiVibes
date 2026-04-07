import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { TimelineItem } from "../../components/TimelineItem";

const MOCK_TODAY = [
  { time: "8:00", title: "Morning devotional", domain: "faith", type: "event" as const },
  { time: "9:00", title: "Team standup", domain: "work", type: "event" as const },
  { time: "10:30", title: "Call mortgage broker re: rate lock", domain: "home", type: "task" as const, priority: "high" },
  { time: "12:00", title: "Lunch \u2014 prep crockpot chili", domain: "health", type: "task" as const },
  { time: "15:00", title: "Emma soccer practice pickup", domain: "family", type: "event" as const, priority: "high" },
  { time: "18:00", title: "Family dinner", domain: "family", type: "event" as const },
  { time: "20:00", title: "Review Q2 initiative roadmap", domain: "work", type: "task" as const },
];

export default function TodayScreen() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, Paul</Text>
          <Text style={styles.date}>{dateStr}</Text>
          <Text style={styles.summary}>7 items today — 2 need attention</Text>
        </View>
        <View style={styles.timeline}>
          {MOCK_TODAY.map((item, i) => (
            <TimelineItem key={i} {...item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  greeting: { fontSize: 28, fontWeight: "700", color: "#1F2937" },
  date: { fontSize: 16, color: "#6B7280", marginTop: 4 },
  summary: { fontSize: 14, color: "#4F46E5", marginTop: 8, fontWeight: "500" },
  timeline: { paddingVertical: 8 },
});
