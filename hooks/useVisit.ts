import { useContext } from "react";
import { VisitContext } from "@/context/VisitContext";

const useVisit = () => {
  const context = useContext(VisitContext);
  if (context === undefined) {
    throw new Error("useVisit must be used within a VisitProvider");
  }
  return context;
};

export { useVisit };
