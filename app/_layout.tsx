import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/themed/useColorScheme";
import AuthProvider from "@/context/AuthProvider";

import * as Localization from "expo-localization";
import { initI18n } from "../config/i18n";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toast";
import { LogBox } from "react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Ignore all log notifications:
LogBox.ignoreAllLogs();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "/login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // State to track if we've initialized i18n
  const [languageLoaded, setLanguageLoaded] = useState(false);
  // Our language (locale) to use
  const [language, setLanguage] = useState<string | null>();

  const [loaded, error] = useFonts({
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    // We either don't have a language, or we've already initialized
    if (!language || languageLoaded) return;
    initI18n(language);
    setLanguageLoaded(true);
  }, [language, languageLoaded]);

  useEffect(() => {
    const getSystemLanguageAndSet = async () => {
      // Get the device's current system locale from expo-localization
      const phoneLocale =
        Localization.getLocales()?.[0]?.languageTag ?? "en-US";
      setLanguage(phoneLocale);
    };

    getSystemLanguageAndSet();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)/(tabs)" options={{ headerShown: false }} />
          {/* <Stack.Screen name="modal" options={{ presentation: "modal" }} /> */}
          <Stack.Screen
            name="(public)/login"
            options={{ headerShown: false }}
          />
        </Stack>
        <Toast position="bottom" bottomOffset={40} config={toastConfig} />
      </ThemeProvider>
    </AuthProvider>
  );
}
