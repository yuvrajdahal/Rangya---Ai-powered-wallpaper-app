import { Avatar, Text, View, YStack, XStack, useTheme } from "tamagui";
import {
  useSession,
  signOut,
  API_URL,
  getAuthHeaders,
  authClient,
} from "../../lib/auth-client";
import { useRouter } from "expo-router";
import {
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image } from "expo-image";
import { buildUrl } from "@/lib/utils";

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
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)";
  const iconBg = danger
    ? "rgba(239,68,68,0.15)"
    : isDark
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.08)";
  const iconColor = danger ? "#ef4444" : isDark ? "#fff" : "#000";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: bg,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: border,
        padding: 16,
        gap: 16,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text
        flex={1}
        fontSize={16}
        fontWeight="600"
        color={danger ? "#ef4444" : "$color"}
      >
        {label}
      </Text>
      {!danger && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"}
        />
      )}
    </TouchableOpacity>
  );
}

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
      borderRadius={18}
      borderWidth={1}
      borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
    >
      <Text fontSize={20} fontWeight="800" color="$color">
        {value}
      </Text>
      <Text
        fontSize={11}
        color="$color11"
        fontWeight="600"
        textTransform="uppercase"
      >
        {label}
      </Text>
    </YStack>
  );
}

export default function AdminProfileScreen() {
  const { data: session, isPending, refetch, isRefetching } = useSession();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = useTheme();
  const accentColor = theme.blue10?.val ?? "#3B82F6";

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  if (isPending) return null;
  if (!session) return null;

  const initials = session.user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View flex={1} backgroundColor="$background">
      <SafeAreaView
        edges={["top"]}
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)",
        }}
      >
        <XStack paddingHorizontal="$4" paddingVertical="$4" alignItems="center">
          <YStack>
            <Text
              fontSize={11}
              fontWeight="700"
              color="$blue10"
              letterSpacing={2}
              textTransform="uppercase"
            >
              Management
            </Text>
            <Text fontSize={24} fontWeight="800">
              Admin Profile
            </Text>
          </YStack>
        </XStack>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={accentColor}
          />
        }
      >
        <YStack gap="$6">
          {}
          <View
            borderRadius={24}
            overflow="hidden"
            borderWidth={1}
            borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
          >
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(59,130,246,0.2)", "rgba(139,92,246,0.1)"]
                  : ["rgba(59,130,246,0.12)", "rgba(139,92,246,0.06)"]
              }
              start={[0, 0]}
              end={[1, 1]}
              style={{ padding: 24, alignItems: "center", gap: 16 }}
            >
              <View
                width={80}
                height={80}
                borderRadius={40}
                overflow="hidden"
                style={{
                  shadowColor: accentColor,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  elevation: 10,
                }}
              >
                {session.user.image ? (
                  <Image
                    source={{ uri: buildUrl(session.user.image) }}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%" }}
                    transition={300}
                  />
                ) : (
                  <LinearGradient
                    colors={["#3B82F6", "#6366F1"]}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text color="white" fontSize={26} fontWeight="800">
                      {initials}
                    </Text>
                  </LinearGradient>
                )}
              </View>

              <YStack alignItems="center" gap="$1">
                <Text fontSize={22} fontWeight="800">
                  {session.user.name}
                </Text>
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$1"
                  borderRadius={20}
                  backgroundColor={
                    isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.1)"
                  }
                  alignItems="center"
                  gap="$2"
                >
                  <Ionicons name="shield-checkmark" size={12} color="$blue10" />
                  <Text fontSize={12} color="$blue10" fontWeight="700">
                    ADMINISTRATOR
                  </Text>
                </XStack>
              </YStack>

              <XStack gap="$3" width="100%">
                <StatBadge value="ADMIN" label="Role" isDark={isDark} />
                <StatBadge value="SYS" label="Power" isDark={isDark} />
              </XStack>
            </LinearGradient>
          </View>

          {}
          <YStack gap="$4">
            <YStack gap="$2">
              <Text
                fontSize={12}
                color="$color11"
                fontWeight="700"
                letterSpacing={1.5}
                textTransform="uppercase"
                paddingLeft="$1"
              >
                Controls
              </Text>
              <MenuItem
                icon="swap-horizontal"
                label="Switch to User View"
                onPress={() => router.replace("/(tabs)/explore")}
                isDark={isDark}
              />
            </YStack>

            <YStack gap="$2" marginTop="$4">
              <MenuItem
                icon="log-out-outline"
                label="Logout from Panel"
                onPress={handleLogout}
                danger
                isDark={isDark}
              />
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </View>
  );
}
