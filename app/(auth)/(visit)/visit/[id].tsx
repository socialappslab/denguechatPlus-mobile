import QuestionnaireRenderer, {
  FormStateOption,
} from "@/components/QuestionnaireRenderer";
import { Loading, SafeAreaView, ScrollView, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { useVisit } from "@/hooks/useVisit";
import { InspectionQuestion, Question } from "@/types";
import { PhotoId } from "@/util";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AnswerState, useVisitStore } from "@/hooks/useVisitStore";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Routes } from "../_layout";

// When next is -1 we end the flow
const TERMINATE = -1;

// Custom validation function
const isValid = (
  currentValue: FormStateOption | FormStateOption[],
  question?: Question,
): boolean => {
  if (!question || !currentValue) return false;

  const required = question.options?.filter((item) => item.required) || [];

  // Radio buttons
  if (!Array.isArray(currentValue)) {
    if (currentValue.optionType === "inputNumber") {
      return !!currentValue.text;
    }
    return !!currentValue;
  }

  // Checkboxes
  if (Array.isArray(currentValue)) {
    // Check if all requierd fields are present
    if (required.length > 0) {
      const currentIds = currentValue?.map((item: any) => item.value) || [];
      const requiredIds = required.map((item) => item.id);
      return requiredIds.every((req) => currentIds?.includes(req));
    }

    // Check if at least one is marked
    return currentValue.length > 0;
  }

  return false;
};

export default function Visit() {
  const { questionnaire, isLoadingQuestionnaire } = useVisit();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const { setCurrentVisitData, answerId, visitMap, visitId } = useVisitStore();
  const questionId = id.toString();
  const methods = useForm({});

  const { getValues, watch } = methods;

  let currentQuestion: InspectionQuestion | undefined =
    questionnaire?.questions.find((q) => String(q.id) === questionId);
  const isSplash = currentQuestion?.typeField === "splash";
  const currentValues = watch(answerId) as AnswerState;

  const findNext = () => {
    if (!currentQuestion) return;
    let next = currentQuestion.next;

    if (next) return next;

    const curr = getValues(answerId);
    // look inside current option selected
    // which extends an option object
    if (!next && !Array.isArray(curr)) {
      return curr.next;
    } else if (Array.isArray(curr)) {
      const [first] = curr;
      return first.next;
    }
    return TERMINATE;
  };

  const onNext = () => {
    if (!currentQuestion) return;

    const next = findNext();
    const resourceName = currentQuestion.resourceName;
    const values = methods.getValues(answerId);

    // Persist values
    if (values) setCurrentVisitData(questionId, values);

    // Branches
    if (resourceName === PhotoId) {
      return router.push({
        pathname: Routes.ContainerPicture,
        params: { next },
      });
    }
    if (next !== TERMINATE) return router.push(`${Routes.Visit}/${next}`);
    if (next === TERMINATE) return router.push(Routes.AddContainer);
  };

  const onBack = () => {
    router.back();
  };

  if (isLoadingQuestionnaire) {
    return (
      <SafeAreaView className="flex h-full align-center justify-center">
        <Loading />
      </SafeAreaView>
    );
  }

  const disableNextButton = !isValid(currentValues, currentQuestion);

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {!isLoadingQuestionnaire && currentQuestion && (
            <QuestionnaireRenderer
              name={answerId}
              methods={methods}
              question={currentQuestion}
              currentValues={currentValues}
            />
          )}
        </ScrollView>
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <Button title={t("back")} onPress={onBack} />
          </View>
          <View className="flex-1">
            {isSplash && <Button primary title={t("next")} onPress={onNext} />}
            {!isSplash && (
              <Button
                primary
                title={t("next")}
                onPress={onNext}
                disabled={disableNextButton}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
