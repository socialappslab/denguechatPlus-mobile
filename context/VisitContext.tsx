import { useNetInfo } from "@react-native-community/netinfo";
import useAxios from "axios-hooks";
import * as SecureStore from "expo-secure-store";
import { deserialize, ExistingDocumentObject } from "jsonapi-fractal";
import React, { createContext, ReactNode, useEffect, useState } from "react";

import {
  CURRENT_RESOURCES_LOCAL_STORAGE_KEY,
  CURRENT_VISIT_LOCAL_STORAGE_KEY,
} from "@/constants/Keys";
import { useAuth } from "@/context/AuthProvider";
import { ErrorResponse } from "@/schema";
import { Questionnaire, Resources, VisitData } from "@/types";
import { useTranslation } from "react-i18next";
import { setQuestionnaire } from "@/hooks/useStore";

interface VisitContextType {
  visitData: VisitData;
  resources: Resources;
  setVisitData: (data: Partial<VisitData>) => void;
  isConnected: boolean;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

/**
 * HashMap of questionnaires where @string is the questionnaireId
 */

const VisitProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const { isInternetReachable } = useNetInfo();
  const { meData } = useAuth();
  const [visitData, setVisitDataState] = useState<VisitData>({
    answers: {},
    // @ts-expect-error
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

  // @ts-expect-error `resources` is a tuple with some objects that we expect
  // from our backend and it will be used throughout the life of our app, we
  // should make sure that resources always comes in the shape that the types
  // say, or throw, because is guaranteed the app will crash at some point
  const [resources, setResources] = useState<Resources>([]);

  const [{ data: questionnaireData }, featchQuestionnaire] = useAxios<
    ExistingDocumentObject,
    unknown,
    ErrorResponse
  >(
    {
      // We need to support en-US es-ES etc in the backend
      // for now we're manually grabbing the first part
      url: `questionnaires/current?language=${i18n.language}`,
    },
    { manual: true },
  );

  const [{ data: paramsData }, featchParams] = useAxios<
    Resources,
    unknown,
    ErrorResponse
  >(
    {
      url: `get_last_params`,
    },
    { manual: true },
  );

  useEffect(() => {
    if (!meData) {
      return;
    }
    setVisitData({ userAccountId: meData.id });
    featchQuestionnaire();
    featchParams();
  }, [meData, featchQuestionnaire, featchParams]);

  useEffect(() => {
    if (!questionnaireData) {
      return;
    }

    const deserializedQuestionnaire = deserialize<Questionnaire>(
      questionnaireData,
    ) as Questionnaire;

    setQuestionnaire(deserializedQuestionnaire);
  }, [questionnaireData]);

  useEffect(() => {
    if (!paramsData) {
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

  const setVisitData = (data: Partial<VisitData>) => {
    setVisitDataState((prev) => {
      const updatedData = { ...prev, ...data };
      SecureStore.setItemAsync(
        CURRENT_VISIT_LOCAL_STORAGE_KEY,
        JSON.stringify(updatedData),
      );
      return updatedData;
    });
  };

  return (
    <VisitContext.Provider
      value={{
        visitData,
        resources,
        setVisitData,
        isConnected: !!isInternetReachable,
      }}
    >
      {children}
    </VisitContext.Provider>
  );
};

export { VisitContext, VisitProvider };
