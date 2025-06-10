import { Button, ScrollView, View } from "@/components/themed";
import VisitSummary from "@/components/VisitSummary";
import { useAuth } from "@/context/AuthProvider";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { useStore } from "@/hooks/useStore";
import { VisitData } from "@/types";
import { Inspection, StatusColor } from "@/types/prepareFormData";
import { extractAxiosErrorData, formatDate, prepareFormData } from "@/util";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { sanitizeInspections } from "@/util/sanitizeInspections";
import { Image } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { VISITS_LOG } from "@/util/logger";

const getColorsAndQuantities = (inspections: Inspection[]) => {
  const highestWeightInEachContainer = inspections
    .map((inspection) => Object.values(inspection))
    .map((valuesArray) =>
      valuesArray
        .flat()
        .filter((item) => !!item?.statusColor && !!item?.weightedPoints)
        .reduce(
          (previous, current) =>
            previous.weightedPoints > current.weightedPoints
              ? previous
              : current,
          {},
        ),
    )
    .filter((valuesArray) => Object.keys(valuesArray).length > 0);

  const colorsAndQuantities: Record<StatusColor, number> = {
    RED: 0,
    YELLOW: 0,
    GREEN: 0,
  };

  for (const [index, inspection] of inspections.entries()) {
    const quantity =
      (!Array.isArray(inspection.quantity_founded) &&
        parseInt(inspection.quantity_founded as string)) ||
      0;

    if (!highestWeightInEachContainer[index]?.statusColor) {
      continue;
    }

    colorsAndQuantities[
      highestWeightInEachContainer[index].statusColor as StatusColor
    ] += quantity;
  }

  const colorOrder = Object.values(StatusColor);
  const worstStatusColorBetweenContainers =
    highestWeightInEachContainer.sort(
      (a, b) =>
        colorOrder.indexOf(a.statusColor) - colorOrder.indexOf(b.statusColor),
    )[0]?.statusColor ?? StatusColor.NotInfected;

  return {
    colorsAndQuantities,
    mainStatusColor: worstStatusColorBetweenContainers,
  };
};

export default function Summary() {
  const router = useRouter();
  const { visitData } = useVisit();
  const { isInternetReachable } = useNetInfo();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const visitMap = useStore((state) => state.visitMap);
  const visitId = useStore((state) => state.visitId);
  const finaliseCurrentVisit = useStore((state) => state.finaliseCurrentVisit);
  const questionnaire = useStore((state) => {
    if ((state.questionnaire, "Expected questionnaire to be defined"))
      return state.questionnaire;
  });

  const currentVisit = visitMap[visitId];

  const { inspections, answers, visit } = prepareFormData(currentVisit);
  let { mainStatusColor, colorsAndQuantities } =
    getColorsAndQuantities(inspections);

  // if there's only one answer, there was a not allowed - early exit
  const visitWasNotAllowedOrWasEarlyExit = answers.length === 1;

  mainStatusColor = visitWasNotAllowedOrWasEarlyExit
    ? StatusColor.PotentionallyInfected
    : mainStatusColor;

  const { createMutation: createVisit, loading } = useCreateMutation<
    { json_params: string },
    VisitData
  >("visits", { "Content-Type": "multipart/form-data" });

  const onFinalize = async () => {
    // This should never happen, but we're being cautious
    if (!user || !questionnaire) {
      return Toast.show({
        type: "error",
        text1: t("generic"),
      });
    }

    const sanitizedVisitData = {
      ...visitData,
      house: visitData.houseId ? undefined : visitData.house,
      visitPermission: !visitWasNotAllowedOrWasEarlyExit,
      host: visit.host,
      visitedAt: new Date(),
      answers,
      // @ts-expect-error
      inspections: sanitizeInspections(inspections),
    };

    VISITS_LOG.debug("Payload prepared for the server", sanitizedVisitData);

    try {
      // We only make the request if it's connected
      if (isInternetReachable) {
        await createVisit({ json_params: JSON.stringify(sanitizedVisitData) });
        VISITS_LOG.info("Visit sent to the server successfully");
      }
      Toast.show({
        type: "success",
        text1: t("success"),
      });
      router.push({
        pathname: "/final",
        params: {
          houseColor: mainStatusColor,
        },
      });
      // Cleanup, if it's not connected we send house details
      finaliseCurrentVisit(!!isInternetReachable, {
        ...sanitizedVisitData,
        // NOTE: This is stuff we need to show in the modal before syncing an
        // offline visit
        // @ts-expect-error the type is wrong
        house: visitData.house,
        statusColor: mainStatusColor,
        // @ts-expect-error the type is wrong
        colorsAndQuantities,
      });
    } catch (error) {
      console.error(error);
      const errorData = extractAxiosErrorData(error);
      errorData?.errors?.forEach((error: any) => {
        Toast.show({
          type: "error",
          text1: t([`errorCodes.${error.error_code}`, "errorCodes.generic"]),
        });
      });
      if (!errorData?.errors || errorData?.errors.length === 0) {
        Toast.show({
          type: "error",
          text1: t("login.error.invalidCredentials"),
        });
      }
    }
  };

  return (
    <View className="h-full">
      <ScrollView
        className="flex-grow"
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        <View className="p-4">
          <View className="flex-col justify-center items-center">
            <View className="h-52 w-52 items-center justify-center">
              <Image
                source={require("@/assets/images/summary.png")}
                style={{ width: "100%", height: "100%", resizeMode: "contain" }}
              />
            </View>
          </View>
          <VisitSummary
            date={formatDate(new Date().toString(), i18n.language) ?? ""}
            house={visitData.house?.referenceCode}
            sector={user?.neighborhoodName}
            greens={colorsAndQuantities.GREEN}
            yellows={colorsAndQuantities.YELLOW}
            reds={colorsAndQuantities.RED}
            color={mainStatusColor}
            permissionToVisitGranted={!visitWasNotAllowedOrWasEarlyExit}
          />
        </View>
      </ScrollView>
      <View className="py-2 px-4 border-t border-neutral-200">
        <Button
          primary
          title={t("finalize")}
          onPress={onFinalize}
          disabled={loading}
        />
      </View>
    </View>
  );
}
