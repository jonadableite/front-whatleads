// src/contexts/TourContextDefinition.ts
import type { TourContextType } from "@/types/tour";
import { createContext } from "react";

export const TourContext = createContext<TourContextType | undefined>(
  undefined
);
