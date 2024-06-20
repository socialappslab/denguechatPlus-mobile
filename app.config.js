const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  expo: {
    name: IS_DEV ? "Dengue Chat+ (Dev)" : "Dengue Chat+",
    slug: "dengue-chat-plus",
    scheme: "dengue-chat-plus-scheme",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "org.denguechat.plus",
      buildNumber: "1",
    },
    android: {
      package: "org.denguechat.plus",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router"],
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
    owner: "dengue-chat-plus",
  },
};
