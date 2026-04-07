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

  
  
  const baseTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      
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
