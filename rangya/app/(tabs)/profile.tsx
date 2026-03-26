import { Avatar, Text, View, YStack, XStack, useTheme } from "tamagui";
import {
  useSession,
  signOut,
  API_URL,
  authClient,
  getAuthHeaders,
} from "../../lib/auth-client";
import { useRouter } from "expo-router";
import { TouchableOpacity, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useState } from "react";
import * as SecureStore from "expo-secure-store";

function MenuItem({
  icon,
  label,
  onPress,
  danger = false,
  isDark,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  isDark: boolean;
}) {
  const bg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const iconBg = danger
    ? "rgba(239,68,68,0.12)"
    : isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.06)";
  const iconColor = danger ? "#ef4444" : isDark ? "#fff" : "#111";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: bg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: border,
        padding: 14,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon as any} size={19} color={iconColor} />
      </View>
      <Text
        flex={1}
        fontSize={15}
        fontWeight="600"
        color={danger ? "#ef4444" : "$color"}
      >
        {label}
      </Text>
      {!danger && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"}
        />
      )}
    </TouchableOpacity>
  );
}

// ── Stat badge ───────────────────────────────────────────────────
function StatBadge({
  value,
  label,
  isDark,
}: {
  value: string;
  label: string;
  isDark: boolean;
}) {
  return (
    <YStack
      flex={1}
      alignItems="center"
      paddingVertical="$3"
      gap="$1"
      backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
      borderRadius={16}
      borderWidth={1}
      borderColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}
    >
      <Text fontSize={22} fontWeight="800" color="$color" letterSpacing={-0.5}>
        {value}
      </Text>
      <Text fontSize={12} color="$color11" fontWeight="500">
        {label}
      </Text>
    </YStack>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { data: session, isPending } = useSession();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useTheme();

  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const handleLogout = async () => {
    await signOut();
    router.replace("/(tabs)/explore");
  };

  // ── Loading ──
  if (isPending) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
      >
        <Text color="$color11" fontSize={15}>
          Loading…
        </Text>
      </View>
    );
  }

  // ── Logged In ──
  if (session) {
    const initials = session.user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const BASE_URL = API_URL.replace("/api", "");

    const handleAvatarUpload = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled) {
          setUploadingAvatar(true);
          const uri = result.assets[0].uri;

          // Prepare FormData
          const fileToUpload = {
            uri,
            type: "image/jpeg",
            name: `avatar-${Date.now()}.jpg`,
          } as any;

          const formData = new FormData();
          formData.append("image", fileToUpload);

          // Upload to backend — gets back the new relative image path
          const authHeaders = await getAuthHeaders();
          const res = await axios.post(
            `${BASE_URL}/api/auth/upload-avatar`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                ...authHeaders,
              },
            },
          );

          const newImagePath: string | undefined = res.data?.user?.image;
          if (newImagePath) {
            // Sync the new image URL back into better-auth's session so
            // useSession() picks it up immediately everywhere in the app.
            await authClient.updateUser({ image: newImagePath });
            Alert.alert("Success", "Profile picture updated!");
          }
        }
      } catch (error) {
        console.error("Avatar upload failed:", error);
        Alert.alert("Error", "Failed to upload avatar");
      } finally {
        setUploadingAvatar(false);
      }
    };

    return (
      <View flex={1} backgroundColor="$background">
        {/* ── Sticky BlurView header ── */}
        <SafeAreaView
          edges={["top"]}
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: barBorderColor,
          }}
        >
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$4"
            paddingTop="$2"
            paddingBottom="$4"
          >
            <YStack gap={2}>
              <Text
                fontSize={11}
                fontWeight="700"
                color="$blue10"
                letterSpacing={2.2}
                textTransform="uppercase"
              >
                Account
              </Text>
              <Text
                fontSize={24}
                fontWeight="800"
                color="$color"
                letterSpacing={-0.8}
                lineHeight={28}
              >
                Profile
              </Text>
            </YStack>

            {/* Settings shortcut */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={isDark ? "#fff" : "#111"}
              />
            </TouchableOpacity>
          </XStack>
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <YStack paddingHorizontal={20} paddingTop={28} gap={24}>
            {/* ── Avatar card ── */}
            <View
              borderRadius={24}
              overflow="hidden"
              borderWidth={1}
              borderColor={
                isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"
              }
            >
              <LinearGradient
                colors={
                  isDark
                    ? ["rgba(59,130,246,0.18)", "rgba(99,102,241,0.08)"]
                    : ["rgba(59,130,246,0.1)", "rgba(99,102,241,0.04)"]
                }
                start={[0, 0]}
                end={[1, 1]}
                style={{ padding: 24, alignItems: "center", gap: 12 }}
              >
                {/* Avatar */}
                <TouchableOpacity
                  onPress={handleAvatarUpload}
                  activeOpacity={0.8}
                >
                  <View style={{ position: "relative" }}>
                    <Avatar
                      circular
                      size="$12"
                      style={{
                        shadowColor: "#3b82f6",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 10,
                        opacity: uploadingAvatar ? 0.6 : 1,
                      }}
                    >
                      <Avatar.Image
                        src={
                          session.user.image
                            ? session.user.image.startsWith("http")
                              ? session.user.image
                              : `${API_URL.replace("/api", "")}${session.user.image}`
                            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                        }
                      />
                      <Avatar.Fallback backgroundColor="$blue10">
                        <Text color="white" fontSize={28} fontWeight="800">
                          {initials}
                        </Text>
                      </Avatar.Fallback>
                    </Avatar>

                    {/* Camera icon over avatar */}
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: -4,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#3b82f6",
                        borderWidth: 2.5,
                        borderColor: isDark ? "#171717" : "#fff", // adjust approx background
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="camera" size={16} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>

                <YStack alignItems="center" gap={4}>
                  <Text
                    fontSize={22}
                    fontWeight="800"
                    color="$color"
                    letterSpacing={-0.5}
                  >
                    {session.user.name}
                  </Text>

                  <XStack
                    paddingHorizontal={12}
                    paddingVertical={4}
                    borderRadius={20}
                    backgroundColor={
                      isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"
                    }
                    alignItems="center"
                    gap={5}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={12}
                      color={theme.color11?.val ?? "#888"}
                    />
                    <Text fontSize={13} color="$color11">
                      {session.user.email}
                    </Text>
                  </XStack>
                </YStack>

                {/* Stats row inside the card */}
                <XStack gap={10} width="100%" marginTop={4}>
                  <StatBadge value="128" label="Saved" isDark={isDark} />
                  <StatBadge value="24" label="Collections" isDark={isDark} />
                  <StatBadge value="5" label="Downloads" isDark={isDark} />
                </XStack>
              </LinearGradient>
            </View>

            {/* ── Account section ── */}
            <YStack gap={10}>
              <Text
                fontSize={11}
                fontWeight="700"
                color="$color11"
                letterSpacing={1.5}
                paddingHorizontal={4}
                textTransform="uppercase"
              >
                Account
              </Text>
              <MenuItem
                icon="person-outline"
                label="Edit Profile"
                onPress={() => {}}
                isDark={isDark}
              />
              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                onPress={() => {}}
                isDark={isDark}
              />
              <MenuItem
                icon="color-palette-outline"
                label="Appearance"
                onPress={() => {}}
                isDark={isDark}
              />
            </YStack>

            {/* ── Support section ── */}
            <YStack gap={10}>
              <Text
                fontSize={11}
                fontWeight="700"
                color="$color11"
                letterSpacing={1.5}
                paddingHorizontal={4}
                textTransform="uppercase"
              >
                Support
              </Text>
              <MenuItem
                icon="help-circle-outline"
                label="Help & FAQ"
                onPress={() => {}}
                isDark={isDark}
              />
              <MenuItem
                icon="shield-checkmark-outline"
                label="Privacy Policy"
                onPress={() => {}}
                isDark={isDark}
              />
            </YStack>

            {/* ── Sign Out ── */}
            <YStack gap={10}>
              <MenuItem
                icon="log-out-outline"
                label="Sign Out"
                onPress={handleLogout}
                danger
                isDark={isDark}
              />
            </YStack>
          </YStack>
        </ScrollView>

        <SafeAreaView edges={["bottom"]} />
      </View>
    );
  }

  // ── Guest / Logged Out ──
  return (
    <View flex={1} backgroundColor="$background">
      {/* ── Same BlurView header pattern as explore ── */}
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
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <YStack gap={2}>
            <Text
              fontSize={11}
              fontWeight="700"
              color="$blue10"
              letterSpacing={2.2}
              textTransform="uppercase"
            >
              Account
            </Text>
            <Text
              fontSize={24}
              fontWeight="800"
              color="$color"
              letterSpacing={-0.8}
              lineHeight={28}
            >
              Profile
            </Text>
          </YStack>
        </BlurView>
      </SafeAreaView>

      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal={28}
        gap={0}
      >
        {/* Icon */}
        <View
          width={100}
          height={100}
          borderRadius={30}
          backgroundColor="$blue10"
          alignItems="center"
          justifyContent="center"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 12,
            marginBottom: 28,
          }}
        >
          <Ionicons name="person-outline" size={44} color="#fff" />
        </View>

        <Text
          fontSize={28}
          fontWeight="800"
          color="$color"
          textAlign="center"
          letterSpacing={-0.5}
        >
          Welcome to Rangya
        </Text>
        <Text
          fontSize={15}
          color="$color11"
          textAlign="center"
          lineHeight={22}
          marginTop={10}
          marginBottom={36}
        >
          Sign in to save your favourite wallpapers, build collections, and sync
          across devices.
        </Text>

        {/* Feature pills */}
        <XStack
          gap={8}
          flexWrap="wrap"
          justifyContent="center"
          marginBottom={36}
        >
          {["💾 Save wallpapers", "📁 Collections", "🔄 Sync"].map((f) => (
            <View
              key={f}
              paddingHorizontal={14}
              paddingVertical={7}
              borderRadius={20}
              backgroundColor={
                isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
              }
              borderWidth={1}
              borderColor={
                isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
              }
            >
              <Text fontSize={13} color="$color11" fontWeight="500">
                {f}
              </Text>
            </View>
          ))}
        </XStack>

        {/* CTAs */}
        <YStack width="100%" gap={12}>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={{
              height: 56,
              borderRadius: 16,
              backgroundColor: "#3b82f6",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <XStack alignItems="center" gap={8}>
              <Text color="#fff" fontSize={16} fontWeight="700">
                Sign In
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </XStack>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/signup")}
            style={{
              height: 52,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: isDark
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.12)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text fontSize={15} fontWeight="600" color="$color">
              Create an account
            </Text>
          </TouchableOpacity>
        </YStack>
      </YStack>

      <SafeAreaView edges={["bottom"]} />
    </View>
  );
}
