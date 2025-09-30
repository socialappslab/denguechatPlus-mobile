import React, { createContext, ReactNode, useState } from "react";

import { BaseObject, Team } from "@/schema";
import { IUser } from "@/schema/auth";

export interface FilterData {
  team?: BaseObject;
  sector?: BaseObject;
  wedge?: BaseObject;
  brigader?: IUser;
}

interface SelectionData {
  brigader: IUser | null;
  newBrigade: Team | null;
  newHouseBlock: BaseObject | null;
  filters: FilterData;
}

interface BrigadeContextType {
  filters: FilterData;
  selection: SelectionData;
  setFilter: (data: Partial<FilterData>) => void;
  setSelection: (data: Partial<SelectionData>) => void;
  clearState: () => void;
}

const BrigadeContext = createContext<BrigadeContextType | undefined>(undefined);

const BrigadeProvider = ({ children }: { children: ReactNode }) => {
  const [filterData, setFilterData] = useState<FilterData>({});

  const [selectionData, setSelectionData] = useState<SelectionData>({
    brigader: null,
    newBrigade: null,
    newHouseBlock: null,
    filters: {},
  });

  const setFilter = (data: Partial<FilterData>) => {
    setFilterData((prev) => {
      const updatedData = { ...prev, ...data };
      return updatedData;
    });
  };

  const setSelection = (data: Partial<SelectionData>) => {
    setSelectionData((prev) => {
      const updatedData = { ...prev, ...data };
      return updatedData;
    });
  };

  const clearState = () => {
    setFilterData({});
    setSelectionData({
      brigader: null,
      newBrigade: null,
      newHouseBlock: null,
      filters: {},
    });
  };

  return (
    <BrigadeContext.Provider
      value={{
        filters: filterData,
        selection: selectionData,
        setFilter,
        setSelection,
        clearState,
      }}
    >
      {children}
    </BrigadeContext.Provider>
  );
};

export { BrigadeContext, BrigadeProvider };
