import QuestionnaireRenderer from "@/components/QuestionnaireRenderer";
import { Loading, SafeAreaView, ScrollView, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { useAuth } from "@/context/AuthProvider";
import { useVisit } from "@/hooks/useVisit";
import { HouseKey, TypeField } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const TERMINATE = -1;

export default function Visit() {
  const {
    questionnaire,
    isLoadingQuestionnaire,
    visitData,
    setQuestionForCurrentHouse,
    visitMap,
  } = useVisit();
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const houseKey: HouseKey = `${parseInt(visitData.userAccountId)}-${visitData.houseId}`;

  useEffect(() => {
    setCurrentQuestion(String(id));
  }, [id, setCurrentQuestion, visitMap]);

  const methods = useForm({
    defaultValues: visitMap[houseKey],
  });

  const { getValues, watch } = methods;

  let current = questionnaire?.questions.find(
    (q) => String(q.id) === currentQuestion,
  );

  const findNext = () => {
    let next = current?.next;
    if (next) return next;

    // look inside current option selected
    // which extends an option object
    if (!next) {
      const curr = getValues(currentQuestion);
      return curr.next;
    }
    return TERMINATE;
  };

  const onNext = () => {
    const values = methods.watch(currentQuestion);
    setQuestionForCurrentHouse(currentQuestion, values);
    const next = findNext();
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

  const currentValue = watch(currentQuestion) as Record<any, any> | any[];
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
