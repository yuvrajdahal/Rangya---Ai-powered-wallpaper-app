import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { TouchableOpacity, RefreshControl, FlatList, StyleSheet } from "react-native";
import { Text, View, YStack, XStack, useTheme } from "tamagui";
import { Image } from "expo-image";
import axios from "axios";
import { API_URL, getAuthHeaders } from "@/lib/auth-client";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { buildUrl } from "@/lib/utils";

interface DownloadedImage {
  id: string;
  createdAt: string;
  image: {
    id: string;
    url: string;
    title?: string;
  };
}

export default function DownloadsScreen() {
  const router = useRouter();
  const [downloads, setDownloads] = useState<DownloadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#fff" : "#111";
  const pillBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)";
  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const fetchDownloads = async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const { data } = await axios.get(`${API_URL}/payments/downloads`, {
        headers: authHeaders,
      });
      setDownloads(data);
    } catch (err) {
      console.error("Failed to fetch downloads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

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
              My Downloads
            </Text>
            <View width={38} />
          </XStack>
        </BlurView>
      </SafeAreaView>

      <YStack padding="$4" gap="$4" flex={1}>
        {loading ? (
          <View flex={1} alignItems="center" justifyContent="center">
            <Text color="$color11">Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={downloads}
            keyExtractor={(d) => d.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={fetchDownloads}
                tintColor={iconColor}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/wallpaper/[id]",
                    params: { id: item.image.id },
                  })
                }
              >
                <Image
                  source={{ uri: buildUrl(item.image.url) }}
                  style={styles.thumb}
                  contentFit="cover"
                  transition={300}
                />
                <Text style={styles.label} color="$color" numberOfLines={1}>
                  {item.image.title ?? "Wallpaper"}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View flex={1} alignItems="center" justifyContent="center" marginTop={100}>
                <Ionicons name="cloud-download-outline" size={48} color="$color8" />
                <Text color="$color8" fontSize={16} marginTop="$2">
                  No downloads yet.
                </Text>
              </View>
            }
          />
        )}
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 6 },
  thumb: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  label: { marginTop: 6, fontSize: 13, textAlign: "center", fontWeight: "600" },
  center: { marginTop: 40, textAlign: "center" },
});
