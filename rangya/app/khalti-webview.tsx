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
  const handled = useRef(false);   

  async function handleNavigationChange(nav: WebViewNavigation) {
    const url = nav.url;

    
    if (!handled.current && url.includes(CALLBACK_PATH)) {
      handled.current = true;

      
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
        
        
        const backendBase = API_URL.replace("/api", "");
        await axios.get(`${backendBase}${CALLBACK_PATH}`, {
          params: { pidx, status },
          headers,
          
          maxRedirects: 0,
        });
      } catch (e: any) {
        
        
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
