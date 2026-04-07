import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { TimelineItem } from "../../components/TimelineItem";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/AuthContext";

const MOCK_TODAY = [
  { time: "8:00", title: "Morning devotional", domain: "faith", type: "event" as const },
  { time: "9:00", title: "Team standup", domain: "work", type: "event" as const },
  { time: "10:30", title: "Call mortgage broker re: rate lock", domain: "home", type: "task" as const, priority: "high" },
  { time: "12:00", title: "Lunch \u2014 prep crockpot chili", domain: "health", type: "task" as const },
  { time: "15:00", title: "Emma soccer practice pickup", domain: "family", type: "event" as const, priority: "high" },
  { time: "18:00", title: "Family dinner", domain: "family", type: "event" as const },
  { time: "20:00", title: "Review Q2 initiative roadmap", domain: "work", type: "task" as const },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function TodayScreen() {
  const { userId } = useAuth();
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const { data, isLoading } = trpc.today.items.useQuery(
    { userId: userId! },
    { enabled: !!userId },
  );

  // Use real data when available, fall back to mock data
  const hasRealData = data && data.items.length > 0;
  const items = hasRealData ? data.items : MOCK_TODAY;
  const total = hasRealData ? data.total : MOCK_TODAY.length;
  const needsAttention = hasRealData
    ? data.needsAttention
    : MOCK_TODAY.filter((i) => i.priority === "high").length;

  // Split timed and untimed items
  const timedItems = items.filter((i) => i.time);
  const untimedItems = items.filter((i) => !i.time);

  const greeting = getGreeting();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}, Paul</Text>
          <Text style={styles.date}>{dateStr}</Text>
          <Text style={styles.summary}>
            {isLoading
              ? "Loading today\u2019s items\u2026"
              : `${total} item${total !== 1 ? "s" : ""} today${needsAttention > 0 ? ` \u2014 ${needsAttention} need${needsAttention !== 1 ? "" : "s"} attention` : ""}`}
          </Text>
        </View>
        <View style={styles.timeline}>
          {timedItems.map((item, i) => (
            <TimelineItem
              key={("id" in item ? item.id : null) ?? `timed-${i}`}
              time={item.time ?? undefined}
              title={item.title}
              domain={item.domain}
              type={item.type}
              priority={"priority" in item ? item.priority : undefined}
            />
          ))}
        </View>
        {untimedItems.length > 0 && (
          <View style={styles.anytimeSection}>
            <Text style={styles.anytimeHeader}>Anytime</Text>
            {untimedItems.map((item, i) => (
              <TimelineItem
                key={("id" in item ? item.id : null) ?? `untimed-${i}`}
                time={item.time ?? undefined}
                title={item.title}
                domain={item.domain}
                type={item.type}
                priority={"priority" in item ? item.priority : undefined}
              />
            ))}
          </View>
        )}
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
  anytimeSection: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 12, marginTop: 4 },
  anytimeHeader: { fontSize: 14, fontWeight: "600", color: "#6B7280", paddingHorizontal: 20, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
});
