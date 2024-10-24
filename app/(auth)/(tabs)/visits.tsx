import Button from "@/components/themed/Button";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import CircularProgress from "react-native-circular-progress-indicator";

import HouseWarning from "@/assets/images/icons/house-warning.svg";

import { CheckTeam } from "@/components/segments/CheckTeam";
import {
  ListItem,
  Loading,
  ProgressBar,
  SafeAreaView,
  ScrollView,
  SimpleChip,
  Text,
  View,
} from "@/components/themed";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { QuestionnaireState, useVisitStore } from "@/hooks/useVisitStore";
import { VisitData } from "@/types";
import { extractAxiosErrorData, formatDate } from "@/util";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { Routes } from "../(visit)/_layout";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/AuthProvider";
import { BaseObject, ErrorResponse, Team } from "@/schema";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import useAxios from "axios-hooks";
import Colors from "@/constants/Colors";

const visitsData = {
  weeklyChange: "+15%",
};

const sitesData = {
  totalSites: 170,
  weeklyChange: "+15%",
};

export default function Visits() {
  const { t } = useTranslation();
  const router = useRouter();
  const { storedVisits, cleanUpStoredVisit } = useVisitStore();
  const { language, isConnected } = useVisit();
  const [selectedVisit, setSelectedVisit] = useState<QuestionnaireState>();
  const { user, meData } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [{ data: teamData, loading: loadingTeam }, refetchTeam] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >({
    url: `teams/${(meData?.userProfile?.team as BaseObject)?.id}`,
  });

  function sleep(ms = 2000): Promise<void> {
    setLoading(true);
    console.log("Kindly remember to remove `sleep`");
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  useEffect(() => {
    if (meData) refetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meData]);

  useEffect(() => {
    if (!teamData) return;
    const deserializedData = deserialize<Team>(teamData);
    // console.log("deserializedData TEAM>>>>>>>>>>", deserializedData);
    if (deserializedData && !Array.isArray(deserializedData)) {
      setTeam(deserializedData);
    }
  }, [teamData]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const hasVisits = storedVisits.length > 0;

  const { createMutation: createVisit } = useCreateMutation<
    { json_params: string },
    VisitData
  >("visits", { "Content-Type": "multipart/form-data" });

  const synchronizeVisit = async (visit: any) => {
    const newVisit = {
      ...visit,
      host: "nunu",
      house: visit.houseId ? undefined : visit.house,
      notes: "hi",
      visitPermission: true,
    };
    console.log(JSON.stringify(newVisit));
    try {
      await sleep();
      await createVisit({ json_params: JSON.stringify(newVisit) });
      cleanUpStoredVisit(newVisit);
      setLoading(false);
      setSuccess(true);
      // bottomSheetModalRef.current?.close();
      Toast.show({
        type: "success",
        text1: t("success"),
      });
    } catch (error) {
      const errorData = extractAxiosErrorData(error);
      errorData?.errors?.forEach((error: any) => {
        Toast.show({
          type: "error",
          text1: t([`errorCodes.${error.error_code}`, "errorCodes.generic"]),
        });
      });
      console.log(error);
    }
  };

  const handlePressVisit = (visit: any) => {
    setSelectedVisit(visit);
    console.log(visit);
    bottomSheetModalRef.current?.present();
  };

  const snapPoints = useMemo(() => ["60%"], []);

  const VisitSummary = () => {
    return (
      <>
        <View className="border-b border-neutral-200 flex flex-row justify-center justify-around py-6">
          <View className="flex items-center">
            <Text className="mb-2 text-base text-gray-300">Fecha</Text>
            <Text type="subtitle">{`${formatDate(selectedVisit.visitedAt, language)}`}</Text>
          </View>
          <View className="flex items-center">
            <Text className="mb-2 text-base text-gray-300">
              {(meData?.userProfile?.team as Team)?.sector_name}
            </Text>
            <Text type="subtitle">
              {`${selectedVisit?.house?.houseBlock?.name} Casa ${selectedVisit.houseId}`}
            </Text>
          </View>
        </View>
        <StatusCharts />
      </>
    );
  };

  const SuccessSummary = () => {
    return (
      <View className="flex flex-col justify-center items-center flex-1">
        <Text type="title" className="text-center">
          Visita sincronizada
        </Text>
        <Text type="text" className="text-center p-8 pt-4 whitespace-pre-wrap">
          La visita a la Casa 1 del 2024-Jul-5 ha sido sincronizada.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <CheckTeam view="visit">
          <View className="flex flex-1 py-5 px-5 w-full">
            <View className="my-6 mb-8 p-8 rounded-2xl border border-neutral-200">
              <Text className="text-xl font-bold text-center mb-2">
                {t("visit.newVisit")}
              </Text>
              <Text className="text-center mb-6">
                {t("visit.registerCopy")}
              </Text>
              <Button
                title={t("visit.registerVisit")}
                primary
                onPress={() => router.push(Routes.SelectHouse)}
              />
            </View>

            <View>
              <View className="p-4 mb-4 border border-neutral-200 rounded-lg">
                <Text type="title" className="mb-6">
                  {(meData?.userProfile?.team as Team)?.sector_name}
                </Text>
                <Text className="text-neutral-600 mb-2">
                  {t("brigade.cards.numberVisits")}
                </Text>
                <View className="flex-row items-center justify-between mb-8">
                  <Text className="text-3xl font-semibold">
                    {team?.visits ?? 0}
                  </Text>
                  <SimpleChip
                    border="1"
                    padding="small"
                    textColor="neutral-500"
                    borderColor="neutral-500"
                    ionIcon="arrow-up"
                    iconColor={Colors.light.neutral}
                    label={`${visitsData.weeklyChange} ${t("brigade.cards.numberThisWeek")}`}
                  />
                </View>

                <View>
                  <Text className="text-neutral-600 mb-2">
                    {t("brigade.cards.numberSites")}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-3xl font-semibold">
                      {sitesData.totalSites}
                    </Text>

                    <SimpleChip
                      border="1"
                      padding="small"
                      textColor="neutral-500"
                      borderColor="neutral-500"
                      ionIcon="arrow-up"
                      iconColor={Colors.light.neutral}
                      label={`${sitesData.weeklyChange} ${t("brigade.cards.numberThisWeek")}`}
                    />
                  </View>
                </View>
                <View className="flex flex-col mt-6">
                  <ProgressBar
                    label={t("brigade.sites.green")}
                    progress={team?.sitesStatuses?.green ?? 0}
                    color="primary"
                  />
                  <ProgressBar
                    label={t("brigade.sites.yellow")}
                    progress={team?.sitesStatuses?.yellow ?? 0}
                    color="yellow-300"
                  />
                  <ProgressBar
                    label={t("brigade.sites.red")}
                    progress={team?.sitesStatuses?.red ?? 0}
                    color="red-500"
                  />
                </View>
              </View>
            </View>

            <View className="my-4 p-8 rounded-2xl border border-neutral-200">
              <Text className="text-xl font-bold text-center mb-2">
                {t("visit.list.visitList")}
              </Text>
              {!!hasVisits && (
                <>
                  <Text className="text-center mb-6">
                    {t("visit.list.pending", {
                      storedVisits: storedVisits.length,
                    })}
                  </Text>
                  {storedVisits.map((visit, idx) => {
                    return (
                      <ListItem
                        title={
                          visit.house
                            ? `${t("visit.houses.house")} ${visit.houseId || idx + 5}`
                            : "Casa 23"
                        }
                        onPressElement={() => handlePressVisit(visit)}
                        filled={formatDate(visit.visitedAt, language)}
                      />
                    );
                  })}
                </>
              )}
              {!hasVisits && (
                <>
                  <Text className="text-center">{t("visit.list.done")}</Text>
                </>
              )}
            </View>
          </View>
        </CheckTeam>

        <View className={Platform.OS === "ios" ? "h-6" : "h-14"}></View>
        {selectedVisit && (
          <ClosableBottomSheet
            title={`Casa ${selectedVisit.houseId}`}
            snapPoints={snapPoints}
            bottomSheetModalRef={bottomSheetModalRef}
            onClose={() => setSuccess(false)}
          >
            <View className="h-full w-full flex px-4 py-4">
              <View className="flex-1 mb-4">
                <View className="border border-neutral-200 rounded-lg w-full h-full px-4">
                  {!success && (
                    <>
                      {loading && (
                        <View className="flex flex-1 items-center justify-center">
                          <Loading />
                        </View>
                      )}
                      {!loading && <VisitSummary />}
                    </>
                  )}
                  {success && <SuccessSummary />}
                </View>
              </View>
              {!success && (
                <Button
                  title="Sincronizar visita"
                  onPress={() => synchronizeVisit(selectedVisit)}
                  disabled={!isConnected || loading}
                  primary
                />
              )}
              {success && (
                <Button
                  title="Cerrar"
                  onPress={() => {
                    setSuccess(false);
                    bottomSheetModalRef.current?.close();
                  }}
                />
              )}
            </View>
          </ClosableBottomSheet>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatusCharts = () => {
  return (
    <View className="flex align-center flex-row py-6 justify-between flex-1">
      <View className="flex flex-1 items-center justify-center">
        <View
          className="rounded-full w-20 h-20 flex items-center justify-center"
          style={[styles.circle]}
        >
          <HouseWarning />
        </View>
        <Text className="mt-3 text-center" type="small">
          El sitio es Rojo
        </Text>
      </View>
      <View className="flex flex-1 items-center justify-center">
        <CircularProgress
          value={4}
          maxValue={4}
          radius={40}
          duration={0}
          activeStrokeColor="#FCC914"
        />
        <Text className="mt-3 text-center" type="small">
          Contenedores potenciales
        </Text>
      </View>
      <View className="flex flex-1 items-center justify-center">
        <CircularProgress
          duration={0}
          value={1}
          maxValue={5}
          radius={40}
          activeStrokeColor="#FC0606"
        />
        <Text className="mt-3 text-center" type="small">
          Contenedores positivos
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({ circle: { backgroundColor: "#FC0606" } });
