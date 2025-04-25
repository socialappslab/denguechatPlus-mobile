import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useState } from "react";
import * as Localization from "expo-localization";
import { LogBox } from "react-native";
import Toast from "react-native-toast-message";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import AuthProvider, { useAuth } from "@/context/AuthProvider";
import { LANGUAGE_LOCAL_STORAGE_KEY } from "@/constants/Keys";
import { useStorageState } from "@/hooks/useStorageState";
import { setHeaderFromLocalStorage } from "@/config/axios";
import { initI18n } from "@/config/i18n";
import { toastConfig } from "@/config/toast";
import useUser from "@/hooks/useUser";
import { useVisitStore } from "@/hooks/useVisitStore";
import { BrigadeProvider } from "@/context/BrigadeContext";
import { FilterProvider } from "@/context/FilterContext";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

Sentry.init({
  dsn: __DEV__
    ? undefined
    : "https://1530b05d8bc80b91a3304733b4f40e15@o4508732723232768.ingest.us.sentry.io/4508732748529664",
});

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
  // Our language (locale) to use
  const [[, language], setLanguageLocalStorage] = useStorageState(
    LANGUAGE_LOCAL_STORAGE_KEY,
  );
  const { setUser } = useAuth();

  // State to track if we've initialized i18n
  const [loadedLanguage, setLoadedLanguage] = useState(false);
  const [loadedToken, setLoadedToken] = useState(false);
  const [loadedUser, setLoadedUser] = useState(false);
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
      setLanguageLocalStorage(phoneLocale);
    };

    getSystemLanguageAndSet();
  }, [setLanguageLocalStorage]);

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
  const state = useVisitStore();
  const StoreState: React.FC<any> = (props) => {
    return null;
  };

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <StoreState {...state} />
      <AuthProvider>
        <BrigadeProvider>
          <FilterProvider>
            <ThemeProvider value={DefaultTheme}>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(public)/login"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(public)/register"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(public)/register-success"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="(public)/logout"
                  options={{ headerShown: false }}
                />
              </Stack>
              <Toast
                position="top"
                topOffset={110}
                visibilityTime={2000}
                config={toastConfig}
              />
            </ThemeProvider>
          </FilterProvider>
        </BrigadeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
