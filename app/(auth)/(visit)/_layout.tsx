import React from "react";

import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

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
        headerTitleAlign: "center",
        headerTintColor: color,
        title: t("visit.stackTitle"),
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("back")}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={24} color={color} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="add-comment"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="select-house"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="new-house"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="add-location"
        options={{ headerShown: false, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="visit/[questionId]"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="container-picture"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="summary"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name={"final"}
        options={{ headerShown: true, headerShadowVisible: false }}
      />
    </Stack>
  );
}
