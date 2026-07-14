import React from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import { Stack } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import { COLORS } from '@/constants/Colors';
import { useSubscriptionGuard } from "@/hooks/useSubscriptionGuard";

const TABS = [
  {
    name: '(home)',
    route: '/(tabs)/(home)' as const,
    icon: 'explore' as const,
    label: 'Explore',
  },
  {
    name: 'feed',
    route: '/(tabs)/feed' as const,
    icon: 'dynamic_feed' as const,
    label: 'My Feed',
  },
  {
    name: 'messages',
    route: '/(tabs)/messages' as const,
    icon: 'chat-bubble' as const,
    label: 'Messages',
  },
  {
    name: 'profile',
    route: '/(tabs)/profile' as const,
    icon: 'person' as const,
    label: 'Profile',
  },
];

export default function TabLayout() {
  useSubscriptionGuard();

  const pathname = usePathname();

  // Hide tab bar on certain screens
  const hideTabBar = pathname.includes('/chat/') || pathname.includes('/post/');

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="profile" />
      </Stack>
      {!hideTabBar && (
        <FloatingTabBar
          tabs={TABS}
          containerWidth={340}
          borderRadius={35}
          bottomMargin={20}
        />
      )}
    </View>
  );
}
