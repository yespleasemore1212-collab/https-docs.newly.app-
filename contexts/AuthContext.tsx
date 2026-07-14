import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name,
    image: supabaseUser.user_metadata?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session check, user:', session?.user?.id ?? 'none');
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state changed, event:', _event, 'user:', session?.user?.id ?? 'none');
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[AuthContext] fetchUser, user:', session?.user?.id ?? 'none');
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
    } catch (error) {
      console.error('[AuthContext] Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    console.log('[AuthContext] signInWithEmail:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[AuthContext] signInWithEmail error:', error.message);
      throw new Error(error.message);
    }
    console.log('[AuthContext] signInWithEmail success');
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    console.log('[AuthContext] signUpWithEmail:', email, 'name:', name);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
    if (error) {
      console.error('[AuthContext] signUpWithEmail error:', error.message);
      throw new Error(error.message);
    }
    console.log('[AuthContext] signUpWithEmail success');
  };

  const signInWithGoogle = async () => {
    console.log('[AuthContext] signInWithGoogle');
    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth-callback` },
      });
      if (error) {
        console.error('[AuthContext] Google OAuth error:', error.message);
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "eliteconnect://auth-callback" },
      });
      if (error) {
        console.error('[AuthContext] Google OAuth error:', error.message);
        throw new Error(error.message);
      }
    }
  };

  const signInWithApple = async () => {
    console.log('[AuthContext] signInWithApple');
    if (Platform.OS === "ios") {
      try {
        const AppleAuthentication = await import("expo-apple-authentication");
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        if (!credential.identityToken) {
          throw new Error("No identity token received from Apple");
        }
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        if (error) {
          console.error('[AuthContext] Apple sign in error:', error.message);
          throw new Error(error.message);
        }
        console.log('[AuthContext] Apple sign in success');
      } catch (err: any) {
        if (err.code === "ERR_REQUEST_CANCELED") {
          throw new Error("Authentication cancelled");
        }
        throw err;
      }
    } else {
      const redirectTo = Platform.OS === "web"
        ? `${window.location.origin}/auth-callback`
        : "eliteconnect://auth-callback";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo },
      });
      if (error) {
        console.error('[AuthContext] Apple OAuth error:', error.message);
        throw new Error(error.message);
      }
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] signOut');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AuthContext] signOut error:', error.message);
    }
    setUser(null);
  };

  const deleteAccount = async () => {
    console.log('[AuthContext] deleteAccount');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No authenticated user found');
    }
    const userId = session.user.id;

    // Delete all user data from the database
    await supabase.from('likes').delete().eq('user_id', userId);
    await supabase.from('comments').delete().eq('user_id', userId);
    await supabase.from('messages').delete().eq('sender_id', userId);
    await supabase.from('memberships').delete().eq('user_id', userId);
    await supabase.from('posts').delete().eq('creator_id', userId);
    await supabase.from('communities').delete().eq('creator_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);

    // Invoke edge function to delete the auth user (requires service role)
    const { error: fnError } = await supabase.functions.invoke('delete-account', {
      body: { user_id: userId },
    });
    if (fnError) {
      console.error('[AuthContext] delete-account function error:', fnError.message);
      // Still sign out even if the edge function fails
    }

    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithApple,
        signInWithGoogle,
        signOut,
        deleteAccount,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
