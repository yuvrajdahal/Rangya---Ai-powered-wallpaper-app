import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { PortalProvider, useTheme } from "tamagui";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { HapticTab } from "@/components/haptic-tab";

export default function AdminTabLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <PortalProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.blue10?.val,
          tabBarInactiveTintColor: theme.color11?.val,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: theme.background?.val,
            borderTopColor: theme.borderColor?.val,
            height: 60,
            paddingBottom: 8,
          },
          sceneStyle: {
            backgroundColor:
              theme.background?.val ||
              (colorScheme === "dark" ? "#050505" : "#fff"),
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <Feather size={22} name="pie-chart" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: "Users",
            tabBarIcon: ({ color }) => (
              <Feather size={22} name="users" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="content"
          options={{
            title: "Content",
            tabBarIcon: ({ color }) => (
              <Feather size={22} name="image" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Feather size={22} name="settings" color={color} />
            ),
          }}
        />
      </Tabs>
    </PortalProvider>
  );
}
