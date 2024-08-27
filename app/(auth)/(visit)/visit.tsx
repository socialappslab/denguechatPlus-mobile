import QuestionnaireRenderer from "@/components/QuestionnaireRenderer";
import { Text, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { useVisit } from "@/hooks/useVisit";
import { parseId } from "@/util";
import { useRouter } from "expo-router";
import { t } from "i18next";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const INSPECTION = 0;
const TERMINATE = -1;

const findTrue = (obj: Record<string, string | boolean>) => {
  if (!obj) return;
  return Object.keys(obj).find((key) => obj[key] === true);
};

export default function Visit() {
  const { questionnaire, isLoadingQuestionnaire, setVisitData, visitData } =
    useVisit();
  const [currentQuestion, setCurrentQuestion] = useState<null | number>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setHistory] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCurrentQuestion(questionnaire?.initialQuestion);
  }, [questionnaire, isLoadingQuestionnaire]);

  const methods = useForm({
    defaultValues: visitData.answers,
  });

  const { getValues, formState } = methods;

  const normalizeAndSaveValues = useCallback(() => {
    const values = getValues();
    const questionKey = `question_${currentQuestion}`;
    if (!values[questionKey]) return;
    const normalizedValues = Object.keys(values[questionKey]).reduce(
      (acc, key) => ({ ...acc, [key]: values[questionKey][key] || false }),
      {},
    );
    const currentAnswers = visitData.answers;
    setVisitData({
      answers: { ...currentAnswers, [questionKey]: normalizedValues },
    });
  }, [currentQuestion, getValues, setVisitData, visitData.answers]);

  let current = questionnaire?.questions.find((q) => q.id === currentQuestion);

  const findNext = () => {
    let next = current?.next;
    if (next) return next;

    // look inside options
    if (!next) {
      const curr = getValues(`question_${currentQuestion}`);
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
    normalizeAndSaveValues();
    const next = findNext();
    setCurrentQuestion(next!);
    setHistory((prev) => [...prev, currentQuestion as number]);

    if (next === TERMINATE || next === INSPECTION) {
      router.push("summary");
      return;
    }
  };

  const isValid =
    (!!findTrue(getValues(`question_${currentQuestion}`)) &&
      formState.isValid) ||
    current?.typeField === "splash";

  const onBack = () => {
    setHistory((prev) => {
      const lastQuestion = prev.pop();
      setCurrentQuestion(lastQuestion!);
      return prev;
    });
  };

  return (
    <View className="h-full flex flex-col justify-between pt-5 pb-10 px-5">
      {isLoadingQuestionnaire && <Text>Loading...</Text>}
      {!isLoadingQuestionnaire && current && (
        <QuestionnaireRenderer methods={methods} question={current} />
      )}

      <View className="flex flex-row gap-2">
        <View className="flex-1">
          <Button
            disabled={currentQuestion === questionnaire?.initialQuestion}
            title="Atras"
            onPress={onBack}
          />
        </View>
        <View className="flex-1">
          <Button
            primary
            title="Siguiente"
            onPress={onNext}
            disabled={!isValid}
          />
        </View>
      </View>
    </View>
  );
}
