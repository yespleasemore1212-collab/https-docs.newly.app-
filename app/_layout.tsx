import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, Redirect, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { COLORS } from "@/constants/Colors";
import { isOnboardingComplete } from "@/utils/onboardingStorage";

const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function SubscriptionRedirect() {
  const { isSubscribed, loading } = useSubscription();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  // Re-read onboarding completion on every navigation so it stays fresh
  // (e.g. immediately after completeOnboarding() runs).
  useEffect(() => {
    let cancelled = false;
    isOnboardingComplete()
      .then((done) => { if (!cancelled) setOnboardingDone(done); })
      .catch(() => { if (!cancelled) setOnboardingDone(true); });
    return () => { cancelled = true; };
  }, [pathname]);

  // SINGLE source of truth for the gated chain: auth -> onboarding -> paywall -> home.
  // Each step redirects ONLY when the user is not already on it, which prevents
  // redirect loops. This guard OWNS routing for authenticated users — no other
  // guard should send them straight to home, or onboarding/paywall get skipped.
  useEffect(() => {
    if (loading || authLoading || onboardingDone === null) return;

    const onAuthFlow =
      pathname === "/auth" ||
      pathname.startsWith("/auth-popup") ||
      pathname.startsWith("/auth-callback");
    const onOnboarding = pathname.startsWith("/onboarding");
    const onPaywall = pathname === "/paywall";

    if (!user) {
      if (!onAuthFlow) router.replace("/auth");
      return;
    }
    if (!onboardingDone) {
      if (!onOnboarding) router.replace("/onboarding");
      return;
    }
    if (!isSubscribed) {
      if (!onPaywall) router.replace("/paywall");
      return;
    }
    // Fully unlocked — if stranded on a gate screen, proceed to home.
    if (onAuthFlow || onOnboarding || onPaywall) {
      router.replace("/(tabs)/(home)");
    }
  }, [isSubscribed, loading, authLoading, onboardingDone, pathname, user, router]);

  return null;
}

export default function RootLayout() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    isOnboardingComplete().then((complete) => {
      setOnboardingComplete(complete);
    });
  }, [pathname]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (onboardingComplete === null) {
    return null;
  }

  const EliteConnectDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.text,
      border: COLORS.border,
      notification: COLORS.danger,
    },
  };

  const EliteConnectLightTheme: Theme = {
    ...DefaultTheme,
    colors: {
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.text,
      border: COLORS.border,
      notification: COLORS.danger,
    },
  };

  return (
    <DevErrorBoundary>
      <StatusBar style="light" animated />
      <ThemeProvider value={EliteConnectDarkTheme}>
        <SafeAreaProvider>
          <AuthProvider>
        <SubscriptionProvider>
          <SubscriptionRedirect />
            <WidgetProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>

                <Stack
                  screenOptions={{
                    headerStyle: { backgroundColor: COLORS.background },
                    headerTintColor: COLORS.text,
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: COLORS.background },
                  }}
                >
                  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                  <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />

                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
                  <Stack.Screen name="auth-popup" options={{ headerShown: false }} />
                  <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="community/[id]"
                    options={{
                      headerShown: true,
                      headerTransparent: true,
                      headerTintColor: '#fff',
                      headerBackButtonDisplayMode: 'minimal',
                    }}
                  />
                  <Stack.Screen
                    name="post/[id]"
                    options={{
                      headerShown: true,
                      headerStyle: { backgroundColor: COLORS.background },
                      headerTintColor: COLORS.text,
                      headerBackButtonDisplayMode: 'minimal',
                    }}
                  />
                  <Stack.Screen
                    name="create-community"
                    options={{
                      presentation: 'modal',
                      headerShown: true,
                      headerStyle: { backgroundColor: COLORS.background },
                      headerTintColor: COLORS.text,
                    }}
                  />
                  <Stack.Screen
                    name="create-post/[communityId]"
                    options={{
                      presentation: 'modal',
                      headerShown: true,
                      headerStyle: { backgroundColor: COLORS.background },
                      headerTintColor: COLORS.text,
                    }}
                  />
                  <Stack.Screen
                    name="chat/[userId]"
                    options={{
                      headerShown: true,
                      headerStyle: { backgroundColor: COLORS.background },
                      headerTintColor: COLORS.text,
                      headerBackButtonDisplayMode: 'minimal',
                    }}
                  />
                  <Stack.Screen
                    name="creator/[userId]"
                    options={{
                      headerShown: true,
                      headerTransparent: true,
                      headerTintColor: '#fff',
                      headerBackButtonDisplayMode: 'minimal',
                    }}
                  />
                </Stack>
                <SystemBars style="light" />
              </GestureHandlerRootView>
            </WidgetProvider>
          </SubscriptionProvider>
        </AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </DevErrorBoundary>
  );
}
