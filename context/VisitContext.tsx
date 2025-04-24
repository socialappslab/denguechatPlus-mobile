import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from "@react-native-community/netinfo";
import useAxios from "axios-hooks";
import * as SecureStore from "expo-secure-store";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import React, { createContext, ReactNode, useEffect, useState } from "react";

import {
  CURRENT_QUESTIONNAIRE_LOCAL_STORAGE_KEY,
  CURRENT_RESOURCES_LOCAL_STORAGE_KEY,
  CURRENT_VISIT_LOCAL_STORAGE_KEY,
  LANGUAGE_LOCAL_STORAGE_KEY,
  VISIT_MAP_LOCAL_STORAGE_KEY,
} from "@/constants/Keys";
import { useAuth } from "@/context/AuthProvider";
import { useStorageState } from "@/hooks/useStorageState";
import { ErrorResponse } from "@/schema";
import { Questionnaire, Resources, VisitData } from "@/types";

interface VisitContextType {
  questionnaire?: Questionnaire;
  isLoadingQuestionnaire: boolean;
  visitData: VisitData;
  resources: Resources;
  setVisitData: (data: Partial<VisitData>) => Promise<void>;
  cleanStore: () => Promise<void>;
  language: string | null;
  isConnected: boolean;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

/**
 * HashMap of questionnaires where @string is the questionnaireId
 */

const VisitProvider = ({ children }: { children: ReactNode }) => {
  const { isInternetReachable } = useNetInfo();
  const [[_, language]] = useStorageState(LANGUAGE_LOCAL_STORAGE_KEY);
  const { meData } = useAuth();
  const [visitData, setVisitDataState] = useState<VisitData>({
    answers: {},
    host: "",
    visitPermission: false,
    houseId: 0,
    questionnaireId: "0",
    teamId: 0,
    visitedAt: "",
    userAccountId: "0",
    notes: "",
    inspections: [],
  });

  const [questionnaire, setQuestionnaire] = useState<Questionnaire>();
  // @ts-expect-error `resources` is a tuple with some objects that we expect
  // from our backend and it will be use throughout the life of our app, we
  // should make sure that resources always comes in the shape that the types
  // say, or throw, because is guaranteed the app will crash at some point
  const [resources, setResources] = useState<Resources>([]);

  const [
    { data: questionnaireData, loading: isLoadingQuestionnaire },
    featchQuestionnaire,
  ] = useAxios<ExistingDocumentObject, unknown, ErrorResponse>(
    {
      // We need to support en-US es-ES etc in the backend
      // for now we're manually grabbing the first part
      url: `questionnaires/current?language=${language?.split("-")[0]}`,
    },
    { manual: true },
  );

  const [{ data: paramsData, loading: isLoadingParams }, featchParams] =
    useAxios<Resources, unknown, ErrorResponse>(
      {
        url: `get_last_params`,
      },
      { manual: true },
    );

  useEffect(() => {
    // console.log("meData>>>>>>", meData);
    if (!meData) {
      return;
    }
    setVisitData({ userAccountId: meData.id });
    featchQuestionnaire();
    featchParams();
  }, [meData, featchQuestionnaire, featchParams]);

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
      initialQuestion: deserializedQuestionnaire.initialQuestion,
      questions: [...deserializedQuestionnaire.questions],
    });

    // console.log("deserializedQuestionnaire>>", deserializedQuestionnaire);
  }, [questionnaireData]);

  useEffect(() => {
    if (!paramsData) {
      console.log("no paramsData>>>>>>");
      return;
    }
    setResources(paramsData);
  }, [paramsData]);

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
    const loadResourcesData = async () => {
      const storedData = await SecureStore.getItemAsync(
        CURRENT_RESOURCES_LOCAL_STORAGE_KEY,
      );
      if (storedData) {
        setResources(JSON.parse(storedData));
      }
    };
    loadResourcesData();
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
    AsyncStorage.setItem(VISIT_MAP_LOCAL_STORAGE_KEY, JSON.stringify({}));
  };

  return (
    <VisitContext.Provider
      value={{
        visitData,
        questionnaire,
        resources,
        isLoadingQuestionnaire: isLoadingQuestionnaire || isLoadingParams,
        setVisitData,
        cleanStore,
        language: language ?? "es",
        isConnected: !!isInternetReachable,
      }}
    >
      {children}
    </VisitContext.Provider>
  );
};

export { VisitContext, VisitProvider };
