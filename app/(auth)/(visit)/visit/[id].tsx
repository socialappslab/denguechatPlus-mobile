import QuestionnaireRenderer from "@/components/QuestionnaireRenderer";
import { Loading, SafeAreaView, ScrollView, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { useVisit } from "@/hooks/useVisit";
import { TypeField } from "@/types";
import { parseId } from "@/util";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const TERMINATE = -1;

export default function Visit() {
  const { questionnaire, isLoadingQuestionnaire, visitData } = useVisit();
  const [currentQuestion, setCurrentQuestion] = useState<null | number>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    const parsedId = parseInt(id as string, 10);
    setCurrentQuestion(parsedId);
  }, [id, setCurrentQuestion]);

  const methods = useForm({
    defaultValues: visitData.answers,
  });

  const { getValues, watch } = methods;

  let current = questionnaire?.questions.find((q) => q.id === currentQuestion);

  const findNext = () => {
    let next = current?.next;
    if (next) return next;

    // look inside options
    if (!next) {
      const curr = getValues(String(currentQuestion));
      const selectedOption = Object.keys(curr).find(
        (key) => curr[key] === true,
      );
      if (!selectedOption) return TERMINATE;
      const selectedOptionNumber = parseId(selectedOption);
      const nextFromOption = current?.options?.find(
        (o) => o.id === selectedOptionNumber,
      );

      return nextFromOption?.next;
    }
    return TERMINATE;
  };

  const onNext = () => {
    const values = methods.watch(String(currentQuestion));
    console.log("values>>>>>>", values);
    const next = findNext();
    console.log(">>>>next", next);
    router.push(`visit/${next}`);

    if (next === TERMINATE) {
      router.push("summary");
      return;
    }
  };

  const isSplash = current?.typeField === "splash";

  const onBack = () => {
    router.back();
  };

  const currentValue = watch(String(currentQuestion)) as
    | Record<any, any>
    | any[];
  const isSelected = useCallback(
    (fieldType?: TypeField) => {
      if (!fieldType) return false;
      switch (fieldType) {
        case "list":
          return currentValue;
        case "multiple":
          if (Array.isArray(currentValue)) {
            return currentValue.length > 0;
          }
          return false;
        default:
          return false;
      }
    },
    [currentValue],
  );

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
                disabled={!isSelected(current?.typeField)}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
