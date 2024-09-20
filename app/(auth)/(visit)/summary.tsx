import { Button, Text, View } from "@/components/themed";
import { useAuth } from "@/context/AuthProvider";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { FormState, VisitData, VisitPayload } from "@/types";
import { extractAxiosErrorData, formatDate } from "@/util";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

const prepareFormData = (formData: FormState) => {
  const questions = Object.keys(formData);
  let inspection: Record<string, string | undefined | string[]> = {};
  let answers: Record<string, string | number | undefined> = {};
  questions.forEach((question) => {
    const answer = formData[question];
    if (Array.isArray(answer)) {
      const [first] = answer;
      const resourceName = first.resourceName as string;
      if (!resourceName) return;
      inspection[resourceName] = answer.map(
        (item) => item.text || (item.resourceId as string),
      );
      return;
    }
    if (answer.resourceName) {
      const resourceName = answer.resourceName;
      if (answer.resourceType === "relation")
        inspection[resourceName] = answer.text || answer.resourceId;
      if (answer.resourceType === "atribute")
        inspection[resourceName] = answer.label;
    }
    const questionId = `question_${question}`;
    answers[questionId] = answer.value;
  });
  return { inspection, answers };
};

export default function Summary() {
  const router = useRouter();
  const { questionnaire, currentFormData, visitData, cleanStore } = useVisit();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { createMutation: createVisit, loading } = useCreateMutation<
    { json_params: string },
    VisitData
  >("visits", { "Content-Type": "multipart/form-data" });

  const onFinalize = async () => {
    console.log(">>>>>>>>>>>>");
    const { inspection, answers } = prepareFormData(currentFormData);
    // console.log(inspection);
    // console.log(">>>>>inspection", inspection, Object.keys(inspection).length);
    // console.log(">>>>>answers", answers, Object.keys(answers).length);
    // const answers = normalizeAnswer(visitData.answers);

    // This should never happen, but we're being cautious
    if (!user || !questionnaire) {
      return Toast.show({
        type: "error",
        text1: t("generic"),
      });
    }

    // console.log(prepareFormDataPayload(payload));
    const normalizedData: VisitPayload = {
      answers: [],
      host: "ejemplo.com",
      visitPermission: true,
      houseId: 1,
      questionnaireId: "1",
      teamId: 1,
      userAccountId: "1",
      notes: "Algo a notar",
      visitedAt: "1212",
      inspections: [
        // {
        //   ...inspection,
        //   breeding_site_type_id: 1,
        //   has_water: true, // will be static depending on water ding
        //   was_chemically_treated: "si, si, si",
        //   photo_id: "CRCODE",
        // },
        // {
        //   breeding_site_type_id: 1,
        //   elimination_method_type_id: 1,
        //   water_source_type_id: 1,
        //   // code_reference: "CRCODE",
        //   has_water: true,
        //   was_chemically_treated: "si, si, si",
        //   // water_source_other: "Fuente de agua",
        //   container_protection_id: 1,
        //   type_content_id: [1, 2],
        //   quantity_founded: 3,
        // },
      ],
    };

    try {
      // await createVisit({ json_params: JSON.stringify(normalizedData) });
      await cleanStore();
      Toast.show({
        type: "success",
        text1: t("success"),
      });
      router.push("final");
    } catch (error) {
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
