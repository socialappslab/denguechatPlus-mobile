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
import AuthProvider, { useAuth } from "@/context/AuthProvider";

import * as Localization from "expo-localization";
import { initI18n } from "../config/i18n";
import Toast from "react-native-toast-message";
import { toastConfig } from "../config/toast";
import { LogBox } from "react-native";
import { setHeaderFromLocalStorage } from "../config/axios";
import useUser from "../hooks/useUser";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Ignore all log notifications:
LogBox.ignoreAllLogs();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(auth)/(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser } = useAuth();
  // State to track if we've initialized i18n
  const [loadedLanguage, setLoadedLanguage] = useState(false);
  const [loadedToken, setLoadedToken] = useState(false);
  const [loadedUser, setLoadedUser] = useState(false);
  // Our language (locale) to use
  const [language, setLanguage] = useState<string | null>();
  const [[loadingUser, user]] = useUser();

  const [loadedFonts, error] = useFonts({
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    // We either don't have a language, or we've already initialized
    if (!language || loadedLanguage) return;
    initI18n(language);
    setLoadedLanguage(true);
  }, [language, loadedLanguage]);

  useEffect(() => {
    const getSystemLanguageAndSet = async () => {
      // Get the device's current system locale from expo-localization
      const phoneLocale =
        Localization.getLocales()?.[0]?.languageTag ?? "en-US";
      setLanguage(phoneLocale);
    };

    getSystemLanguageAndSet();
  }, []);

  useEffect(() => {
    if (!loadingUser) {
      setUser(user, false);
      setLoadedUser(true);
    }
  }, [loadingUser, setUser, user]);

  useEffect(() => {
    const getAccessTokenAsync = async () => {
      await setHeaderFromLocalStorage(); // set header token from local storage on first load
      setLoadedToken(true);
    };

    getAccessTokenAsync();
  }, [loadingUser]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loadedFonts && loadedUser && loadedToken && loadedLanguage) {
      SplashScreen.hideAsync();
    }
  }, [loadedFonts, loadedUser, loadedToken, loadedLanguage]);

  if (!loadedFonts) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(auth)/(tabs)"
            options={{ headerShown: false, headerShadowVisible: false }}
          />
          <Stack.Screen
            name="(public)/login"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(public)/logout"
            options={{ headerShown: false }}
          />
        </Stack>
        <Toast position="bottom" bottomOffset={40} config={toastConfig} />
      </ThemeProvider>
    </AuthProvider>
  );
}
