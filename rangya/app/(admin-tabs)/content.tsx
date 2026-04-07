import {
  View,
  Text,
  YStack,
  XStack,
  ScrollView,
  Spinner,
  Avatar,
  Input,
} from "tamagui";
import { Image } from "expo-image";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useMemo } from "react";
import { API_URL, getAuthHeaders } from "../../lib/auth-client";
import axios from "axios";
import {
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 40 - 12) / 2;

type ImageItem = {
  id: string;
  url: string;
  title?: string;
  isPremium: boolean;
  category?: { name: string };
  user?: { name: string; image?: string };
};

function ContentCard({
  img,
  isDark,
  onDelete,
  onTogglePremium,
}: {
  img: ImageItem;
  isDark: boolean;
  onDelete: () => void;
  onTogglePremium: () => void;
}) {
  const imageUrl = img.url.startsWith("http") ? img.url : `${API_URL.replace("/api", "")}${img.url}`;

  return (
    <YStack
      borderRadius="$5"
      overflow="hidden"
      backgroundColor="$background"
      borderWidth={0.5}
      borderColor="$borderColor"
      style={styles.card}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: COLUMN_WIDTH, height: img.isPremium ? 210 : 170 }}
          resizeMode="cover"
        />

        <TouchableOpacity
          onPress={onTogglePremium}
          activeOpacity={0.8}
          style={[
            styles.badgeTopLeft,
            {
              backgroundColor: img.isPremium
                ? "rgba(245,158,11,0.9)"
                : "rgba(0,0,0,0.55)",
            },
          ]}
        >
          <XStack alignItems="center" gap="$1">
            <Ionicons
              name={img.isPremium ? "star" : "star-outline"}
              size={10}
              color="white"
            />
            <Text
              fontSize={8}
              fontWeight="800"
              color="white"
              letterSpacing={0.5}
            >
              {img.isPremium ? "PREMIUM" : "FREE"}
            </Text>
          </XStack>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          activeOpacity={0.8}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={13} color="#ef4444" />
        </TouchableOpacity>

        {img.category?.name && (
          <View style={styles.badgeBottom}>
            <Text
              fontSize={8}
              fontWeight="700"
              color="white"
              letterSpacing={0.4}
            >
              {img.category.name.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <YStack padding="$2.5" gap="$1.5">
        <Text fontSize={13} fontWeight="700" color="$color" numberOfLines={1}>
          {img.title || "Untitled"}
        </Text>
        <XStack alignItems="center" gap="$1.5">
          <Avatar circular size="$1">
            <Avatar.Image
              src={
                img.user?.image
                  ? img.user.image.startsWith("http")
                    ? img.user.image
                    : `${API_URL.replace("/api", "")}${img.user.image}`                  : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              }
            />
            <Avatar.Fallback backgroundColor="$blue10" />
          </Avatar>
          <Text fontSize={10} color="$color10" flex={1} numberOfLines={1}>
            {img.user?.name || "Unknown"}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}

type FilterType = "all" | "premium" | "free";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Premium", value: "premium" },
  { label: "Free", value: "free" },
];

export default function ContentManagementScreen() {
  const isDark = useColorScheme() === "dark";
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_URL}/admin/images`, { headers });
      setImages(res.data.images);
    } catch (error) {
      Alert.alert("Error", "Failed to load content data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, title?: string) => {
    Alert.alert(
      "Delete Asset",
      `Are you sure you want to delete "${title || "this asset"}"? This action cannot be undone.`,      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = await getAuthHeaders();
              await axios.delete(`${API_URL}/admin/images/${id}`, { headers });
              setImages((prev) => prev.filter((i) => i.id !== id));
            } catch {
              Alert.alert("Error", "Failed to delete asset.");
            }
          },
        },
      ],
    );
  };

  const handleTogglePremium = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.patch(
        `${API_URL}/admin/images/${id}/toggle-premium`,        {},
        { headers },
      );
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, isPremium: res.data.image.isPremium } : img,
        ),
      );
    } catch {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (img.title || "").toLowerCase().includes(q) ||
        (img.category?.name || "").toLowerCase().includes(q) ||
        (img.user?.name || "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "premium" && img.isPremium) ||
        (filter === "free" && !img.isPremium);
      return matchesSearch && matchesFilter;
    });
  }, [images, search, filter]);

  const leftCol = filteredImages.filter((_, i) => i % 2 === 0);
  const rightCol = filteredImages.filter((_, i) => i % 2 !== 0);

  if (loading && images.length === 0) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
      >
        <Spinner size="large" color="$blue10" />
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      <SafeAreaView edges={["top"]}>
        {}
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$4"
          alignItems="flex-start"
          justifyContent="space-between"
          borderBottomWidth={0.5}
          borderColor="$borderColor"
        >
          <YStack gap="$0.5">
            <Text
              fontSize={11}
              fontWeight="700"
              color="$blue10"
              letterSpacing={2}
              textTransform="uppercase"
            >
              Catalog
            </Text>
            <Text
              fontSize={28}
              fontWeight="700"
              color="$color"
              letterSpacing={-0.8}
            >
              Content
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={fetchImages}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.04)",
              borderWidth: 0.5,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </XStack>

        {}
        <YStack
          paddingHorizontal="$5"
          paddingVertical="$3"
          gap="$2.5"
          borderBottomWidth={0.5}
          borderColor="$borderColor"
        >
          <XStack
            alignItems="center"
            gap="$2"
            paddingHorizontal="$3"
            borderRadius="$4"
            backgroundColor="$backgroundHover"
            borderWidth={0.5}
            borderColor="$borderColor"
            height={42}
          >
            <Ionicons
              name="search-outline"
              size={15}
              color={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)"}
            />
            <Input
              flex={1}
              borderWidth={0}
              backgroundColor="transparent"
              placeholder="Search by title, category, or author…"
              value={search}
              onChangeText={setSearch}
              fontSize={14}
              color="$color"
              focusStyle={{ outlineWidth: 0 }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={15}
                  color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                />
              </TouchableOpacity>
            )}
          </XStack>

          <XStack gap="$2" alignItems="center">
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setFilter(f.value)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: active
                      ? "#3b82f6"
                      : isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.04)",
                    borderWidth: 0.5,
                    borderColor: active
                      ? "#3b82f6"
                      : isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.08)",
                  }}
                >
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color={
                      active ? "white" : isDark ? "#ffffff99" : "#00000099"
                    }
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text fontSize={12} color="$color10">
                {filteredImages.length} asset
                {filteredImages.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </XStack>
        </YStack>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchImages}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
      >
        {filteredImages.length > 0 ? (
          <XStack gap="$3" alignItems="flex-start">
            <YStack flex={1} gap="$3">
              {leftCol.map((img) => (
                <ContentCard
                  key={img.id}
                  img={img}
                  isDark={isDark}
                  onDelete={() => handleDelete(img.id, img.title)}
                  onTogglePremium={() => handleTogglePremium(img.id)}
                />
              ))}
            </YStack>
            <YStack flex={1} gap="$3">
              {rightCol.map((img) => (
                <ContentCard
                  key={img.id}
                  img={img}
                  isDark={isDark}
                  onDelete={() => handleDelete(img.id, img.title)}
                  onTogglePremium={() => handleTogglePremium(img.id)}
                />
              ))}
            </YStack>
          </XStack>
        ) : (
          <YStack flex={1} paddingVertical="$12" alignItems="center" gap="$4">
            <View
              width={72}
              height={72}
              borderRadius="$6"
              backgroundColor={
                isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
              }
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons
                name="images-outline"
                size={32}
                color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"}
              />
            </View>
            <YStack alignItems="center" gap="$1">
              <Text fontSize={15} fontWeight="600" color="$color">
                No assets found
              </Text>
              <Text
                fontSize={13}
                color="$color10"
                textAlign="center"
                maxWidth={260}
              >
                {search
                  ? `No assets matching "${search}" found.`
                  : "No content matches the selected filter."}
              </Text>
            </YStack>
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setFilter("all");
              }}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
                borderWidth: 0.5,
                borderColor: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.1)",
              }}
            >
              <Text fontSize={14} fontWeight="600" color="$color">
                Clear Filters
              </Text>
            </TouchableOpacity>
          </YStack>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeTopLeft: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  deleteBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(239,68,68,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeBottom: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
