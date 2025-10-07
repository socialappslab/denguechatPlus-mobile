import QuestionnaireRenderer, {
  FormStateOption,
} from "@/components/QuestionnaireRenderer";
import { SafeAreaView, ScrollView, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { Question } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AnswerId, AnswerState, useStore, VisitCase } from "@/hooks/useStore";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import invariant from "tiny-invariant";

// NOTE: When next is -1 we end the flow
const TERMINATE = -1;

const isValid = (
  currentValue: FormStateOption | FormStateOption[],
  question: Question | null,
): boolean => {
  if (!question) return false;
  const required = question.options?.filter((item) => item.required) || [];

  // return true if the question isn't required
  if (!question.required) return true;
  if (!currentValue) return false;

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
  const { t } = useTranslation();
  const { questionId: questionIdAsString } = useLocalSearchParams<{
    questionId: string;
  }>();

  const router = useRouter();
  const methods = useForm();

  const questionnaire = useStore((state) => {
    invariant(state.questionnaire, "Expected questionnaire to be defined");
    return state.questionnaire;
  });
  const setCurrentVisitData = useStore((state) => state.setCurrentVisitData);
  const visitMap = useStore((state) => state.visitMap);
  const visitMetadata = useStore((state) => state.visitMetadata);
  const visitId = useStore((state) => state.visitId);
  const setSelectedCase = useStore((state) => state.setSelectedCase);
  const selectedCase = useStore((state) => state.selectedCase);
  const increaseCurrentVisitInspection = useStore(
    (state) => state.increaseCurrentVisitInspection,
  );

  const questionId = Number(questionIdAsString);

  const currentQuestion = useMemo(() => {
    const maybeQuestion = questionnaire.questions.find(
      (question) => question.id === questionId,
    );
    invariant(maybeQuestion, `Question with id ${questionId} not found`);

    const optionsHaveShowInCase = maybeQuestion.options.some(
      (option) => option.showInCase === selectedCase,
    );

    if (optionsHaveShowInCase) {
      // TODO: fix the inference for this
      const casesSoFar = Object.values(visitMap).flatMap((group) =>
        Object.values(group).map((item) => {
          // @ts-expect-error - array support is not implemented yet
          return item?.selectedCase as VisitCase | undefined;
        }),
      );

      const hasAllVisitCases =
        casesSoFar.includes("house") && casesSoFar.includes("orchard");

      if (hasAllVisitCases) {
        const newOptions = maybeQuestion.options.filter((option) => {
          return (
            (option.showInCase === selectedCase &&
              option.selectedCase === selectedCase) ||
            !option.showInCase
          );
        });

        return {
          ...maybeQuestion,
          options: newOptions,
        };
      } else {
        const newOptions = maybeQuestion.options.filter((option) => {
          return option.showInCase === selectedCase;
        });

        return {
          ...maybeQuestion,
          options: newOptions,
        };
      }
    }

    return maybeQuestion;
  }, [questionId, questionnaire, selectedCase, visitMap]);

  const answerId: AnswerId = `${currentQuestion.id}-${visitMetadata[visitId].inspectionIdx}`;

  const currentValues = methods.watch(answerId) as AnswerState;

  function findNext() {
    if (currentQuestion.next) return currentQuestion.next;

    if (Array.isArray(currentValues)) {
      const next = currentValues[0].next;
      if (!next) return TERMINATE;
      return next;
    }

    const next = currentValues.next;
    if (!next) return TERMINATE;
    return next;
  }

  const onNext = () => {
    const next = findNext();

    const selectedOption = currentQuestion.options.find(
      // @ts-expect-error - array support is not implemented yet
      (option) => option.id === currentValues?.value,
    );

    if (selectedOption?.selectedCase) {
      setSelectedCase(selectedOption.selectedCase);
    }

    if (selectedOption?.showInCase && selectedOption.value) {
      increaseCurrentVisitInspection();
    }

    // Persist values
    if (currentValues)
      setCurrentVisitData(answerId, currentQuestion, currentValues);

    // Branches
    // @ts-expect-error - array support is not implemented yet
    if (currentQuestion.resourceName === "photo_id" && currentValues.bool) {
      return router.push({
        pathname: "/container-picture",
        params: { next },
      });
    }

    if (next === TERMINATE) {
      return router.push("/add-comment");
    }

    return router.push({
      pathname: "/visit/[questionId]",
      params: { questionId: next },
    });
  };

  const disableNextButton = !isValid(currentValues, currentQuestion);

  return (
    <SafeAreaView edges={["right", "bottom", "left"]}>
      <View className="flex flex-1 py-5 px-5 h-full">
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          automaticallyAdjustKeyboardInsets={true}
        >
          <QuestionnaireRenderer
            key={currentQuestion.id}
            name={answerId}
            methods={methods}
            question={currentQuestion}
            currentValues={currentValues}
          />
        </ScrollView>
        <View className="flex flex-row gap-2">
          <View className="flex-1">
            <Button
              title={t("back")}
              onPress={() => {
                router.back();
              }}
            />
          </View>
          <View className="flex-1">
            <Button
              primary
              title={t("next")}
              onPress={onNext}
              disabled={disableNextButton}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
