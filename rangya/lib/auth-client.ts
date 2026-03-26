import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// The backend is running locally on port 3000
export const API_URL = "http://192.168.100.13:3000/api";

export const authClient = createAuthClient({
  baseURL: `${API_URL}/auth`,
  plugins: [
    expoClient({
      scheme: "rangya",
      storagePrefix: "rangya",
      storage: SecureStore,
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;

export const getAuthHeaders = async () => {
  const headers: Record<string, string> = {};
  try {
    const cookieStr = await (authClient as any).getCookie?.();
    if (cookieStr) {
      headers["cookie"] = cookieStr;
    }
  } catch (err) {
    console.error("Failed to get auth cookie", err);
  }
  return headers;
};
