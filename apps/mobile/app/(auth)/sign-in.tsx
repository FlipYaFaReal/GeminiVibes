import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";

export default function SignInScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>LifePulse</Text>
        <Text style={styles.tagline}>Your AI-powered life copilot</Text>

        <View style={styles.features}>
          <Text style={styles.feature}>Capture anything in natural language</Text>
          <Text style={styles.feature}>Proactive nudges when things drift</Text>
          <Text style={styles.feature}>See your whole life at a glance</Text>
        </View>

        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your data is private and encrypted. We connect to Google Calendar to help manage your schedule.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  logo: { fontSize: 42, fontWeight: "800", color: "#4F46E5", marginBottom: 8 },
  tagline: { fontSize: 18, color: "#6B7280", marginBottom: 48 },
  features: { alignSelf: "stretch", marginBottom: 48 },
  feature: {
    fontSize: 16, color: "#374151", paddingVertical: 8, paddingLeft: 16,
    borderLeftWidth: 3, borderLeftColor: "#4F46E5", marginBottom: 8,
  },
  googleButton: {
    backgroundColor: "#4F46E5", paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: 12, width: "100%", alignItems: "center",
  },
  googleButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  disclaimer: { fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 24, lineHeight: 18 },
});
