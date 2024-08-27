import React from "react";

import { Slot } from "expo-router";

import { VisitProvider } from "@/context/VisitContext";

export default function VisitLayout() {
  return (
    <VisitProvider>
      <Slot />
    </VisitProvider>
  );
}
