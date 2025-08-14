import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useAuth } from "@/context/AuthProvider";
import { setHeaderFromLocalStorage } from "@/config/axios";
import "@/config/i18n";
import { toastConfig } from "@/config/toast";
import useUser from "@/hooks/useUser";
import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { Providers } from "@/components/Providers";
import { useTranslation } from "react-i18next";
import { useLocales } from "expo-localization";

import moment from "moment";
import "moment/locale/es";
import "moment/locale/pt";

Sentry.init({
  dsn: __DEV__
    ? undefined
    : "https://1530b05d8bc80b91a3304733b4f40e15@o4508732723232768.ingest.us.sentry.io/4508732748529664",
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
  profilesSampleRate: 0.75,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(auth)/(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { i18n } = useTranslation();
  const { setUser } = useAuth();

  const locales = useLocales();

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
    const currentDeviceLocale = locales[0].languageCode;
    // NOTE: Do nothing if deviceLanguage is null, we will rely on the fallback language
    if (!currentDeviceLocale) return;
    i18n.changeLanguage(currentDeviceLocale);
    moment.locale([currentDeviceLocale, "en"]);
  }, [locales, i18n]);

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
    if (loadedFonts && loadedUser && loadedToken) {
      SplashScreen.hideAsync();
    }
  }, [loadedFonts, loadedUser, loadedToken]);

  if (!loadedFonts) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" />

      <Providers>
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
          visibilityTime={6000}
          config={toastConfig}
        />
      </Providers>
    </>
  );
}

export default Sentry.wrap(RootLayout);
