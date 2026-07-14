import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, ImageSourcePropType, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Video, Headphones, Radio, ImageIcon, FileText, Lock } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Post } from '@/types';
import { timeAgo, formatCount } from '@/utils/mockData';
import { AnimatedPressable } from '@/components/AnimatedPressable';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

const POST_TYPE_CONFIG = {
  video: { label: 'Video', color: COLORS.typeVideo, Icon: Video },
  audio: { label: 'Audio', color: COLORS.typeAudio, Icon: Headphones },
  live: { label: 'Live', color: COLORS.typeLive, Icon: Radio },
  image: { label: 'Image', color: COLORS.typeImage, Icon: ImageIcon },
  text: { label: 'Text', color: COLORS.typeText, Icon: FileText },
};

interface PostCardProps {
  post: Post;
  index?: number;
  showCommunity?: boolean;
  communityName?: string;
  communityAvatar?: string;
}

export function PostCard({ post, index = 0, showCommunity = false, communityName, communityAvatar }: PostCardProps) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }).start();
    Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }).start();
  }, []);

  const typeConfig = POST_TYPE_CONFIG[post.type];
  const hasThumbnail = post.thumbnail_url || (post.type === 'image' && post.media_url);
  const thumbnailUrl = post.thumbnail_url || (post.type === 'image' ? post.media_url : undefined);
  const timeDisplay = timeAgo(post.created_at);
  const likeDisplay = formatCount(post.like_count);
  const commentDisplay = formatCount(post.comment_count);
  const creatorName = post.creator?.name || 'Creator';
  const creatorImage = post.creator?.image;
  const isLive = post.type === 'live';

  const handlePress = () => {
    console.log('[PostCard] Navigating to post:', post.id, post.title);
    router.push(`/post/${post.id}`);
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
          {/* Thumbnail */}
          {hasThumbnail && (
            <View style={{ position: 'relative' }}>
              <Image
                source={resolveImageSource(thumbnailUrl)}
                style={{ width: '100%', height: 180 }}
                contentFit="cover"
              />
              {post.locked && (
                <View style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(10,10,15,0.75)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <View style={{
                    backgroundColor: COLORS.primaryMuted,
                    borderRadius: 50,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: COLORS.primaryBorder,
                  }}>
                    <Lock size={24} color={COLORS.primary} />
                  </View>
                </View>
              )}
              {/* Type badge on thumbnail */}
              <View style={{
                position: 'absolute',
                top: 10,
                right: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}>
                {isLive && (
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: COLORS.typeLive,
                  }} />
                )}
                <typeConfig.Icon size={12} color={typeConfig.color} />
                <Text style={{ color: typeConfig.color, fontSize: 11, fontWeight: '600' }}>
                  {typeConfig.label}
                </Text>
              </View>
            </View>
          )}

          <View style={{ padding: 14 }}>
            {/* Community info row */}
            {showCommunity && communityName && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {communityAvatar && (
                  <Image
                    source={resolveImageSource(communityAvatar)}
                    style={{ width: 18, height: 18, borderRadius: 9 }}
                    contentFit="cover"
                  />
                )}
                <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600' }}>
                  {communityName}
                </Text>
              </View>
            )}

            {/* Type badge (when no thumbnail) */}
            {!hasThumbnail && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: `${typeConfig.color}20`,
                  borderRadius: 20,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}>
                  {isLive && (
                    <View style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: COLORS.typeLive,
                    }} />
                  )}
                  <typeConfig.Icon size={12} color={typeConfig.color} />
                  <Text style={{ color: typeConfig.color, fontSize: 11, fontWeight: '600' }}>
                    {typeConfig.label}
                  </Text>
                </View>
                {post.locked && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: COLORS.primaryMuted,
                    borderRadius: 20,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}>
                    <Lock size={11} color={COLORS.primary} />
                    <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '600' }}>Members only</Text>
                  </View>
                )}
              </View>
            )}

            {/* Title */}
            <Text
              style={{ color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 6, lineHeight: 22 }}
              numberOfLines={2}
            >
              {post.title}
            </Text>

            {/* Creator row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              {creatorImage ? (
                <Image
                  source={resolveImageSource(creatorImage)}
                  style={{ width: 20, height: 20, borderRadius: 10 }}
                  contentFit="cover"
                />
              ) : (
                <View style={{
                  width: 20, height: 20, borderRadius: 10,
                  backgroundColor: COLORS.primaryMuted,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: COLORS.primary, fontSize: 9, fontWeight: '700' }}>
                    {creatorName.charAt(0)}
                  </Text>
                </View>
              )}
              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                {creatorName}
              </Text>
              <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>·</Text>
              <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>
                {timeDisplay}
              </Text>
            </View>

            {/* Stats row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Heart
                  size={15}
                  color={post.liked_by_me ? '#EF4444' : COLORS.textTertiary}
                  fill={post.liked_by_me ? '#EF4444' : 'transparent'}
                />
                <Text style={{ color: COLORS.textTertiary, fontSize: 13, fontVariant: ['tabular-nums'] }}>
                  {likeDisplay}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MessageCircle size={15} color={COLORS.textTertiary} />
                <Text style={{ color: COLORS.textTertiary, fontSize: 13, fontVariant: ['tabular-nums'] }}>
                  {commentDisplay}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}


