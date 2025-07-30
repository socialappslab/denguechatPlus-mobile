import { useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  Button,
  Text,
  View,
  SafeAreaView,
  Loading,
  ListItem,
} from "@/components/themed";
import { IUser } from "@/schema/auth";

import { authApi } from "@/config/axios";
import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";
import { AvatarBig } from "@/components/segments/AvatarBig";
import Toast from "react-native-toast-message";
import { extractAxiosErrorData } from "@/util";

export default function ChangeBrigade() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const { selection } = useBrigades();
  const [user] = useState(selection?.brigader);

  const router = useRouter();

  const renderBrigade = (user?: IUser) => {
    return (user?.team as BaseObject)?.name || t("config.noBrigade");
  };

  const onPressSelectBrigade = () => {
    router.push("/select-brigade");
  };

  const onPressSelectHouseBlock = () => {
    router.push("/select-house-block");
  };

  const onChangeBrigade = async () => {
    setLoading(true);
    try {
      await authApi.put(`/users/change_team`, {
        teamId: selection?.newBrigade?.id,
        houseBlockId: selection?.newHouseBlock?.id,
        userId: user?.id,
      });

      router.push("/change-brigade-success");
    } catch (error) {
      console.error(error);
      const errorData = extractAxiosErrorData(error);
      errorData?.errors?.forEach((error: any) => {
        Toast.show({
          type: "error",
          text1: t([`errorCodes.${error.error_code}`, "errorCodes.generic"]),
        });
        console.error(error);
      });
      if (!errorData?.errors || errorData?.errors.length === 0) {
        Toast.show({
          type: "error",
          text1: t("login.error.invalidCredentials"),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5">
        {!loading && (
          <>
            <View className="flex flex-row items-center justify-center mb-8">
              <View className="flex items-center justify-center mb-2">
                <AvatarBig user={user} />
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
                title={t("houseGroup_one")}
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
          <Button
            disabled={
              !selection?.newBrigade || !selection?.newHouseBlock || loading
            }
            primary
            onPress={onChangeBrigade}
            title={t("config.changeBrigade")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
