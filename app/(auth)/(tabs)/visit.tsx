import QuestionnaireRenderer from "@/components/QuestionnaireRenderer";
import { Text, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { ErrorResponse } from "@/schema";
import { Questionnaire } from "@/types";
import useAxios from "axios-hooks";
import { useNavigation } from "expo-router";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const INSPECTION = 0;
const TERMINATE = -1;

export default function Visit() {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>();
  const [currentQuestion, setCurrentQuestion] = useState<null | number>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setHistory] = useState<number[]>([]);
  const navigation = useNavigation();

  const [{ data: questionnaireData, loading }] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >({
    url: `questionnaires/current`,
  });

  useEffect(() => {
    if (!questionnaireData) return;
    const deserializedQuestionnaire = deserialize<Questionnaire>(
      questionnaireData,
    ) as Questionnaire;

    setQuestionnaire(deserializedQuestionnaire);
    console.log(deserializedQuestionnaire);
    setCurrentQuestion(deserializedQuestionnaire.initialQuestion);
  }, [questionnaireData]);

  const methods = useForm();

  const {
    // watch,
    getValues,
    // formState: { errors, isValid },
  } = methods;

  const onNextHandler = () => {
    const values = getValues();
    // setLocal(values);
    console.log(values);
  };

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
      const selectedOptionNumber = selectedOption
        ? parseInt(selectedOption.match(/\d+/)![0], 10)
        : null;
      const nextFromOption = current?.options?.find(
        (o) => o.id === selectedOptionNumber,
      );
      return nextFromOption?.next;
    }
    return TERMINATE;
  };

  const onNext = () => {
    onNextHandler();
    const next = findNext();
    setCurrentQuestion(next!);
    setHistory((prev) => [...prev, currentQuestion as number]);
  };

  const onBack = () => {
    setHistory((prev) => {
      const lastQuestion = prev.pop();
      setCurrentQuestion(lastQuestion!);
      return prev;
    });
  };

  const exitQuestionnaire = () => {
    navigation.goBack();
    setCurrentQuestion(questionnaire?.initialQuestion);
    methods.reset();
  };

  if (currentQuestion === TERMINATE) {
    exitQuestionnaire();
  }

  if (currentQuestion === INSPECTION) {
    return (
      <View className="h-full flex items-center p-4">
        <Text className="mb-2">Inspection</Text>
        <Button
          disabled={currentQuestion === questionnaire?.initialQuestion}
          title="Terminar"
          onPress={() => {
            exitQuestionnaire();
          }}
        />
      </View>
    );
  }

  const isFinalQuestion =
    current && current.id === questionnaire?.finalQuestion;

  return (
    <View className="h-full flex flex-col justify-between pt-5 pb-12 px-5">
      {loading && <Text>Loading...</Text>}
      {!loading && current && (
        <QuestionnaireRenderer methods={methods} question={current} />
      )}

      <>
        {!isFinalQuestion && (
          <View className="flex flex-row gap-2">
            <View className="flex-1">
              <Button
                disabled={currentQuestion === questionnaire?.initialQuestion}
                title="Atras"
                onPress={onBack}
              />
            </View>
            <View className="flex-1">
              <Button primary title="Siguiente" onPress={onNext} />
            </View>
          </View>
        )}
        {isFinalQuestion && (
          <View className="flex flex-row gap-2">
            <View className="flex-1">
              <Button
                onPress={() =>
                  setCurrentQuestion(questionnaire.initialQuestion)
                }
                title="Volver al inicio"
              />
            </View>
            <View className="flex-1">
              <Button primary title="Finalizar" onPress={exitQuestionnaire} />
            </View>
          </View>
        )}
      </>
    </View>
  );
}
