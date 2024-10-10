import Button from "@/components/themed/Button";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { CheckTeam } from "@/components/segments/CheckTeam";
import {
  ListItem,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "@/components/themed";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { QuestionnaireState, useVisitStore } from "@/hooks/useVisitStore";
import { VisitData } from "@/types";
import { formatDate } from "@/util";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { Routes } from "../(visit)/_layout";

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { storedVisits, cleanUpStoredVisit } = useVisitStore();
  const { language, isConnected } = useVisit();
  const [selectedVisit, setSelectedVisit] = useState<QuestionnaireState>();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const hasVisits = storedVisits.length > 0;

  const { createMutation: createVisit, loading } = useCreateMutation<
    { json_params: string },
    VisitData
  >("visits", { "Content-Type": "multipart/form-data" });

  const synchronizeVisit = async (visit: any) => {
    const newVisit = {
      ...visit,
      host: "nunu",
      house: undefined,
      notes: "hi",
      visitPermission: true,
    };
    console.log(JSON.stringify(newVisit));
    try {
      createVisit({ json_params: JSON.stringify(newVisit) });
      cleanUpStoredVisit(newVisit);
      bottomSheetModalRef.current?.close();
    } catch (e) {
      console.log(e);
    }
  };

  const handlePressVisit = (visit: any) => {
    setSelectedVisit(visit);
    bottomSheetModalRef.current?.present();
  };

  const snapPoints = useMemo(() => ["55%"], []);

  return (
    <SafeAreaView>
      <ScrollView>
        <CheckTeam view="visit">
          <View className="flex flex-1 py-5 px-5 w-full">
            <View className="my-4 p-8 rounded-2xl border border-neutral-200">
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
                        title={`${t("visit.houses.house")} ${visit.houseId}`}
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
          >
            <View className="h-full w-full flex px-4 py-4">
              <View className="flex-1 mb-4">
                <View className="border border-neutral-200 rounded-lg w-full h-full px-8">
                  <View className="border-b border-neutral-200 flex flex-row justify-center justify-around py-6">
                    <View className="flex items-center">
                      <Text className="mb-2 text-base text-gray-300">
                        Fecha
                      </Text>
                      <Text type="subtitle">{`${formatDate(selectedVisit.visitedAt, language)}`}</Text>
                    </View>
                    <View className="flex items-center">
                      <Text className="mb-2 text-base text-gray-300">
                        Tariki
                      </Text>
                      <Text type="subtitle">
                        Tariki 07 {`Casa ${selectedVisit.houseId}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Button
                title="Sincronizar visita"
                onPress={() => synchronizeVisit(selectedVisit)}
                disabled={!isConnected}
                primary
              />
            </View>
          </ClosableBottomSheet>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
