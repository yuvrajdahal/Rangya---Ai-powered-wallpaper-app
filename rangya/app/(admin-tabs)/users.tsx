import {
  View,
  Text,
  YStack,
  XStack,
  ScrollView,
  Spinner,
  Avatar,
  Input,
  Dialog,
  Label,
  Adapt,
  Sheet,
} from "tamagui";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useMemo } from "react";
import { API_URL, getAuthHeaders } from "../../lib/auth-client";
import axios from "axios";
import {
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

const { width } = Dimensions.get("window");

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "admin" | "user";
  createdAt: string;
  _count: {
    payments: number;
    downloads: number;
  };
};

function UserCard({
  user,
  onDelete,
  onEdit,
  isDark,
}: {
  user: User;
  onDelete: () => void;
  onEdit: (user: User) => void;
  isDark: boolean;
}) {
  const isAdmin = user.role === "admin";
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <XStack
      alignItems="center"
      gap="$3"
      paddingVertical="$3"
      paddingHorizontal="$1"
      borderBottomWidth={0.5}
      borderColor={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}
    >
      {}
      <View style={{ position: "relative" }}>
        <Avatar circular size="$5">
          <Avatar.Image
            src={
              user.image
                ? user.image.startsWith("http")
                  ? user.image
                  : `${API_URL.replace("/api", "")}${user.image}`
                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            }
          />
          <Avatar.Fallback backgroundColor="$blue10">
            <Text color="white" fontWeight="700" fontSize={15}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </Avatar.Fallback>
        </Avatar>
        {isAdmin && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#3b82f6",
              borderWidth: 2,
              borderColor: isDark ? "#121212" : "#ffffff",
            }}
          />
        )}
      </View>

      {}
      <YStack flex={1} gap="$0.5" minWidth={0}>
        <XStack alignItems="center" gap="$2">
          <Text
            fontWeight="600"
            fontSize={14}
            color="$color"
            numberOfLines={1}
            flexShrink={1}
          >
            {user.name}
          </Text>
          <View
            paddingHorizontal="$2"
            paddingVertical={2}
            borderRadius="$2"
            backgroundColor={
              isAdmin
                ? "rgba(59,130,246,0.12)"
                : isDark
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(0,0,0,0.05)"
            }
          >
            <Text
              fontSize={9}
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing={0.8}
              color={isAdmin ? "$blue10" : "$color10"}
            >
              {user.role}
            </Text>
          </View>
        </XStack>
        <Text fontSize={12} color="$color10" numberOfLines={1}>
          {user.email}
        </Text>
      </YStack>

      {}
      <YStack alignItems="flex-end" gap="$2">
        <XStack gap="$1.5">
          <TouchableOpacity
            onPress={() => onEdit(user)}
            activeOpacity={0.7}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.04)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="create-outline"
              size={14}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            activeOpacity={0.7}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              backgroundColor: "rgba(239,68,68,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="trash-outline" size={14} color="#ef4444" />
          </TouchableOpacity>
        </XStack>
        <Text fontSize={11} color="$color10">
          {joinedDate}
        </Text>
      </YStack>
    </XStack>
  );
}

export default function UsersScreen() {
  const isDark = useColorScheme() === "dark";
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "user">("user");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API_URL}/admin/users`, { headers });
      setUsers(res.data.users);
    } catch (error) {
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert("Delete user", `Are you sure you want to delete ${userName}? This action cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const headers = await getAuthHeaders();
            await axios.delete(`${API_URL}/admin/users/${userId}`, { headers });
            setUsers((prev) => prev.filter((u) => u.id !== userId));
          } catch {
            Alert.alert("Error", "Failed to delete user.");
          }
        },
      },
    ]);
  };

  const handleEditPress = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.patch(
        `${API_URL}/admin/users/${editingUser.id}`,        {
          name: editName,
          email: editEmail,
          role: editRole,
        },
        { headers },
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? res.data.user : u)),
      );
      setIsEditOpen(false);
      Alert.alert("Success", "User updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update user.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = filterRole === "all" || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, search, filterRole]);

  const FILTERS: { label: string; value: "all" | "admin" | "user" }[] = [
    { label: "All", value: "all" },
    { label: "Admins", value: "admin" },
    { label: "Users", value: "user" },
  ];

  if (loading && users.length === 0) {
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
        {}
        <XStack
          paddingHorizontal="$5"
          paddingVertical="$4"
          alignItems="flex-start"
          justifyContent="space-between"
          borderBottomWidth={0.5}
          borderColor="$borderColor"
        >
          <YStack gap="$0.5">
            <Text
              fontSize={11}
              fontWeight="700"
              color="$blue10"
              letterSpacing={2}
              textTransform="uppercase"
            >
              Directory
            </Text>
            <Text
              fontSize={28}
              fontWeight="700"
              color="$color"
              letterSpacing={-0.8}
            >
              Users
            </Text>
          </YStack>
          <TouchableOpacity
            onPress={fetchUsers}
            activeOpacity={0.7}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(0,0,0,0.04)",
              borderWidth: 0.5,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={17}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </XStack>

        {}
        <YStack
          paddingHorizontal="$5"
          paddingVertical="$3"
          gap="$2.5"
          borderBottomWidth={0.5}
          borderColor="$borderColor"
        >
          {}
          <XStack
            alignItems="center"
            gap="$2"
            paddingHorizontal="$3"
            borderRadius="$4"
            backgroundColor="$backgroundHover"
            borderWidth={0.5}
            borderColor="$borderColor"
            height={42}
          >
            <Ionicons
              name="search-outline"
              size={15}
              color={isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)"}
            />
            <Input
              flex={1}
              borderWidth={0}
              backgroundColor="transparent"
              placeholder="Search by name or email…"
              value={search}
              onChangeText={setSearch}
              fontSize={14}
              color="$color"
              focusStyle={{ outlineWidth: 0 }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={15}
                  color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                />
              </TouchableOpacity>
            )}
          </XStack>

          {}
          <XStack gap="$2" alignItems="center">
            {FILTERS.map((f) => {
              const active = filterRole === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setFilterRole(f.value)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: active
                      ? "#3b82f6"
                      : isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.04)",
                    borderWidth: 0.5,
                    borderColor: active
                      ? "#3b82f6"
                      : isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.08)",
                  }}
                >
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color={
                      active ? "white" : isDark ? "#ffffff99" : "#00000099"
                    }
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text fontSize={12} color="$color10">
                {filteredUsers.length} result
                {filteredUsers.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </XStack>
        </YStack>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchUsers}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
      >
        {filteredUsers.length > 0 ? (
          <YStack>
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isDark={isDark}
                onDelete={() => handleDeleteUser(user.id, user.name)}
                onEdit={handleEditPress}
              />
            ))}
          </YStack>
        ) : (
          <YStack paddingVertical="$12" alignItems="center" gap="$4">
            <View
              width={64}
              height={64}
              borderRadius="$6"
              backgroundColor={
                isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
              }
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons
                name="people-outline"
                size={28}
                color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
              />
            </View>
            <YStack alignItems="center" gap="$1">
              <Text fontSize={15} fontWeight="600" color="$color">
                No users found
              </Text>
              <Text
                fontSize={13}
                color="$color10"
                textAlign="center"
                maxWidth={260}
              >
                {search
                  ? `No users matching "${search}" found.`
                  : "No users match the selected filter."}
              </Text>
            </YStack>
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setFilterRole("all");
              }}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 9,
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
              <Text fontSize={13} fontWeight="600" color="$color">
                Clear filters
              </Text>
            </TouchableOpacity>
          </YStack>
        )}
      </ScrollView>

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
          >
            <Dialog.Title fontWeight="800">Edit User</Dialog.Title>
            <Dialog.Description color="$color10">
              Update details for {editingUser?.name}
            </Dialog.Description>

            <YStack gap="$4" marginTop="$2">
              <YStack gap="$2">
                <Label fontWeight="600">Full Name</Label>
                <Input
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="John Doe"
                />
              </YStack>

              <YStack gap="$2">
                <Label fontWeight="600">Email Address</Label>
                <Input
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="john@example.com"
                  autoCapitalize="none"
                />
              </YStack>

              <YStack gap="$2">
                <Label fontWeight="600">Administrative Role</Label>
                <XStack gap="$2">
                  <TouchableOpacity
                    onPress={() => setEditRole("user")}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor:
                        editRole === "user"
                          ? "#3b82f6"
                          : isDark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.04)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      fontWeight="700"
                      color={editRole === "user" ? "white" : "$color"}
                    >
                      User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditRole("admin")}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor:
                        editRole === "admin"
                          ? "#3b82f6"
                          : isDark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.04)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      fontWeight="700"
                      color={editRole === "admin" ? "white" : "$color"}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </XStack>
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
                onPress={handleUpdateUser}
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
    </View>
  );
}
