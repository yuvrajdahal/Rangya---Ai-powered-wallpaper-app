import React, { useEffect, useRef, useState } from "react";
import { View, Text, YStack, XStack } from "tamagui";
import { useRouter, Redirect, useRootNavigationState } from "expo-router";
import { useSession } from "@/lib/auth-client";
import { useOnboardingStore } from "@/hooks/use-onboarding";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";

const { width, height } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    key: "1",
    title: "Stay Motivated And Achieve Goals",
    description:
      "Discover beautiful, high-quality images to keep you inspired every day.",
    image: require("@/assets/images/splash/face.png"),
  },
  {
    key: "2",
    title: "Elevate Your Perspective With Visuals",
    description:
      "Get bite-sized inspiration and unlock visual creativity smarter than ever.",
    image: require("@/assets/images/splash/cards.png"),
  },
  {
    key: "3",
    title: "Empower Yourself With Quick Knowledge",
    description:
      "Access curated insights from the best wallpapers and visual collections in minutes.",
    image: require("@/assets/images/splash/building.png"),
  },
];

export default function EntryScreen() {
  const { data: session, isPending, error } = useSession();
  const { hasCompletedOnboarding, completeOnboarding } = useOnboardingStore();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  
  useEffect(() => {
    if (error) {
      console.error("Session initialization error:", error);
    }
  }, [error]);

  if (!rootNavigationState?.key) return null;

  
  if (isPending) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$4"
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  
  if (session || hasCompletedOnboarding) {
    if ((session?.user as any)?.role === "admin") {
      return <Redirect href={"/(admin-tabs)" as any} />;
    }
    return <Redirect href="/(tabs)/explore" />;
  }

  const handleSkip = () => {
    completeOnboarding();
    router.replace("/(tabs)/explore");
  };

  const handleNext = () => {
    if (currentPage < ONBOARDING_DATA.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      completeOnboarding();
      router.replace("/(tabs)/explore");
    }
  };

  return (
    <View flex={1} backgroundColor="$background">
      <SafeAreaView style={{ flex: 1, paddingTop: 20 }}>
        {}

        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          {ONBOARDING_DATA.map((item, index) => (
            <View
              key={item.key}
              flex={1}
              paddingHorizontal={20}
              justifyContent="center"
              alignItems="center"
            >
              <View
                width={width * 0.85}
                height={height * 0.45}
                justifyContent="center"
                alignItems="center"
                borderRadius={24}
                overflow="hidden"
                backgroundColor={
                  isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                }
              >
                <Image
                  source={item.image}
                  style={{
                    width: index === 1 ? 400 : "100%",
                    height: "100%",
                  }}
                  resizeMode={index === 1 ? "contain" : "cover"}
                />
              </View>

              <YStack marginTop={40} alignItems="center" px={16} gap={12}>
                <Text
                  fontSize={28}
                  fontWeight="800"
                  color="$color"
                  textAlign="center"
                  lineHeight={34}
                >
                  {item.title}
                </Text>
                {index !== 2 && (
                  <Text
                    fontSize={16}
                    color="$color11"
                    textAlign="center"
                    lineHeight={24}
                    paddingHorizontal="$4"
                  >
                    {item.description}
                  </Text>
                )}

                {index === ONBOARDING_DATA.length - 1 && (
                  <YStack
                    width="100%"
                    gap="$4"
                    alignItems="center"
                    marginTop="$5"
                  >
                    <TouchableOpacity
                      onPress={() => router.push("/signup")}
                      activeOpacity={0.8}
                      style={{
                        width: width * 0.75,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: "#3b82f6",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#3b82f6",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        elevation: 5,
                      }}
                    >
                      <XStack alignItems="center" gap="$2">
                        <Text color="#fff" fontSize={16} fontWeight="700">
                          Create Account
                        </Text>
                        <Ionicons
                          name="person-add-outline"
                          size={18}
                          color="#fff"
                        />
                      </XStack>
                    </TouchableOpacity>

                    {}
                  </YStack>
                )}
              </YStack>
            </View>
          ))}
        </PagerView>

        {}
        <YStack
          paddingHorizontal={32}
          paddingBottom={32}
          height={90}
          justifyContent="center"
        >
          {currentPage === ONBOARDING_DATA.length - 1 ? (
            <XStack
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              {}
              <TouchableOpacity
                onPress={handleSkip}
                style={{ padding: 10, marginLeft: -10 }}
              >
                <Text color="$color11" fontSize={16} fontWeight="600">
                  Skip
                </Text>
              </TouchableOpacity>

              {}
              <XStack gap={8} alignItems="center">
                {ONBOARDING_DATA.map((_, i) => (
                  <View
                    key={i}
                    width={currentPage === i ? 24 : 8}
                    height={8}
                    borderRadius={4}
                    backgroundColor={
                      currentPage === i
                        ? "$blue10"
                        : isDark
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.1)"
                    }
                  />
                ))}
              </XStack>

              {}
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/explore")}
                activeOpacity={0.8}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#3b82f6",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </XStack>
          ) : (
            <XStack
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              {}
              <TouchableOpacity
                onPress={handleSkip}
                style={{ padding: 10, marginLeft: -10 }}
              >
                <Text color="$color11" fontSize={16} fontWeight="600">
                  Skip
                </Text>
              </TouchableOpacity>

              {}
              <XStack gap={8} alignItems="center">
                {ONBOARDING_DATA.map((_, i) => (
                  <View
                    key={i}
                    width={currentPage === i ? 24 : 8}
                    height={8}
                    borderRadius={4}
                    backgroundColor={
                      currentPage === i
                        ? "$blue10"
                        : isDark
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.1)"
                    }
                  />
                ))}
              </XStack>

              {}
              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.8}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#3b82f6",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </XStack>
          )}
        </YStack>
      </SafeAreaView>
    </View>
  );
}
