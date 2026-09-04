import React from "react";

import { Stack, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { HeaderIconButton } from "@/components/themed";

export default function VisitLayout(props: ThemeProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { lightColor, darkColor } = props;

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  const renderDismissBackButton = () => (
    <HeaderIconButton
      onPress={() => router.dismiss()}
      accessibilityLabel={t("back")}
      name="arrow-back"
      color={color}
    />
  );

  const renderBackButton = () => (
    <HeaderIconButton
      onPress={() => router.back()}
      accessibilityLabel={t("back")}
      name="arrow-back"
      color={color}
    />
  );

  const renderDismissButton = () => (
    <HeaderIconButton
      onPress={() => router.dismiss()}
      accessibilityLabel={t("close")}
      name="close-sharp"
      color={color}
    />
  );

  const renderVisitFiltersCloseButton = () => (
    <HeaderIconButton
      onPress={() => router.push("/(auth)/(tabs)/visits")}
      accessibilityLabel={t("close")}
      name="close-sharp"
      color={color}
    />
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor,
        },
        headerTitleAlign: "center",
        headerTintColor: color,
        headerLeft: renderDismissBackButton,
      }}
    >
      <Stack.Screen
        name="select-user"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.brigaderList"),
          headerLeft: renderBackButton,
        }}
      />
      <Stack.Screen
        name="change-brigade-success"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: t("drawer.changeHouseBlock"),
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="change-house-group"
        options={{
          title: t("drawer.changeHouseBlock"),
          headerShadowVisible: false,
          headerLeft: renderBackButton,
        }}
      />
      <Stack.Screen
        name="select-house-group"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: t("houseGroup_other"),
        }}
      />
      <Stack.Screen
        name="select-brigade"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.brigadeList"),
        }}
      />
      <Stack.Screen
        name="filters-users"
        options={{
          presentation: "modal",
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.filters"),
          headerLeft: renderDismissButton,
        }}
      />
      <Stack.Screen
        name="filters-brigade"
        options={{
          presentation: "modal",
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.filters"),
          headerLeft: renderDismissButton,
        }}
      />
      <Stack.Screen
        name="filter-brigade"
        options={{
          presentation: "modal",
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.brigades"),
          headerLeft: renderDismissButton,
        }}
      />
      <Stack.Screen
        name="filter-brigade-visit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.brigades"),
          headerLeft: renderDismissButton,
        }}
      />
      <Stack.Screen
        name="filter-sector"
        options={{
          presentation: "modal",
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.brigades"),
          headerLeft: renderDismissButton,
        }}
      />
      <Stack.Screen
        name="filter-sector-visit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.brigades"),
          headerLeft: renderDismissButton,
        }}
      />
      <Stack.Screen
        name="filter-wedge"
        options={{
          presentation: "modal",
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.wedges"),
          headerLeft: renderDismissButton,
        }}
      />
      <Stack.Screen
        name="filter-wedge-visit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.wedges"),
          headerLeft: renderDismissButton,
        }}
      />
      <Stack.Screen
        name="filters-visit"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: t("config.wedges"),
          headerLeft: renderVisitFiltersCloseButton,
        }}
      />
    </Stack>
  );
}
