import useAxios from "axios-hooks";
import * as SecureStore from "expo-secure-store";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import React, { createContext, ReactNode, useEffect, useState } from "react";

import {
  CURRENT_QUESTIONNAIRE_LOCAL_STORAGE_KEY,
  CURRENT_VISIT_LOCAL_STORAGE_KEY,
} from "@/constants/Keys";
import { useAuth } from "@/context/AuthProvider";
import { ErrorResponse } from "@/schema";
import { Question, Questionnaire, VisitData } from "@/types";

const StaticQuestions: Question[] = [
  {
    id: 9,
    question: "¿Me dieron permiso para visitar la casa?",
    typeField: "list",
    options: [
      {
        id: 1,
        name: "Sí, tengo permiso para esta visita",
        required: false,
        textArea: false,
        next: 10,
      },
      {
        id: 2,
        name: "No, no me dieron permiso para esta visita",
        required: false,
        textArea: false,
        next: -1,
      },
      {
        id: 3,
        name: "La casa está cerrada",
        required: false,
        textArea: false,
        next: -1,
      },
      {
        id: 4,
        name: "La casa está deshabitada",
        required: false,
        textArea: false,
        next: -1,
      },
      {
        id: 5,
        name: "Me pidieron regresar en otra ocasión",
        required: false,
        textArea: false,
        next: -1,
      },
      {
        id: 6,
        name: "Otra explicación",
        required: false,
        textArea: false,
        next: -1,
      },
    ],
  },
  {
    id: 10,
    question: "Visitemos la casa",
    typeField: "splash",
    description:
      "Lleguemos a la casa con mucho respeto.\n\nEs importante que las personas nos sientan como alguien que les llega a apoyar para prevenir el dengue.\n\nPidamos permiso para pasar.\n\nNo lleguemos como inspectores, o para juzgar al hogar.",
    next: 11,
    image: {
      id: 8,
      url: "http://localhost:3000/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsiZGF0YSI6OCwicHVyIjoiYmxvYl9pZCJ9fQ==--425559d1a1b5904f74550649547eb1af0d76a44d/En%20la%20huerta",
    },
    options: [],
  },
  {
    id: 11,
    question: "¿Quíen te acompaña hoy en esta visita?",
    typeField: "multiple",
    next: 8,
    options: [
      {
        id: 21,
        name: "Adulto mayor",
        required: false,
        textArea: false,
      },
      {
        id: 22,
        name: "Adulto hombre",
        required: false,
        textArea: false,
      },
      {
        id: 23,
        name: "Adulto mujer",
        required: false,
        textArea: false,
      },
      {
        id: 24,
        name: "Joven hombre",
        required: false,
        textArea: false,
      },
      {
        id: 25,
        name: "Joven mujer",
        required: false,
        textArea: false,
      },
      {
        id: 26,
        name: "Niños\\as",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 0,
    question: "¿Que tipo de contenedor encontraste?",
    typeField: "list",
    next: 21,
    options: [
      {
        id: 31,
        name: "Tanques (cemento, polietileno, metal, otro material)",
        required: false,
        textArea: false,
      },
      {
        id: 32,
        name: "Bidones o cilindros (metal, plástico)",
        required: false,
        textArea: false,
      },
      {
        id: 33,
        name: "Pozos",
        required: false,
        textArea: false,
      },
      {
        id: 34,
        name: "Estructura o partes de la casa",
        required: false,
        textArea: false,
      },
      {
        id: 35,
        name: "Llanta",
        required: false,
        textArea: false,
      },
      {
        id: 36,
        name: "Elementos naturales",
        required: false,
        textArea: false,
      },
      {
        id: 37,
        name: "Otros",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 21,
    question: "¿El contenedor está en uso?",
    typeField: "list",
    next: 22,
    options: [
      {
        id: 41,
        name: "Sí, está en uso",
        required: false,
        textArea: false,
      },
      {
        id: 42,
        name: "No, no está en uso",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 21,
    question: "¿El contenedor contiene agua?",
    typeField: "list",
    next: 22,
    options: [
      {
        id: 41,
        name: "Sí, contiene agua",
        required: false,
        textArea: false,
      },
      {
        id: 42,
        name: "No, no contiene agua",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 22,
    question: "¿El contenedor tiene una tapa?",
    typeField: "list",
    next: 23,
    options: [
      {
        id: 51,
        name: "No, no tiene una tapa",
        required: false,
        textArea: false,
      },
      {
        id: 52,
        name: "Sí, tiene una tapa hermética",
        required: false,
        textArea: false,
      },
      {
        id: 53,
        name: "Sí, tiene una tapa no hermética",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 23,
    question: "¿De donde proviene el agua?",
    typeField: "list",
    next: 24,
    options: [
      {
        id: 51,
        name: "Agua del grifo o potable",
        required: false,
        textArea: false,
      },
      {
        id: 52,
        name: "Lluvia",
        required: false,
        textArea: false,
      },
      {
        id: 53,
        name: "Otro",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 24,
    question:
      "En los últimos 30 días: ¿fue el contenedor tratado por el Ministerio de Salud con piriproxifeno o abate?",
    typeField: "list",
    next: 25,
    options: [
      {
        id: 61,
        name: "Sí, fue tratado",
        required: false,
        textArea: false,
      },
      {
        id: 62,
        name: "No, no fue tratado",
        required: false,
        textArea: false,
      },
      {
        id: 63,
        name: "No lo sé",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 25,
    question: "En este contenedor hay",
    typeField: "list",
    next: 26,
    options: [
      {
        id: 71,
        name: "Larvas",
        required: false,
        textArea: false,
      },
      {
        id: 72,
        name: "Pupas",
        required: false,
        textArea: false,
      },
      {
        id: 73,
        name: "Huevos",
        required: false,
        textArea: false,
      },
      {
        id: 74,
        name: "Nada",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 26,
    question: "Registremos acciones tomadas sobre el contenedor",
    typeField: "splash",
    next: 27,
    options: [],
  },
  {
    id: 27,
    question: "¿Qué acción se realizó con el contenedor?",
    typeField: "list",
    next: 28,
    options: [
      {
        id: 81,
        name: "Contenedor protegido",
        required: false,
        textArea: false,
      },
      {
        id: 82,
        name: "Contenedor descartado",
        required: false,
        textArea: false,
      },
      {
        id: 83,
        name: "Agua del contenedor tirada",
        required: false,
        textArea: false,
      },
      {
        id: 84,
        name: "Contenedor trasladado a un lugar seguro",
        required: false,
        textArea: false,
      },
      {
        id: 85,
        name: "Contenedor limpiado",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 28,
    question: "¿Puedes tomar una foto del contenedor?",
    typeField: "list",
    next: 29,
    options: [
      {
        id: 91,
        name: "Sí, puedo",
        required: false,
        textArea: false,
      },
      {
        id: 92,
        name: "No, no puedo",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 29,
    question: "¿Registrar otro contenedor?",
    typeField: "list",
    next: 30,
    options: [
      {
        id: 101,
        name: "Sí, registrar otro contenedor",
        required: false,
        textArea: false,
      },
      {
        id: 102,
        name: "No, no es necesario",
        required: false,
        textArea: false,
      },
    ],
  },
  {
    id: 30,
    question: "¿Quieres hacer seguimiento de un contenedor?",
    typeField: "list",
    next: 31,
    options: [
      {
        id: 101,
        name: "Sí, hacer seguimiento",
        required: false,
        textArea: false,
      },
      {
        id: 102,
        name: "No, no es necesario",
        required: false,
        textArea: false,
      },
    ],
  },
];

interface VisitContextType {
  questionnaire?: Questionnaire;
  isLoadingQuestionnaire: boolean;
  visitData: VisitData;
  setVisitData: (data: Partial<VisitData>) => Promise<void>;
  cleanStore: () => Promise<void>;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

const VisitProvider = ({ children }: { children: ReactNode }) => {
  const { meData } = useAuth();
  const [visitData, setVisitDataState] = useState<VisitData>({
    answers: {},
    host: "",
    visitPermission: false,
    houseId: 0,
    questionnaireId: "0",
    teamId: 0,
    userAccountId: "0",
    notes: "",
    inspections: [],
  });
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>();
  const [currentQuestion, setCurrentQuestion] = useState<null | number>(9);

  const [
    { data: questionnaireData, loading: isLoadingQuestionnaire },
    featchQuestionnaire,
  ] = useAxios<ExistingDocumentObject, unknown, ErrorResponse>(
    {
      url: `questionnaires/current`,
    },
    { manual: true },
  );

  useEffect(() => {
    if (!meData) {
      return;
    }
    featchQuestionnaire();
  }, [meData, featchQuestionnaire]);

  useEffect(() => {
    if (!questionnaireData) {
      console.log("no questionary data>>>>>>");

      return;
    }
    const deserializedQuestionnaire = deserialize<Questionnaire>(
      questionnaireData,
    ) as Questionnaire;

    setQuestionnaire({
      ...deserializedQuestionnaire,
      initialQuestion: 9,
      questions: [...StaticQuestions, ...deserializedQuestionnaire.questions],
    });
    console.log("deserializedQuestionnaire>>", deserializedQuestionnaire);
  }, [questionnaireData]);

  useEffect(() => {
    const loadVisitData = async () => {
      const storedData = await SecureStore.getItemAsync(
        CURRENT_VISIT_LOCAL_STORAGE_KEY,
      );
      if (storedData) {
        setVisitDataState(JSON.parse(storedData));
      }
    };
    loadVisitData();
  }, []);

  useEffect(() => {
    const loadQuestionnaireData = async () => {
      const storedData = await SecureStore.getItemAsync(
        CURRENT_QUESTIONNAIRE_LOCAL_STORAGE_KEY,
      );
      if (storedData) {
        setQuestionnaire(JSON.parse(storedData));
      }
    };
    loadQuestionnaireData();
  }, []);

  const setVisitData = async (data: Partial<VisitData>) => {
    setVisitDataState((prev) => {
      const updatedData = { ...prev, ...data };
      SecureStore.setItemAsync(
        CURRENT_VISIT_LOCAL_STORAGE_KEY,
        JSON.stringify(updatedData),
      );
      return updatedData;
    });
  };

  const cleanStore = async () => {
    SecureStore.setItemAsync(
      CURRENT_VISIT_LOCAL_STORAGE_KEY,
      JSON.stringify({}),
    );
  };

  return (
    <VisitContext.Provider
      value={{
        visitData,
        questionnaire,
        isLoadingQuestionnaire,
        setVisitData,
        cleanStore,
      }}
    >
      {children}
    </VisitContext.Provider>
  );
};

export { VisitContext, VisitProvider };
