import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  ?? Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL
  ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? '';

// Lazy storage adapter — defers AsyncStorage access until after native modules are ready
const lazyStorage = Platform.OS === 'web' ? undefined : {
  getItem: async (key: string) => {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: lazyStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
