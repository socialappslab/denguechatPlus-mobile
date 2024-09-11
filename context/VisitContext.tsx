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
import { Questionnaire, VisitData } from "@/types";
import { INITIAL_QUESTION, StaticQuestions } from "@/constants/Visit";

interface VisitContextType {
  questionnaire?: Questionnaire;
  isLoadingQuestionnaire: boolean;
  visitData: VisitData;
  setVisitData: (data: Partial<VisitData>) => Promise<void>;
  cleanStore: () => Promise<void>;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

/**
 * HashMap of questionnaires where @string is the questionnaireId
 */

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
      initialQuestion: INITIAL_QUESTION,
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