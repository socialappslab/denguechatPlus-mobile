import QuestionnaireRenderer, {
  FormStateOption,
} from "@/components/QuestionnaireRenderer";
import { Loading, SafeAreaView, ScrollView, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { useVisit } from "@/hooks/useVisit";
import { Question } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

// When next is -1 we end the flow
const TERMINATE = -1;

// Custom validation function
const isValid = (
  currentValue: FormStateOption | FormStateOption[],
  question?: Question,
): boolean => {
  if (!question || !currentValue) return false;

  const required = question.options?.filter((item) => item.required) || [];

  if (!Array.isArray(currentValue)) {
    if (currentValue.optionType === "inputNumber") {
      return !!currentValue.text;
    }
    return !!currentValue;
  }

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
  const {
    questionnaire,
    isLoadingQuestionnaire,
    setFormData,
    visitMap,
    currentFormData,
  } = useVisit();
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentQuestion(String(id));
  }, [id, setCurrentQuestion, visitMap]);

  const methods = useForm({
    defaultValues: currentFormData,
  });

  const { getValues, watch } = methods;

  let current = questionnaire?.questions.find(
    (q) => String(q.id) === currentQuestion,
  );

  const findNext = () => {
    let next = current?.next;
    if (next) return next;

    const curr = getValues(currentQuestion);
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
    const values = methods.watch(currentQuestion);
    if (values) setFormData(currentQuestion, values);

    const next = findNext();
    if (next !== TERMINATE) return router.push(`visit/${next}`);
    if (next === TERMINATE) return router.push("add-comment");
  };

  const isSplash = current?.typeField === "splash";

  const onBack = () => {
    router.back();
  };

  const currentValue = watch(currentQuestion) as
    | FormStateOption
    | FormStateOption[];

  if (isLoadingQuestionnaire) {
    return (
      <SafeAreaView className="flex h-full align-center justify-center">
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <View className="flex flex-1 py-5 px-5 h-full">
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {!isLoadingQuestionnaire && current && (
            <QuestionnaireRenderer methods={methods} question={current} />
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
                disabled={!isValid(currentValue, current)}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
