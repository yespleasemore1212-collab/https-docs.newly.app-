import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Send, ArrowLeft } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Message } from '@/types';
import { MOCK_MESSAGES, MOCK_THREADS, timeAgo } from '@/utils/mockData';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useAuth } from '@/contexts/AuthContext';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

export default function ChatScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const thread = MOCK_THREADS.find(t => t.other_user.id === userId) || MOCK_THREADS[0];
  const otherUser = thread.other_user;
  const myId = user?.id || 'me';

  useEffect(() => {
    console.log('[Chat] Loading messages with user:', userId);
    setMessages(MOCK_MESSAGES);
    console.log('[Chat] Loaded', MOCK_MESSAGES.length, 'messages');
  }, [userId]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Chat] Polling for new messages...');
      // In real app: fetch new messages from API
    }, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim()) return;
    console.log('[Chat] Sending message:', inputText);
    setSending(true);
    const newMessage: Message = {
      id: `m_${Date.now()}`,
      sender_id: myId,
      recipient_id: userId,
      body: inputText.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setSending(false);
    console.log('[Chat] Message sent successfully');
  }, [inputText, myId, userId]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === myId || item.sender_id === 'me';
    const timeDisplay = timeAgo(item.created_at);

    return (
      <View style={{
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 16,
      }}>
        {!isMe && (
          otherUser.image ? (
            <Image
              source={resolveImageSource(otherUser.image)}
              style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0 }}
              contentFit="cover"
            />
          ) : (
            <View style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: COLORS.primaryMuted,
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '700' }}>
                {otherUser.name.charAt(0)}
              </Text>
            </View>
          )
        )}
        <View style={{ maxWidth: '72%' }}>
          <View style={{
            backgroundColor: isMe ? COLORS.primary : COLORS.surface,
            borderRadius: 18,
            borderBottomRightRadius: isMe ? 4 : 18,
            borderBottomLeftRadius: isMe ? 18 : 4,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderWidth: isMe ? 0 : 1,
            borderColor: COLORS.border,
          }}>
            <Text style={{
              color: isMe ? '#fff' : COLORS.text,
              fontSize: 15,
              lineHeight: 21,
            }}>
              {item.body}
            </Text>
          </View>
          <Text style={{
            color: COLORS.textTertiary,
            fontSize: 11,
            marginTop: 4,
            textAlign: isMe ? 'right' : 'left',
          }}>
            {timeDisplay}
          </Text>
        </View>
      </View>
    );
  };

  const otherUserInitials = otherUser.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen
        options={{
          title: otherUser.name,
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () => (
            otherUser.image ? (
              <Image
                source={resolveImageSource(otherUser.image)}
                style={{ width: 32, height: 32, borderRadius: 16 }}
                contentFit="cover"
              />
            ) : (
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: COLORS.primaryMuted,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '700' }}>
                  {otherUserInitials}
                </Text>
              </View>
            )
          ),
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input bar */}
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
              maxHeight: 100,
            }}
            placeholder="Message..."
            placeholderTextColor={COLORS.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <AnimatedPressable onPress={handleSend} disabled={!inputText.trim() || sending}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() ? COLORS.primary : COLORS.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Send size={18} color={inputText.trim() ? '#fff' : COLORS.textTertiary} />
            </View>
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
