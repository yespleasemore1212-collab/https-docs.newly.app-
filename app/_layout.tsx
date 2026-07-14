import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
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
import { AuthProvider } from "@/contexts/AuthContext";
import { COLORS } from "@/constants/Colors";

const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

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
          </AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </DevErrorBoundary>
  );
}
