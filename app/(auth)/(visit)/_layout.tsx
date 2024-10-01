import React from "react";

import { Stack, useRouter } from "expo-router";

import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export enum Routes {
  SelectHouse = "select-house",
  ContainerPicture = "container-picture",
  AddComment = "add-comment",
  Summary = "summary",
  Final = "final",
  Visit = "visit",
}

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
        name={Routes.AddComment}
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name={Routes.SelectHouse}
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
        name="visit/[id]"
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name={Routes.ContainerPicture}
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name={Routes.Summary}
        options={{ headerShown: true, headerShadowVisible: false }}
      />
      <Stack.Screen
        name={Routes.Final}
        options={{ headerShown: true, headerShadowVisible: false }}
      />
    </Stack>
  );
}
