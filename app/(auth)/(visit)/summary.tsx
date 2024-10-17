import { Button, Text, View } from "@/components/themed";
import { useAuth } from "@/context/AuthProvider";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { useVisitStore } from "@/hooks/useVisitStore";
import { VisitData, StatusColor } from "@/types";
import { extractAxiosErrorData, formatDate, prepareFormData } from "@/util";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

export default function Summary() {
  const router = useRouter();
  const { questionnaire, visitData, language } = useVisit();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { visitMap, visitId, finaliseCurrentVisit } = useVisitStore();
  const { inspections, answers, statusColors } = prepareFormData(
    visitMap[visitId],
  );
  const quantity = 1;
  const isConnected = false;
  console.log(visitMap[visitId]);

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
        statusColor: statusColors[0],
      };

      console.log(JSON.stringify(completeVisitData));

      // We only make the request if it's connected
      if (isConnected)
        await createVisit({ json_params: JSON.stringify(completeVisitData) });

      // Cleanup, if it's not connected we send house details
      finaliseCurrentVisit(isConnected, {
        ...completeVisitData,
        house: visitData.house,
      });
      Toast.show({
        type: "success",
        text1: t("success"),
      });
      router.push("final");
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
    <View className="h-full p-6 pb-10 flex flex-col justify-between">
      <View className="flex flex-col justify-center items-center">
        <View className="bg-green-300 h-52 w-52 mb-8 rounded-xl border-green-300 flex items-center justify-center">
          <Text className="text-center text">{t("ilustrationOrIcon")}</Text>
        </View>
      </View>
      <Text type="title" className="mb-4">
        {t("visit.summary.title")}
      </Text>
      <View className="mb-4">
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.status")}</Text>
          <RenderStatus statusColor={statusColors[0]} />
        </View>
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.containers")}</Text>
          <Text type="text">
            {quantity + visitData?.inspections?.length || 1}
          </Text>
        </View>
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.houseNumber")}</Text>
          <Text type="text">{visitData.houseId}</Text>
        </View>
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.date")}</Text>
          <Text type="text">{formatDate(new Date().toString(), language)}</Text>
        </View>
      </View>
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
  );
}

const RenderStatus = ({
  statusColor = StatusColor.NO_INFECTED,
}: {
  statusColor: StatusColor;
}) => {
  const { t } = useTranslation();

  return (
    <View className="flex flex-row justify-center items-center">
      <Text>{t(`visit.summary.statusColor.${statusColor.toLowerCase()}`)}</Text>
      <View
        className={`h-6 w-6 ml-3 rounded-full bg-${statusColor.toLocaleLowerCase()}-100`}
      />
    </View>
  );
};
