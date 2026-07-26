import FinalIllustration from "@/assets/images/final.svg";
import { Button, SafeAreaView, Text, View } from "@/components/themed";
import { ClosableBottomSheet } from "@/components/themed/ClosableBottomSheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNetInfo } from "@react-native-community/netinfo";
import ConfettiImage from "@/assets/images/confetti.svg";
import { PointAward } from "@/types";

function parsePointAwards(value: string | string[] | undefined): PointAward[] {
  const serializedAwards = Array.isArray(value) ? value[0] : value;
  if (!serializedAwards) return [];

  try {
    const awards: unknown = JSON.parse(serializedAwards);
    if (!Array.isArray(awards)) return [];

    return awards.filter((award): award is PointAward => {
      if (!award || typeof award !== "object") return false;

      const candidate = award as Partial<PointAward>;
      return (
        (candidate.recipient === "brigadist" ||
          candidate.recipient === "brigade") &&
        typeof candidate.amount === "number" &&
        candidate.reason === "tariki_reached"
      );
    });
  } catch {
    return [];
  }
}

function useTarikiStatusModal(shouldShowModal: boolean) {
  const modalRef = useRef<BottomSheetModal>(null);

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
  const params = useLocalSearchParams();
  const pointAwards = parsePointAwards(params.pointAwards);
  const tarikiStatusModalRef = useTarikiStatusModal(pointAwards.length > 0);

  const prefix = isInternetReachable ? "online" : "offline";
  const brigadistPoints =
    pointAwards.find((award) => award.recipient === "brigadist")?.amount ?? 0;
  const brigadePoints =
    pointAwards.find((award) => award.recipient === "brigade")?.amount ?? 0;

  const snapPoints = useMemo(() => [460], []);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]}>
      <View className="h-full p-6 justify-between items-center">
        {/* This View is used for space between */}
        <View />
        <View className="justify-center items-center">
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
        <View className="flex-row gap-2 self-end justify-self-end">
          <View className="flex-1">
            <Button
              primary
              title={t("backToHome")}
              onPress={() => {
                router.dismissAll();
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
                <Text className="text-3xl font-bold">{brigadistPoints}</Text>
                <Text className="">
                  {t("visit.final.tarikiStatusModal.points")}
                </Text>
              </View>

              <Text className="text-center font-bold text-2xl mt-4">
                {t("visit.final.tarikiStatusModal.title")}
              </Text>
              <Text className="text-center mt-2 text-gray-800">
                {t("visit.final.tarikiStatusModal.description", {
                  brigadistPoints,
                  brigadePoints,
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
    </SafeAreaView>
  );
}
