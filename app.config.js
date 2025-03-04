export default {
  expo: {
    name: "DengueChatPlus",
    slug: "dengue-chat-plus",
    scheme: "org.denguechat.plus",
    version: "1.2.0",
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
      config: {
        usesNonExemptEncryption: false,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS,
      },
    },
    android: {
      package: "org.denguechatplus",
      versionCode: 1,
      blockedPermissions: ["android.permission.READ_MEDIA_VIDEO"],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
        },
      },
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-asset",
      "expo-localization",
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
      policy: "fingerprint",
    },
    owner: "dengue-chat-plus",
  },
};
