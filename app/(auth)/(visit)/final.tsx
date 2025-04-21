import FinalIllustration from "@/assets/images/final.svg";
import { Button, Text, View } from "@/components/themed";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNetInfo } from "@react-native-community/netinfo";
import { useVisitStore } from "@/hooks/useVisitStore";
import { ResourceName, StatusColor } from "@/types";
import { useResourceData } from "@/hooks/useResourceData";
import ConfettiImage from "@/assets/images/confetti.svg";

function useTarikiStatusModal() {
  const storedHouseList = useVisitStore((state) => state.storedHouseList);
  const visitId = useVisitStore((state) => state.visitId);
  const [, , consecutiveGreenVisitsForTarikiStatus] = useResourceData(
    ResourceName.AppConfigParam,
  );

  // NOTE: `n - 1` here, the current visit is the `n`th.
  const consecutiveGreenVisitsForTarikiStatusValue =
    Number(consecutiveGreenVisitsForTarikiStatus.value) - 1;

  const { houseColor } = useLocalSearchParams();

  const modalRef = useRef<BottomSheetModal>(null);

  const houseId = Number(visitId.split("-")[1]);
  const currentHouse = storedHouseList.find((house) => house.id === houseId);

  if (!currentHouse) throw new Error("House not found");

  const shouldShowModal =
    currentHouse.consecutiveGreenStatus >=
      consecutiveGreenVisitsForTarikiStatusValue &&
    houseColor === StatusColor.NO_INFECTED;

  useEffect(() => {
    if (shouldShowModal) {
      modalRef.current?.present();
    }
  }, [shouldShowModal]);

  return modalRef;
}

export default function Final() {
  const router = useRouter();

  const { t } = useTranslation();
  const { isInternetReachable } = useNetInfo();
  const tarikiStatusModalRef = useTarikiStatusModal();

  const prefix = isInternetReachable ? "online" : "offline";

  const [brigadistPoints, brigadePoints] = useResourceData(
    ResourceName.AppConfigParam,
  );

  const snapPoints = useMemo(() => [440], []);

  return (
    <View className="h-full p-6 pt-20 pb-10 flex flex-col justify-between items-center">
      {/* This View is used for space between */}
      <View />
      <View className="flex flex-col justify-center items-center">
        <View className="h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center overflow-hidden">
          <FinalIllustration width="100%" height="100%" />
        </View>
        <View>
          <Text type="title" className="text-center mb-4">
            {t(`visit.final.title`)}
          </Text>
          <Text type="text" className="text-center px-10">
            {t(`visit.final.${prefix}.greetings`)}
          </Text>
        </View>
      </View>
      <View className="flex flex-row gap-2 self-end justify-self-end">
        <View className="flex-1">
          <Button
            primary
            title={t("backToHome")}
            onPress={() => {
              router.push({
                pathname: "/(auth)/(tabs)/visits",
                params: { reload: Date.now() },
              });
            }}
          />
        </View>
      </View>

      <ClosableBottomSheet
        bottomSheetModalRef={tarikiStatusModalRef}
        title={t("visit.final.tarikiStatusModal.title")}
        snapPoints={snapPoints}
      >
        <View className="flex-1 p-4">
          <View className="border border-gray-100 p-8 rounded-xl items-center relative overflow-hidden">
            <ConfettiImage className="absolute inset-0 opacity-80" />

            <View className="rounded-full border-[16px] border-primary aspect-square p-6 items-center justify-center">
              <Text className="text-3xl font-bold">
                {brigadistPoints.value}
              </Text>
              <Text className="">
                {t("visit.final.tarikiStatusModal.points")}
              </Text>
            </View>

            <Text className="text-center font-bold text-2xl mt-4">
              {t("visit.final.tarikiStatusModal.title")}
            </Text>
            <Text className="text-center mt-2 text-gray-800">
              {t("visit.final.tarikiStatusModal.description", {
                brigadistPoints: brigadistPoints.value,
                brigadePoints: brigadePoints.value,
              })}
            </Text>
          </View>

          <Button
            primary
            title={t("visit.final.tarikiStatusModal.button")}
            onPress={() => {
              tarikiStatusModalRef.current?.close();
            }}
            className="mt-4"
          />
        </View>
      </ClosableBottomSheet>
    </View>
  );
}
