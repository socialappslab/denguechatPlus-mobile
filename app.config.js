const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  expo: {
    name: IS_DEV ? "DengueChatPlus (Dev)" : "DengueChatPlus",
    slug: "dengue-chat-plus",
    scheme: "org.denguechat.plus",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#067507",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "org.denguechatplus",
      buildNumber: "1",
    },
    android: {
      package: "org.denguechatplus",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#067507",
      },
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-localization",
      [
        "./plugins/rollbar-config-plugin",
        {
          environment: "production",
          rollbarPostToken: process.env.POST_CLIENT_ITEM_ACCESS_TOKEN,
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
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
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
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
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
      policy: "appVersion",
    },
    owner: "dengue-chat-plus",
  },
};
