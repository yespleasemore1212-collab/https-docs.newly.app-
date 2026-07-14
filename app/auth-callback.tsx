import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

type Status = "processing" | "success" | "error";

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<Status>("processing");
  const [message, setMessage] = useState("Processing authentication...");
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "web") return;
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log('[AuthCallback] Processing OAuth callback');
      const error = new URLSearchParams(window.location.search).get("error");

      if (error) {
        console.error('[AuthCallback] OAuth error:', error);
        setStatus("error");
        setMessage(`Authentication failed: ${error}`);
        window.opener?.postMessage({ type: "oauth-error", error }, window.location.origin);
        return;
      }

      // Supabase handles the session from the URL hash automatically via onAuthStateChange.
      // Wait briefly for the session to be established.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[AuthCallback] Session established, user:', session.user.id);
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");
        if (window.opener) {
          window.opener.postMessage({ type: "oauth-success" }, window.location.origin);
          setTimeout(() => window.close(), 500);
        } else {
          router.replace("/(tabs)/(home)");
        }
      } else {
        // Session may arrive via onAuthStateChange shortly
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (newSession) {
            console.log('[AuthCallback] Session arrived via state change, user:', newSession.user.id);
            subscription.unsubscribe();
            setStatus("success");
            setMessage("Authentication successful! Redirecting...");
            if (window.opener) {
              window.opener.postMessage({ type: "oauth-success" }, window.location.origin);
              setTimeout(() => window.close(), 500);
            } else {
              router.replace("/(tabs)/(home)");
            }
          }
        });
      }
    } catch (err) {
      console.error('[AuthCallback] Error:', err);
      setStatus("error");
      setMessage("Failed to process authentication");
    }
  };

  return (
    <View style={styles.container}>
      {status === "processing" && <ActivityIndicator size="large" color="#007AFF" />}
      {status === "success" && <Text style={styles.successIcon}>✓</Text>}
      {status === "error" && <Text style={styles.errorIcon}>✗</Text>}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  successIcon: {
    fontSize: 48,
    color: "#34C759",
  },
  errorIcon: {
    fontSize: 48,
    color: "#FF3B30",
  },
  message: {
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
    color: "#333",
  },
});
