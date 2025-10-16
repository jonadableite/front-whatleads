// src/hooks/useTourContext.ts
import { TourContext } from "@/contexts/TourContextDefinition";
import type { TourContextType } from "@/types/tour";
import { useContext } from "react";

export function useTourContext(): TourContextType {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTourContext deve ser usado dentro de um TourProvider");
  }
  return context;
}
