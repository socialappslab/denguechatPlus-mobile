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

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { storedVisits, setNetworkState, networkState } = useVisitStore();
  const { questionnaire } = useVisit();

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
          <View className="my-4 p-8 rounded-2xl border border-gray-200">
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
          <View className="my-4 p-8 rounded-2xl border border-gray-200">
            <Text className="text-xl font-bold text-center mb-2">
              Lista de visitas
            </Text>
            {hasVisits && (
              <>
                <Text className="text-center mb-6">
                  Tienes 2 visitas pendientes a ser sincronizadas.
                </Text>
                {storedVisits.map((visit) => {
                  return (
                    <ListItem
                      title="Casa 1"
                      onPressElement={() => {}}
                      filled="2017-04-20"
                    />
                  );
                })}
                <Button
                  title="Sincronizar visitas"
                  onPress={synchronizeVisits}
                  className="bg-green-300 border-transparent shadow-sm shadow-green-300 mt-8"
                  disabled={!hasConnection}
                />
              </>
            )}
          </View>
        </View>
      </CheckTeam>
    </SafeAreaView>
  );
}
