import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Stack } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff, X } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedPressable } from '@/components/AnimatedPressable';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

function AppleLogo({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
    </Svg>
  );
}

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107" />
      <Path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00" />
      <Path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50" />
      <Path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2" />
    </Svg>
  );
}

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithApple, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'apple' | 'google' | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (user && !loading) {
      console.log('[Auth] User authenticated, navigating to tabs');
      router.replace('/(tabs)/(home)');
    }
  }, [user, loading, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode === 'signup' && !name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async () => {
    console.log('[Auth] Email auth button pressed, mode:', mode);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        console.log('[Auth] Signing in with email:', email);
        await signInWithEmail(email, password);
      } else {
        console.log('[Auth] Signing up with email:', email, 'name:', name);
        await signUpWithEmail(email, password, name);
      }
    } catch (err: any) {
      console.error('[Auth] Email auth failed:', err);
      setErrors({ general: err.message || 'Authentication failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApple = async () => {
    console.log('[Auth] Apple sign in button pressed');
    setSocialLoading('apple');
    try {
      await signInWithApple();
    } catch (err: any) {
      console.error('[Auth] Apple sign in failed:', err);
      if (err.message !== 'Authentication cancelled') {
        setErrors({ general: err.message || 'Apple sign in failed' });
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGoogle = async () => {
    console.log('[Auth] Google sign in button pressed');
    setSocialLoading('google');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('[Auth] Google sign in failed:', err);
      setErrors({ general: err.message || 'Google sign in failed' });
    } finally {
      setSocialLoading(null);
    }
  };

  const switchMode = () => {
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    console.log('[Auth] Switching mode to:', newMode);
    setMode(newMode);
    setErrors({});
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: COLORS.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <AnimatedPressable onPress={() => {
              console.log('[Auth] Close button pressed');
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
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Logo + heading */}
            <View style={{ alignItems: 'center', paddingTop: 20, marginBottom: 36 }}>
              <View style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: COLORS.primaryMuted,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: COLORS.primaryBorder,
              }}>
                <Text style={{ fontSize: 32 }}>⚡</Text>
              </View>
              <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 }}>
                {mode === 'signin' ? 'Welcome back' : 'Join Elite Connect'}
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
                {mode === 'signin'
                  ? 'Sign in to access your communities'
                  : 'Create an account to get started'}
              </Text>
            </View>

            {/* Social buttons */}
            <View style={{ gap: 12, marginBottom: 24 }}>
              {/* Apple */}
              <AnimatedPressable onPress={handleApple} disabled={!!socialLoading}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  paddingVertical: 14,
                  opacity: socialLoading === 'apple' ? 0.7 : 1,
                }}>
                  <AppleLogo size={20} color="#000" />
                  <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>
                    {socialLoading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
                  </Text>
                </View>
              </AnimatedPressable>

              {/* Google */}
              <AnimatedPressable onPress={handleGoogle} disabled={!!socialLoading}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: COLORS.surface,
                  borderRadius: 14,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  opacity: socialLoading === 'google' ? 0.7 : 1,
                }}>
                  <GoogleLogo size={20} />
                  <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '600' }}>
                    {socialLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
                  </Text>
                </View>
              </AnimatedPressable>
            </View>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
              <Text style={{ color: COLORS.textTertiary, fontSize: 13 }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
            </View>

            {/* General error */}
            {errors.general && (
              <View style={{
                backgroundColor: `${COLORS.danger}15`,
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: `${COLORS.danger}30`,
              }}>
                <Text style={{ color: COLORS.danger, fontSize: 14 }}>{errors.general}</Text>
              </View>
            )}

            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                  Full name
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: COLORS.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: errors.name ? COLORS.danger : COLORS.border,
                  paddingHorizontal: 14,
                  gap: 10,
                }}>
                  <User size={18} color={COLORS.textTertiary} />
                  <TextInput
                    style={{ flex: 1, color: COLORS.text, fontSize: 15, height: 50 }}
                    placeholder="Your full name"
                    placeholderTextColor={COLORS.textTertiary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name && <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{errors.name}</Text>}
              </View>
            )}

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                Email address
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: errors.email ? COLORS.danger : COLORS.border,
                paddingHorizontal: 14,
                gap: 10,
              }}>
                <Mail size={18} color={COLORS.textTertiary} />
                <TextInput
                  style={{ flex: 1, color: COLORS.text, fontSize: 15, height: 50 }}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                Password
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: errors.password ? COLORS.danger : COLORS.border,
                paddingHorizontal: 14,
                gap: 10,
              }}>
                <Lock size={18} color={COLORS.textTertiary} />
                <TextInput
                  style={{ flex: 1, color: COLORS.text, fontSize: 15, height: 50 }}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                  placeholderTextColor={COLORS.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <AnimatedPressable onPress={() => {
                  console.log('[Auth] Toggle password visibility');
                  setShowPassword(!showPassword);
                }}>
                  <View style={{ padding: 4 }}>
                    {showPassword ? (
                      <EyeOff size={18} color={COLORS.textTertiary} />
                    ) : (
                      <Eye size={18} color={COLORS.textTertiary} />
                    )}
                  </View>
                </AnimatedPressable>
              </View>
              {errors.password && <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{errors.password}</Text>}
            </View>

            {/* Submit button */}
            <AnimatedPressable onPress={handleEmailAuth} disabled={submitting}>
              <View style={{
                backgroundColor: COLORS.primary,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 20,
                opacity: submitting ? 0.7 : 1,
              }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                  {submitting
                    ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                    : (mode === 'signin' ? 'Sign in' : 'Create account')}
                </Text>
              </View>
            </AnimatedPressable>

            {/* Switch mode */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 15 }}>
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <AnimatedPressable onPress={switchMode}>
                <Text style={{ color: COLORS.primary, fontSize: 15, fontWeight: '600' }}>
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </Text>
              </AnimatedPressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
