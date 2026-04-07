import {
  Avatar,
  Text,
  View,
  YStack,
  XStack,
  useTheme,
  Dialog,
  Adapt,
  Sheet,
  Input,
  Label,
  Spinner,
} from "tamagui";
import {
  useSession,
  signOut,
  API_URL,
  authClient,
  getAuthHeaders,
} from "../../lib/auth-client";
import { useRouter } from "expo-router";
import {
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Appearance,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useQuery } from "@tanstack/react-query";
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


function StatBadge({
  value,
  label,
  isDark,
  loading,
}: {
  value: string;
  label: string;
  isDark: boolean;
  loading?: boolean;
}) {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingVertical="$3"
      height={StatBadgeHeight}
      gap="$1"
      backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
      borderRadius={16}
      borderWidth={1}
      borderColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isDark ? "#fff" : "#3B82F6"} />
      ) : (
        <Text
          fontSize={22}
          fontWeight="800"
          color="$color"
          letterSpacing={-0.5}
        >
          {value}
        </Text>
      )}
      <Text fontSize={12} color="$color11" fontWeight="500">
        {label}
      </Text>
    </YStack>
  );
}
const StatBadgeHeight = 72;


export default function ProfileScreen() {
  const { data: session, isPending, refetch, isRefetching } = useSession();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { width } = Dimensions.get("window");
  const theme = useTheme();
  const accentColor = theme.blue10?.val ?? "#3B82F6";
  const iconColor = isDark ? "#fff" : "#111";

  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["profile-stats"],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_URL}/users/me/stats`, { headers });
      return res.data;
    },
    enabled: !!session,
  });

  const barBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const handleLogout = async () => {
    await signOut();
    router.replace("/(tabs)/explore");
  };

  const handleEditPress = () => {
    if (session) {
      setEditName(session.user.name || "");
      setEditEmail(session.user.email || "");
      setIsEditOpen(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }
    setIsUpdating(true);
    try {
      await authClient.updateUser({
        name: editName,
      });
      setIsEditOpen(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters long");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });
      setIsPasswordModalOpen(false);
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password updated successfully!");
    } catch (error) {
      console.error("Password change failed:", error);
      Alert.alert(
        "Error",
        "Failed to change password. Please check your current password.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  
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

          
          const fileToUpload = {
            uri,
            type: "image/jpeg",
            name: `avatar_${Date.now()}.jpg`,
          } as any;

          const formData = new FormData();
          formData.append("image", fileToUpload);

          
          const authHeaders = await getAuthHeaders();
          const res = await axios.post(
            `${API_URL}/users/me/avatar`,
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
        {}
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

            {}
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
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={iconColor}
              colors={[accentColor]}
            />
          }
        >
          <YStack paddingHorizontal={20} paddingTop={28} gap={24}>
            {}
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
                {}
                <TouchableOpacity
                  onPress={handleAvatarUpload}
                  activeOpacity={0.8}
                >
                  <View style={{ position: "relative" }}>
                    <View
                      width={100}
                      height={100}
                      borderRadius={50}
                      overflow="hidden"
                      style={{
                        shadowColor: "#3B82F6",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        elevation: 10,
                        opacity: uploadingAvatar ? 0.6 : 1,
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
                          <Text color="white" fontSize={32} fontWeight="800">
                            {initials}
                          </Text>
                        </LinearGradient>
                      )}
                    </View>

                    {}
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
                        borderColor: isDark ? "#171717" : "#fff", 
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

                {}
                <XStack gap={10} width="100%" marginTop={4}>
                  <StatBadge
                    value={stats?.favorites?.toString() || "0"}
                    label="Saved"
                    isDark={isDark}
                    loading={statsLoading}
                  />
                  <StatBadge
                    value={stats?.uploads?.toString() || "0"}
                    label="Uploads"
                    isDark={isDark}
                    loading={statsLoading}
                  />
                  <StatBadge
                    value={stats?.saved?.toString() || "0"}
                    label="Downloads"
                    isDark={isDark}
                    loading={statsLoading}
                  />
                </XStack>
              </LinearGradient>
            </View>

            {}
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
                icon="cloud-upload-outline"
                label="My Uploads"
                onPress={() => router.push("/my-wallpapers" as any)}
                isDark={isDark}
              />
              <MenuItem
                icon="download-outline"
                label="My Downloads"
                onPress={() => router.push("/downloads")}
                isDark={isDark}
              />
              <MenuItem
                icon="person-outline"
                label="Edit Profile"
                onPress={handleEditPress}
                isDark={isDark}
              />
              <MenuItem
                icon="lock-closed-outline"
                label="Change Password"
                onPress={() => setIsPasswordModalOpen(true)}
                isDark={isDark}
              />
              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                onPress={() => {
                  Alert.alert(
                    "Notifications",
                    "Notification settings coming soon!",
                  );
                }}
                isDark={isDark}
              />
              <MenuItem
                icon="color-palette-outline"
                label="Appearance"
                onPress={() => {
                  Alert.alert(
                    "Appearance",
                    "The app follows your system preference. Change it in your device settings.",
                  );
                }}
                isDark={isDark}
              />
            </YStack>

            {}
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

            {}
            {(session.user as any).role === "admin" && (
              <YStack gap={10}>
                <Text
                  fontSize={11}
                  fontWeight="700"
                  color="$blue10"
                  letterSpacing={1.5}
                  paddingHorizontal={4}
                  textTransform="uppercase"
                >
                  Administrative
                </Text>
                <MenuItem
                  icon="shield-outline"
                  label="Admin Dashboard"
                  onPress={() => router.push("/(admin-tabs)" as any)}
                  isDark={isDark}
                />
              </YStack>
            )}

            {}
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

        {}
        <Dialog modal open={isEditOpen} onOpenChange={setIsEditOpen}>
          <Adapt platform="touch">
            <Sheet zIndex={200000} modal dismissOnSnapToBottom>
              <Sheet.Frame padding="$4" gap="$4">
                <Adapt.Contents />
              </Sheet.Frame>
              <Sheet.Overlay />
            </Sheet>
          </Adapt>

          <Dialog.Portal>
            <Dialog.Overlay
              key="overlay"
              opacity={0.5}
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />

            <Dialog.Content
              bordered
              elevate
              key="content"
              enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
              exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
              x={0}
              scale={1}
              opacity={1}
              y={0}
              gap="$4"
              width={width * 0.9}
              maxWidth={450}
              backgroundColor="$background"
            >
              <Dialog.Title fontWeight="800">Edit Profile</Dialog.Title>
              <Dialog.Description color="$color10">
                Update your personal information.
              </Dialog.Description>

              <YStack gap="$4" marginTop="$2">
                <YStack gap="$2">
                  <Label fontWeight="600">Full Name</Label>
                  <Input
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Your Name"
                    backgroundColor={
                      isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                    }
                  />
                </YStack>

                <YStack gap="$2">
                  <Label fontWeight="600">Email Address (Read-only)</Label>
                  <Input
                    value={editEmail}
                    editable={false}
                    placeholder="your@email.com"
                    autoCapitalize="none"
                    backgroundColor={
                      isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                    }
                    opacity={0.6}
                  />
                  <Text fontSize={10} color="$color10" paddingLeft="$2">
                    Email cannot be changed directly for security.
                  </Text>
                </YStack>
              </YStack>

              <XStack gap="$3" marginTop="$4" justifyContent="flex-end">
                <Dialog.Close asChild>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 10,
                    }}
                  >
                    <Text fontWeight="600" color="$color10">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </Dialog.Close>
                <TouchableOpacity
                  onPress={handleUpdateProfile}
                  disabled={isUpdating}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: "#3b82f6",
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                >
                  {isUpdating ? (
                    <Spinner color="white" />
                  ) : (
                    <Text fontWeight="700" color="white">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </XStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>

        {}
        <Dialog
          modal
          open={isPasswordModalOpen}
          onOpenChange={setIsPasswordModalOpen}
        >
          <Adapt platform="touch">
            <Sheet zIndex={200000} modal dismissOnSnapToBottom>
              <Sheet.Frame padding="$4" gap="$4">
                <Adapt.Contents />
              </Sheet.Frame>
              <Sheet.Overlay />
            </Sheet>
          </Adapt>

          <Dialog.Portal>
            <Dialog.Overlay
              key="overlay"
              opacity={0.5}
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />

            <Dialog.Content
              bordered
              elevate
              key="content"
              enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
              exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
              x={0}
              scale={1}
              opacity={1}
              y={0}
              gap="$4"
              width={width * 0.9}
              maxWidth={450}
              backgroundColor="$background"
            >
              <Dialog.Title fontWeight="800">Change Password</Dialog.Title>
              <Dialog.Description color="$color10">
                Enter your current and new passwords.
              </Dialog.Description>

              <YStack gap="$4" marginTop="$2">
                <YStack gap="$2">
                  <Label fontWeight="600">Current Password</Label>
                  <Input
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    backgroundColor={
                      isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                    }
                  />
                </YStack>

                <YStack gap="$2">
                  <Label fontWeight="600">New Password</Label>
                  <Input
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    backgroundColor={
                      isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                    }
                  />
                </YStack>

                <YStack gap="$2">
                  <Label fontWeight="600">Confirm New Password</Label>
                  <Input
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    backgroundColor={
                      isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                    }
                  />
                </YStack>
              </YStack>

              <XStack gap="$3" marginTop="$4" justifyContent="flex-end">
                <Dialog.Close asChild>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 10,
                    }}
                  >
                    <Text fontWeight="600" color="$color10">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </Dialog.Close>
                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={isUpdatingPassword}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: "#3b82f6",
                    opacity: isUpdatingPassword ? 0.6 : 1,
                  }}
                >
                  {isUpdatingPassword ? (
                    <Spinner color="white" />
                  ) : (
                    <Text fontWeight="700" color="white">
                      Update Password
                    </Text>
                  )}
                </TouchableOpacity>
              </XStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      {}
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
        {}
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

        {}
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

        {}
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
