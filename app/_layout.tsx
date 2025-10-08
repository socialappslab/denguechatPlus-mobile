import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Stack, useNavigationContainerRef } from "expo-router";
import Toast from "react-native-toast-message";

import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import "@/config/i18n";
import { toastConfig } from "@/config/toast";
import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { Providers } from "@/components/Providers";
import { useTranslation } from "react-i18next";
import { useLocales } from "expo-localization";
import { useReactNavigationDevTools } from "@dev-plugins/react-navigation";

import moment from "moment";
import "moment/locale/es";
import "moment/locale/pt";
import useSessionStore from "@/hooks/useSessionStore";

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
  initialRouteName: "(auth)/(tabs)/index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { i18n } = useTranslation();

  const locales = useLocales();

  const [areFontsLoaded, fontLoadError] = useFonts({
    "Inter-Bold": Inter_700Bold,
    "Inter-Medium": Inter_500Medium,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Regular": Inter_400Regular,
  });

  useEffect(() => {
    const currentDeviceLocale = locales[0].languageCode;
    // NOTE: Do nothing if deviceLanguage is null, we will rely on the fallback language
    if (!currentDeviceLocale) return;
    i18n.changeLanguage(currentDeviceLocale);
    moment.locale([currentDeviceLocale, "en"]);
  }, [locales, i18n]);

  useEffect(() => {
    if (areFontsLoaded || fontLoadError) {
      SplashScreen.hideAsync();
    }
  }, [areFontsLoaded, fontLoadError]);

  if (!areFontsLoaded && !fontLoadError) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const navigationRef = useNavigationContainerRef();
  // @ts-expect-error https://github.com/expo/dev-plugins/issues/70
  useReactNavigationDevTools(navigationRef);

  const session = useSessionStore((state) => state.session);

  return (
    <>
      <StatusBar style="dark" />

      <Providers>
        <Stack>
          <Stack.Protected guard={!!session}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!session}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen
              name="register-success"
              options={{ headerShown: false }}
            />
          </Stack.Protected>
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
