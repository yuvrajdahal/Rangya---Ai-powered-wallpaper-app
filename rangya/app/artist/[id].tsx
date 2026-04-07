import { ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack, Avatar } from "tamagui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Skeleton } from "@/components/Skeleton";
import { API_URL } from "@/lib/auth-client";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";

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

export default function ArtistProfileScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const BASE_URL = API_URL.replace("/api", "");

  const { data: artistData, isLoading } = useQuery({
    queryKey: ["artist", id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/users/artist/${id}`);
      return response.data; 
    },
    enabled: !!id,
  });

  const artist = artistData?.artist;
  const images: any[] = artistData?.images || [];
  const displayName = artist?.name || name || "Artist";

  
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
    const fullUrl = img.url.startsWith("http") ? img.url : `${BASE_URL}${img.url}`;
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View flex={1} backgroundColor="$background">
      {}
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
          <XStack alignItems="center" justifyContent="space-between">
            {}
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

            {}
            <Text
              fontSize={17}
              fontWeight="700"
              color="$color"
              numberOfLines={1}
              flex={1}
              textAlign="center"
              marginHorizontal="$3"
            >
              Profile
            </Text>

            {}
            <View width={38} />
          </XStack>
        </BlurView>
      </SafeAreaView>

      {}
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding={HORIZONTAL_PADDING} paddingTop="$3" gap="$3">
          {}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$1"
            marginBottom="$2"
          >
            <XStack alignItems="center" gap="$3">
              <Avatar circular size="$6">
                <Avatar.Image
                  src={
                    artist?.image
                      ? artist.image.startsWith("http")
                        ? artist.image
                        : `${BASE_URL}${artist.image}`                      : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  }
                />
                {}
                <Avatar.Fallback backgroundColor="$blue10" alignItems="center" justifyContent="center">
                  <Text color="white" fontSize={16} fontWeight="800">
                    {initials}
                  </Text>
                </Avatar.Fallback>
              </Avatar>

              <YStack>
                <Text
                  fontSize={26}
                  fontWeight="800"
                  color="$color"
                  lineHeight={32}
                >
                  {displayName}
                </Text>
                <Text color="$color11" fontSize={14} marginTop="$1">
                  {isLoading
                    ? "Loading…"
                    : `${images.length} wallpaper${images.length !== 1 ? "s" : ""}`}
                </Text>
              </YStack>
            </XStack>

            {}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: pillBg,
              }}
            >
              <Ionicons name="options-outline" size={15} color={iconColor} />
              <Text fontSize={13} fontWeight="600" color="$color">
                Filter
              </Text>
            </TouchableOpacity>
          </XStack>

          {}
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
            <YStack padding="$10" alignItems="center" gap="$3">
              <Ionicons name="images-outline" size={64} color="$color8" />
              <Text color="$color8" fontSize={16} textAlign="center">
                This artist hasn't uploaded any wallpapers yet
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </View>
  );
}
