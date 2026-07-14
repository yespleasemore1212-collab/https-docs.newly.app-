import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, Animated, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MessageCircle, LogIn } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Thread } from '@/types';
import { MOCK_THREADS, timeAgo } from '@/utils/mockData';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useAuth } from '@/contexts/AuthContext';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

function ThreadItem({ thread, index }: { thread: Thread; index: number }) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const timeDisplay = timeAgo(thread.last_message_at);
  const hasUnread = (thread.unread_count ?? 0) > 0;
  const initials = thread.other_user.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const handlePress = () => {
    console.log('[Messages] Opening chat with user:', thread.other_user.id, thread.other_user.name);
    router.push(`/chat/${thread.other_user.id}`);
  };

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AnimatedPressable onPress={handlePress}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.divider,
        }}>
          {/* Avatar */}
          <View style={{ position: 'relative' }}>
            {thread.other_user.image ? (
              <Image
                source={resolveImageSource(thread.other_user.image)}
                style={{ width: 52, height: 52, borderRadius: 26 }}
                contentFit="cover"
              />
            ) : (
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: COLORS.primaryMuted,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: COLORS.primary, fontSize: 18, fontWeight: '700' }}>{initials}</Text>
              </View>
            )}
            {hasUnread && (
              <View style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: COLORS.background,
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                  {thread.unread_count}
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={{
                color: hasUnread ? COLORS.text : COLORS.textSecondary,
                fontSize: 15,
                fontWeight: hasUnread ? '700' : '500',
              }}>
                {thread.other_user.name}
              </Text>
              <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>{timeDisplay}</Text>
            </View>
            <Text
              style={{
                color: hasUnread ? COLORS.textSecondary : COLORS.textTertiary,
                fontSize: 14,
                lineHeight: 20,
              }}
              numberOfLines={1}
            >
              {thread.last_message}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function MessagesScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('[Messages] Loading threads for user:', user.id);
      setTimeout(() => {
        setThreads(MOCK_THREADS);
        setLoading(false);
        console.log('[Messages] Loaded', MOCK_THREADS.length, 'threads');
      }, 400);
    } else {
      setLoading(false);
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          backgroundColor: COLORS.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <MessageCircle size={32} color={COLORS.primary} />
        </View>
        <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          Sign in to view messages
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
          Connect with creators and community members directly.
        </Text>
        <AnimatedPressable onPress={() => {
          console.log('[Messages] Sign in button pressed');
          router.push('/auth');
        }}>
          <View style={{
            backgroundColor: COLORS.primary,
            borderRadius: 14,
            paddingHorizontal: 32,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
            <LogIn size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Sign in</Text>
          </View>
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <FlatList
      data={threads}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => <ThreadItem thread={item} index={index} />}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 16, textAlign: 'center' }}>
            No messages yet. Start a conversation!
          </Text>
        </View>
      }
    />
  );
}
