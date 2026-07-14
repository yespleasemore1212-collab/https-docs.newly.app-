import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ImageSourcePropType,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Heart, MessageCircle, Send, Lock, Radio, Play, Pause } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Post, Comment } from '@/types';
import { MOCK_POSTS, MOCK_COMMENTS, timeAgo, formatCount } from '@/utils/mockData';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useAuth } from '@/contexts/AuthContext';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

function CommentCard({ comment, index }: { comment: Comment; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const timeDisplay = timeAgo(comment.created_at);
  const userName = comment.user?.name || 'User';
  const userImage = comment.user?.image;
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        {userImage ? (
          <Image
            source={resolveImageSource(userImage)}
            style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0 }}
            contentFit="cover"
          />
        ) : (
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: COLORS.primaryMuted,
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '700' }}>{initials}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }}>{userName}</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>{timeDisplay}</Text>
          </View>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 }}>
            {comment.body}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function AudioPlayer({ mediaUrl }: { mediaUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    console.log('[PostDetail] Audio player toggle:', isPlaying ? 'pause' : 'play');
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 1) { setIsPlaying(false); return 0; }
          return p + 0.005;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const progressPercent = Math.round(progress * 100);
  const durationDisplay = '3:42';
  const currentDisplay = `${Math.floor(progress * 222 / 60)}:${String(Math.floor(progress * 222 % 60)).padStart(2, '0')}`;

  return (
    <View style={{
      backgroundColor: COLORS.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <AnimatedPressable onPress={togglePlay}>
          <View style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isPlaying ? <Pause size={22} color="#fff" /> : <Play size={22} color="#fff" />}
          </View>
        </AnimatedPressable>
        <View style={{ flex: 1 }}>
          <View style={{
            height: 4,
            backgroundColor: COLORS.surfaceSecondary,
            borderRadius: 2,
            marginBottom: 8,
          }}>
            <View style={{
              height: '100%',
              width: `${progressPercent}%` as `${number}%`,
              backgroundColor: COLORS.primary,
              borderRadius: 2,
            }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>{currentDisplay}</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>{durationDisplay}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('[PostDetail] Loading post:', id);
    setTimeout(() => {
      const found = MOCK_POSTS.find(p => p.id === id) || MOCK_POSTS[0];
      const postComments = MOCK_COMMENTS.filter(c => c.post_id === found.id);
      setPost(found);
      setComments(postComments);
      setLiked(found.liked_by_me || false);
      setLikeCount(found.like_count);
      setLoading(false);
      console.log('[PostDetail] Loaded post:', found.title);
    }, 300);
  }, [id]);

  const handleLike = useCallback(() => {
    console.log('[PostDetail] Like button pressed, current state:', liked);
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  }, [liked]);

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim()) return;
    console.log('[PostDetail] Sending comment:', commentText);
    if (!user) {
      router.push('/auth');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    const newComment: Comment = {
      id: `cm_${Date.now()}`,
      post_id: id,
      user_id: user.id,
      body: commentText.trim(),
      like_count: 0,
      user: { id: user.id, name: user.name || 'You', image: user.image || '' },
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    setCommentText('');
    setSubmitting(false);
    console.log('[PostDetail] Comment sent successfully');
  }, [commentText, user, id, router]);

  if (loading || !post) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ title: '' }} />
        <Text style={{ color: COLORS.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const timeDisplay = timeAgo(post.created_at);
  const likeDisplay = formatCount(likeCount);
  const commentDisplay = formatCount(comments.length);
  const creatorName = post.creator?.name || 'Creator';
  const creatorImage = post.creator?.image;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen
        options={{
          title: post.title,
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Media section */}
          {post.locked ? (
            <View style={{
              margin: 16,
              height: 200,
              backgroundColor: COLORS.surface,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}>
              <View style={{
                backgroundColor: COLORS.primaryMuted,
                borderRadius: 50,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.primaryBorder,
              }}>
                <Lock size={28} color={COLORS.primary} />
              </View>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
                Members only
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>
                Join this community to access exclusive content
              </Text>
              <AnimatedPressable onPress={() => {
                console.log('[PostDetail] Join community CTA pressed');
                router.back();
              }}>
                <View style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 10,
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  marginTop: 14,
                }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Join community</Text>
                </View>
              </AnimatedPressable>
            </View>
          ) : (
            <>
              {post.type === 'image' && post.media_url && (
                <Image
                  source={resolveImageSource(post.media_url)}
                  style={{ width: '100%', height: 280 }}
                  contentFit="cover"
                />
              )}
              {post.type === 'video' && post.media_url && (
                <View style={{
                  margin: 16,
                  height: 220,
                  backgroundColor: COLORS.surface,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  overflow: 'hidden',
                }}>
                  {post.thumbnail_url && (
                    <Image
                      source={resolveImageSource(post.thumbnail_url)}
                      style={{ width: '100%', height: '100%', position: 'absolute' }}
                      contentFit="cover"
                    />
                  )}
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 50,
                    padding: 16,
                  }}>
                    <Play size={32} color="#fff" />
                  </View>
                  <View style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    backgroundColor: COLORS.typeVideo + '30',
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}>
                    <Text style={{ color: COLORS.typeVideo, fontSize: 12, fontWeight: '600' }}>Video</Text>
                  </View>
                </View>
              )}
              {post.type === 'audio' && post.media_url && (
                <AudioPlayer mediaUrl={post.media_url} />
              )}
              {post.type === 'live' && (
                <View style={{
                  margin: 16,
                  height: 160,
                  backgroundColor: COLORS.surface,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: `${COLORS.typeLive}40`,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.typeLive }} />
                    <Radio size={20} color={COLORS.typeLive} />
                    <Text style={{ color: COLORS.typeLive, fontSize: 16, fontWeight: '700' }}>LIVE</Text>
                  </View>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Live stream in progress</Text>
                </View>
              )}
            </>
          )}

          {/* Post content */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '800', lineHeight: 30, marginBottom: 12 }}>
              {post.title}
            </Text>

            {/* Creator + time */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              {creatorImage ? (
                <Image
                  source={resolveImageSource(creatorImage)}
                  style={{ width: 32, height: 32, borderRadius: 16 }}
                  contentFit="cover"
                />
              ) : (
                <View style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: COLORS.primaryMuted,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '700' }}>
                    {creatorName.charAt(0)}
                  </Text>
                </View>
              )}
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' }}>{creatorName}</Text>
              <Text style={{ color: COLORS.textTertiary, fontSize: 14 }}>·</Text>
              <Text style={{ color: COLORS.textTertiary, fontSize: 14 }}>{timeDisplay}</Text>
            </View>

            {/* Body */}
            {!post.locked && (
              <Text style={{ color: COLORS.textSecondary, fontSize: 15, lineHeight: 24, marginBottom: 20 }} selectable>
                {post.body}
              </Text>
            )}

            {/* Like + comment row */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: COLORS.divider,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.divider,
              marginBottom: 24,
            }}>
              <AnimatedPressable onPress={handleLike}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Heart
                    size={22}
                    color={liked ? '#EF4444' : COLORS.textSecondary}
                    fill={liked ? '#EF4444' : 'transparent'}
                  />
                  <Text style={{ color: liked ? '#EF4444' : COLORS.textSecondary, fontSize: 15, fontVariant: ['tabular-nums'] }}>
                    {likeDisplay}
                  </Text>
                </View>
              </AnimatedPressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={22} color={COLORS.textSecondary} />
                <Text style={{ color: COLORS.textSecondary, fontSize: 15, fontVariant: ['tabular-nums'] }}>
                  {commentDisplay}
                </Text>
              </View>
            </View>

            {/* Comments */}
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
              Comments
            </Text>
            {comments.map((c, i) => (
              <CommentCard key={c.id} comment={c} index={i} />
            ))}
            {comments.length === 0 && (
              <Text style={{ color: COLORS.textTertiary, fontSize: 14, textAlign: 'center', paddingVertical: 20 }}>
                No comments yet. Be the first!
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Comment input */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: COLORS.divider,
          backgroundColor: COLORS.background,
        }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: COLORS.surface,
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: COLORS.text,
              fontSize: 15,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.textTertiary}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <AnimatedPressable onPress={handleSendComment} disabled={!commentText.trim() || submitting}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: commentText.trim() ? COLORS.primary : COLORS.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Send size={18} color={commentText.trim() ? '#fff' : COLORS.textTertiary} />
            </View>
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
