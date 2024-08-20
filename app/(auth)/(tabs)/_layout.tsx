import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs, useNavigation } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/themed/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Bubble from "@/assets/images/icons/bubble.svg";
import House from "@/assets/images/icons/house.svg";
import User from "@/assets/images/icons/user.svg";
import { useTranslation } from "react-i18next";
import Button from "@/components/themed/Button";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/themed";

type TabsNames = "chat" | "homes" | "profile";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: { name: TabsNames; color: string }) {
  switch (props.name) {
    case "chat":
      return <Bubble color={props.color} />;
    case "homes":
      return <House color={props.color} />;
    case "profile":
      return <User color={props.color} />;
  }
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { goBack } = useNavigation();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          height: 85,
          paddingBottom: 35,
          backgroundColor: Colors[colorScheme ?? "light"].backgroundTabs,
        },
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        tabBarLabelStyle: {
          fontFamily: "Inter-Bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.chat"),
          tabBarIcon: ({ color }) => <TabBarIcon name="chat" color={color} />,
          headerRight: () => (
            <Link href="/homes" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="user-circle"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="visit"
        options={{
          title: t("tabs.visit"),
          headerTitle: () => <Text type="header">{t("tabs.visit")}</Text>,
          tabBarIcon: ({ color }) => <TabBarIcon name="homes" color={color} />,
          tabBarStyle: { display: "none" },
          headerLeft: () => (
            <Ionicons
              onPress={goBack}
              name="arrow-back"
              size={24}
              marginLeft={20}
              color="black"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="profile" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
