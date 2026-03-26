import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { PortalProvider, useTheme } from "tamagui";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
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
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => (
              <Feather size={24} name="compass" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color }) => (
              <Feather size={24} name="heart" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Feather size={24} name="user" color={color} />
            ),
          }}
        />
      </Tabs>
    </PortalProvider>
  );
}
