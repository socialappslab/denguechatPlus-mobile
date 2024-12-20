import { useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  Button,
  Text,
  View,
  SafeAreaView,
  IconMaterial,
} from "@/components/themed";
import { IUser } from "@/schema/auth";

import { BaseObject } from "@/schema";
import { useBrigades } from "@/hooks/useBrigades";
import { AvatarBig } from "@/components/segments/AvatarBig";

export default function BrigaderList() {
  const { t } = useTranslation();

  const { selection, clearState } = useBrigades();
  const [user] = useState(selection?.brigader);
  const [newBrigade] = useState(selection?.newBrigade?.name);

  const router = useRouter();

  const renderBrigade = (user?: IUser) => {
    return (user?.team as BaseObject)?.name || t("config.noBrigade");
  };

  const onEnd = () => {
    clearState();
    router.push("/(auth)/(tabs)");
  };

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5">
        <View className="flex flex-1 items-center justify-center">
          <View className="flex flex-row items-center justify-center mb-4 px-6">
            <View className="flex w-full p-6 rounded-2xl border border-gray-200">
              <View className="flex items-center justify-center mb-2">
                <AvatarBig user={user} />
                <Text className="text-lg font-semibold text-center mb-1">
                  {`${user?.firstName} ${user?.lastName}`}
                </Text>
                <View className="flex flex-row items-center justify-center">
                  <Text className="text-sm font-normal text-center">
                    {renderBrigade(user)}
                  </Text>
                  <IconMaterial className="mx-1" name="arrow-right" size={14} />
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

        <View className="pt-5">
          <Button primary onPress={onEnd} title={t("config.end")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
