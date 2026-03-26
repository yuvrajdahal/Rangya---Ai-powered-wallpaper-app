import React, { useState } from "react";
import { Text, View, YStack, XStack } from "tamagui";
import { signUp } from "../lib/auth-client";
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

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { completeOnboarding } = useOnboardingStore();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#fff" : "#111";
  const pillBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dividerColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await signUp.email({ email, password, name });
      if (error) {
        console.log(JSON.stringify(error));
        Alert.alert("Signup Failed", error.message || "Something went wrong");
      } else {
        completeOnboarding();
        Alert.alert("Success", "Account created successfully!");
        router.replace("/(tabs)/profile");
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
              onPress={() => router.back()}
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
              Create Account
            </Text>
            <View width={38} />
          </XStack>
        </BlurView>
      </SafeAreaView>

      {/*
        Same fix as login: ScrollView inside KeyboardAvoidingView
        so the form scrolls up naturally rather than the whole screen jumping.
      */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
                <Ionicons name="person-add-outline" size={26} color="#fff" />
              </View>
              <Text
                fontSize={26}
                fontWeight="800"
                color="$color"
                letterSpacing={-0.5}
              >
                Join us today
              </Text>
              <Text color="$color11" fontSize={14} textAlign="center">
                Create an account to start exploring wallpapers
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
                placeholder="Full name"
                value={name}
                onChangeText={setName}
                icon="person-outline"
                autoCapitalize="words"
              />
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
              <PrimaryInput
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon="shield-checkmark-outline"
                secureTextEntry
              />
            </YStack>

            {/* CTA */}
            <YStack gap="$3">
              <TouchableOpacity
                onPress={handleSignup}
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
                    {loading ? "Creating account…" : "Create Account"}
                  </Text>
                  {!loading && (
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  )}
                </XStack>
              </TouchableOpacity>

              <XStack justifyContent="center" alignItems="center">
                <Text color="$color11" fontSize={14}>
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text color="$blue10" fontWeight="700" fontSize={14}>
                    Sign In
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
