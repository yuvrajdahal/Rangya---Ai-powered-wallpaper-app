import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack, useTheme } from "tamagui";

import { PrimaryInput } from "@/components/primary-input";
import { ExploreDivider } from "@/components/explore/ExploreDivider";
import { BestOfMonth } from "@/components/explore/BestOfMonth";
import { ArtistsList } from "@/components/explore/ArtistsList";
import { CategoriesList } from "@/components/explore/CategoriesList";
import { ToneBrowse } from "@/components/explore/ToneBrowse";
import { AllWallpapersList } from "@/components/explore/AllWallpapersList";
import { GuestCta } from "@/components/explore/GuestCta";
import { API_URL, useSession } from "@/lib/auth-client";
import { buildUrl } from "@/lib/utils";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSearchStore } from "@/stores/search-store";

export default function ExploreScreen() {
  const router = useRouter();
  const theme = useTheme();
  const accentColor = theme.blue10?.val ?? "#3B82F6";
  const isDark = theme.background?.val === "#000";
  const iconColor = isDark ? "#fff" : "#111";
  const { setQuery } = useSearchStore();
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  useEffect(() => {
    AsyncStorage.clear();
  }, []);

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
    queryKey: ["images"],
    queryFn: async () => {
      const response = await axios.get();
      return response.data.images || [];
    },
  });

  
  const {
    data: diverseImages = [],
    isLoading: isLoadingDiverse,
    refetch: refetchDiverse,
    isFetching: isFetchingDiverse,
  } = useQuery({
    queryKey: ["diverse-images"],
    queryFn: async () => {
      const response = await axios.get();
      return response.data.images || [];
    },
  });

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
    isFetching: isFetchingCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get();
      return response.data.categories || [];
    },
  });

  
  const {
    data: artists = [],
    isLoading: isLoadingArtists,
    refetch: refetchArtists,
    isFetching: isFetchingArtists,
  } = useQuery({
    queryKey: ["artists"],
    queryFn: async () => {
      const response = await axios.get();
      return response.data.artists || [];
    },
  });

  const onRefresh = () => {
    refetch();
    refetchDiverse();
    refetchCategories();
    refetchArtists();
  };

  const refreshing =
    isFetching ||
    isFetchingDiverse ||
    isFetchingCategories ||
    isFetchingArtists;

  
  const dynamicPalettes = useMemo(() => {
    const colors = new Set<string>();
    images.forEach((img: any) => {
      if (img.palette && Array.isArray(img.palette)) {
        img.palette.forEach((c: string) => colors.add(c));
      }
    });
    return colors.size > 0
      ? Array.from(colors).slice(0, 10)
      : [
          "#FFADAD",
          "#4A90E2",
          "#6B52AE",
          "#4ECDC4",
          "#333333",
          "#FF9F1C",
          "#E056FD",
        ];
  }, [images]);

  
  const handleSearch = (text: string) => {
    setLocalSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    if (localSearchQuery.trim().length > 0) {
      setQuery(localSearchQuery);
      router.push("/search");
    }
  };

  const navigateToWallpaper = (img: any) =>
    router.push({
      pathname: "/wallpaper/[id]",
      params: {
        id: img.id,
        imageUrl: buildUrl(img.url),
        title: img.title || img.category?.name || "Wallpaper",
        category: img.category?.name || "",
        uploadedBy: img.user?.name || "",
        blurhash: img.blurhash || "",
        isPremium: img.isPremium || "false",
        price: img.price || "",
        isAi: img.isAi ? "true" : "false",
        uploaderId: img.userId || "",
      },
    });

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
              Discover
            </Text>
            <Text
              fontSize={34}
              fontWeight="800"
              color="$color"
              letterSpacing={-1}
              lineHeight={40}
            >
              Explore
            </Text>
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

        {}
        <View marginHorizontal="$4" marginBottom="$2">
          <PrimaryInput
            placeholder="Search wallpapers, artists, categories…"
            value={localSearchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            icon="search-outline"
          />
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 36, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={iconColor}
            colors={[accentColor]}
          />
        }
      >
        <BestOfMonth
          images={diverseImages}
          isLoading={isLoadingDiverse}
          onNavigate={navigateToWallpaper}
          onSeeAll={() => router.push("/best-of-month")}
        />

        <ExploreDivider />

        <ArtistsList
          artists={artists}
          isLoading={isLoadingArtists}
          isDark={isDark}
          onSeeAll={() => router.push("/all-artists")}
        />

        <ExploreDivider />

        <CategoriesList
          categories={categories}
          isLoading={isLoadingCategories}
          onSeeAll={() => router.push("/all-categories")}
        />

        <ExploreDivider />

        <ToneBrowse dynamicPalettes={dynamicPalettes} />

        <ExploreDivider />

        <AllWallpapersList
          images={images}
          isLoading={isLoading}
          onNavigate={navigateToWallpaper}
          onSeeAll={() => router.push("/all-wallpapers")}
        />

        {!isLoggedIn && <GuestCta onSignIn={() => router.push("/login")} />}
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
