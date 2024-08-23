import React from "react";

import { Stack, useNavigation } from "expo-router";

import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

export default function VisitLayout(props: ThemeProps) {
  const { t } = useTranslation();
  const { goBack } = useNavigation();
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
            onPress={goBack}
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
    </Stack>
  );
}
