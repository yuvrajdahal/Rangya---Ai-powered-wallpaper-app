import { ScrollView, TouchableOpacity, Dimensions, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Skeleton } from "@/components/Skeleton";
import { CategoryCard } from "@/components/CategoryCard";
import { API_URL } from "@/lib/auth-client";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AllCategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const { data: categories = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data.categories || [];
    },
  });

  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#fff" : "#111";
  const pillBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <View flex={1} backgroundColor="$background">
      <SafeAreaView
        edges={["top"]}
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: barBorderColor,
        }}
      >
        <BlurView
          intensity={72}
          tint={isDark ? "dark" : "light"}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: pillBg, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="chevron-back" size={22} color={iconColor} />
            </TouchableOpacity>
            <Text fontSize={17} fontWeight="700" color="$color" numberOfLines={1} flex={1} textAlign="center" marginHorizontal="$3">
              All Categories
            </Text>
            <View width={38} />
          </XStack>
        </BlurView>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={iconColor}
          />
        }
      >
        <YStack padding="$4" paddingTop="$3" gap="$3">
          <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$1">
            <YStack>
              <Text fontSize={28} fontWeight="800" color="$color" lineHeight={34}>
                Categories
              </Text>
              <Text color="$color11" fontSize={14} marginTop="$1">
                {isLoading ? "Loading…" : `${categories.length} collection${categories.length !== 1 ? "s" : ""}`}
              </Text>
            </YStack>
          </XStack>

          <XStack flexWrap="wrap" justifyContent="space-between" gap="$3">
            {isLoading ?
              [0, 1, 2, 3, 4, 5].map((i) => (
                <View key={i} width="48%">
                  <Skeleton width="100%" height={120} borderRadius={16} />
                </View>
              ))
            : categories.length > 0 ?
              categories.map((cat: any) => (
                <View key={cat.id} width="48%">
                  <CategoryCard
                    id={cat.id}
                    title={cat.name}
                    imageUri={cat.images?.[0]?.url || ""}
                    blurhash={cat.images?.[0]?.blurhash}
                  />
                </View>
              ))
            : (
              <YStack width="100%" padding="$10" alignItems="center" gap="$3">
                <Ionicons name="folder-open-outline" size={64} color="$color8" />
                <Text color="$color8" fontSize={16} textAlign="center">
                  No categories yet
                </Text>
              </YStack>
            )}
          </XStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
