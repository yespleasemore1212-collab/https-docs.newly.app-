import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { X, Image as ImageIcon, Link } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { AnimatedPressable } from '@/components/AnimatedPressable';

type PostType = 'text' | 'image' | 'video' | 'audio' | 'live';

const POST_TYPES: { type: PostType; label: string; color: string }[] = [
  { type: 'text', label: 'Text', color: COLORS.typeText },
  { type: 'image', label: 'Image', color: COLORS.typeImage },
  { type: 'video', label: 'Video', color: COLORS.typeVideo },
  { type: 'audio', label: 'Audio', color: COLORS.typeAudio },
  { type: 'live', label: 'Live', color: COLORS.typeLive },
];

export default function CreatePostScreen() {
  const { communityId } = useLocalSearchParams<{ communityId: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState<PostType>('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isExclusive, setIsExclusive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Post title is required';
    if (!body.trim()) newErrors.body = 'Post body is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    console.log('[CreatePost] Publish button pressed');
    console.log('[CreatePost] Form data:', { communityId, title, body, postType, mediaUrl, thumbnailUrl, isExclusive });
    if (!validate()) {
      console.log('[CreatePost] Validation failed:', errors);
      return;
    }
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      console.log('[CreatePost] Post published successfully');
      router.back();
    } catch (err) {
      console.error('[CreatePost] Failed to publish post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const showMediaUrl = postType !== 'text';
  const showThumbnail = postType === 'video' || postType === 'live';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen
        options={{
          title: 'Create Post',
          presentation: 'modal',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <AnimatedPressable onPress={() => {
              console.log('[CreatePost] Cancel button pressed');
              router.back();
            }}>
              <View style={{ padding: 4 }}>
                <X size={22} color={COLORS.textSecondary} />
              </View>
            </AnimatedPressable>
          ),
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Post type selector */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Post type
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {POST_TYPES.map(({ type, label, color }) => {
                const isSelected = postType === type;
                return (
                  <AnimatedPressable key={type} onPress={() => {
                    console.log('[CreatePost] Post type selected:', type);
                    setPostType(type);
                  }}>
                    <View style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: isSelected ? `${color}25` : COLORS.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? color : COLORS.border,
                    }}>
                      <Text style={{
                        color: isSelected ? color : COLORS.textSecondary,
                        fontSize: 14,
                        fontWeight: isSelected ? '700' : '500',
                      }}>
                        {label}
                      </Text>
                    </View>
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          {/* Title */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Title <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: errors.title ? COLORS.danger : COLORS.border,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: COLORS.text,
                fontSize: 15,
              }}
              placeholder="Give your post a title..."
              placeholderTextColor={COLORS.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
            {errors.title && (
              <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{errors.title}</Text>
            )}
          </View>

          {/* Body */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Body <Text style={{ color: COLORS.danger }}>*</Text>
            </Text>
            <TextInput
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: errors.body ? COLORS.danger : COLORS.border,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: COLORS.text,
                fontSize: 15,
                minHeight: 120,
                textAlignVertical: 'top',
              }}
              placeholder="Write your post content..."
              placeholderTextColor={COLORS.textTertiary}
              value={body}
              onChangeText={setBody}
              multiline
            />
            {errors.body && (
              <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{errors.body}</Text>
            )}
          </View>

          {/* Media URL */}
          {showMediaUrl && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Media URL
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
                paddingHorizontal: 14,
                gap: 10,
              }}>
                <Link size={18} color={COLORS.textTertiary} />
                <TextInput
                  style={{ flex: 1, color: COLORS.text, fontSize: 15, height: 48 }}
                  placeholder="https://..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={mediaUrl}
                  onChangeText={setMediaUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {/* Thumbnail URL */}
          {showThumbnail && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Thumbnail URL
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
                paddingHorizontal: 14,
                gap: 10,
              }}>
                <ImageIcon size={18} color={COLORS.textTertiary} />
                <TextInput
                  style={{ flex: 1, color: COLORS.text, fontSize: 15, height: 48 }}
                  placeholder="https://..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={thumbnailUrl}
                  onChangeText={setThumbnailUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {/* Exclusive toggle */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 28,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 2 }}>
                Members only
              </Text>
              <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>
                Only paying members can view this post
              </Text>
            </View>
            <Switch
              value={isExclusive}
              onValueChange={(v) => {
                console.log('[CreatePost] Exclusive toggle changed:', v);
                setIsExclusive(v);
              }}
              trackColor={{ false: COLORS.surfaceSecondary, true: COLORS.primary }}
              thumbColor="#fff"
            />
          </View>

          <AnimatedPressable onPress={handlePublish} disabled={submitting}>
            <View style={{
              backgroundColor: COLORS.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: submitting ? 0.7 : 1,
            }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {submitting ? 'Publishing...' : 'Publish post'}
              </Text>
            </View>
          </AnimatedPressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
