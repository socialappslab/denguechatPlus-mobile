import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";

import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Bubble from "@/assets/images/icons/bubble.svg";
import House from "@/assets/images/icons/house.svg";
import Brigade from "@/assets/images/icons/brigade.svg";
import { useTranslation } from "react-i18next";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabsNames = "chat" | "homes" | "profile";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: { name: TabsNames; color: string }) {
  switch (props.name) {
    case "chat":
      return <Bubble color={props.color} />;
    case "homes":
      return <House color={props.color} />;
    case "profile":
      return <Brigade color={props.color} />;
  }
}

export default function TabLayout(props: ThemeProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { lightColor, darkColor } = props;

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerStyle: {
          backgroundColor,
        },
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerTintColor: color,
        tabBarStyle: {
          position: "absolute",
          height: Platform.OS === "ios" ? 85 : 75,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 20,
          backgroundColor: Colors["light"].backgroundTabs,
        },
        tabBarActiveTintColor: Colors["light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        tabBarLabelStyle: {
          fontFamily: "Inter-Bold",
        },
        headerLeft: () => <DrawerToggleButton tintColor={color} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.chat"),
          tabBarIcon: ({ color }) => <TabBarIcon name="chat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="visits"
        options={{
          title: t("tabs.visit"),
          tabBarIcon: ({ color }) => <TabBarIcon name="homes" color={color} />,
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
