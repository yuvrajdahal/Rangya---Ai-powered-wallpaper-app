import { config } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

const appConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      primary: "#0070f3",
      primaryHover: "#005cc5",
    },
    dark: {
      ...config.themes.dark,
      primary: "#3291ff",
      primaryHover: "#0070f3",
    },
  },
});

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
