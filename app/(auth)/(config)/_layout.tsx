import React from "react";

import { Stack, useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { BrigadeProvider } from "@/context/BrigadeContext";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";

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
    <BrigadeProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor,
          },
          headerTitleAlign: "center",
          headerTintColor: color,
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
          name="select-user"
          options={{
            headerShown: true,
            headerShadowVisible: false,
            title: t("config.brigaderList"),
          }}
        />
        <Stack.Screen
          name="change-brigade"
          options={{
            headerShown: true,
            headerShadowVisible: false,
            title: t("config.changeBrigade"),
          }}
        />
        <Stack.Screen
          name="change-brigade-success"
          options={{
            headerShown: true,
            headerShadowVisible: false,
            title: t("config.changeBrigade"),
            headerLeft: () => null,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="select-house-block"
          options={{
            headerShown: true,
            headerShadowVisible: false,
            title: t("config.houseBlocks"),
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
            headerLeft: () => (
              <Ionicons
                onPress={() => router.back()}
                name="close-sharp"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Stack.Screen
          name="filters-brigade"
          options={{
            presentation: "modal",
            headerShown: true,
            headerShadowVisible: false,
            title: t("config.filters"),
            headerLeft: () => (
              <Ionicons
                onPress={() => router.back()}
                name="close-sharp"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Stack.Screen
          name="filter-brigade"
          options={{
            presentation: "modal",
            headerShown: true,
            headerShadowVisible: false,
            title: t("config.brigades"),
            headerLeft: () => (
              <Ionicons
                onPress={() => router.back()}
                name="close-sharp"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Stack.Screen
          name="filter-sector"
          options={{
            presentation: "modal",
            headerShown: true,
            headerShadowVisible: false,
            title: t("config.brigades"),
            headerLeft: () => (
              <Ionicons
                onPress={() => router.back()}
                name="close-sharp"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Stack.Screen
          name="filter-wedge"
          options={{
            presentation: "modal",
            headerShown: true,
            headerShadowVisible: false,
            title: t("config.wedges"),
            headerLeft: () => (
              <Ionicons
                onPress={() => router.back()}
                name="close-sharp"
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Stack>
    </BrigadeProvider>
  );
}
