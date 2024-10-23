import React from "react";

import { Stack, useNavigation } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

export default function ChatLayout(props: ThemeProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
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
        headerLeft: () => {
          return (
            <Ionicons
              onPress={() => navigation.goBack()}
              name="arrow-back"
              size={24}
              color={color}
            />
          );
        },
      }}
    >
      <Stack.Screen
        name="new-post"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: t("chat.createPost"),
        }}
      />
      <Stack.Screen
        name="edit-post"
        options={{
          headerShown: true,
          headerShadowVisible: false,
          title: t("chat.actions.editPost"),
        }}
      />
    </Stack>
  );
}
