import { View, Text, YStack, XStack, ScrollView, Spinner } from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useSession, API_URL, getAuthHeaders } from "../../lib/auth-client";
import axios from "axios";
import { TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  accentColor: string;
  bgToken: string;
  trend?: string;
};

function StatCard({
  label,
  value,
  icon,
  accentColor,
  bgToken,
  trend,
}: StatCardProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <YStack
      flex={1}
      padding="$4"
      borderRadius="$5"
      backgroundColor="$background"
      borderWidth={0.5}
      borderColor="$borderColor"
      gap="$3"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <View
          width={38}
          height={38}
          borderRadius="$3"
          backgroundColor={bgToken as any}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name={icon as any} size={18} color={accentColor} />
        </View>
        {trend && (
          <View
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$10"
            backgroundColor={
              isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)"
            }
          >
            <Text fontSize={11} fontWeight="600" color="$green10">
              {trend}
            </Text>
          </View>
        )}
      </XStack>

      <YStack gap="$1">
        <Text
          fontSize={24}
          fontWeight="700"
          color="$color"
          letterSpacing={-0.5}
        >
          {value}
        </Text>
        <Text
          fontSize={11}
          fontWeight="600"
          color="$color10"
          textTransform="uppercase"
          letterSpacing={0.8}
        >
          {label}
        </Text>
      </YStack>
    </YStack>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
  showDivider = true,
}: {
  label: string;
  value: string;
  valueColor: string;
  showDivider?: boolean;
}) {
  const isDark = useColorScheme() === "dark";
  return (
    <YStack gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={15} fontWeight="500" color="$color">
          {label}
        </Text>
        <Text fontSize={14} fontWeight="700" color={valueColor as any}>
          {value}
        </Text>
      </XStack>
      {showDivider && (
        <View
          height={0.5}
          backgroundColor={
            isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"
          }
        />
      )}
    </YStack>
  );
}

export default function AdminDashboardScreen() {
  const isDark = useColorScheme() === "dark";
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_URL}/admin/stats`, { headers });
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
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
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$4"
          alignItems="center"
          justifyContent="space-between"
        >
          <YStack gap="$1">
            <Text
              fontSize={11}
              fontWeight="700"
              color="$blue10"
              letterSpacing={2}
              textTransform="uppercase"
            >
              Analytics
            </Text>
            <Text
              fontSize={30}
              fontWeight="700"
              color="$color"
              letterSpacing={-0.8}
            >
              Overview
            </Text>
          </YStack>

          <TouchableOpacity
            onPress={fetchStats}
            activeOpacity={0.7}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.04)",
              borderWidth: 0.5,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </XStack>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchStats}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
      >
        {stats ? (
          <YStack gap="$5">
            {}
            <YStack gap="$3">
              <Text
                fontSize={11}
                fontWeight="700"
                color="$color10"
                textTransform="uppercase"
                letterSpacing={1.5}
              >
                Platform Stats
              </Text>

              <XStack gap="$3">
                <StatCard
                  label="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon="people-outline"
                  accentColor="#3b82f6"
                  bgToken="$blue3"
                  trend="+8%"
                />
                <StatCard
                  label="Photos"
                  value={stats.totalImages.toLocaleString()}
                  icon="image-outline"
                  accentColor="#10b981"
                  bgToken="$green3"
                  trend="+12"
                />
              </XStack>

              <XStack gap="$3">
                <StatCard
                  label="Revenue"
                  value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
                  icon="cash-outline"
                  accentColor="#f59e0b"
                  bgToken="$yellow3"
                  trend="+3%"
                />
                <StatCard
                  label="Downloads"
                  value={stats.totalDownloads.toLocaleString()}
                  icon="download-outline"
                  accentColor="#8b5cf6"
                  bgToken="$purple3"
                />
              </XStack>

              <StatCard
                label="Premium Assets"
                value={stats.premiumImages.toLocaleString()}
                icon="star-outline"
                accentColor="#ec4899"
                bgToken="$pink3"
                trend="+5%"
              />
            </YStack>

            {}
            <YStack gap="$3">
              <Text
                fontSize={11}
                fontWeight="700"
                color="$color10"
                textTransform="uppercase"
                letterSpacing={1.5}
              >
                Quick Summary
              </Text>

              <YStack
                padding="$4"
                borderRadius="$5"
                backgroundColor="$background"
                borderWidth={0.5}
                borderColor="$borderColor"
                gap="$3"
              >
                <SummaryRow
                  label="Active Sessions"
                  value={stats.activeSessions.toString()}
                  valueColor="$blue10"
                />
                <SummaryRow
                  label="Recent Uploads"
                  value={stats.recentUploads.toString()}
                  valueColor="$green10"
                />
                <SummaryRow
                  label="Uncategorized"
                  value={stats.uncategorizedCount.toString()}
                  valueColor="$yellow10"
                  showDivider={false}
                />
              </YStack>
            </YStack>
          </YStack>
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
                name="cloud-offline-outline"
                size={32}
                color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"}
              />
            </View>
            <YStack alignItems="center" gap="$1">
              <Text fontSize={15} fontWeight="600" color="$color">
                No data available
              </Text>
              <Text
                fontSize={13}
                color="$color10"
                textAlign="center"
                maxWidth={260}
              >
                Unable to load platform overview. Check your connection and try
                again.
              </Text>
            </YStack>
            <TouchableOpacity
              onPress={fetchStats}
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
                Retry
              </Text>
            </TouchableOpacity>
          </YStack>
        )}
      </ScrollView>
    </View>
  );
}
