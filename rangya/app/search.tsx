import {
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Skeleton } from "@/components/Skeleton";
import { API_URL } from "@/lib/auth-client";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { buildUrl } from "@/lib/utils";
import { useSearchStore, type ColorTone } from "@/stores/search-store";
import { useEffect, useRef, useState } from "react";

const COLUMN_GAP = 10;
const HORIZONTAL_PADDING = 12;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

const COLOR_TONES: { label: string; value: ColorTone; emoji: string }[] = [
  { label: "All", value: "ALL", emoji: "✦" },
  { label: "Warm", value: "WARM", emoji: "🔥" },
  { label: "Cool", value: "COOL", emoji: "🧊" },
  { label: "Neutral", value: "NEUTRAL", emoji: "🌫" },
  { label: "Dark", value: "DARK", emoji: "🌑" },
  { label: "Light", value: "LIGHT", emoji: "☀️" },
];

const getImageHeight = (item: any, index: number) => {
  if (item.width && item.height) {
    return (item.height / item.width) * COLUMN_WIDTH;
  }
  const heights = [260, 200, 320, 180, 280, 240, 300, 210, 350, 190];
  return heights[index % heights.length];
};

export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    query,
    colorTone,
    palette,
    setQuery,
    setColorTone,
    setPalette,
    reset,
  } = useSearchStore();

  // Local debounce for query
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const { data: images = [], isFetching, isLoading, refetch } = useQuery({
    queryKey: ["search", debouncedQuery, colorTone, palette],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      if (colorTone !== "ALL") params.set("tone", colorTone);
      if (palette) params.set("palette", palette);
      const res = await axios.get(
        `${API_URL}/images/search?${params.toString()}`,
      );
      return res.data.images || [];
    },
  });

  // Collect palette colors from all returned images
  const allPaletteColors = Array.from(
    new Set<string>(images.flatMap((img: any) => img.palette ?? [])),
  ).slice(0, 14);

  const splitIntoColumns = (items: any[]) => {
    const leftCol: { item: any; index: number }[] = [];
    const rightCol: { item: any; index: number }[] = [];
    let lH = 0,
      rH = 0;
    items.forEach((item, index) => {
      const h = getImageHeight(item, index);
      if (lH <= rH) {
        leftCol.push({ item, index });
        lH += h + COLUMN_GAP;
      } else {
        rightCol.push({ item, index });
        rH += h + COLUMN_GAP;
      }
    });
    return { leftCol, rightCol };
  };
  const { leftCol, rightCol } = splitIntoColumns(images);

  const iconColor = isDark ? "#fff" : "#111";
  const pillBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const pillActiveBg = "#3B82F6";
  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  const renderCard = (img: any, index: number) => {
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
              title: img.title || img.category?.name || "Wallpaper",
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
          {/* Tone badge */}
          {img.colorTone && img.colorTone !== "NEUTRAL" && (
            <View
              position="absolute"
              bottom={8}
              left={8}
              paddingHorizontal={8}
              paddingVertical={3}
              borderRadius={10}
              backgroundColor="rgba(0,0,0,0.5)"
            >
              <Text fontSize={10} color="white" fontWeight="600">
                {img.colorTone.charAt(0) + img.colorTone.slice(1).toLowerCase()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletons = () => (
    <XStack gap={COLUMN_GAP} alignItems="flex-start">
      <YStack flex={1} gap={COLUMN_GAP}>
        {[0, 2, 4].map((i) => (
          <Skeleton
            key={i}
            width="100%"
            height={getImageHeight({}, i)}
            borderRadius={14}
          />
        ))}
      </YStack>
      <YStack flex={1} gap={COLUMN_GAP}>
        {[1, 3, 5].map((i) => (
          <Skeleton
            key={i}
            width="100%"
            height={getImageHeight({}, i)}
            borderRadius={14}
          />
        ))}
      </YStack>
    </XStack>
  );

  return (
    <View flex={1} backgroundColor="$background">
      {/* ── App Bar ── */}
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
          {/* Back + Search input row */}
          <XStack alignItems="center" gap={10}>
            <TouchableOpacity
              onPress={() => {
                reset();
                router.back();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: pillBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={20} color={iconColor} />
            </TouchableOpacity>

            <XStack
              flex={1}
              alignItems="center"
              gap={8}
              backgroundColor={inputBg}
              borderWidth={1}
              borderColor={inputBorder}
              borderRadius={14}
              paddingHorizontal={12}
              height={42}
            >
              <Ionicons
                name="search-outline"
                size={16}
                color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"}
              />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Search wallpapers, categories…"
                placeholderTextColor={
                  isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)"
                }
                style={[styles.input, { color: isDark ? "#fff" : "#111" }]}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={17}
                    color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                  />
                </TouchableOpacity>
              )}
            </XStack>
          </XStack>

          {/* ── Tone filter chips ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, gap: 8 }}
          >
            {COLOR_TONES.map((t) => {
              const active = colorTone === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setColorTone(t.value)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: active ? pillActiveBg : pillBg,
                    borderWidth: active ? 0 : 1,
                    borderColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)",
                  }}
                >
                  <Text fontSize={13}>{t.emoji}</Text>
                  <Text
                    fontSize={13}
                    fontWeight="600"
                    color={active ? "white" : "$color"}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </BlurView>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor={iconColor}
          />
        }
      >
        <YStack padding={HORIZONTAL_PADDING} paddingTop="$3" gap="$3">
          {/* ── Palette color dots ── */}
          {allPaletteColors.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 8, paddingHorizontal: 4 }}
            >
              {palette && (
                <TouchableOpacity onPress={() => setPalette(null)}>
                  <View
                    width={32}
                    height={32}
                    borderRadius={16}
                    borderWidth={1}
                    borderColor="$color11"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                  >
                    <Ionicons name="close" size={16} color={iconColor} />
                  </View>
                </TouchableOpacity>
              )}
              {allPaletteColors.map((c) => {
                const isSelected = palette === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setPalette(isSelected ? null : c)}
                  >
                    <View
                      width={32}
                      height={32}
                      borderRadius={16}
                      backgroundColor={c}
                      borderWidth={isSelected ? 3 : 1}
                      borderColor={isSelected ? "$blue10" : "rgba(150,150,150,0.3)"}
                      shadowColor="#000"
                      shadowOffset={{ width: 0, height: 2 }}
                      shadowOpacity={0.15}
                      shadowRadius={4}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* ── Result count ── */}
          <Text color="$color11" fontSize={13} paddingHorizontal="$1">
            {isFetching
              ? "Searching…"
              : `${images.length} result${images.length !== 1 ? "s" : ""}`}
          </Text>

          {/* ── Grid ── */}
          {isLoading ? (
            renderSkeletons()
          ) : images.length > 0 ? (
            <XStack gap={COLUMN_GAP} alignItems="flex-start">
              <YStack flex={1}>
                {leftCol.map(({ item, index }) => renderCard(item, index))}
              </YStack>
              <YStack flex={1}>
                {rightCol.map(({ item, index }) => renderCard(item, index))}
              </YStack>
            </XStack>
          ) : (
            <YStack padding="$10" alignItems="center" gap="$3">
              <Ionicons name="search-outline" size={64} color="$color8" />
              <Text color="$color8" fontSize={16} textAlign="center">
                No wallpapers match your search
              </Text>
              <TouchableOpacity
                onPress={reset}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: "#3B82F6",
                }}
              >
                <Text color="white" fontWeight="600" fontSize={14}>
                  Clear filters
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
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    fontWeight: "500",
  },
});
