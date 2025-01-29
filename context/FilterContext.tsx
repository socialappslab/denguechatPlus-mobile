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
  brigader?: IUser;
  newBrigade?: Team;
  newHouseBlock?: BaseObject;
  filters: FilterData;
}

interface FilterContextType {
  filters: FilterData;
  selection: SelectionData;
  setFilter: (data: Partial<FilterData>) => void;
  setSelection: (data: Partial<SelectionData>) => void;
  clearState: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filterData, setFilterData] = useState<FilterData>({});

  const [selectionData, setSelectionData] = useState<SelectionData>({
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
    setSelectionData({ filters: {} });
  };

  return (
    <FilterContext.Provider
      value={{
        filters: filterData,
        selection: selectionData,
        setFilter,
        setSelection,
        clearState,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export { FilterContext, FilterProvider };
