import { useState, useEffect, useRef, useMemo } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@/lib/auth';
import { useColorScheme } from '@/components/useColorScheme';
import { trpc, createTRPCClient } from '@/lib/trpc';
import { registerForPushNotifications } from '@/lib/notifications';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <RootLayoutNav />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function AuthGate() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const notificationResponseListener = useRef<EventSubscription | null>(null);
  const registerPushToken = trpc.nudges.registerPushToken.useMutation();

  // Auth-based routing
  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isSignedIn, isLoaded, segments]);

  // Register for push notifications once authenticated
  useEffect(() => {
    if (!isSignedIn || !userId) return;

    registerForPushNotifications().then((pushToken) => {
      if (pushToken) {
        registerPushToken.mutate({ userId, pushToken });
      }
    });
  }, [isSignedIn, userId]);

  // Handle notification taps to navigate to the relevant screen
  useEffect(() => {
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as {
          domain?: string;
          nudgeId?: string;
          type?: string;
        };
        if (data.domain) {
          router.push(`/domain/${data.domain}`);
        }
      });

    return () => {
      notificationResponseListener.current?.remove();
    };
  }, []);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="domain/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient());
  const { getToken } = useAuth();

  const trpcClient = useMemo(() => createTRPCClient(getToken), [getToken]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthGate />
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
