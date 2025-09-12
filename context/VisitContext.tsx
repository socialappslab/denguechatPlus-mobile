import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useEffect, useState } from "react";

import { CURRENT_VISIT_LOCAL_STORAGE_KEY } from "@/constants/Keys";
import { VisitData } from "@/types";
import { useStore } from "@/hooks/useStore";

interface VisitContextType {
  visitData: VisitData;
  setVisitData: (data: Partial<VisitData>) => void;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

/**
 * HashMap of questionnaires where @string is the questionnaireId
 */

const VisitProvider = ({ children }: { children: ReactNode }) => {
  const userProfile = useStore((state) => state.userProfile);
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

  useEffect(() => {
    if (!userProfile) return;

    // NOTE: Here we're setting the current user as the "owner" of the visits.
    // We're only executing this if we have the default value "0", which means
    // that we don't have a real user account. We may want to handle this
    // differently. The check is weird.
    if (visitData.userAccountId === "0") {
      setVisitData({ userAccountId: userProfile.id });
    }
  }, [userProfile]);

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
        setVisitData,
      }}
    >
      {children}
    </VisitContext.Provider>
  );
};

export { VisitContext, VisitProvider };
