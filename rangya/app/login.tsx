import React, { useState } from "react";
import { Text, View, YStack, XStack } from "tamagui";
import { signIn } from "../lib/auth-client";
import { useRouter } from "expo-router";
import {
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryInput } from "../components/primary-input";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useOnboardingStore } from "@/hooks/use-onboarding";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { completeOnboarding } = useOnboardingStore();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#fff" : "#111";
  const pillBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dividerColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await signIn.email({ email, password });
      if (error) {
        Alert.alert("Login Failed", error.message || "Something went wrong");
      } else {
        completeOnboarding();
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/profile");
        }
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View flex={1} backgroundColor="$background">
      {/* App Bar */}
      <SafeAreaView edges={["top"]} style={{ zIndex: 10 }}>
        <BlurView
          intensity={72}
          tint={isDark ? "dark" : "light"}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: barBorderColor,
          }}
        >
          <XStack alignItems="center">
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/profile");
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: pillBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={22} color={iconColor} />
            </TouchableOpacity>
            <Text
              fontSize={17}
              fontWeight="700"
              color="$color"
              flex={1}
              textAlign="center"
              marginHorizontal="$3"
            >
              Sign In
            </Text>
            <View width={38} />
          </XStack>
        </BlurView>
      </SafeAreaView>

      {/*
        KeyboardAvoidingView only adjusts the bottom inset.
        ScrollView lets the content scroll naturally if the keyboard
        overlaps — the hero stays put and only the form scrolls into view.
      */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        // On iOS, offset by the app-bar height so padding doesn't
        // over-compensate and shift the whole screen.
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack
            flex={1}
            paddingHorizontal="$5"
            justifyContent="center"
            gap="$5"
            paddingVertical="$8"
          >
            {/* Hero */}
            <YStack alignItems="center" gap="$2">
              <View
                width={60}
                height={60}
                borderRadius={18}
                backgroundColor="$blue10"
                alignItems="center"
                justifyContent="center"
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Ionicons name="lock-open-outline" size={26} color="#fff" />
              </View>
              <Text
                fontSize={26}
                fontWeight="800"
                color="$color"
                letterSpacing={-0.5}
              >
                Welcome back
              </Text>
              <Text color="$color11" fontSize={14} textAlign="center">
                Sign in to continue exploring wallpapers
              </Text>
            </YStack>

            {/* Form Card */}
            <YStack
              borderRadius={20}
              padding="$4"
              gap="$3"
              backgroundColor={
                isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
              }
              borderWidth={1}
              borderColor={dividerColor}
            >
              <PrimaryInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <PrimaryInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                icon="lock-closed-outline"
                secureTextEntry
              />
              <XStack justifyContent="flex-end">
                <TouchableOpacity>
                  <Text color="$blue10" fontSize={13} fontWeight="600">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* CTA */}
            <YStack gap="$3">
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: "#3b82f6",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading ? 0.75 : 1,
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.38,
                  shadowRadius: 12,
                  elevation: 7,
                }}
              >
                <XStack alignItems="center" gap="$2">
                  <Text color="#fff" fontSize={15} fontWeight="700">
                    {loading ? "Signing in…" : "Sign In"}
                  </Text>
                  {!loading && (
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  )}
                </XStack>
              </TouchableOpacity>

              <XStack justifyContent="center" alignItems="center">
                <Text color="$color11" fontSize={14}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text color="$blue10" fontWeight="700" fontSize={14}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView edges={["bottom"]} />
    </View>
  );
}
