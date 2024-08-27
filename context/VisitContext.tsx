import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";

import {
  CURRENT_VISIT_LOCAL_STORAGE_KEY,
  CURRENT_QUESTIONNAIRE_LOCAL_STORAGE_KEY,
} from "@/constants/Keys";
import { Questionnaire, VisitData } from "@/types";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import useAxios from "axios-hooks";
import { ErrorResponse } from "@/schema";
import { useAuth } from "@/context/AuthProvider";

interface VisitContextType {
  questionnaire?: Questionnaire;
  isLoadingQuestionnaire: boolean;
  visitData: VisitData;
  setVisitData: (data: Partial<VisitData>) => Promise<void>;
  cleanStore: () => Promise<void>;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

const VisitProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
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
    if (!user) return;
    featchQuestionnaire();
  }, [user, featchQuestionnaire]);

  useEffect(() => {
    if (!questionnaireData) return;
    const deserializedQuestionnaire = deserialize<Questionnaire>(
      questionnaireData,
    ) as Questionnaire;

    setQuestionnaire(deserializedQuestionnaire);
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

export { VisitProvider, VisitContext };
