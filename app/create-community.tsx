import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X, Image as ImageIcon, DollarSign, Users } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface FormField {
  label: string;
  value: string;
  placeholder: string;
  key: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'url';
  required?: boolean;
}

export default function CreateCommunityScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [oneTimePrice, setOneTimePrice] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Community name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (monthlyPrice && isNaN(Number(monthlyPrice))) newErrors.monthlyPrice = 'Enter a valid price';
    if (oneTimePrice && isNaN(Number(oneTimePrice))) newErrors.oneTimePrice = 'Enter a valid price';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    console.log('[CreateCommunity] Create community button pressed');
    console.log('[CreateCommunity] Form data:', { name, description, monthlyPrice, oneTimePrice, coverUrl, avatarUrl });
    if (!validate()) {
      console.log('[CreateCommunity] Validation failed:', errors);
      return;
    }
    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      console.log('[CreateCommunity] Community created successfully');
      router.back();
    } catch (err) {
      console.error('[CreateCommunity] Failed to create community:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline,
    keyboardType,
    required,
    error,
    icon,
  }: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric' | 'url';
    required?: boolean;
    error?: string;
    icon?: React.ReactNode;
  }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}{required && <Text style={{ color: COLORS.danger }}> *</Text>}
      </Text>
      <View style={{
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: error ? COLORS.danger : COLORS.border,
        paddingHorizontal: 14,
        paddingVertical: multiline ? 12 : 0,
        gap: 10,
      }}>
        {icon && <View style={{ paddingTop: multiline ? 2 : 0 }}>{icon}</View>}
        <TextInput
          style={{
            flex: 1,
            color: COLORS.text,
            fontSize: 15,
            minHeight: multiline ? 80 : 48,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textTertiary}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType || 'default'}
        />
      </View>
      {error && (
        <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen
        options={{
          title: 'Create Community',
          presentation: 'modal',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <AnimatedPressable onPress={() => {
              console.log('[CreateCommunity] Cancel button pressed');
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
          <InputField
            label="Community name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Fitness with Alex"
            required
            error={errors.name}
            icon={<Users size={18} color={COLORS.textTertiary} />}
          />
          <InputField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what your community is about..."
            multiline
            required
            error={errors.description}
          />
          <InputField
            label="Monthly price (USD)"
            value={monthlyPrice}
            onChangeText={setMonthlyPrice}
            placeholder="e.g. 19.99 (leave blank for free)"
            keyboardType="numeric"
            error={errors.monthlyPrice}
            icon={<DollarSign size={18} color={COLORS.textTertiary} />}
          />
          <InputField
            label="One-time price (USD)"
            value={oneTimePrice}
            onChangeText={setOneTimePrice}
            placeholder="e.g. 149.99 (leave blank to skip)"
            keyboardType="numeric"
            error={errors.oneTimePrice}
            icon={<DollarSign size={18} color={COLORS.textTertiary} />}
          />
          <InputField
            label="Cover image URL"
            value={coverUrl}
            onChangeText={setCoverUrl}
            placeholder="https://..."
            keyboardType="url"
            icon={<ImageIcon size={18} color={COLORS.textTertiary} />}
          />
          <InputField
            label="Avatar URL"
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="https://..."
            keyboardType="url"
            icon={<ImageIcon size={18} color={COLORS.textTertiary} />}
          />

          <AnimatedPressable onPress={handleCreate} disabled={submitting}>
            <View style={{
              backgroundColor: COLORS.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 8,
              opacity: submitting ? 0.7 : 1,
            }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {submitting ? 'Creating...' : 'Create community'}
              </Text>
            </View>
          </AnimatedPressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
