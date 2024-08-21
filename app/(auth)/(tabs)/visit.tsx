import QuestionnaireRenderer from "@/components/QuestionnaireRenderer";
import { Text, View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { Questionnaire } from "@/types";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const questionnaire: Questionnaire = {
  name: "Visita",
  createdAt: new Date(),
  initialQuestion: "8",
  finalQuestion: "7",
  questions: [
    {
      id: "8",
      question: "Por favor informemos a la familia sobre",
      typeField: "multiple",
      next: "1",
      options: [
        {
          id: "1",
          name: "Explicación de larvas y pupas",
          required: true,
        },
        {
          id: "2",
          name: "Explicación sobre cómo se reproduce el zancudo",
          required: true,
        },
        {
          id: "3",
          name: "Otro tópico importante",
          textArea: true,
        },
      ],
    },
    {
      id: "1",
      question: "¿Donde comienza la visita?",
      typeField: "select",
      options: [
        {
          id: "1",
          name: "En la huerta",
          next: "2",
        },
        {
          id: "2",
          name: "En la casa",
          next: "3",
        },
      ],
    },
    {
      id: "2",
      question: "En la huerta",
      description:
        "Vamos a buscar todos los recipientes que contienen agua y potencialmente son criaderos de zancudos.",
      typeField: "splash",
      next: "4",
      image: {
        id: "2",
        url: "...",
      },
    },
    {
      id: "3",
      question: "En la casa",
      typeField: "splash",
      description:
        "Vamos a buscar todos los recipientes que contienen agua y potencialmente son criaderos de zancudos.",
      next: "5",
      image: {
        id: "1",
        url: "...",
      },
    },
    {
      id: "4",
      question: "¿Encontraste un contenedor?",
      typeField: "select",
      options: [
        {
          id: "1",
          name: "Si, encontré",
          next: "inspection",
        },
        {
          id: "2",
          name: "No, no encontré",
          next: "3",
        },
      ],
    },
    {
      id: "5",
      question: "¿Encontraste un contenedor?",
      typeField: "select",
      options: [
        {
          id: "1",
          name: "Si, encontré",
          next: "6",
        },
        {
          id: "2",
          name: "No, no encontré",
          next: "-1",
        },
        {
          id: "3",
          name: "Otro",
          textArea: true,
          next: "-1",
        },
      ],
    },
    {
      id: "6",
      question: "¿Que tipo de contenedor encontraste?",
      typeField: "select",
      next: "7",
      options: [
        {
          id: "1",
          name: "Tanques",
          image: {
            id: "1",
            url: "...",
          },
        },
        {
          id: "2",
          name: "Bidones",
          image: {
            id: "1",
            url: "...",
          },
        },
      ],
    },
    {
      id: "7",
      question: "Registrar otro contenedor?",
      typeField: "select",
      options: [
        {
          id: "1",
          name: "Si, registrar",
          next: "5",
        },
        {
          id: "2",
          name: "No, no es necesario",
          next: "7",
        },
      ],
    },
  ],
};

export default function Visit() {
  const [currentQuestion, setCurrentQuestion] = useState(
    questionnaire.initialQuestion,
  );
  const [history, setHistory] = useState<string[]>([
    questionnaire.initialQuestion,
  ]);
  const [canContinue, setCanContinue] = useState(false);
  const navigation = useNavigation();
  const questions = questionnaire.questions;

  const methods = useForm();

  const {
    handleSubmit,
    watch,
    getValues,
    formState,
    // formState: { errors, isValid },
  } = methods;

  const onSubmitHandler = () => {
    const values = getValues();
    console.log(values);
  };

  useEffect(() => {
    const subscription = watch(`question_${currentQuestion}`);
    console.log("hiiiii");
    const someIsSelected = Object.keys(subscription || {}).some(
      (k) => subscription[k] === true,
    );
    setCanContinue(someIsSelected);
    // return () => subscription?.unsubscribe();
  }, [watch]);

  let current = questions.find((q) => q.id === currentQuestion);

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
        (o) => o.id === String(selectedOptionNumber!),
      );
      return nextFromOption?.next;
    }
    return "-1";
  };

  const onNext = () => {
    onSubmitHandler();
    const next = findNext();
    setCurrentQuestion(next!);
    setHistory((prev) => [...prev, currentQuestion]);
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
    setCurrentQuestion(questionnaire.initialQuestion);
    methods.reset();
  };

  if (currentQuestion === "-1") {
    exitQuestionnaire();
  }

  if (currentQuestion === "inspection") {
    return (
      <View className="h-full flex items-center p-4">
        <Text className="mb-2">Inspection</Text>
        <Button
          disabled={currentQuestion === questionnaire.initialQuestion}
          title="Terminar"
          onPress={() => {
            exitQuestionnaire();
          }}
        />
      </View>
    );
  }

  const isFinalQuestion = current && current.id === questionnaire.finalQuestion;

  return (
    <View className="h-full flex flex-col justify-between pt-5 pb-12 px-5">
      {current && (
        <QuestionnaireRenderer methods={methods} question={current} />
      )}

      <>
        {!isFinalQuestion && (
          <View className="flex flex-row gap-2">
            <View className="flex-1">
              <Button
                disabled={currentQuestion === questionnaire.initialQuestion}
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
