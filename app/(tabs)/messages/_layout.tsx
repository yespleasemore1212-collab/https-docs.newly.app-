import { Stack } from 'expo-router';
import { COLORS } from '@/constants/Colors';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Messages',
          headerLargeTitle: true,
          headerLargeTitleStyle: { color: COLORS.text },
        }}
      />
    </Stack>
  );
}
