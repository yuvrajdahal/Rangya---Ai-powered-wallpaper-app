import { ScrollView, TouchableOpacity, Dimensions, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack, useTheme } from "tamagui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Skeleton } from "@/components/Skeleton";
import { API_URL, useSession } from "@/lib/auth-client";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { buildUrl } from "@/lib/utils";

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

export default function MyWallpapersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const { data: session } = useSession();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["my-wallpapers", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { images: [] };
      const response = await axios.get();
      return response.data;
    },
    enabled: !!session?.user?.id,
  });

  const images = data?.images || [];

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
        <Skeleton key={i} width="100%" height={getImageHeight({}, i)} borderRadius={14} />
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
      <SafeAreaView
        edges={["top"]}
        style={{
          zIndex: 10,
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
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
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
              My Uploads
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
        <YStack padding={HORIZONTAL_PADDING} paddingTop="$4" gap="$4">
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
                {rightCol.map(({ item, index }) => renderImageCard(item, index))}
              </YStack>
            </XStack>
          ) : (
            <YStack paddingVertical="$20" alignItems="center" gap="$4">
              <View
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor={pillBg}
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="cloud-upload-outline" size={40} color="$color8" />
              </View>
              <YStack alignItems="center" gap="$2">
                <Text fontSize={18} fontWeight="700" color="$color">
                  No uploads yet
                </Text>
                <Text color="$color11" textAlign="center" maxWidth={250}>
                  Share your beautiful wallpapers with the world!
                </Text>
              </YStack>
              <TouchableOpacity
                onPress={() => router.push("/upload" as any)}
                style={{
                  marginTop: 10,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: "#3B82F6",
                }}
              >
                <Text color="white" fontWeight="700">
                  Upload Now
                </Text>
              </TouchableOpacity>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
}
