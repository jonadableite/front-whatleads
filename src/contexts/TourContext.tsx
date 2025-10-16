// src/contexts/TourContext.tsx
import { TourGuide } from '@/components/tour/TourGuide';
import { useTour } from '@/hooks/useTour';
import { TourContext } from '@/contexts/TourContextDefinition';
import type { ReactNode } from 'react';

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const tourHook = useTour();

  return (
    <TourContext.Provider value={tourHook}>
      {children}
      <TourGuide />
    </TourContext.Provider>
  );
}

// Hook movido para um arquivo separado para evitar problemas com Fast Refresh
