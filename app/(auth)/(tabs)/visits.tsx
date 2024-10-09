import Button from "@/components/themed/Button";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { CheckTeam } from "@/components/segments/CheckTeam";
import { OfflineVisitSheet } from "@/components/segments/OfflineVisitSheet";
import { ListItem, SafeAreaView, Text, View } from "@/components/themed";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { useVisitStore } from "@/hooks/useVisitStore";
import { VisitData } from "@/types";
import { formatDate } from "@/util";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Network from "expo-network";
import { useEffect, useRef } from "react";
import { Routes } from "../(visit)/_layout";
import { Platform } from "react-native";

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { storedVisits, setNetworkState, networkState } = useVisitStore();
  const { language } = useVisit();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  /**
   * Set network state
   */
  useEffect(() => {
    (async () => {
      const networkState = await Network.getNetworkStateAsync();
      setNetworkState(networkState);
    })();
  }, []);

  const hasVisits = storedVisits.length > 0;
  const hasConnection = networkState?.isConnected;

  const synchronizeVisits = async () => {
    for (let visit of storedVisits) {
      console.log(visit);
    }
  };

  const handlePressVisit = () => {
    bottomSheetModalRef.current?.present();
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
            {hasVisits && (
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
                      onPressElement={handlePressVisit}
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

      {/* <View className={Platform.OS === "ios" ? "h-6" : "h-14"}></View> */}
      {/* <OfflineVisitSheet bottomSheetModalRef={bottomSheetModalRef} /> */}
    </SafeAreaView>
  );
}
