import { useContext } from "react";
import { FilterContext } from "@/context/FilterContext";

const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useBrigades must be used within a BrigadeProvider");
  }
  return context;
};

export { useFilters };
