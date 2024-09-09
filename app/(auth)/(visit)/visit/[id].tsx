import QuestionnaireRenderer from "@/components/QuestionnaireRenderer";
import { Text, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { useVisit } from "@/hooks/useVisit";
import { FormAnswer } from "@/types";
import { parseId } from "@/util";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const TERMINATE = -1;

export default function Visit() {
  const { questionnaire, isLoadingQuestionnaire, setVisitData, visitData } =
    useVisit();
  const [currentQuestion, setCurrentQuestion] = useState<null | number>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setHistory] = useState<number[]>([]);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const parsedId = parseInt(id as string, 10);
    setCurrentQuestion(parsedId);
  }, [id, setCurrentQuestion]);

  const methods = useForm({
    defaultValues: visitData.answers,
  });

  const { getValues, formState } = methods;

  const normalizeValues = (values: FormAnswer, qK: string) => {
    return Object.keys(values[qK]).reduce(
      (acc, key) => ({ ...acc, [key]: values[qK][key] || false }),
      {},
    );
  };

  const normalizeValuesForInspection = (values: FormAnswer, qK: string) => {
    if (values[qK]["option_true"] && values[qK]["option_false"]) {
      return values[qK]["option_true"];
    } else {
      const res = Object.keys(values[qK])
        .filter((k) => values[qK][k] === true)[0]
        .split("option_")[1];
      return res;
    }
  };

  const normalizeAndSaveValues = useCallback(() => {
    const values = getValues();
    const currentAnswers = visitData.answers;
    const currentInspection = visitData.inspections[0];
    console.log("----------", currentInspection, "-----");
    let questionKey = `question_${currentQuestion}`;

    if (values["question_inspection"]) {
      const inspectionQuestion = Object.keys(values["question_inspection"])[0];
      console.log("inspectionQuestion", inspectionQuestion);
      if (inspectionQuestion) {
        const inspectionValues = values[
          "question_inspection"
        ] as unknown as FormAnswer;
        const normalizedValues = normalizeValuesForInspection(
          inspectionValues,
          inspectionQuestion!,
        );
        console.log(
          normalizedValues,
          "noamsfjaksfa+_---------",
          inspectionQuestion,
        );
        setVisitData({
          inspections: [
            {
              ...currentInspection,
              [inspectionQuestion]: normalizedValues,
            },
          ],
        });
      }
      return;
    }

    if (!values[questionKey]) {
      return;
    }

    const normalizedValues = normalizeValues(values, questionKey);
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
    router.push(`visit/${next!}`);
    setHistory((prev) => [...prev, currentQuestion as number]);

    if (next === TERMINATE) {
      router.push("summary");
      return;
    }
  };

  console.log("formState.isValid", formState.isValid);

  const isValid = formState.isValid || current?.typeField === "splash";

  const onBack = () => {
    router.back();
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
