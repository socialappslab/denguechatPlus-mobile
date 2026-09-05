import { ExpoConfig } from "expo/config";

import { version } from "./package.json";

const appVariants = ["development", "preview", "production"] as const;
type AppVariant = (typeof appVariants)[number];

const appVariantSettings = {
  development: {
    name: "DengueChatPlus (Dev)",
    appId: "org.denguechatplus.dev",
    icon: "./assets/images/icon-development.png",
  },
  preview: {
    name: "DengueChatPlus (Preview)",
    appId: "org.denguechatplus.preview",
    icon: "./assets/images/icon.png",
  },
  production: {
    name: "DengueChatPlus",
    appId: "org.denguechatplus",
    icon: "./assets/images/icon.png",
  },
} satisfies Record<AppVariant, { name: string; appId: string; icon: string }>;

function isAppVariant(value: string): value is AppVariant {
  return appVariants.some((variant) => variant === value);
}

function getAppVariant(): AppVariant {
  const appVariant = process.env.APP_VARIANT ?? "development";

  if (!isAppVariant(appVariant)) {
    throw new Error(`Unsupported APP_VARIANT: ${appVariant}`);
  }

  return appVariant;
}

const appVariant = getAppVariant();
const { name, appId, icon } = appVariantSettings[appVariant];

const config: ExpoConfig = {
  name,
  slug: "dengue-chat-plus",
  scheme: "org.denguechat.plus",
  version,
  orientation: "portrait",
  icon,
  ios: {
    supportsTablet: true,
    bundleIdentifier: appId,
    icon,
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: appId,
    icon,
  },
  plugins: [
    "expo-router",
    [
      "expo-dev-client",
      {
        addGeneratedScheme: appVariant === "development",
      },
    ],
    "expo-font",
    "expo-asset",
    "expo-image",
    "expo-localization",
    "expo-secure-store",
    "expo-status-bar",
    "expo-web-browser",
    "@rnrepo/expo-config-plugin",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#067507",
        image: "./assets/images/splash-icon.png",
        imageWidth: 190,
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location.",
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
        recordAudioAndroid: true,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow $(PRODUCT_NAME) to access your photos for posts",
      },
    ],
    [
      "react-native-maps",
      {
        iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
        androidGoogleMapsApiKey:
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
      },
    ],
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        note: "Use SENTRY_AUTH_TOKEN env to authenticate with Sentry.",
        project: "react-native",
        organization: "denguechatplus",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appVariant,
    router: {
      origin: false,
    },
    eas: {
      projectId: "213aa26c-f57b-4b2e-84f6-fa87fd86adbc",
    },
  },
  updates: {
    url: "https://u.expo.dev/213aa26c-f57b-4b2e-84f6-fa87fd86adbc",
  },
  runtimeVersion: {
    policy: "fingerprint",
  },
  owner: "dengue-chat-plus",
};

export default config;
