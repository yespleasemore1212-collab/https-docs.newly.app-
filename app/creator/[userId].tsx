import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Users, MessageCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Profile, Community } from '@/types';
import { MOCK_CREATOR_PROFILES, MOCK_COMMUNITIES, formatCount } from '@/utils/mockData';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { CommunityCard } from '@/components/CommunityCard';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

export default function CreatorProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[CreatorProfile] Loading creator profile for userId:', userId);
    setTimeout(() => {
      const found = MOCK_CREATOR_PROFILES[userId] || MOCK_CREATOR_PROFILES['u1'];
      const creatorCommunities = MOCK_COMMUNITIES.filter(c => c.creator_id === userId);
      setProfile(found);
      setCommunities(creatorCommunities);
      setLoading(false);
      console.log('[CreatorProfile] Loaded profile:', found.username);
    }, 300);
  }, [userId]);

  const handleMessage = () => {
    console.log('[CreatorProfile] Message creator button pressed:', userId);
    router.push(`/chat/${userId}`);
  };

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerTintColor: '#fff' }} />
        <Text style={{ color: COLORS.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const followerDisplay = formatCount(profile.follower_count);
  const initials = profile.username.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerTintColor: '#fff',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Cover */}
        <View style={{ height: 220, position: 'relative' }}>
          <Image
            source={resolveImageSource(profile.cover_url)}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            backgroundColor: 'rgba(10,10,15,0.7)',
          }} />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: -50 }}>
          {/* Avatar + action */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
            {profile.avatar_url ? (
              <Image
                source={resolveImageSource(profile.avatar_url)}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 3,
                  borderColor: COLORS.primary,
                }}
                contentFit="cover"
              />
            ) : (
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: COLORS.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: COLORS.primary,
              }}>
                <Text style={{ color: COLORS.primary, fontSize: 28, fontWeight: '700' }}>{initials}</Text>
              </View>
            )}
            <AnimatedPressable onPress={handleMessage}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: COLORS.surface,
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}>
                <MessageCircle size={16} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>Message</Text>
              </View>
            </AnimatedPressable>
          </View>

          {/* Name + bio */}
          <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 6 }}>
            {profile.username}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 16 }}>
            {profile.bio}
          </Text>

          {/* Follower count */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 28 }}>
            <Users size={16} color={COLORS.primary} />
            <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700' }}>{followerDisplay}</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 15 }}>followers</Text>
          </View>

          {/* Communities */}
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 14 }}>
            Communities
          </Text>
          {communities.length === 0 ? (
            <View style={{
              backgroundColor: COLORS.surface,
              borderRadius: 14,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>No communities yet</Text>
            </View>
          ) : (
            communities.map((c, i) => (
              <CommunityCard key={c.id} community={c} index={i} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
