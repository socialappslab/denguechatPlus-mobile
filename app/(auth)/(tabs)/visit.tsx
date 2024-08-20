import QuestionnaireRenderer from "@/components/QuestionnaireRenderer";
import { View } from "@/components/themed";
import Button from "@/components/themed/Button";
import { Question } from "@/types";
import { useState } from "react";

const questionnaire: Question[] = [
  {
    id: 1,
    question: "¿ Me dieron permiso para visitar esa casa ?",
    typeField: "select",
    options: [
      {
        id: "1",
        name: "Si, tengo permiso para esta visita",
      },
      {
        id: "2",
        name: "No, no me dieron permiso para esta visista",
      },
      {
        id: "3",
        name: "La casa esta cerrada",
      },
      {
        id: "4",
        name: "La casa esta deshabitada",
      },
      {
        id: "5",
        name: "Me pidieron regresar en otra ocasión",
      },
      {
        id: "6",
        name: "Otra explicación",
      },
    ],
  },
  {
    id: 2,
    question: "Visitemos la casa",
    typeField: "splash",
  },
  {
    id: 3,
    question: "¿ Quién te acompaña hoy en esta visita?",
    typeField: "select",
    options: [
      {
        id: "1",
        name: "Adulto Mayor",
      },
      {
        id: "2",
        name: "Adulto Joven",
      },
      {
        id: "3",
        name: "Adulto Mujer",
      },
    ],
  },
];

export default function Homes() {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  return (
    <View className="h-full flex flex-col justify-between pt-5 pb-12 px-5">
      <QuestionnaireRenderer question={questionnaire[currentQuestion]} />

      <View className="flex flex-row gap-2">
        <View className="flex-1">
          <Button
            disabled={currentQuestion === 0}
            title="Atras"
            onPress={() => setCurrentQuestion((prev) => prev - 1 || 0)}
          />
        </View>
        <View className="flex-1">
          <Button
            primary
            title="Siguiente"
            onPress={() => setCurrentQuestion((prev) => prev + 1)}
          />
        </View>
      </View>
    </View>
  );
}
