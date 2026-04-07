import {
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Text, View, XStack, YStack, useTheme } from "tamagui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Skeleton } from "@/components/Skeleton";
import { API_URL, useSession, getAuthHeaders } from "@/lib/auth-client";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { buildUrl } from "@/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";

const COLUMN_GAP = 10;
const HORIZONTAL_PADDING = 12;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

const getImageHeight = (item: any, index: number) => {
  if (item.width && item.height) {
    return (item.height / item.width) * COLUMN_WIDTH;
  }
  const heights = [260, 200, 320, 180, 280, 240, 300, 210, 350, 190];
  return heights[index % heights.length];
};

export default function FavoriteScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const accentColor = theme.blue10?.val ?? "#3B82F6";

  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const handleUploadPress = () =>
    router.push(isLoggedIn ? "/upload" : "/login");

  const {
    data: images = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["saved-images"],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/images/saved`, { headers });
      return response.data.images || [];
    },
    enabled: isLoggedIn,
  });

  const splitIntoColumns = (items: any[]) => {
    const leftCol: { item: any; index: number }[] = [];
    const rightCol: { item: any; index: number }[] = [];
    let leftHeight = 0;
    let rightHeight = 0;
    items.forEach((item, index) => {
      const h = getImageHeight(item, index);
      if (leftHeight <= rightHeight) {
        leftCol.push({ item, index });
        leftHeight += h + COLUMN_GAP;
      } else {
        rightCol.push({ item, index });
        rightHeight += h + COLUMN_GAP;
      }
    });
    return { leftCol, rightCol };
  };

  const { leftCol, rightCol } = splitIntoColumns(images);

  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#fff" : "#111";
  const pillBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const renderSkeletonColumn = (indices: number[]) => (
    <YStack gap={COLUMN_GAP} flex={1}>
      {indices.map((i) => (
        <Skeleton
          key={i}
          width="100%"
          height={getImageHeight({}, i)}
          borderRadius={14}
        />
      ))}
    </YStack>
  );

  const renderImageCard = (img: any, index: number) => {
    const fullUrl = buildUrl(img.url);
    return (
      <TouchableOpacity
        key={img.id}
        activeOpacity={0.88}
        style={{ marginBottom: COLUMN_GAP }}
        onPress={() =>
          router.push({
            pathname: "/wallpaper/[id]",
            params: {
              id: img.id,
              imageUrl: fullUrl,
              title: img.title || "Wallpaper",
              category: img.category?.name || "",
              blurhash: img.blurhash || "",
              isPremium: img.isPremium || "false",
              price: img.price || "",
              isAi: img.isAi ? "true" : "false",
              uploaderId: img.userId || "",
            },
          })
        }
      >
        <View
          borderRadius={14}
          overflow="hidden"
          height={getImageHeight(img, index)}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.18}
          shadowRadius={10}
        >
          <Image
            source={{ uri: fullUrl }}
            placeholder={img.blurhash}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            transition={300}
          />
          {img.isAi && (
            <View
              position="absolute"
              top={8}
              right={8}
              backgroundColor="rgba(0,0,0,0.55)"
              paddingHorizontal={6}
              paddingVertical={2}
              borderRadius={6}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.2)"
            >
              <XStack alignItems="center" gap={4}>
                <View
                  width={5}
                  height={5}
                  borderRadius={2.5}
                  backgroundColor="#3B82F6"
                />
                <Text
                  color="white"
                  fontSize={10}
                  fontWeight="800"
                  letterSpacing={0.5}
                >
                  AI
                </Text>
              </XStack>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View flex={1} backgroundColor="$background">
      <SafeAreaView edges={["top"]}>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingTop="$2"
          paddingBottom="$4"
        >
          <YStack gap="$0.5">
            <Text
              fontSize={11}
              fontWeight="700"
              color="$blue10"
              letterSpacing={2.2}
              textTransform="uppercase"
            >
              Favorites
            </Text>
            <YStack>
              <Text
                fontSize={34}
                fontWeight="800"
                color="$color"
                letterSpacing={-1}
                lineHeight={40}
              >
                Favorites
              </Text>
              <Text color="$color11" fontSize={13} marginTop="$-1">
                {isLoading
                  ? "Loading…"
                  : `${images.length} wallpaper${images.length !== 1 ? "s" : ""} you liked`}
              </Text>
            </YStack>
          </YStack>

          <TouchableOpacity
            onPress={handleUploadPress}
            style={[styles.uploadBtn, { shadowColor: accentColor }]}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.uploadGradient}
            >
              <Feather
                name={isLoggedIn ? "upload" : "lock"}
                size={17}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </XStack>
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
        <YStack padding={HORIZONTAL_PADDING} paddingTop="$3" gap="$3">
          {isLoading ? (
            <XStack gap={COLUMN_GAP} alignItems="flex-start">
              {renderSkeletonColumn([0, 2, 4])}
              {renderSkeletonColumn([1, 3, 5])}
            </XStack>
          ) : images.length > 0 ? (
            <XStack gap={COLUMN_GAP} alignItems="flex-start">
              <YStack flex={1}>
                {leftCol.map(({ item, index }) => renderImageCard(item, index))}
              </YStack>
              <YStack flex={1}>
                {rightCol.map(({ item, index }) =>
                  renderImageCard(item, index),
                )}
              </YStack>
            </XStack>
          ) : (
            <YStack padding="$10" alignItems="center" gap="$4" marginTop="$10">
              <View backgroundColor={pillBg} padding="$5" borderRadius={50}>
                <Ionicons name="heart-outline" size={48} color="$color8" />
              </View>
              <YStack alignItems="center" gap="$2">
                <Text
                  color="$color"
                  fontSize={18}
                  fontWeight="600"
                  textAlign="center"
                >
                  Your gallery is empty
                </Text>
                <Text
                  color="$color11"
                  fontSize={14}
                  textAlign="center"
                  maxWidth={250}
                >
                  Wallpapers you favorite, save or apply will appear here.
                </Text>
              </YStack>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/explore")}
                style={{
                  backgroundColor: "$color",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 25,
                  marginTop: 10,
                }}
              >
                <Text color="$background" fontWeight="700">
                  Explore Wallpapers
                </Text>
              </TouchableOpacity>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadBtn: {
    borderRadius: 14,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 7,
  },
  uploadGradient: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
