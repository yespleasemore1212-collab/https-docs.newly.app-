import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  RefreshControl,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Users, TrendingUp } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Community } from '@/types';
import { MOCK_COMMUNITIES, formatCount } from '@/utils/mockData';
import { CommunityCard } from '@/components/CommunityCard';
import { AnimatedPressable } from '@/components/AnimatedPressable';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

function FeaturedCard({ community, index }: { community: Community; index: number }) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const priceText = community.monthly_price ? `$${community.monthly_price}/mo` : 'Free';
  const memberDisplay = formatCount(community.member_count);

  const handlePress = () => {
    console.log('[FeaturedCard] Tapped featured community:', community.id, community.name);
    router.push(`/community/${community.id}`);
  };

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <AnimatedPressable onPress={handlePress}>
        <View style={{
          width: 260,
          height: 160,
          borderRadius: 16,
          borderCurve: 'continuous',
          overflow: 'hidden',
          marginRight: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}>
          <Image
            source={resolveImageSource(community.cover_url)}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          {/* Gradient overlay */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            backgroundColor: 'rgba(10,10,15,0)',
          }} />
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 12,
            backgroundColor: 'rgba(10,10,15,0.7)',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 }} numberOfLines={1}>
                {community.name}
              </Text>
              <View style={{
                backgroundColor: COLORS.primary,
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginLeft: 8,
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{priceText}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Users size={12} color="rgba(255,255,255,0.7)" />
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {memberDisplay} members
              </Text>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCommunities = useCallback(async () => {
    console.log('[Explore] Loading communities...');
    try {
      // Simulate API call with mock data
      await new Promise(r => setTimeout(r, 500));
      setCommunities(MOCK_COMMUNITIES);
      console.log('[Explore] Loaded', MOCK_COMMUNITIES.length, 'communities');
    } catch (err) {
      console.error('[Explore] Failed to load communities:', err);
      setCommunities(MOCK_COMMUNITIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const onRefresh = useCallback(async () => {
    console.log('[Explore] Pull to refresh triggered');
    setRefreshing(true);
    await loadCommunities();
    setRefreshing(false);
  }, [loadCommunities]);

  const featuredCommunities = communities.slice(0, 3);

  const ListHeader = () => (
    <View>
      {/* Featured section */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 14 }}>
          <TrendingUp size={18} color={COLORS.primary} />
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700' }}>Featured</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {featuredCommunities.map((c, i) => (
            <FeaturedCard key={c.id} community={c} index={i} />
          ))}
        </ScrollView>
      </View>

      {/* All communities header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 14 }}>
        <Users size={18} color={COLORS.primary} />
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700' }}>All Communities</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ paddingTop: 120, paddingHorizontal: 16, gap: 12 }}>
          {[0, 1, 2].map(i => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={communities}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => <CommunityCard community={item} index={index} />}
      ListHeaderComponent={<ListHeader />}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ opacity }}>
      <View style={{
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        height: 200,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
      }} />
    </Animated.View>
  );
}
