import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { TamaguiProvider, Theme, useTheme } from "tamagui";

import { useColorScheme } from "@/hooks/use-color-scheme";
import RootProvider from "@/providers/app-provider";
import tamaguiConfig from "../tamagui.config";

import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

export const unstable_settings = {
  
};

function AppStack({ colorScheme }: { colorScheme: any }) {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor:
            theme.background?.val ||
            (colorScheme === "dark" ? "#050505" : "#ffffff"),
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="best-of-month" options={{ headerShown: false }} />
      <Stack.Screen name="all-wallpapers" options={{ headerShown: false }} />
      <Stack.Screen name="all-artists" options={{ headerShown: false }} />
      <Stack.Screen name="all-categories" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="upload" options={{ presentation: "card" }} />
      <Stack.Screen
        name="wallpaper/[id]"
        options={{ presentation: "fullScreenModal", headerShown: false }}
      />
      <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    
    const bgColor = colorScheme === "dark" ? "#050505" : "#ffffff";
    SystemUI.setBackgroundColorAsync(bgColor);
  }, [colorScheme]);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
    >
      <RootProvider>
        <Theme name={colorScheme === "dark" ? "dark" : "light"}>
          <AppStack colorScheme={colorScheme} />
        </Theme>
      </RootProvider>
    </TamaguiProvider>
  );
}
