import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "tamagui";

type RootProviderProps = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

const RootProvider: React.FC<RootProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  // Align React Navigation theme with basic system colors
  // Tamagui handles the actual UI colors within the screens
  const baseTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      // Tamagui config v3 dark theme background is #050505, light is #fff
      background: colorScheme === "dark" ? "#050505" : "#fff",
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme}>
        {children}
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default RootProvider;
