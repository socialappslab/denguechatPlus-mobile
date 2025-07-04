import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, Pressable, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { Button, Loading, SafeAreaView, Text, View } from "@/components/themed";
import { useAuth } from "@/context/AuthProvider";
import { VisitProvider } from "@/context/VisitContext";
import AssignBrigade from "@/assets/images/icons/add-brigade.svg";
import Logout from "@/assets/images/icons/logout.svg";
import Logo from "@/assets/images/logo-small.svg";
import Cog from "@/assets/images/icons/cog.svg";

import ProtectedView from "@/components/control/ProtectedView";
import { extractAxiosErrorData, getInitialsBase } from "@/util";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import { authApi } from "@/config/axios";
import Toast from "react-native-toast-message";
import { useIsFocused } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useUserHasBrigade } from "@/hooks/useUserHasBrigade";
import { useNetInfo } from "@react-native-community/netinfo";
import invariant from "tiny-invariant";
import { LOG } from "@/util/logger";

function CustomDrawerContent() {
  const router = useRouter();
  const { meData, logout, reFetchMe } = useAuth();
  const { t } = useTranslation();
  const [openSettings, setOpenSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isFocused = useIsFocused();
  const userHasBrigade = useUserHasBrigade();
  const { isInternetReachable } = useNetInfo();

  const onPressDeleteAccount = () => {
    bottomSheetModalRef.current?.present();
  };

  const onConfirmDeleteAccount = async () => {
    invariant(meData, "Expected user object to be defined");
    try {
      setLoading(true);
      await authApi.delete("/users/delete_account");
      LOG.warn(`Deleted user: ${meData.username}`);
      await logout(meData);
    } catch (error) {
      console.error(error);
      const errorData = extractAxiosErrorData(error);
      errorData?.errors?.forEach((error: any) => {
        Toast.show({
          type: "error",
          text1: t([`errorCodes.${error.error_code}`, "errorCodes.generic"]),
        });
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) reFetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const snapPoints = useMemo(() => ["45%"], []);

  const isChangeHouseBlockButtonDisabled =
    !userHasBrigade || !isInternetReachable;

  return (
    <SafeAreaView>
      <View
        className={`flex flex-1 flex-col pl-2 pb-4 ${Platform.OS === "android" ? "mt-2 pt-8" : "pt-2"}`}
      >
        <View className="flex flex-row items-center mb-6 px-2">
          <Logo className="mr-2"></Logo>
          <Text className="text-lg font-semibold">DengueChatPlus</Text>
        </View>
        <View className="flex-grow px-2">
          <ProtectedView hasPermission={["users-change_team"]}>
            <Pressable
              className="py-3 flex-row items-center"
              onPress={() => router.push("/select-user")}
            >
              <AssignBrigade />
              <Text className="font-semibold ml-3">
                {t("drawer.assignBrigade")}
              </Text>
            </Pressable>
          </ProtectedView>

          <Link
            href="/change-house-block"
            asChild
            disabled={isChangeHouseBlockButtonDisabled}
          >
            <Pressable
              className={`py-3 flex-row items-center ${
                isChangeHouseBlockButtonDisabled ? "opacity-50" : ""
              }`}
            >
              <MaterialIcons name="swap-horiz" size={24} color="#56534E" />
              <Text className="font-semibold ml-3">
                {t("drawer.changeHouseBlock")}
              </Text>
            </Pressable>
          </Link>

          <Pressable
            className="py-3 flex-row items-center"
            onPress={async () => {
              await Linking.openURL(
                "https://scribehow.com/page/Guia_de_Usuario__Id5Pqg7PTqeXHAqDhYyRWw",
              );
            }}
          >
            <MaterialIcons name="help" size={24} color="#56534E" />
            <Text className="font-semibold ml-3">{t("drawer.userGuide")}</Text>
          </Pressable>
        </View>
        <View className="flex justify-end">
          {openSettings && (
            <TouchableOpacity
              className="flex py-3 flex-row items-center px-8"
              onPress={onPressDeleteAccount}
            >
              <Text className="font-semibold ml-3 text-red-600">
                {t("profile.deleteAccount.title")}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex py-3 flex-row items-center px-2 mb-2"
            onPress={() => {
              setOpenSettings((prev) => !prev);
            }}
          >
            <Cog className="opacity-80" />
            <Text className="font-semibold ml-3">{t("drawer.settings")}</Text>
          </TouchableOpacity>
          <ClosableBottomSheet
            title={t("profile.deleteAccount.title")}
            snapPoints={snapPoints}
            bottomSheetModalRef={bottomSheetModalRef}
          >
            <View className="flex flex-col w-full px-5">
              <View className="flex items-center justify-center my-6 p-4 rounded-2xl border border-neutral-200 h-36">
                {loading && (
                  <View className="w-full h-36 flex items-center justify-center">
                    <Loading />
                  </View>
                )}
                {!loading && (
                  <Text className="text-neutral-700 text-center text-base mb-2 w-10/12">
                    {t("profile.deleteAccount.description")}
                  </Text>
                )}
              </View>

              <Button
                title={t("profile.deleteAccount.delete")}
                onPress={() => onConfirmDeleteAccount()}
                textClassName="text-white"
                className="bg-red-400 border-red-400 mb-4"
                disabled={loading}
              />
              <Button
                title={t("profile.deleteAccount.cancel")}
                onPress={() => bottomSheetModalRef.current?.close()}
                disabled={loading}
              />
            </View>
          </ClosableBottomSheet>

          <View
            className="mb-4 h-px  mr-2"
            lightColor="#eee"
            darkColor="rgba(255,255,255,0.1)"
          />
          <View className="flex-row items-center px-2">
            <View className="flex items-center justify-center w-10 h-10 rounded-full bg-green-400 mr-3">
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
              <TouchableOpacity
                className="mr-4"
                onPress={async () => {
                  invariant(meData, "Expected user object to be defined");
                  await logout(meData);
                }}
              >
                <Logout />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function AuthLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <VisitProvider>
        <BottomSheetModalProvider>
          <Drawer
            backBehavior="history"
            drawerContent={() => <CustomDrawerContent />}
            screenOptions={{
              headerShown: false,
              swipeEdgeWidth: 0,
            }}
          ></Drawer>
        </BottomSheetModalProvider>
      </VisitProvider>
    </GestureHandlerRootView>
  );
}
