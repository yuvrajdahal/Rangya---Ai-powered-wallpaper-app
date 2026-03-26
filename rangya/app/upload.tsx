// Paste March 17, 2026 - Updated implementation

import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library"; // NEW: Media library for downloading
import { useState } from "react";
import { API_URL, authClient, getAuthHeaders } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  ScrollView,
  Switch,
  Text,
  TextArea,
  View,
  XStack,
  YStack,
  useTheme,
} from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { PrimaryInput, PrimaryTextArea } from "../components/primary-input";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { File, Paths } from "expo-file-system/next";

const POLLINATIONS_MODELS = [
  { id: "flux", label: "Flux", badge: "Fast" },
  { id: "zimage", label: "Z-Image", badge: "Balanced" },
  { id: "klein", label: "Klein", badge: "Smart" },
];

const STYLE_CHIPS = [
  "Photorealistic",
  "Cinematic",
  "Anime",
  "Oil Painting",
  "Watercolor",
  "Neon Glow",
  "Minimalist",
  "Cyberpunk",
  "Fantasy",
  "Abstract",
  "Lo-fi",
  "Dark Moody",
];

const THEME_CHIPS = [
  "Nature",
  "Space",
  "City",
  "Ocean",
  "Mountains",
  "Architecture",
  "Abstract",
  "Flowers",
  "Forest",
  "Desert",
  "Futuristic",
  "Vintage",
];

const ASPECT_RATIOS = [
  { label: "9:16", value: "9:16 portrait mobile wallpaper" },
];

type Mode = "upload" | "generate";

export default function UploadPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useTheme();

  const [mode, setMode] = useState<Mode>("upload");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(POLLINATIONS_MODELS[0].id);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0].value);

  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCategoryId, setGeneratedCategoryId] = useState<string | null>(
    null,
  );
  const [generatedCategoryName, setGeneratedCategoryName] = useState("");

  // NEW: Full Screen Preview States
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const accentColor = theme.blue10?.val ?? "#3B82F6";
  const iconColor = isDark ? "#fff" : "#111";
  const pillBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dividerColor = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.07)";
  const subtitleColor = theme.color11?.val ?? "#888";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data.categories || [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const authHeaders = await getAuthHeaders();
      const response = await axios.post(`${API_URL}/images/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...authHeaders,
        },
        transformRequest: (data) => data,
      });
      return response.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Image uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["images"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.back();
    },
    onError: (e: any) => {
      Alert.alert(
        "Upload Failed",
        e.response?.data?.message || e.message || "Something went wrong",
      );
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleUpload = () => {
    const uri = mode === "generate" ? generatedImageUri : imageUri;
    const catId =
      mode === "generate" ? generatedCategoryId : selectedCategoryId;
    const catName =
      mode === "generate" ? generatedCategoryName : newCategoryName;
    if (!uri) return;

    const formData = new FormData();
    formData.append("image", {
      uri,
      name: "upload.jpg",
      type: "image/jpeg",
    } as any);
    if (catId) formData.append("categoryId", catId);
    else if (catName) formData.append("categoryName", catName);

    if (isPremium) {
      formData.append("isPremium", "true");
      if (price) formData.append("price", price);
    }
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);

    uploadMutation.mutate(formData);
  };

  const toggleChip = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const buildPrompt = () => {
    const parts = [prompt.trim()];
    if (selectedStyles.length)
      parts.push(`Style: ${selectedStyles.join(", ")}`);
    if (selectedThemes.length)
      parts.push(`Theme: ${selectedThemes.join(", ")}`);
    parts.push(`Aspect ratio: ${selectedRatio}`);
    parts.push(
      "High resolution mobile wallpaper, 9:16 portrait orientation. No text, no watermarks.",
    );
    return parts.filter(Boolean).join(". ");
  };

  const handleGenerate = async () => {
    if (
      !prompt.trim() &&
      selectedStyles.length === 0 &&
      selectedThemes.length === 0
    ) {
      Alert.alert(
        "Describe your wallpaper",
        "Add a prompt, style, or theme first.",
      );
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUri(null);

    try {
      const authHeaders = await getAuthHeaders();

      const response = await fetch(`${API_URL}/images/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ prompt: buildPrompt(), model: selectedModel }),
      });

      if (response.status === 429) {
        Alert.alert(
          "Limit Reached",
          "Daily limit of 10 images reached. Try again tomorrow.",
        );
        return;
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        Alert.alert(
          "Error",
          err.message || `Generation failed (${response.status})`,
        );
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const file = new File(Paths.cache, `generated_${Date.now()}.jpg`);
      await file.write(uint8);

      setGeneratedImageUri(file.uri);
    } catch (e: any) {
      Alert.alert("Generation Failed", e.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Download Image Handler
  const handleDownload = async (uri: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need media library permissions to save the image.",
        );
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Success", "Wallpaper saved to your gallery!");
    } catch (error) {
      Alert.alert("Error", "Failed to save the image to your device.");
    }
  };

  // NEW: Full Screen Preview Handler
  const openPreview = (uri: string) => {
    setPreviewUri(uri);
    setIsPreviewVisible(true);
  };

  const isUploadDisabled =
    mode === "upload"
      ? !imageUri ||
        (!selectedCategoryId && !newCategoryName) ||
        (isPremium && !price) ||
        uploadMutation.isPending
      : !generatedImageUri ||
        (!generatedCategoryId && !generatedCategoryName) ||
        uploadMutation.isPending;

  return (
    <View flex={1} backgroundColor="$background">
      {/* FULL SCREEN PREVIEW MODAL */}
      <Modal visible={isPreviewVisible} transparent={true} animationType="fade">
        <View flex={1} backgroundColor="black">
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          )}
          <SafeAreaView style={{ position: "absolute", top: 0, width: "100%" }}>
            <XStack
              justifyContent="flex-end"
              paddingHorizontal="$4"
              paddingTop="$2"
            >
              <TouchableOpacity
                onPress={() => setIsPreviewVisible(false)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </XStack>
          </SafeAreaView>
        </View>
      </Modal>

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
          <XStack alignItems="center">
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                width={38}
                height={38}
                borderRadius={12}
                alignItems="center"
                justifyContent="center"
                backgroundColor={pillBg as any}
              >
                <Ionicons name="chevron-back" size={22} color={iconColor} />
              </View>
            </TouchableOpacity>
            <Text
              fontSize={17}
              fontWeight="700"
              color="$color"
              flex={1}
              textAlign="center"
              marginHorizontal="$3"
            >
              {mode === "upload" ? "Upload Wallpaper" : "AI Generator"}
            </Text>
            <View width={38} />
          </XStack>
        </BlurView>

        {/* Mode Toggle */}
        <XStack
          marginHorizontal="$5"
          marginTop="$3"
          marginBottom="$1"
          borderRadius={14}
          backgroundColor="$color3"
          padding={4}
          gap={4}
        >
          {(["upload", "generate"] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                style={{ flex: 1 }}
                activeOpacity={0.85}
              >
                {active ? (
                  <LinearGradient
                    colors={
                      m === "generate"
                        ? ["#6366F1", "#3B82F6"]
                        : ["#3B82F6", "#2563EB"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 38,
                      borderRadius: 11,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <XStack alignItems="center" gap={6} justifyContent="center">
                      <Ionicons
                        name={
                          m === "upload"
                            ? "cloud-upload-outline"
                            : "sparkles-outline"
                        }
                        size={15}
                        color="#fff"
                      />
                      <Text fontSize={13} fontWeight="700" color="white">
                        {m === "upload" ? "Upload" : "AI Generate"}
                      </Text>
                    </XStack>
                  </LinearGradient>
                ) : (
                  <View
                    height={38}
                    borderRadius={11}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <XStack alignItems="center" gap={6} justifyContent="center">
                      <Ionicons
                        name={
                          m === "upload"
                            ? "cloud-upload-outline"
                            : "sparkles-outline"
                        }
                        size={15}
                        color={subtitleColor}
                      />
                      <Text fontSize={13} fontWeight="600" color="$color11">
                        {m === "upload" ? "Upload" : "AI Generate"}
                      </Text>
                    </XStack>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </XStack>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          backgroundColor="$background"
        >
          <YStack
            paddingHorizontal="$5"
            paddingTop="$4"
            paddingBottom="$10"
            gap="$5"
          >
            {mode === "upload" ? (
              <>
                {imageUri ? (
                  <YStack alignItems="center" gap="$3">
                    <TouchableOpacity
                      onPress={() => openPreview(imageUri)}
                      activeOpacity={0.9}
                    >
                      <View
                        borderRadius={20}
                        overflow="hidden"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.25,
                          shadowRadius: 16,
                          elevation: 10,
                        }}
                      >
                        <Image
                          source={{ uri: imageUri }}
                          contentFit="cover"
                          style={{ width: 180, aspectRatio: 9 / 16 }}
                        />
                        <TouchableOpacity
                          onPress={() => setImageUri(null)}
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: "rgba(0,0,0,0.55)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Feather name="x" size={14} color="white" />
                        </TouchableOpacity>

                        {/* Overlay to indicate preview is clickable */}
                        <View
                          position="absolute"
                          bottom={10}
                          right={10}
                          backgroundColor="rgba(0,0,0,0.55)"
                          padding={6}
                          borderRadius={12}
                        >
                          <Ionicons name="expand" size={16} color="white" />
                        </View>
                      </View>
                    </TouchableOpacity>

                    <XStack
                      paddingHorizontal={12}
                      paddingVertical={5}
                      borderRadius={20}
                      alignItems="center"
                      gap={5}
                      backgroundColor={pillBg as any}
                    >
                      <Ionicons
                        name="crop-outline"
                        size={12}
                        color={subtitleColor}
                      />
                      <Text fontSize={11} fontWeight="600" color="$color11">
                        9:16 · Mobile Wallpaper
                      </Text>
                    </XStack>

                    <XStack gap="$3">
                      <TouchableOpacity onPress={pickImage}>
                        <XStack
                          paddingHorizontal={16}
                          paddingVertical={9}
                          borderRadius={20}
                          alignItems="center"
                          gap={6}
                          backgroundColor={pillBg as any}
                        >
                          <Feather
                            name="refresh-cw"
                            size={13}
                            color={iconColor}
                          />
                          <Text fontSize={13} fontWeight="600" color="$color">
                            Change
                          </Text>
                        </XStack>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openPreview(imageUri)}>
                        <XStack
                          paddingHorizontal={16}
                          paddingVertical={9}
                          borderRadius={20}
                          alignItems="center"
                          gap={6}
                          backgroundColor={pillBg as any}
                        >
                          <Feather
                            name="maximize"
                            size={13}
                            color={iconColor}
                          />
                          <Text fontSize={13} fontWeight="600" color="$color">
                            Preview
                          </Text>
                        </XStack>
                      </TouchableOpacity>
                    </XStack>
                  </YStack>
                ) : (
                  <TouchableOpacity onPress={pickImage} activeOpacity={0.75}>
                    <YStack
                      borderWidth={1.5}
                      borderColor="$borderColor"
                      borderStyle="dashed"
                      borderRadius={20}
                      backgroundColor="$color3"
                      justifyContent="center"
                      alignItems="center"
                      gap="$2"
                      paddingVertical={36}
                    >
                      <View
                        width={52}
                        height={52}
                        borderRadius={16}
                        backgroundColor="$color4"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Feather name="image" size={24} color={iconColor} />
                      </View>
                      <Text
                        fontSize={15}
                        fontWeight="700"
                        color="$color"
                        marginTop="$1"
                      >
                        Select Wallpaper
                      </Text>
                      <Text fontSize={12} color="$color11">
                        Cropped to 9:16 portrait
                      </Text>
                      <YStack marginTop={8} alignItems="center" gap={4}>
                        <View
                          width={18}
                          height={32}
                          borderRadius={3}
                          borderWidth={1.5}
                          borderColor="rgba(150,150,150,0.4)"
                          backgroundColor="rgba(59,130,246,0.1)"
                        />
                        <Text
                          fontSize={10}
                          fontWeight="700"
                          color="$color11"
                          letterSpacing={0.5}
                        >
                          9:16
                        </Text>
                      </YStack>
                    </YStack>
                  </TouchableOpacity>
                )}

                <CategorySection
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  setSelectedCategoryId={setSelectedCategoryId}
                  newCategoryName={newCategoryName}
                  setNewCategoryName={setNewCategoryName}
                  isDark={isDark}
                />

                <YStack gap="$3" marginTop="$2">
                  <Text fontSize={13} fontWeight="600" color="$color11">Title (Optional)</Text>
                  <PrimaryInput
                    placeholder="Enter image title"
                    value={title}
                    onChangeText={setTitle}
                    icon="text-outline"
                  />
                  <Text fontSize={13} fontWeight="600" color="$color11">Description (Optional)</Text>
                  <PrimaryTextArea
                    placeholder="Enter image description"
                    value={description}
                    onChangeText={setDescription}
                  />
                </YStack>

                {/* Premium Switch logic remains same */}
                <View
                  borderRadius={20}
                  padding="$4"
                  backgroundColor="$color3"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$3">
                      <View
                        width={40}
                        height={40}
                        borderRadius={12}
                        backgroundColor={
                          isPremium
                            ? isDark
                              ? "rgba(59,130,246,0.2)"
                              : "rgba(59,130,246,0.12)"
                            : "$color4"
                        }
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons
                          name="diamond-outline"
                          size={18}
                          color={
                            isPremium
                              ? "#3b82f6"
                              : isDark
                                ? "rgba(255,255,255,0.5)"
                                : "rgba(0,0,0,0.4)"
                          }
                        />
                      </View>
                      <YStack>
                        <Text fontSize={15} fontWeight="700" color="$color">
                          Premium
                        </Text>
                        <Text fontSize={12} color="$color11">
                          Require payment to download
                        </Text>
                      </YStack>
                    </XStack>
                    <Switch
                      size="$3"
                      checked={isPremium}
                      onCheckedChange={setIsPremium}
                      backgroundColor={
                        isPremium ? "$blue9" : "$backgroundFocus"
                      }
                    >
                      <Switch.Thumb />
                    </Switch>
                  </XStack>
                  {isPremium && (
                    <YStack marginTop="$4" gap="$2">
                      <View height={1} backgroundColor="$borderColor" />
                      <YStack marginTop="$2" gap="$2">
                        <Text fontSize={13} fontWeight="600" color="$color11">
                          Price (USD)
                        </Text>
                        <PrimaryInput
                          placeholder="e.g. 2.99"
                          keyboardType="numeric"
                          value={price}
                          onChangeText={setPrice}
                          icon="pricetag-outline"
                        />
                      </YStack>
                    </YStack>
                  )}
                </View>
              </>
            ) : (
              <>
                {/* AI Generator Tools... (Model, Prompt, Styles, Themes remain identical) */}
                <YStack gap="$3">
                  <SectionLabel label="Model" icon="hardware-chip-outline" />
                  <XStack gap="$2">
                    {POLLINATIONS_MODELS.map((m) => {
                      const active = selectedModel === m.id;
                      return (
                        <TouchableOpacity
                          key={m.id}
                          onPress={() => setSelectedModel(m.id)}
                          style={{ flex: 1 }}
                          activeOpacity={0.8}
                        >
                          <View
                            flex={1}
                            padding="$3"
                            borderRadius={14}
                            borderWidth={1.5}
                            borderColor={active ? "$blue10" : "$borderColor"}
                            backgroundColor={
                              active
                                ? isDark
                                  ? "rgba(59,130,246,0.15)"
                                  : "rgba(59,130,246,0.08)"
                                : "$color3"
                            }
                            alignItems="center"
                            gap="$1"
                          >
                            <Text
                              fontSize={13}
                              fontWeight="800"
                              color={active ? "$blue10" : "$color"}
                            >
                              {m.label}
                            </Text>
                            <Text
                              fontSize={10}
                              fontWeight="700"
                              letterSpacing={0.8}
                              color={active ? "$blue9" : "$color11"}
                            >
                              {m.badge.toUpperCase()}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </XStack>
                </YStack>

                <YStack gap="$2">
                  <SectionLabel label="Prompt" icon="text-outline" />
                  <PrimaryTextArea
                    placeholder="Describe your wallpaper… e.g. 'Misty mountain peaks at golden hour'"
                    value={prompt}
                    onChangeText={setPrompt}
                    minHeight={120}
                  />
                </YStack>

                <YStack gap="$3">
                  <SectionLabel label="Style" icon="color-palette-outline" />
                  <XStack flexWrap="wrap">
                    {STYLE_CHIPS.map((s) => {
                      const active = selectedStyles.includes(s);
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() =>
                            toggleChip(s, selectedStyles, setSelectedStyles)
                          }
                          activeOpacity={0.75}
                        >
                          <View
                            paddingHorizontal={14}
                            paddingVertical={7}
                            borderRadius={20}
                            borderWidth={1.5}
                            borderColor={active ? "$blue10" : "$borderColor"}
                            backgroundColor={
                              active
                                ? isDark
                                  ? "rgba(59,130,246,0.18)"
                                  : "rgba(59,130,246,0.1)"
                                : "$color3"
                            }
                            marginBottom={8}
                            marginRight={8}
                          >
                            <Text
                              fontSize={12}
                              fontWeight="600"
                              color={active ? "$blue10" : "$color11"}
                            >
                              {s}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </XStack>
                </YStack>

                <YStack gap="$3">
                  <SectionLabel label="Theme" icon="leaf-outline" />
                  <XStack flexWrap="wrap">
                    {THEME_CHIPS.map((t) => {
                      const active = selectedThemes.includes(t);
                      return (
                        <TouchableOpacity
                          key={t}
                          onPress={() =>
                            toggleChip(t, selectedThemes, setSelectedThemes)
                          }
                          activeOpacity={0.75}
                        >
                          <View
                            paddingHorizontal={14}
                            paddingVertical={7}
                            borderRadius={20}
                            borderWidth={1.5}
                            borderColor={active ? "$blue10" : "$borderColor"}
                            backgroundColor={
                              active
                                ? isDark
                                  ? "rgba(99,102,241,0.18)"
                                  : "rgba(99,102,241,0.1)"
                                : "$color3"
                            }
                            marginBottom={8}
                            marginRight={8}
                          >
                            <Text
                              fontSize={12}
                              fontWeight="600"
                              color={active ? "$blue10" : "$color11"}
                            >
                              {t}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </XStack>
                </YStack>

                <TouchableOpacity
                  onPress={handleGenerate}
                  disabled={isGenerating}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    opacity: isGenerating ? 0.8 : 1,
                    shadowColor: "#6366F1",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 14,
                    elevation: 8,
                  }}
                >
                  <LinearGradient
                    colors={["#6366F1", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 54,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isGenerating ? (
                      <XStack alignItems="center" gap="$2">
                        <ActivityIndicator size="small" color="#fff" />
                        <Text color="white" fontSize={15} fontWeight="700">
                          Generating…
                        </Text>
                      </XStack>
                    ) : (
                      <XStack alignItems="center" gap="$2">
                        <Ionicons name="sparkles" size={17} color="#fff" />
                        <Text color="white" fontSize={15} fontWeight="700">
                          Generate Wallpaper
                        </Text>
                      </XStack>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Generated Preview & Actions */}
                {generatedImageUri && (
                  <YStack gap="$4">
                    <View
                      height={1}
                      backgroundColor="$borderColor"
                      opacity={0.5}
                    />
                    <SectionLabel
                      label="Generated Result"
                      icon="checkmark-circle-outline"
                    />

                    <YStack alignItems="center" gap="$3">
                      <TouchableOpacity
                        onPress={() => openPreview(generatedImageUri)}
                        activeOpacity={0.9}
                      >
                        <View
                          borderRadius={20}
                          overflow="hidden"
                          style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            elevation: 10,
                          }}
                        >
                          <Image
                            source={{ uri: generatedImageUri }}
                            contentFit="cover"
                            style={{ width: 180, aspectRatio: 9 / 16 }}
                          />
                          <View
                            position="absolute"
                            bottom={10}
                            right={10}
                            backgroundColor="rgba(0,0,0,0.55)"
                            padding={6}
                            borderRadius={12}
                          >
                            <Ionicons name="expand" size={16} color="white" />
                          </View>
                        </View>
                      </TouchableOpacity>

                      <XStack
                        paddingHorizontal={12}
                        paddingVertical={5}
                        borderRadius={20}
                        alignItems="center"
                        gap={5}
                        backgroundColor={pillBg as any}
                      >
                        <Ionicons
                          name="crop-outline"
                          size={12}
                          color={subtitleColor}
                        />
                        <Text fontSize={11} fontWeight="600" color="$color11">
                          9:16 · Ready for use
                        </Text>
                      </XStack>

                      {/* NEW: Tooling Options for Generated Image */}
                      <XStack gap="$3" marginTop="$1">
                        <TouchableOpacity onPress={handleGenerate}>
                          <XStack
                            paddingHorizontal={14}
                            paddingVertical={8}
                            borderRadius={20}
                            alignItems="center"
                            gap={6}
                            backgroundColor={pillBg as any}
                          >
                            <Feather
                              name="refresh-cw"
                              size={13}
                              color={iconColor}
                            />
                            <Text fontSize={13} fontWeight="600" color="$color">
                              Regenerate
                            </Text>
                          </XStack>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDownload(generatedImageUri)}
                        >
                          <XStack
                            paddingHorizontal={14}
                            paddingVertical={8}
                            borderRadius={20}
                            alignItems="center"
                            gap={6}
                            backgroundColor={pillBg as any}
                          >
                            <Feather
                              name="download"
                              size={13}
                              color={iconColor}
                            />
                            <Text fontSize={13} fontWeight="600" color="$color">
                              Save
                            </Text>
                          </XStack>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => openPreview(generatedImageUri)}
                        >
                          <XStack
                            paddingHorizontal={14}
                            paddingVertical={8}
                            borderRadius={20}
                            alignItems="center"
                            gap={6}
                            backgroundColor={pillBg as any}
                          >
                            <Feather
                              name="maximize"
                              size={13}
                              color={iconColor}
                            />
                            <Text fontSize={13} fontWeight="600" color="$color">
                              Preview
                            </Text>
                          </XStack>
                        </TouchableOpacity>
                      </XStack>
                    </YStack>

                    <CategorySection
                      categories={categories}
                      selectedCategoryId={generatedCategoryId}
                      setSelectedCategoryId={setGeneratedCategoryId}
                      newCategoryName={generatedCategoryName}
                      setNewCategoryName={setGeneratedCategoryName}
                      isDark={isDark}
                    />
                  </YStack>
                )}
              </>
            )}

            {/* Action Buttons: Cancel and Upload (Works for both manual and generated) */}
            {(mode === "upload" || generatedImageUri) && (
              <XStack gap="$3" marginTop="$2">
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: dividerColor,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text fontSize={15} fontWeight="600" color="$color">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpload}
                  disabled={isUploadDisabled}
                  style={{
                    flex: 2,
                    height: 52,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: accentColor,
                    opacity: isUploadDisabled ? 0.4 : 1,
                    shadowColor: accentColor,
                    shadowOpacity: isUploadDisabled ? 0 : 0.38,
                    shadowOffset: { width: 0, height: 5 },
                    shadowRadius: 12,
                    elevation: 7,
                  }}
                >
                  <XStack alignItems="center" gap="$2">
                    {uploadMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons
                        name="cloud-upload-outline"
                        size={18}
                        color="#fff"
                      />
                    )}
                    <Text color="white" fontSize={15} fontWeight="700">
                      {uploadMutation.isPending
                        ? "Uploading…"
                        : mode === "generate"
                          ? "Upload Generated Image"
                          : "Upload"}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              </XStack>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
      <SafeAreaView edges={["bottom"]} />
    </View>
  );
}

function SectionLabel({ label, icon }: { label: string; icon: string }) {
  const theme = useTheme();
  return (
    <XStack alignItems="center" gap="$2">
      <Ionicons
        name={icon as any}
        size={16}
        color={theme.blue10?.val ?? "#3B82F6"}
      />
      <Text fontSize={14} fontWeight="700" color="$color" letterSpacing={-0.2}>
        {label}
      </Text>
    </XStack>
  );
}

function CategorySection({
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  newCategoryName,
  setNewCategoryName,
  isDark,
}: any) {
  return (
    <YStack gap="$3">
      <SectionLabel label="Category" icon="folder-outline" />
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" paddingBottom="$1">
            {categories.map((cat: any) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategoryId(cat.id);
                    setNewCategoryName("");
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    paddingHorizontal={16}
                    paddingVertical={8}
                    borderRadius={20}
                    borderWidth={1.5}
                    borderColor={isSelected ? "$blue10" : "$borderColor"}
                    backgroundColor={
                      isSelected
                        ? isDark
                          ? "rgba(59,130,246,0.2)"
                          : "rgba(59,130,246,0.1)"
                        : "$color3"
                    }
                  >
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color={isSelected ? "$blue10" : "$color11"}
                    >
                      {cat.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </XStack>
        </ScrollView>
      )}
      <PrimaryInput
        placeholder={
          categories.length > 0
            ? "Or create new category…"
            : "Category name e.g. Abstract, Nature"
        }
        value={newCategoryName}
        onChangeText={(text: string) => {
          setNewCategoryName(text);
          if (text) setSelectedCategoryId(null);
        }}
      />
    </YStack>
  );
}
