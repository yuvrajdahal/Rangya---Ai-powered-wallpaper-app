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
  } = useLocalSearchParams<{
    id: string;
    imageUrl: string;
    title?: string;
    category?: string;
    uploadedBy?: string;
    blurhash?: string;
    isPremium?: string;
    price?: string;
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

  const toggleInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = showInfo ? 0 : 1;
    setShowInfo(!showInfo);
    Animated.spring(infoAnim, {
      toValue,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
    }).start();
  };

  // ── Download image to cache using the new File API ──────────────
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

  // ── Auth guard ──────────────────────────────────────────────────
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
    console.log(isPremium);
    if (isPremium === "true") {
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

      // Get free download access mapping
      const downloadUrl = await getFreeDownload(id);

      const localUri = await downloadToCache();
      await MediaLibrary.saveToLibraryAsync(localUri);

      // Sync with backend (don't wait for it to finish)
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

  // ── Apply wallpaper directly on device ─────────────────────────
  //
  // Android: Uses ACTION_ATTACH_DATA intent — this triggers the native
  // "Set as wallpaper" system dialog (Home / Lock / Both) directly
  // from within the app. No custom native module needed.
  //
  // iOS: System restriction prevents any app from setting the wallpaper
  // programmatically. We save it and guide the user instead.
  //
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

      // ── Android path ────────────────────────────────────────────
      // 1. Save the image to the media library so we get a real
      //    content:// URI that the system WallpaperManager can read.
      // 2. Fire ACTION_ATTACH_DATA — Android's built-in intent that
      //    opens the "Set as…" picker (Home / Lock screen / Both).
      const granted = await requestMediaPermission();
      if (!granted) {
        Alert.alert(
          "Permission needed",
          "Allow media access to apply wallpaper.",
        );
        return;
      }

      const localUri = await downloadToCache();

      // Save to media library and get the resulting content URI
      const asset = await MediaLibrary.createAssetAsync(localUri);
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      const contentUri = assetInfo?.localUri ?? localUri;

      // ACTION_ATTACH_DATA opens the system "Set as wallpaper" sheet
      await IntentLauncher.startActivityAsync(
        "android.intent.action.ATTACH_DATA",
        {
          data: contentUri,
          type: "image/jpeg",
          // FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK
          flags: 0x00000001 | 0x10000000,
          extra: { mimeType: "image/jpeg" },
        },
      );

      // Sync with backend
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

      // Some OEM launchers don't handle ACTION_ATTACH_DATA — fall back gracefully
      const isIntentError =
        e?.code === "ERR_INTENT_LAUNCHER" ||
        e?.message?.includes("No Activity found") ||
        e?.message?.includes("ActivityNotFoundException");

      if (isIntentError) {
        Alert.alert(
          "Not supported on this device",
          "Your device doesn't support setting wallpapers this way. The wallpaper has been saved to your gallery — open it in Photos and choose 'Use as Wallpaper'.",
        );
      } else {
        Alert.alert(
          "Error",
          "Could not apply wallpaper. Please try Save instead.",
        );
      }
    } finally {
      setApplying(false);
    }
  };

  const infoSlideY = infoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [240, 0],
  });

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ── Full-screen image ── */}
      <Image
        source={{ uri: imageUrl }}
        placeholder={blurhash}
        contentFit="cover"
        style={StyleSheet.absoluteFillObject}
        transition={300}
      />

      {/* Dark gradient overlay — top + bottom */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.42)",
          "transparent",
          "transparent",
          "rgba(0,0,0,0.68)",
        ]}
        locations={[0, 0.25, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* ── Top bar: back button ── */}
      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <BlurView intensity={60} tint="dark" style={styles.blurCircle}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </BlurView>
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── Info drawer (slides up) ── */}
      <Animated.View
        style={[styles.infoDrawer, { transform: [{ translateY: infoSlideY }] }]}
        pointerEvents={showInfo ? "auto" : "none"}
      >
        <BlurView intensity={72} tint="dark" style={styles.infoBlur}>
          <YStack gap={10} paddingHorizontal={20} paddingVertical={18}>
            <Text fontSize={18} fontWeight="800" color="#fff">
              {title || "Wallpaper"}
            </Text>
            {!!category && (
              <XStack gap={6} alignItems="center">
                <Ionicons
                  name="grid-outline"
                  size={14}
                  color="rgba(255,255,255,0.6)"
                />
                <Text fontSize={13} color="rgba(255,255,255,0.7)">
                  {category}
                </Text>
              </XStack>
            )}
            {!!uploadedBy && (
              <XStack gap={6} alignItems="center">
                <Ionicons
                  name="person-outline"
                  size={14}
                  color="rgba(255,255,255,0.6)"
                />
                <Text fontSize={13} color="rgba(255,255,255,0.7)">
                  By {uploadedBy}
                </Text>
              </XStack>
            )}
            <XStack gap={6} alignItems="center">
              <Ionicons
                name="resize-outline"
                size={14}
                color="rgba(255,255,255,0.6)"
              />
              <Text fontSize={13} color="rgba(255,255,255,0.7)">
                High resolution · 9:16
              </Text>
            </XStack>
            {isPremium === "true" && (
              <XStack gap={6} alignItems="center">
                <Ionicons name="diamond" size={14} color="#facc15" />
                <Text fontSize={13} color="#facc15" fontWeight="600">
                  Premium Image {price ? `(NPR ${parseInt(price) / 100})` : ""}
                </Text>
              </XStack>
            )}
          </YStack>
        </BlurView>
      </Animated.View>

      {/* ── Bottom action bar ── */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
        <View style={styles.actionBar}>
          <ActionButton
            icon="information"
            label="Info"
            active={showInfo}
            onPress={toggleInfo}
          />
          <ActionButton
            icon={isFavorited ? "heart" : "heart-outline"}
            label={isFavorited ? "Liked" : "Favorite"}
            active={isFavorited}
            loading={toggleFavoriteMutation.isPending}
            onPress={toggleFavorite}
          />
          <ActionButton
            icon={isPremium === "true" ? "cart-outline" : "download-outline"}
            label={isPremium === "true" ? "Buy" : "Save"}
            loading={saving}
            onPress={handleSave}
          />
          <ActionButton
            icon="brush-outline"
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
      activeOpacity={0.8}
      style={[
        styles.actionBtn,
        accent && styles.accentBtn,
        active && styles.activeBtn,
      ]}
    >
      <BlurView
        intensity={accent ? 0 : 55}
        tint="dark"
        style={[
          styles.actionBtnInner,
          accent && { backgroundColor: "#3B82F6" },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons
            name={icon as any}
            size={22}
            color={active ? "#3B82F6" : "#fff"}
          />
        )}
        <Text
          fontSize={12}
          fontWeight="600"
          color={active ? "#3B82F6" : "#fff"}
          marginTop={4}
        >
          {label}
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, overflow: "hidden" },
  blurCircle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  infoDrawer: {
    position: "absolute",
    bottom: 110,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 15,
  },
  infoBlur: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
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
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
  },
  actionBtn: { borderRadius: 18, overflow: "hidden", flex: 1 },
  accentBtn: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  activeBtn: {},
  actionBtnInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
