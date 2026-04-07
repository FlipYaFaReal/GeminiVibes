import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { SignIn } from "@clerk/clerk-react";

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

        <View style={styles.clerkContainer}>
          <SignIn />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  logo: { fontSize: 42, fontWeight: "800", color: "#4F46E5", marginBottom: 8 },
  tagline: { fontSize: 18, color: "#6B7280", marginBottom: 48 },
  features: { alignSelf: "stretch", marginBottom: 32 },
  feature: {
    fontSize: 16, color: "#374151", paddingVertical: 8, paddingLeft: 16,
    borderLeftWidth: 3, borderLeftColor: "#4F46E5", marginBottom: 8,
  },
  clerkContainer: { width: "100%", alignItems: "center" },
});
