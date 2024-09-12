import { Button, Text, View } from "@/components/themed";
import { useAuth } from "@/context/AuthProvider";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { Answer, VisitData, VisitPayload } from "@/types";
import { extractAxiosErrorData, formatDate, parseId } from "@/util";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

// Converts the data from the visitData object into a format that can be sent to the API
const normalizeAnswer = (
  data: Record<string, Record<string, boolean | string>>,
): Answer[] => {
  const keys = Object.keys(data);
  const normalized = keys.map((key) => ({
    questionId: parseId(key),
    answer: Object.keys(data[key]).map((k) => ({
      optionId: parseId(key),
      value: data[key][k],
    })),
  }));
  return normalized;
};

export default function Summary() {
  const router = useRouter();
  const { questionnaire, visitData, cleanStore } = useVisit();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { createMutation: createVisit, loading } = useCreateMutation<
    VisitPayload,
    VisitData
  >("visits");

  const onFinalize = async () => {
    const answers = normalizeAnswer(visitData.answers);

    // This should never happen, but we're being cautious
    if (!user || !questionnaire) {
      return Toast.show({
        type: "error",
        text1: t("generic"),
      });
    }

    const normalizedData: VisitPayload = {
      ...visitData,
      inspections: [],
      answers,
      userAccountId: user.id,
      questionnaireId: questionnaire.id,
      visitPermission: true,
      host: "Host",
      notes: "Notas",
    };

    try {
      await createVisit(normalizedData);
      await cleanStore();
      router.push("final");
    } catch (error) {
      const errorData = extractAxiosErrorData(error);
      // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-explicit-any
      errorData?.errors?.forEach((error: any) => {
        Toast.show({
          type: "error",
          text1: t(`errorCodes.${error.error_code || "generic"}`),
        });
      });
      console.log(errorData?.errors);

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
          <Text className="text-center text">Ilustración o ícono</Text>
        </View>
      </View>
      <Text type="title" className="mb-4">
        {t("visit.summary.title")}
      </Text>
      <View className="mb-4">
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.status")}</Text>
          <Text type="text">-</Text>
        </View>
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.containers")}</Text>
          <Text type="text">-</Text>
        </View>
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.houseNumber")}</Text>
          <Text type="text">-</Text>
        </View>
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.date")}</Text>
          <Text type="text">{formatDate(new Date().toISOString())}</Text>
        </View>
      </View>
      <View className="flex flex-row gap-2">
        <View className="flex-1">
          <Button
            title={t("editFromStart")}
            onPress={() => router.push("visit/1")}
          />
        </View>
        <View className="flex-1">
          <Button primary title={t("finalize")} onPress={onFinalize} />
        </View>
      </View>
    </View>
  );
}
