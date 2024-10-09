import { StyleSheet } from "react-native";

import Button from "@/components/themed/Button";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

import { Text, View, SafeAreaView, ListItem } from "@/components/themed";
import { CheckTeam } from "@/components/segments/CheckTeam";
import { useVisit } from "@/hooks/useVisit";
import { Routes } from "../(visit)/_layout";
import { useVisitStore } from "@/hooks/useVisitStore";
import * as Network from "expo-network";
import { useEffect } from "react";
import useCreateMutation from "@/hooks/useCreateMutation";
import { VisitData } from "@/types";
import { formatDate } from "@/util";

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { storedVisits, setNetworkState, networkState } = useVisitStore();
  const { language } = useVisit();

  /**
   * Set network state
   */
  useEffect(() => {
    (async () => {
      const networkState = await Network.getNetworkStateAsync();
      setNetworkState(networkState);
    })();
  }, []);

  const hasVisits = storedVisits.length;
  const hasConnection = networkState?.isConnected;

  const synchronizeVisits = async () => {
    for (let visit of storedVisits) {
      console.log(visit);
    }
  };

  const { createMutation: createVisit, loading } = useCreateMutation<
    { json_params: string },
    VisitData
  >("visits", { "Content-Type": "multipart/form-data" });

  return (
    <SafeAreaView>
      <CheckTeam view="visit">
        <View className="flex flex-1 py-5 px-5 w-full">
          <View className="my-4 p-8 rounded-2xl border border-neutral-200">
            <Text className="text-xl font-bold text-center mb-2">
              {t("visit.houses.noHouses")}
            </Text>
            <Text className="text-center mb-6">
              {t("visit.houses.noHousesMessage")}
            </Text>
            <Button
              title={t("visit.houses.registerNewHouse")}
              primary
              onPress={() => router.push(Routes.SelectHouse)}
            />
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
                {storedVisits.map((visit) => {
                  return (
                    <ListItem
                      title={`${t("visit.houses.house")} ${visit.houseId!}`}
                      onPressElement={() => {}}
                      filled={formatDate(visit.visitedAt, language)}
                    />
                  );
                })}
                {/* <Button
                  title="Sincronizar visitas"
                  onPress={synchronizeVisits}
                  className="bg-green-300 border-transparent shadow-sm shadow-green-300 mt-8"
                  disabled={!hasConnection}
                /> */}
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
    </SafeAreaView>
  );
}
