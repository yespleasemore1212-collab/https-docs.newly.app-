import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageSourcePropType,
  Alert,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { User, Settings, LogOut, Plus, Users, Heart, Zap, Trash2, FileText, Shield } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { Community } from '@/types';
import { MOCK_COMMUNITIES, MOCK_PROFILE, formatCount } from '@/utils/mockData';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useAuth } from '@/contexts/AuthContext';

const PRIVACY_POLICY_URL = 'https://eliteconnect.app/privacy';
const TERMS_URL = 'https://eliteconnect.app/terms';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

function CommunityRow({ community }: { community: Community }) {
  const router = useRouter();
  const priceText = community.monthly_price ? `$${community.monthly_price}/mo` : 'Free';

  return (
    <AnimatedPressable onPress={() => {
      console.log('[Profile] Navigating to community:', community.id);
      router.push(`/community/${community.id}`);
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
      }}>
        <Image
          source={resolveImageSource(community.avatar_url)}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          contentFit="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '600', marginBottom: 2 }} numberOfLines={1}>
            {community.name}
          </Text>
          <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>
            {formatCount(community.member_count)} members
          </Text>
        </View>
        <View style={{
          backgroundColor: COLORS.primaryMuted,
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}>
          <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600' }}>{priceText}</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function ProfileScreen() {
  const { user, loading: authLoading, signOut, deleteAccount } = useAuth();
  const router = useRouter();
  const [joinedCommunities] = useState<Community[]>(MOCK_COMMUNITIES.slice(0, 2));
  const [myCommunities] = useState<Community[]>([]);
  const isCreator = MOCK_PROFILE.is_creator;

  const handleSignOut = async () => {
    console.log('[Profile] Sign out button pressed');
    await signOut();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? All your data, communities, and memberships will be removed. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            console.log('[Profile] Delete account confirmed');
            try {
              await deleteAccount();
            } catch (err: any) {
              console.error('[Profile] Delete account error:', err.message);
              Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
            }
          },
        },
      ]
    );
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
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: COLORS.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <User size={36} color={COLORS.primary} />
        </View>
        <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
          Your profile
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
          Sign in to access your profile, communities, and exclusive content.
        </Text>
        <AnimatedPressable onPress={() => {
          console.log('[Profile] Sign in button pressed');
          router.push('/auth');
        }}>
          <View style={{
            backgroundColor: COLORS.primary,
            borderRadius: 14,
            paddingHorizontal: 40,
            paddingVertical: 14,
            marginBottom: 12,
          }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Sign in</Text>
          </View>
        </AnimatedPressable>
        <AnimatedPressable onPress={() => {
          console.log('[Profile] Create account button pressed');
          router.push('/auth');
        }}>
          <View style={{
            borderWidth: 1,
            borderColor: COLORS.primaryBorder,
            borderRadius: 14,
            paddingHorizontal: 40,
            paddingVertical: 14,
          }}>
            <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: '600' }}>Create account</Text>
          </View>
        </AnimatedPressable>
      </View>
    );
  }

  const avatarUrl = user.image || MOCK_PROFILE.avatar_url;
  const coverUrl = MOCK_PROFILE.cover_url;
  const username = user.name || user.email?.split('@')[0] || 'User';
  const initials = username.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover image */}
      <View style={{ height: 180, position: 'relative' }}>
        <Image
          source={resolveImageSource(coverUrl)}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          backgroundColor: 'rgba(10,10,15,0.6)',
        }} />
      </View>

      {/* Avatar + info */}
      <View style={{ paddingHorizontal: 20, marginTop: -40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          {avatarUrl ? (
            <Image
              source={resolveImageSource(avatarUrl)}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: COLORS.background,
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
              borderColor: COLORS.background,
            }}>
              <Text style={{ color: COLORS.primary, fontSize: 28, fontWeight: '700' }}>{initials}</Text>
            </View>
          )}
          <AnimatedPressable onPress={() => {
            console.log('[Profile] Edit profile button pressed');
          }}>
            <View style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}>
              <Settings size={15} color={COLORS.textSecondary} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' }}>Edit profile</Text>
            </View>
          </AnimatedPressable>
        </View>

        <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 4 }}>
          {username}
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
          {MOCK_PROFILE.bio}
        </Text>

        {/* Stats */}
        <View style={{
          flexDirection: 'row',
          gap: 20,
          marginBottom: 20,
          paddingVertical: 16,
          paddingHorizontal: 20,
          backgroundColor: COLORS.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Users size={16} color={COLORS.primary} />
              <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '700' }}>
                {joinedCommunities.length}
              </Text>
            </View>
            <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>Communities</Text>
          </View>
          <View style={{ width: 1, backgroundColor: COLORS.border }} />
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Heart size={16} color={COLORS.primary} />
              <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '700' }}>47</Text>
            </View>
            <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>Posts liked</Text>
          </View>
        </View>

        {/* Become a creator */}
        {!isCreator && (
          <AnimatedPressable onPress={() => {
            console.log('[Profile] Become a creator button pressed');
          }}>
            <View style={{
              backgroundColor: COLORS.primaryMuted,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: COLORS.primaryBorder,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Zap size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 2 }}>
                  Become a creator
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>
                  Build your community and monetize your content
                </Text>
              </View>
            </View>
          </AnimatedPressable>
        )}

        {/* My Communities (creator) */}
        {isCreator && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700' }}>My Communities</Text>
              <AnimatedPressable onPress={() => {
                console.log('[Profile] Create community button pressed');
                router.push('/create-community');
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: COLORS.primary,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                }}>
                  <Plus size={14} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Create</Text>
                </View>
              </AnimatedPressable>
            </View>
            {myCommunities.length === 0 ? (
              <View style={{
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                padding: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: COLORS.border,
              }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' }}>
                  You haven't created any communities yet.
                </Text>
              </View>
            ) : (
              <View style={{
                backgroundColor: COLORS.surface,
                borderRadius: 14,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}>
                {myCommunities.map(c => <CommunityRow key={c.id} community={c} />)}
              </View>
            )}
          </View>
        )}

        {/* Joined Communities */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Joined Communities
          </Text>
          {joinedCommunities.length === 0 ? (
            <View style={{
              backgroundColor: COLORS.surface,
              borderRadius: 14,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' }}>
                You haven't joined any communities yet.
              </Text>
            </View>
          ) : (
            <View style={{
              backgroundColor: COLORS.surface,
              borderRadius: 14,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}>
              {joinedCommunities.map(c => <CommunityRow key={c.id} community={c} />)}
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={{
          backgroundColor: COLORS.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: 'hidden',
          marginBottom: 12,
        }}>
          <AnimatedPressable onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.divider,
            }}>
              <Shield size={20} color={COLORS.textSecondary} />
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '500', flex: 1 }}>Privacy Policy</Text>
            </View>
          </AnimatedPressable>
          <AnimatedPressable onPress={() => Linking.openURL(TERMS_URL)}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.divider,
            }}>
              <FileText size={20} color={COLORS.textSecondary} />
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '500', flex: 1 }}>Terms of Service</Text>
            </View>
          </AnimatedPressable>
          <AnimatedPressable onPress={() => {
            console.log('[Profile] Sign out pressed');
            handleSignOut();
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 16,
            }}>
              <LogOut size={20} color={COLORS.danger} />
              <Text style={{ color: COLORS.danger, fontSize: 15, fontWeight: '500' }}>Sign out</Text>
            </View>
          </AnimatedPressable>
        </View>

        {/* Delete account */}
        <View style={{
          backgroundColor: COLORS.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <AnimatedPressable onPress={handleDeleteAccount}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 16,
            }}>
              <Trash2 size={20} color={COLORS.danger} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.danger, fontSize: 15, fontWeight: '500' }}>Delete Account</Text>
                <Text style={{ color: COLORS.textTertiary, fontSize: 12, marginTop: 2 }}>Permanently remove your account and data</Text>
              </View>
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </ScrollView>
  );
}
