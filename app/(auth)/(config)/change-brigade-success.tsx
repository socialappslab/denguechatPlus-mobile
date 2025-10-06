import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import {
  Button,
  Text,
  View,
  SafeAreaView,
  IconMaterial,
} from "@/components/themed";

import { useBrigades } from "@/hooks/useBrigades";
import { AvatarBig } from "@/components/segments/AvatarBig";
import invariant from "tiny-invariant";

export default function BrigaderList() {
  const { t } = useTranslation();
  const { selection } = useBrigades();

  const user = useMemo(() => {
    invariant(selection.brigader, "Expected a brigader");
    return selection.brigader;
  }, [selection]);
  const newBrigade = useMemo(() => {
    invariant(selection.newBrigade, "Expected a newBrigade");
    return selection.newBrigade;
  }, [selection]);
  const newHouseGroup = useMemo(() => {
    invariant(selection.newHouseBlock, "Expected a newHouseBlock");
    return selection.newHouseBlock;
  }, [selection]);

  const router = useRouter();

  // @ts-expect-error
  const brigadeName = user.team?.name ?? t("config.noBrigade");
  const houseGroupName =
    // @ts-expect-error
    user.houseBlocks?.[0]?.name?.trim() ??
    // @ts-expect-error
    user.houseBlock?.name?.trim() ??
    t("config.noHouseGroup");

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5">
        <View className="flex flex-1 items-center justify-center">
          <View className="flex flex-row items-center justify-center mb-4 px-6">
            <View className="flex w-full p-6 rounded-2xl border border-gray-200">
              <View className="flex items-center justify-center mb-2">
                <AvatarBig user={user} />
                <Text className="text-lg font-semibold text-center mb-1">
                  {user.firstName} {user.lastName}
                </Text>
                <View className="flex-row items-center justify-center">
                  <Text className="text-sm font-normal text-center">
                    {brigadeName}
                  </Text>
                  <IconMaterial className="mx-1" name="arrow-right" size={14} />
                  <Text className="text-sm font-normal text-center">
                    {newBrigade.name}
                  </Text>
                </View>

                <View className="flex-row items-center justify-center">
                  <Text className="text-sm font-normal text-center">
                    {houseGroupName}
                  </Text>
                  <IconMaterial className="mx-1" name="arrow-right" size={14} />
                  <Text className="text-sm font-normal text-center">
                    {newHouseGroup.name.trim()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text className="text-lg font-bold mb-1 mt-4">
            {t("config.successTitle")}
          </Text>
        </View>

        <View className="pt-5">
          <Button
            primary
            onPress={() => {
              router.dismissAll();
            }}
            title={t("config.end")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
