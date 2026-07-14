import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Rss, LogIn } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Post } from '@/types';
import { MOCK_POSTS, MOCK_COMMUNITIES } from '@/utils/mockData';
import { PostCard } from '@/components/PostCard';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useAuth } from '@/contexts/AuthContext';

export default function FeedScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    console.log('[Feed] Loading feed posts...');
    try {
      await new Promise(r => setTimeout(r, 400));
      // Show posts from first 2 communities as "joined"
      const feedPosts = MOCK_POSTS.filter(p => ['c1', 'c2'].includes(p.community_id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setPosts(feedPosts);
      console.log('[Feed] Loaded', feedPosts.length, 'posts');
    } catch (err) {
      console.error('[Feed] Failed to load feed:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadFeed();
    } else {
      setLoading(false);
    }
  }, [user, loadFeed]);

  const onRefresh = useCallback(async () => {
    console.log('[Feed] Pull to refresh triggered');
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [loadFeed]);

  const getCommunityForPost = (post: Post) => {
    return MOCK_COMMUNITIES.find(c => c.id === post.community_id);
  };

  if (authLoading) {
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
          <Rss size={32} color={COLORS.primary} />
        </View>
        <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          Sign in to see your feed
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
          Join communities and get exclusive content from your favorite creators.
        </Text>
        <AnimatedPressable onPress={() => {
          console.log('[Feed] Sign in button pressed');
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

  if (!loading && posts.length === 0) {
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
          <Rss size={32} color={COLORS.primary} />
        </View>
        <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          Your feed is empty
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
          Join communities to see their posts here.
        </Text>
        <AnimatedPressable onPress={() => {
          console.log('[Feed] Browse communities button pressed');
          router.push('/(tabs)/(home)');
        }}>
          <View style={{
            backgroundColor: COLORS.primary,
            borderRadius: 14,
            paddingHorizontal: 32,
            paddingVertical: 14,
          }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Browse communities</Text>
          </View>
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => {
        const community = getCommunityForPost(item);
        return (
          <PostCard
            post={item}
            index={index}
            showCommunity
            communityName={community?.name}
            communityAvatar={community?.avatar_url}
          />
        );
      }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
