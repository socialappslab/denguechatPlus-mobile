import FinalIllustration from "@/assets/images/final.svg";
import { Button, Text, View } from "@/components/themed";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNetInfo } from "@react-native-community/netinfo";
import { useVisitStore } from "@/hooks/useVisitStore";
import { ResourceName, StatusColor } from "@/types";
import { useResourceData } from "@/hooks/useResourceData";

function useTarikiStatusModal() {
  const storedHouseList = useVisitStore((state) => state.storedHouseList);
  const visitId = useVisitStore((state) => state.visitId);
  const [consecutiveGreenVisitsForTarikiStatus] = useResourceData(
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

  // TODO: make sure this is dynamic with Raul
  const shouldShowModal =
    currentHouse.consecutiveGreenStatus >=
      consecutiveGreenVisitsForTarikiStatusValue &&
    houseColor === StatusColor.NO_INFECTED;

  if (shouldShowModal) {
    modalRef.current?.present();
  }

  return modalRef;
}

export default function Summary() {
  const router = useRouter();

  const { t } = useTranslation();
  const { isInternetReachable } = useNetInfo();
  const tarikiStatusModalRef = useTarikiStatusModal();

  const prefix = isInternetReachable ? "online" : "offline";

  const [, brigadistPoints, brigadePoints] = useResourceData(
    ResourceName.AppConfigParam,
  );

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
        title="¡Nuevo sitio Tariki!"
        snapPoints={["50%"]}
      >
        <View className="flex-1 p-4">
          <View className="border border-gray-100 p-8 rounded-xl items-center">
            <View className="rounded-full border-[16px] border-primary aspect-square p-6 items-center justify-center">
              <Text className="text-3xl font-bold">
                {brigadistPoints.value}
              </Text>
              <Text className="">Puntos</Text>
            </View>

            <Text className="text-center font-bold text-2xl mt-4">
              Este sitio ahora es Tariki
            </Text>
            <Text className="text-center mt-2 text-gray-800">
              {brigadistPoints.value} puntos fueron asignados a ti y{" "}
              {brigadePoints.value} puntos a tu brigada. ¡Excelente trabajo!
            </Text>
          </View>

          <Button
            primary
            title={"Aceptar puntos"}
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
