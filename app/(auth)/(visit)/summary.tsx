import { Button, Text, View } from "@/components/themed";
import { useAuth } from "@/context/AuthProvider";
import useCreateMutation from "@/hooks/useCreateMutation";
import { useVisit } from "@/hooks/useVisit";
import { useVisitStore } from "@/hooks/useVisitStore";
import { FormState, VisitData, VisitPayload } from "@/types";
import { extractAxiosErrorData, formatDate } from "@/util";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import * as Network from "expo-network";

// Inspection type
const QuantityFound = "quantity_founded";

// StatusColor utils
enum StatusColor {
  INFECTED = "RED",
  POTENTIONALLY_INFECTED = "YELLOW",
  NO_INFECTED = "GREEN",
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

type Inspection = Record<string, string | undefined | string[]>;
type Answer = Record<string, string | number | undefined>;

/**
 *
 * @param formData
 * @returns takes all SelectableItems from a given formState and returns
 * formatted inspection, answers and colorStatus
 */
export const prepareFormData = (formData: FormState) => {
  const questions = Object.keys(formData);
  let inspections: Inspection[] = [];
  let answers: Answer[] = [];
  let statusColors: StatusColor[] = [];

  questions.forEach((question) => {
    const answer = formData[question];
    const index = parseInt(question.split("-")[1]);
    if (!inspections[index]) inspections[index] = {};
    if (!answers[index]) answers[index] = {};

    if (Array.isArray(answer)) {
      const [first] = answer;
      const resourceName = first.resourceName as string;
      if (!resourceName) return;
      inspections[index][resourceName] = answer.map(
        (item) => item.text || (item.resourceId as string),
      );

      const colors: StatusColor[] = answer
        .filter((item) => typeof item.statusColor === "string")
        .map((item) => item.statusColor as StatusColor);

      statusColors.push(...colors);
      return;
    }

    if (answer.resourceName) {
      const resourceName = answer.resourceName;
      if (answer.resourceType === "relation") {
        inspections[index][resourceName] = answer.text || answer.resourceId;
      }
      if (answer.resourceType === "attribute") {
        inspections[index][resourceName] = answer.text || answer.label;
      }
      if (answer.statusColor) {
        statusColors.push(answer.statusColor as StatusColor);
      }
    }

    // console.log(inspection);
    const questionId = `question_${question}`;
    answers[index][questionId] = answer.value;
  });

  // We order with RED beign first, then YELLOW, then GREEN
  const orderedStatus = statusColors.sort((a, b) => {
    if (a < b) return 1;
    if (a > b) return -1;
    return 0;
  });
  // And get the first
  const [statusColor] = orderedStatus;

  return { inspections, answers, statusColor: statusColor as StatusColor };
};

export default function Summary() {
  const router = useRouter();
  const { questionnaire, visitData, language, cleanStore } = useVisit();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { visitMap, visitId, finaliseCurrentVisit } = useVisitStore();
  const { inspections, answers, statusColor } = prepareFormData(
    visitMap[visitId],
  );
  const quantity = 1;

  const { createMutation: createVisit, loading } = useCreateMutation<
    { json_params: string },
    VisitData
  >("visits", { "Content-Type": "multipart/form-data" });

  const onFinalize = async () => {
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
      houseId: 1, // visitData.houseId or visitData.houseId if not houseId
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
      console.log(visitMap);
      const { inspections, statusColor, answers } = prepareFormData(
        visitMap[visitId],
      );
      console.log(inspections, statusColor, answers, visitData);
      const completeVisitData = {
        ...visitData,
        visitedAt: new Date(),
        inspections,
        answers,
        statusColor,
      };
      finaliseCurrentVisit(true, completeVisitData);
      // await createVisit({ json_params: JSON.stringify(normalizedData) });
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
          <Text className="text-center text">{t("ilustrationOrIcon")}</Text>
        </View>
      </View>
      <Text type="title" className="mb-4">
        {t("visit.summary.title")}
      </Text>
      <View className="mb-4">
        <View className="flex flex-row mb-4 w-full justify-between items-center">
          <Text type="header">{t("visit.summary.status")}</Text>
          <RenderStatus statusColor={statusColor} />
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
          <Button primary title={t("finalize")} onPress={onFinalize} />
        </View>
      </View>
    </View>
  );
}
