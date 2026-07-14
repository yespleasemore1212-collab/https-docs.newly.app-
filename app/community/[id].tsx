import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  ImageSourcePropType,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Users, FileText, CheckCircle, Plus, ChevronRight, Lock } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Community, Post } from '@/types';
import { MOCK_COMMUNITIES, MOCK_POSTS, formatCount } from '@/utils/mockData';
import { PostCard } from '@/components/PostCard';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useAuth } from '@/contexts/AuthContext';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningMonthly, setJoiningMonthly] = useState(false);
  const [joiningOneTime, setJoiningOneTime] = useState(false);

  const loadData = useCallback(async () => {
    console.log('[Community] Loading community data for id:', id);
    try {
      await new Promise(r => setTimeout(r, 300));
      const found = MOCK_COMMUNITIES.find(c => c.id === id) || MOCK_COMMUNITIES[0];
      const communityPosts = MOCK_POSTS.filter(p => p.community_id === found.id);
      setCommunity(found);
      setPosts(communityPosts);
      console.log('[Community] Loaded community:', found.name, 'with', communityPosts.length, 'posts');
    } catch (err) {
      console.error('[Community] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleJoinMonthly = async () => {
    console.log('[Community] Join monthly button pressed for community:', id);
    if (!user) {
      router.push('/auth');
      return;
    }
    setJoiningMonthly(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsMember(true);
    setJoiningMonthly(false);
    console.log('[Community] Joined monthly successfully');
  };

  const handleJoinOneTime = async () => {
    console.log('[Community] Join one-time button pressed for community:', id);
    if (!user) {
      router.push('/auth');
      return;
    }
    setJoiningOneTime(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsMember(true);
    setJoiningOneTime(false);
    console.log('[Community] Joined one-time successfully');
  };

  const handleViewCreator = () => {
    if (community?.creator_id) {
      console.log('[Community] View creator profile:', community.creator_id);
      router.push(`/creator/${community.creator_id}`);
    }
  };

  const handleCreatePost = () => {
    console.log('[Community] Create post button pressed for community:', id);
    router.push(`/create-post/${id}`);
  };

  if (loading || !community) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <Stack.Screen options={{ title: '', headerTransparent: true, headerTintColor: '#fff' }} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: COLORS.textSecondary }}>Loading...</Text>
        </View>
      </View>
    );
  }

  const memberDisplay = formatCount(community.member_count);
  const creatorName = community.creator?.name || 'Creator';
  const creatorImage = community.creator?.image;
  const isCreator = user?.id === community.creator_id;

  const ListHeader = () => (
    <View>
      {/* Hero cover */}
      <View style={{ height: 280, position: 'relative' }}>
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
          height: 160,
          backgroundColor: 'rgba(10,10,15,0.8)',
        }} />
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: -60 }}>
        {/* Avatar + name */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginBottom: 16 }}>
          <Image
            source={resolveImageSource(community.avatar_url)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              borderWidth: 3,
              borderColor: COLORS.primary,
            }}
            contentFit="cover"
          />
          <View style={{ flex: 1, paddingBottom: 4 }}>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>
              {community.name}
            </Text>
            {isMember && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#10B98120',
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                alignSelf: 'flex-start',
              }}>
                <CheckCircle size={13} color={COLORS.success} />
                <Text style={{ color: COLORS.success, fontSize: 12, fontWeight: '600' }}>Member</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 16 }}>
          {community.description}
        </Text>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Users size={16} color={COLORS.primary} />
            <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600' }}>{memberDisplay}</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 14 }}>members</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <FileText size={16} color={COLORS.primary} />
            <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600' }}>{community.post_count}</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 14 }}>posts</Text>
          </View>
        </View>

        {/* Creator row */}
        <AnimatedPressable onPress={handleViewCreator}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: COLORS.surface,
            borderRadius: 14,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}>
            {creatorImage ? (
              <Image
                source={resolveImageSource(creatorImage)}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                contentFit="cover"
              />
            ) : (
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: COLORS.primaryMuted,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '700' }}>
                  {creatorName.charAt(0)}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.textTertiary, fontSize: 12, marginBottom: 2 }}>Creator</Text>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600' }}>{creatorName}</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textTertiary} />
          </View>
        </AnimatedPressable>

        {/* Pricing section */}
        {!isMember && !isCreator && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              Join this community
            </Text>
            <View style={{ gap: 10 }}>
              {community.monthly_price && (
                <View style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: COLORS.primaryBorder,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <View>
                    <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 2 }}>
                      Monthly
                    </Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                      Cancel anytime
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Text style={{ color: COLORS.primary, fontSize: 20, fontWeight: '800' }}>
                      ${community.monthly_price}/mo
                    </Text>
                    <AnimatedPressable onPress={handleJoinMonthly} disabled={joiningMonthly}>
                      <View style={{
                        backgroundColor: COLORS.primary,
                        borderRadius: 10,
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                        opacity: joiningMonthly ? 0.7 : 1,
                      }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                          {joiningMonthly ? 'Joining...' : 'Join'}
                        </Text>
                      </View>
                    </AnimatedPressable>
                  </View>
                </View>
              )}
              {community.one_time_price && (
                <View style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <View>
                    <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 2 }}>
                      Lifetime access
                    </Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                      One-time payment
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '800' }}>
                      ${community.one_time_price}
                    </Text>
                    <AnimatedPressable onPress={handleJoinOneTime} disabled={joiningOneTime}>
                      <View style={{
                        backgroundColor: COLORS.surfaceSecondary,
                        borderRadius: 10,
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        opacity: joiningOneTime ? 0.7 : 1,
                      }}>
                        <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '700' }}>
                          {joiningOneTime ? 'Joining...' : 'Buy'}
                        </Text>
                      </View>
                    </AnimatedPressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Posts header */}
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          Posts
        </Text>
      </View>
    </View>
  );

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
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <PostCard post={item} index={index} />}
        ListHeaderComponent={<ListHeader />}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating create post button for creators */}
      {isCreator && (
        <View style={{ position: 'absolute', bottom: 100, right: 20 }}>
          <AnimatedPressable onPress={handleCreatePost}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
            }}>
              <Plus size={24} color="#fff" />
            </View>
          </AnimatedPressable>
        </View>
      )}
    </View>
  );
}
