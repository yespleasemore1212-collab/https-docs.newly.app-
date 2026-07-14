import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Users } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Community } from '@/types';
import { formatCount } from '@/utils/mockData';
import { AnimatedPressable } from '@/components/AnimatedPressable';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

interface CommunityCardProps {
  community: Community;
  index?: number;
}

export function CommunityCard({ community, index = 0 }: CommunityCardProps) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const priceText = community.monthly_price
    ? `$${community.monthly_price}/mo`
    : 'Free';
  const memberDisplay = formatCount(community.member_count);
  const creatorName = community.creator?.name || 'Creator';

  const handlePress = () => {
    console.log('[CommunityCard] Navigating to community:', community.id, community.name);
    router.push(`/community/${community.id}`);
  };

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AnimatedPressable onPress={handlePress}>
        <View style={{
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          borderCurve: 'continuous',
          marginHorizontal: 16,
          marginBottom: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: COLORS.border,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          {/* Cover image */}
          <View style={{ height: 120, position: 'relative' }}>
            <Image
              source={resolveImageSource(community.cover_url)}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              backgroundColor: 'rgba(10,10,15,0.6)',
            }} />
            {/* Price badge */}
            <View style={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: COLORS.primary,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                {priceText}
              </Text>
            </View>
          </View>

          <View style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              {/* Avatar */}
              <Image
                source={resolveImageSource(community.avatar_url)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                  marginTop: -28,
                }}
                contentFit="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 2 }} numberOfLines={1}>
                  {community.name}
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                  by {creatorName}
                </Text>
              </View>
            </View>

            <Text
              style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 10 }}
              numberOfLines={2}
            >
              {community.description}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Users size={14} color={COLORS.textTertiary} />
              <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>
                {memberDisplay}
              </Text>
              <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>members</Text>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
