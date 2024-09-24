import { useContext } from "react";
import { BrigadeContext } from "@/context/BrigadeContext";

const useBrigades = () => {
  const context = useContext(BrigadeContext);
  if (context === undefined) {
    throw new Error("useBrigades must be used within a BrigadeProvider");
  }
  return context;
};

export { useBrigades };
