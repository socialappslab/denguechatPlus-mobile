import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  Button,
  Text,
  View,
  SafeAreaView,
  Loading,
  ListItem,
  IconMaterial,
} from "@/components/themed";
import { IUser } from "@/schema/auth";

import { getInitialsBase } from "@/util";

import { authApi } from "@/config/axios";
import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";

export default function BrigaderList() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newBrigade, setNewBrigade] = useState<string>();
  const { selection, clearState } = useBrigades();
  const [user] = useState(selection?.brigader);

  const router = useRouter();

  const avatar = (user?: IUser) => {
    const initials = getInitialsBase(
      String(user?.firstName),
      String(user?.lastName),
    );
    return (
      <View className="flex items-center justify-center w-24 h-24 rounded-full bg-green-400 mb-2">
        <Text className="font-selmibold text-4xl text-green-700">
          {initials}
        </Text>
      </View>
    );
  };

  const renderBrigade = (user?: IUser) => {
    return (user?.team as BaseObject)?.name || t("config.noBrigade");
  };

  const onPressSelectBrigade = () => {
    router.push("select-brigade");
  };

  const onPressSelectHouseBlock = () => {
    router.push("select-house-block");
  };

  const onChangeBrigade = async () => {
    setLoading(true);
    try {
      await authApi.put(`/users/change_team`, {
        teamId: selection?.newBrigade?.id,
        houseBlockId: selection?.newHouseBlock?.id,
      });
      setSuccess(true);
      setNewBrigade(selection?.newBrigade?.name);
    } catch (error) {
      console.error("error change team", error);
    } finally {
      setLoading(false);
    }
  };

  const onEnd = () => {
    clearState();
    while (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5">
        {success && (
          <View className="flex flex-1 items-center justify-center">
            <View className="flex flex-row items-center justify-center mb-4 px-6">
              <View className="flex w-full p-6 rounded-2xl border border-gray-200">
                <View className="flex items-center justify-center mb-2">
                  {avatar(user)}
                  <Text className="text-lg font-semibold text-center mb-1">
                    {`${user?.firstName} ${user?.lastName}`}
                  </Text>
                  <View className="flex flex-row items-center justify-center">
                    <Text className="text-sm font-normal text-center">
                      {renderBrigade(user)}
                    </Text>
                    <IconMaterial
                      className="mx-1"
                      name="arrow-right"
                      size={14}
                    />
                    <Text className="text-sm font-normal text-center">
                      {newBrigade}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <Text className="text-lg font-bold mb-1 mt-4">
              {t("config.successTitle")}
            </Text>
            <Text className="text-sm font-thin mb-1">
              {`${user?.firstName} ${t("config.successDescription")} ${selection?.newBrigade?.name}`}
            </Text>
          </View>
        )}

        {!loading && !success && (
          <>
            <View className="flex flex-row items-center justify-center mb-8">
              <View className="flex items-center justify-center mb-2">
                {avatar(user)}
                <Text className="text-lg font-semibold text-center mb-1">
                  {`${user?.firstName} ${user?.lastName}`}
                </Text>
                <View className="flex flex-row items-center justify-center">
                  <Text className="text-sm font-normal text-center">
                    {renderBrigade(user)}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-lg font-bold mb-0">
              {t("config.chooseBrigadeTitle")}
            </Text>

            <View className="flex flex-1 mt-4">
              <ListItem
                title={t("config.brigade")}
                onPressElement={onPressSelectBrigade}
                filled={selection?.newBrigade?.name}
                emptyString={t("config.allBrigades")}
              />
              <ListItem
                title={t("config.houseBlock")}
                disabled={!selection?.newBrigade}
                onPressElement={onPressSelectHouseBlock}
                filled={selection?.newHouseBlock?.name}
                emptyString={t("config.allHouseBlocks")}
              />
            </View>
          </>
        )}

        {loading && (
          <View className="flex flex-1 items-center justify-center">
            <Loading />
          </View>
        )}

        <View className="pt-5">
          {success && (
            <Button primary onPress={onEnd} title={t("config.end")} />
          )}
          {!success && (
            <Button
              disabled={
                !selection?.newBrigade || !selection?.newHouseBlock || loading
              }
              primary
              onPress={onChangeBrigade}
              title={t("config.changeBrigade")}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
