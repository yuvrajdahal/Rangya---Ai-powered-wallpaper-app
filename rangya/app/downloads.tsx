import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { Text, YStack, useTheme } from "tamagui";
import axios from "axios";
import { API_URL, getAuthHeaders } from "@/lib/auth-client";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

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
  const [downloads, setDownloads] = useState<DownloadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colorScheme = useColorScheme();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.val }}>
      <YStack padding="$4" gap="$4" flex={1}>
        <Text fontSize={24} fontWeight="bold" color="$color">
          My Downloads
        </Text>
        
        {loading ? (
          <Text style={styles.center} color="$color11">Loading...</Text>
        ) : (
          <FlatList
            data={downloads}
            keyExtractor={(d) => d.id}
            numColumns={2}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDownloads} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image.url }} style={styles.thumb} contentFit="cover" />
                <Text style={styles.label} color="$color" numberOfLines={1}>{item.image.title ?? "Wallpaper"}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.center} color="$color11">No downloads yet.</Text>}
          />
        )}
      </YStack>
    </SafeAreaView>
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
