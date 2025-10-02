import { useMemo, useState } from "react";
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

import { axios } from "@/config/axios";
import { useBrigades } from "@/hooks/useBrigades";
import { AvatarBig } from "@/components/segments/AvatarBig";
import Toast from "react-native-toast-message";
import { extractAxiosErrorData } from "@/util";
import * as Sentry from "@sentry/react-native";
import { useMutation } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { useStore } from "@/hooks/useStore";

function useChangeAssignmentMutation() {
  return useMutation({
    mutationFn: (payload: {
      userId?: number;
      teamId?: number;
      houseBlockId?: number;
    }) =>
      axios.put("/users/change_assignment", {
        userId: payload.userId,
        teamId: payload.teamId,
        houseBlockId: payload.houseBlockId,
      }),
  });
}

export default function ChangeBrigade() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const { selection } = useBrigades();

  const userProfile = useStore((state) => state.userProfile);
  const user = useMemo(() => {
    invariant(selection.brigader, "Expected a brigader");
    return selection.brigader;
  }, [selection]);

  const isMyUser = userProfile?.id === user.id;
  // @ts-expect-error
  const brigradeName = user.team?.name || t("config.noBrigade");
  const houseGroupName =
    // @ts-expect-error
    user.houseBlocks?.[0]?.name?.trim() ??
    // @ts-expect-error
    user.houseBlock?.name?.trim() ??
    t("config.noHouseGroup");

  const router = useRouter();
  const changeAssignment = useChangeAssignmentMutation();

  async function onChangeBrigade() {
    setLoading(true);
    try {
      await changeAssignment.mutateAsync({
        userId: isMyUser ? undefined : user.id,
        teamId: selection.newBrigade?.id,
        houseBlockId: selection.newHouseBlock?.id,
      });

      router.push("/change-brigade-success");
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
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
  }

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
                    {brigradeName} - {houseGroupName}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex flex-1 mt-4">
              <ListItem
                title={t("config.brigade")}
                onPressElement={() => {
                  router.push("/select-brigade");
                }}
                filled={selection.newBrigade?.name}
                emptyString={t("config.allBrigades")}
              />
              <ListItem
                title={t("houseGroup_one")}
                disabled={!selection.newBrigade}
                onPressElement={() => {
                  router.push("/select-house-group");
                }}
                filled={selection.newHouseBlock?.name}
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
              !selection.newBrigade || !selection.newHouseBlock || loading
            }
            primary
            onPress={onChangeBrigade}
            title={t("drawer.changeHouseBlock")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
