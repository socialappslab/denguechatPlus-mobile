import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";

import Colors from "@/constants/Colors";
import BubbleIcon from "@/assets/images/icons/bubble.svg";
import HouseIcon from "@/assets/images/icons/house.svg";
import BrigadeIcon from "@/assets/images/icons/brigade.svg";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/hooks/useStore";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

export default function TabLayout({ lightColor, darkColor }: ThemeProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const storedHouseList = useStore((state) => state.storedHouseList);
  const fetchHouses = useStore((state) => state.fetchHouses);

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  const houses = useQuery({
    queryKey: ["housesToVisit"],
    initialData: storedHouseList,
    queryFn: fetchHouses,
  });
  useRefreshOnFocus(houses.refetch);

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
        tabBarLabelStyle: {
          fontFamily: "Inter-Bold",
        },
        headerLeft: () => <DrawerToggleButton tintColor={color} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.myBrigade"),
          tabBarIcon: (props) => <BrigadeIcon color={props.color} />,
        }}
      />
      <Tabs.Screen
        name="visits"
        options={{
          title: t("tabs.visit"),
          tabBarIcon: (props) => <HouseIcon color={props.color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("tabs.chat"),
          tabBarIcon: (props) => <BubbleIcon color={props.color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: (props) => (
            <MaterialIcons
              name="person-outline"
              size={24}
              color={props.color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
