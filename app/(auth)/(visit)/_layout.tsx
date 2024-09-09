import React from "react";

import { Stack, useRouter } from "expo-router";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function VisitLayout(props: ThemeProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { lightColor, darkColor } = props;

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor,
        },
        headerTintColor: color,
        title: t("tabs.visit"),
        headerLeft: () => (
          <Ionicons
            onPress={() => router.back()}
            name="arrow-back"
            size={24}
            color={color}
          />
        ),
      }}
    >
      <Stack.Screen
        name="select-house"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="visit"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="summary"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="final"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
    </Stack>
  );
}
