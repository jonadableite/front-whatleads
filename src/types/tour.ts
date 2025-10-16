// src/types/tour.ts

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // Seletor CSS do elemento alvo
  placement?: "top" | "bottom" | "left" | "right" | "center";
  page?: string; // Página onde o passo deve ser executado
  action?: "click" | "navigate" | "wait" | "highlight";
  actionTarget?: string; // Elemento para ação (se diferente do target)
  nextRoute?: string; // Rota para navegar no próximo passo
  showSkip?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  showFinish?: boolean;
  delay?: number; // Delay antes de mostrar o passo (ms)
  optional?: boolean; // Se o passo é opcional
}

export interface TourConfig {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  persistent?: boolean; // Se deve lembrar que o usuário já fez o tour
}

export interface TourState {
  isActive: boolean;
  currentStepIndex: number;
  currentTour: TourConfig | null;
  completedTours: string[];
  isLoading: boolean;
  error: string | null;
}

export interface TourContextType {
  state: TourState;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
  goToStep: (stepIndex: number) => void;
  resetTour: () => void;
  markTourAsCompleted: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  getCurrentStep: () => TourStep | null;
  isCurrentStepValid: () => boolean;
}

export interface TourTooltipProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onFinish: () => void;
  isVisible: boolean;
}

export interface TourOverlayProps {
  target: string;
  isVisible: boolean;
  onClose?: () => void;
}
