// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getWarmupProgressColor = (progress: number): string => {
  if (progress < 20) {
    return "text-neon-pink";
  } else if (progress >= 20 && progress < 80) {
    return "text-yellow-300";
  } else {
    return "text-neon-green";
  }
};
