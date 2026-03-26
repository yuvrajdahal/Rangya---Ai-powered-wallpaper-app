import React, { useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_URL, getAuthHeaders } from "@/lib/auth-client";
import axios from "axios";

const CALLBACK_PATH = "/api/payments/callback";

export default function KhaltiWebViewScreen() {
  const { paymentUrl, imageId } = useLocalSearchParams<{
    paymentUrl: string;
    imageId: string;
  }>();
  const router = useRouter();
  const handled = useRef(false);   // prevent double-handling

  async function handleNavigationChange(nav: WebViewNavigation) {
    const url = nav.url;

    // Intercept Khalti's redirect back to our backend callback URL
    if (!handled.current && url.includes(CALLBACK_PATH)) {
      handled.current = true;

      // Extract query params from the callback URL
      const urlObj = new URL(url);
      const pidx = urlObj.searchParams.get("pidx");
      const status = urlObj.searchParams.get("status");

      if (!pidx) {
        Alert.alert("Payment Error", "Missing payment ID in callback.");
        router.back();
        return;
      }

      try {
        const headers = await getAuthHeaders();
        // Call our backend callback endpoint to verify & record the payment
        // Replace port 8081 with 3000 for backend
        const backendBase = API_URL.replace("/api", "");
        await axios.get(`${backendBase}${CALLBACK_PATH}`, {
          params: { pidx, status },
          headers,
          // Prevent axios from following the redirect
          maxRedirects: 0,
        });
      } catch (e: any) {
        // A 302 redirect counts as an error with maxRedirects:0 — that's fine
        // What matters is the backend processed the callback
        if (e?.response?.status !== 302) {
          console.error("Callback error:", e?.response?.data || e.message);
        }
      }

      if (status === "Completed") {
        router.replace(`/downloads?highlight=${imageId}`);
      } else {
        Alert.alert(
          "Payment Not Completed",
          `Status: ${status ?? "Unknown"}. Please try again.`
        );
        router.back();
      }
    }
  }

  if (!paymentUrl) return null;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: paymentUrl as string }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
