import React from "react";

import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Platform, TouchableOpacity } from "react-native";

import { useTranslation } from "react-i18next";

import { View, Text, SafeAreaView } from "@/components/themed";
import { useAuth } from "@/context/AuthProvider";
import { VisitProvider } from "@/context/VisitContext";

import Logo from "@/assets/images/logo-small.svg";
import Logout from "@/assets/images/icons/logout.svg";
import MyCity from "@/assets/images/icons/city.svg";
import MyCommunity from "@/assets/images/icons/community.svg";
import Brigades from "@/assets/images/icons/brigades.svg";
import AssignBrigade from "@/assets/images/icons/add-brigade.svg";

import { getInitialsBase } from "@/util";
import ProtectedView from "@/components/control/ProtectedView";

const CustomDrawerContent = () => {
  const router = useRouter();
  const { meData, logout } = useAuth();
  const { t } = useTranslation();

  // console.log("meData>>>", meData);

  return (
    <SafeAreaView>
      <View
        className={`flex flex-1 flex-col pl-2 pb-4 ${Platform.OS === "android" ? "mt-2 pt-8" : "pt-2"}`}
      >
        <View className="flex flex-row items-center mb-6 px-2">
          <Logo className="mr-2"></Logo>
          <Text className="text-lg font-semibold">DengueChat+</Text>
        </View>
        <View className="flex flex-1 flex-col px-2">
          <TouchableOpacity
            className="flex py-3 flex-row items-center"
            onPress={() => router.push("my-city")}
          >
            <MyCity />
            <Text className="font-semibold ml-3">{t("drawer.myCity")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex py-3 flex-row items-center"
            onPress={() => router.push("my-community")}
          >
            <MyCommunity />
            <Text className="font-semibold ml-3">
              {t("drawer.myCommunity")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex py-3 flex-row items-center"
            onPress={() => router.push("brigades")}
          >
            <Brigades />
            <Text className="font-semibold ml-3"> {t("drawer.brigades")}</Text>
          </TouchableOpacity>
          <ProtectedView hasPermission={["users-update"]}>
            <TouchableOpacity
              className="flex py-3 flex-row items-center"
              onPress={() => router.push("select-user")}
            >
              <AssignBrigade />
              <Text className="font-semibold ml-3">
                {t("drawer.assignBrigade")}
              </Text>
            </TouchableOpacity>
          </ProtectedView>
        </View>
        <View className="flex justify-end">
          <View
            className="mb-4 h-px  mr-2"
            lightColor="#eee"
            darkColor="rgba(255,255,255,0.1)"
          />
          <View className="flex-row items-center px-2">
            <View className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mr-3">
              <Text className="font-bold text-sm text-green-700">
                {meData?.userProfile
                  ? getInitialsBase(
                      String(meData.userProfile.firstName),
                      String(meData.userProfile.lastName),
                    )
                  : "U"}
              </Text>
            </View>
            <View className="flex flex-1 flex-row items-center">
              <View className="flex flex-1 flex-col">
                <Text>{`${meData?.userProfile?.firstName} ${meData?.userProfile?.lastName}`}</Text>
                <Text className="text-sm font-thin">{meData?.username}</Text>
              </View>
              <TouchableOpacity className="mr-4" onPress={logout}>
                <Logout />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default function AuthLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <VisitProvider>
        <Drawer
          drawerContent={() => <CustomDrawerContent />}
          screenOptions={{ headerShown: false, swipeEdgeWidth: 0 }}
        ></Drawer>
      </VisitProvider>
    </GestureHandlerRootView>
  );
}
