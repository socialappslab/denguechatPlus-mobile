import SummaryImage from "@/assets/images/summary.svg";
import { Button, ScrollView, View } from "@/components/themed";
import VisitSummary from "@/components/VisitSummary";
import { useAuth } from "@/context/AuthProvider";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { useVisitStore } from "@/hooks/useVisitStore";
import { VisitData } from "@/types";
import { Inspection, StatusColor } from "@/types/prepareFormData";
import {
  extractAxiosErrorData,
  formatDate,
  orderStatus,
  prepareFormData,
} from "@/util";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

const getColorsAndQuantities = (inspections: Inspection[]) => {
  let color: StatusColor = StatusColor.NO_INFECTED;
  const colorsAndQuantities: Record<StatusColor, number> = {
    RED: 0,
    YELLOW: 0,
    GREEN: 0,
  };
  for (const inspection of inspections) {
    const quantity =
      (!Array.isArray(inspection.quantity_founded) &&
        parseInt(inspection.quantity_founded as string)) ||
      0;
    colorsAndQuantities[inspection.statusColor as StatusColor] += quantity;
  }

  // Ordering
  const colors = Object.keys(colorsAndQuantities);
  const unorderedColors: StatusColor[] = [];

  for (const key of colors) {
    if (colorsAndQuantities[key as StatusColor] >= 1) {
      unorderedColors.push(key as StatusColor);
    }
  }
  color = orderStatus(unorderedColors);

  return { colorsAndQuantities, mainStatusColor: color };
};

export default function Summary() {
  const router = useRouter();
  const { questionnaire, visitData, language, isConnected } = useVisit();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { visitMap, visitId, finaliseCurrentVisit } = useVisitStore();
  const { inspections, answers } = prepareFormData(visitMap[visitId]);

  const { mainStatusColor, colorsAndQuantities } =
    getColorsAndQuantities(inspections);
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

    try {
      const completeVisitData = {
        ...visitData,
        house: visitData.houseId ? undefined : visitData.house,
        visitPermission: true,
        host: user.firstName,
        visitedAt: new Date(),
        inspections,
        answers,
      };

      console.log(JSON.stringify(completeVisitData));

      // We only make the request if it's connected
      if (isConnected)
        await createVisit({ json_params: JSON.stringify(completeVisitData) });

      Toast.show({
        type: "success",
        text1: t("success"),
      });
      router.push("final");
      // Cleanup, if it's not connected we send house details
      finaliseCurrentVisit(isConnected, {
        ...completeVisitData,
        house: visitData.house,
        statusColor: mainStatusColor,
        colorsAndQuantities,
      });
    } catch (error) {
      console.log(error);
      const errorData = extractAxiosErrorData(error);
      // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-explicit-any
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
    <ScrollView>
      <View className="h-full p-6 pb-10 flex flex-col justify-between">
        <View className="flex flex-col justify-center items-center">
          <View className="h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center overflow-hidden">
            <SummaryImage height="100%" width="100%" />
          </View>
        </View>
        <VisitSummary
          date={formatDate(new Date().toString(), language) || ""}
          house={visitData.houseId.toString()}
          sector={user?.neighborhoodName}
          greens={colorsAndQuantities.GREEN}
          yellows={colorsAndQuantities.YELLOW}
          reds={colorsAndQuantities.RED}
          color={mainStatusColor}
        />
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <Button
              title={t("editFromStart")}
              onPress={() =>
                router.push(`visit/${questionnaire?.initialQuestion}`)
              }
            />
          </View>
          <View className="flex-1">
            <Button
              primary
              title={t("finalize")}
              onPress={onFinalize}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
