import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import * as IntentLauncher from "expo-intent-launcher";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";
import { File, Paths } from "expo-file-system/next";
import { useSession, API_URL, getAuthHeaders } from "@/lib/auth-client";
import axios from "axios";
import { useKhaltiPayment } from "@/hooks/useKhaltiPayment";

const { width: W, height: H } = Dimensions.get("window");

export default function WallpaperDetailScreen() {
  const router = useRouter();
  const {
    id,
    imageUrl,
    title,
    category,
    uploadedBy,
    blurhash,
    isPremium,
    price,
    isAi,
    uploaderId,
  } = useLocalSearchParams<{
    id: string;
    imageUrl: string;
    title?: string;
    category?: string;
    uploadedBy?: string;
    blurhash?: string;
    isPremium?: string;
    price?: string;
    isAi?: string;
    uploaderId?: string;
  }>();

  const { buyImage, getFreeDownload } = useKhaltiPayment();

  const [showInfo, setShowInfo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const infoAnim = useRef(new Animated.Value(0)).current;
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const queryClient = useQueryClient();
  const { data: savedImages = [] } = useQuery({
    queryKey: ["saved-images"],
    queryFn: async () => {
      if (!isLoggedIn) return [];
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/images/saved`, { headers });
      return response.data.images || [];
    },
    enabled: isLoggedIn,
  });

  const isFavorited = savedImages.some((img: any) => img.id === id);
  const isOwner = session?.user?.id === uploaderId;

  const { data: artistData } = useQuery({
    queryKey: ["artist", uploaderId],
    queryFn: async () => {
      if (!uploaderId) return null;
      const response = await axios.get(
        `${API_URL}/images/artist/${uploaderId}`,
      );
      return response.data.artist || null;
    },
    enabled: !!uploaderId,
  });

  const artistInitials = uploadedBy
    ? uploadedBy
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const toggleInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = showInfo ? 0 : 1;
    setShowInfo(!showInfo);
    Animated.spring(infoAnim, {
      toValue,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
  };

  const downloadToCache = async (): Promise<string> => {
    const filename = `rangya_${id}_${Date.now()}.jpg`;
    const file = new File(Paths.cache, filename);
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    await file.write(new Uint8Array(arrayBuffer));
    return file.uri;
  };

  const requestMediaPermission = async (): Promise<boolean> => {
    const { status } = await MediaLibrary.requestPermissionsAsync(true);
    return status === "granted";
  };

  const requireLogin = (action: string): boolean => {
    if (!isLoggedIn) {
      Alert.alert(
        "Sign In Required",
        `You need to be signed in to ${action} wallpapers.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/login") },
        ],
      );
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!requireLogin("save")) return;
    if (saving) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPremium === "true" && !isOwner) {
      setSaving(true);
      try {
        const { paymentUrl } = await buyImage(id);
        router.push({
          pathname: "/khalti-webview",
          params: { paymentUrl, imageId: id },
        });
      } catch (e: any) {
        console.error(e);
        Alert.alert("Payment Error", e.message || "Failed to initiate payment");
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      const granted = await requestMediaPermission();
      if (!granted) {
        Alert.alert(
          "Permission needed",
          "Allow access to save to your gallery.",
        );
        return;
      }

      const localUri = await downloadToCache();
      await MediaLibrary.saveToLibraryAsync(localUri);

      getAuthHeaders().then((headers) => {
        axios
          .post(`${API_URL}/images/saved/${id}`, { type: "SAVED" }, { headers })
          .then(() =>
            queryClient.invalidateQueries({ queryKey: ["saved-images"] }),
          )
          .catch(console.error);
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Saved! 🎉",
        "Wallpaper saved to your gallery. View it in My Downloads.",
      );
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.message || "Could not save wallpaper.");
    } finally {
      setSaving(false);
    }
  };

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const headers = await getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/images/saved/${id}`,
        { type: "FAVORITE" },
        { headers },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-images"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (e) => {
      console.error(e);
      Alert.alert("Error", "Could not update favorite status.");
    },
  });

  const toggleFavorite = () => {
    if (!requireLogin("favorite")) return;
    if (toggleFavoriteMutation.isPending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavoriteMutation.mutate();
  };

  const handleApply = async () => {
    if (!requireLogin("apply")) return;
    if (applying) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setApplying(true);

    try {
      if (Platform.OS === "ios") {
        Alert.alert(
          "Set Wallpaper on iOS",
          "Apple doesn't allow apps to set wallpapers directly. Tap Save to download it, then open Photos → tap Share → Use as Wallpaper.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Save instead",
              onPress: () => {
                setApplying(false);
                handleSave();
              },
            },
          ],
        );
        return;
      }

      const granted = await requestMediaPermission();
      if (!granted) {
        Alert.alert(
          "Permission needed",
          "Allow media access to apply wallpaper.",
        );
        return;
      }

      const localUri = await downloadToCache();
      const asset = await MediaLibrary.createAssetAsync(localUri);
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      const contentUri = assetInfo?.localUri ?? localUri;

      await IntentLauncher.startActivityAsync(
        "android.intent.action.ATTACH_DATA",
        {
          data: contentUri,
          type: "image/jpeg",
          flags: 0x00000001 | 0x10000000,
          extra: { mimeType: "image/jpeg" },
        },
      );

      getAuthHeaders().then((headers) => {
        axios
          .post(
            `${API_URL}/images/saved/${id}`,
            { type: "APPLIED" },
            { headers },
          )
          .then(() =>
            queryClient.invalidateQueries({ queryKey: ["saved-images"] }),
          )
          .catch(console.error);
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      console.error(e);
      const isIntentError =
        e?.code === "ERR_INTENT_LAUNCHER" ||
        e?.message?.includes("No Activity found");

      if (isIntentError) {
        Alert.alert(
          "Not supported",
          "Wallpaper saved to gallery. Please apply it from your Photos app.",
        );
      } else {
        Alert.alert("Error", "Could not apply wallpaper.");
      }
    } finally {
      setApplying(false);
    }
  };

  const infoSlideY = infoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <Image
        source={{ uri: imageUrl }}
        placeholder={blurhash}
        contentFit="cover"
        style={StyleSheet.absoluteFillObject}
        transition={300}
      />

      <LinearGradient
        colors={[
          "rgba(0,0,0,0.45)",
          "transparent",
          "transparent",
          "rgba(0,0,0,0.8)",
        ]}
        locations={[0, 0.2, 0.6, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <BlurView intensity={35} tint="dark" style={styles.blurCircle}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.View
        style={[styles.infoDrawer, { transform: [{ translateY: infoSlideY }] }]}
        pointerEvents={showInfo ? "auto" : "none"}
      >
        <BlurView intensity={85} tint="dark" style={styles.infoBlur}>
          <YStack
            gap={20}
            paddingHorizontal={24}
            paddingTop={12}
            paddingBottom={24}
          >
            <View
              width={40}
              height={5}
              borderRadius={3}
              backgroundColor="rgba(255,255,255,0.2)"
              alignSelf="center"
              marginBottom={8}
            />

            <YStack gap={4}>
              <Text
                fontSize={W < 400 ? 20 : 24}
                fontWeight="900"
                color="#fff"
                letterSpacing={-0.5}
              >
                {title || "Untitled Masterpiece"}
              </Text>
              <Text
                fontSize={14}
                color="rgba(255,255,255,0.5)"
                fontWeight="500"
              >
                In {category || "Art Discovery"}
              </Text>
            </YStack>

            <XStack
              padding={12}
              borderRadius={16}
              backgroundColor="rgba(255,255,255,0.08)"
              alignItems="center"
              justifyContent="space-between"
            >
              <XStack gap={12} alignItems="center">
                <View
                  width={44}
                  height={44}
                  borderRadius={22}
                  overflow="hidden"
                  backgroundColor="$blue10"
                  borderWidth={2}
                  borderColor="rgba(255,255,255,0.2)"
                >
                  {artistData?.image ? (
                    <Image
                      source={{
                        uri: `${API_URL.replace("/api", "")}${artistData.image}`,
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <View
                      flex={1}
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor="$blue9"
                    >
                      <Text color="white" fontSize={16} fontWeight="800">
                        {artistInitials}
                      </Text>
                    </View>
                  )}
                </View>
                <YStack gap={1}>
                  <Text color="#fff" fontSize={16} fontWeight="700">
                    {uploadedBy || "Unknown Artist"}
                  </Text>
                  <Text
                    color="rgba(255,255,255,0.5)"
                    fontSize={12}
                    fontWeight="600"
                  >
                    Featured Creator
                  </Text>
                </YStack>
              </XStack>
              <TouchableOpacity style={styles.viewProfileBtn}>
                <Text color="$blue10" fontSize={12} fontWeight="800">
                  PROFILE
                </Text>
              </TouchableOpacity>
            </XStack>

            <XStack gap={10} flexWrap="wrap">
              {isAi === "true" && (
                <Badge icon="sparkles" label="AI Generated" color="#3B82F6" />
              )}
              {isPremium === "true" && (
                <Badge
                  icon="diamond"
                  label={`Premium · Rs. ${Math.round(parseInt(price!) / 100)}`}
                  color="#facc15"
                />
              )}
            </XStack>
          </YStack>
        </BlurView>
      </Animated.View>

      <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
        <View style={styles.actionBar}>
          <ActionButton
            icon="information-circle"
            label="Info"
            active={showInfo}
            onPress={toggleInfo}
          />
          <ActionButton
            icon={isFavorited ? "heart" : "heart-outline"}
            label={isFavorited ? "Liked" : "Like"}
            active={isFavorited}
            loading={toggleFavoriteMutation.isPending}
            onPress={toggleFavorite}
          />
          <ActionButton
            icon={
              isPremium === "true" && !isOwner ? "cart" : "arrow-down-circle"
            }
            label={isPremium === "true" && !isOwner ? "Buy" : "Save"}
            loading={saving}
            onPress={handleSave}
          />
          <ActionButton
            icon="color-wand"
            label="Apply"
            accent
            loading={applying}
            onPress={handleApply}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Badge({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <XStack
      paddingHorizontal={12}
      paddingVertical={8}
      borderRadius={12}
      backgroundColor="rgba(255,255,255,0.08)"
      gap={8}
      alignItems="center"
      borderWidth={1}
      borderColor={`${color}33`}
    >
      <Ionicons name={icon as any} size={14} color={color} />
      <Text color={color} fontSize={12} fontWeight="800" letterSpacing={0.5}>
        {label}
      </Text>
    </XStack>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  accent = false,
  active = false,
  loading = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  accent?: boolean;
  active?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.actionBtn, accent && styles.accentBtn]}
    >
      <BlurView
        intensity={accent ? 0 : 40}
        tint="dark"
        style={[
          styles.actionBtnInner,
          accent && { backgroundColor: "#3B82F6" },
          active && { backgroundColor: "rgba(59, 130, 246, 0.2)" },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons
            name={icon as any}
            size={24}
            color={active ? "#3B82F6" : "#fff"}
          />
        )}
        <Text
          fontSize={11}
          fontWeight="800"
          color={active ? "#3B82F6" : "#fff"}
          marginTop={6}
          letterSpacing={0.2}
        >
          {label.toUpperCase()}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: { width: 48, height: 48, borderRadius: 24, overflow: "hidden" },
  blurCircle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  infoDrawer: {
    position: "absolute",
    bottom: 120,
    left: 12,
    right: 12,
    borderRadius: 28,
    overflow: "hidden",
    zIndex: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  infoBlur: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  bottomSafe: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  actionBtn: { borderRadius: 22, overflow: "hidden", flex: 1 },
  accentBtn: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  actionBtnInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  viewProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
});
