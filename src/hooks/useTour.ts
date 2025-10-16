// src/hooks/useTour.ts
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { TourState, TourStep } from "@/types/tour";
import { tourConfigs } from "@/config/tours";

const STORAGE_KEY = "whatleads_completed_tours";

export function useTour() {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<TourState>({
    isActive: false,
    currentStepIndex: 0,
    currentTour: null,
    completedTours: [],
    isLoading: false,
    error: null,
  });

  // Carregar tours completados do localStorage
  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (completed) {
        setState((prev) => ({
          ...prev,
          completedTours: JSON.parse(completed),
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar tours completados:", error);
    }
  }, []);

  // Salvar tours completados no localStorage
  const saveCompletedTours = useCallback((tours: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
    } catch (error) {
      console.error("Erro ao salvar tours completados:", error);
    }
  }, []);

  // Verificar se um tour foi completado
  const isTourCompleted = useCallback(
    (tourId: string): boolean => {
      return state.completedTours.includes(tourId);
    },
    [state.completedTours]
  );

  // Marcar tour como completado
  const markTourAsCompleted = useCallback(
    (tourId: string) => {
      setState((prev) => {
        const newCompleted = [...prev.completedTours];
        if (!newCompleted.includes(tourId)) {
          newCompleted.push(tourId);
          saveCompletedTours(newCompleted);
        }
        return {
          ...prev,
          completedTours: newCompleted,
        };
      });
    },
    [saveCompletedTours]
  );

  // Iniciar um tour
  const startTour = useCallback(
    (tourId: string) => {
      const tour = tourConfigs.find((t) => t.id === tourId);
      if (!tour) {
        setState((prev) => ({
          ...prev,
          error: `Tour "${tourId}" não encontrado`,
        }));
        return;
      }

      // Verificar se o tour já foi completado (apenas para tours persistentes)
      if (tour.persistent && isTourCompleted(tourId)) {
        // Para permitir reiniciar tours, comentamos o return
        // return;
      }

      setState((prev) => ({
        ...prev,
        isActive: true,
        currentStepIndex: 0,
        currentTour: tour,
        error: null,
      }));

      // Navegar para a primeira página se necessário
      const firstStep = tour.steps[0];
      if (firstStep.nextRoute && location.pathname !== firstStep.nextRoute) {
        navigate(firstStep.nextRoute);
      }
    },
    [isTourCompleted, location.pathname, navigate]
  );

  // Próximo passo
  const nextStep = useCallback(() => {
    setState((prev) => {
      if (!prev.currentTour || !prev.isActive) return prev;

      const nextIndex = prev.currentStepIndex + 1;

      if (nextIndex >= prev.currentTour.steps.length) {
        // Tour finalizado
        markTourAsCompleted(prev.currentTour.id);
        return {
          ...prev,
          isActive: false,
          currentStepIndex: 0,
          currentTour: null,
        };
      }

      const nextStep = prev.currentTour.steps[nextIndex];

      // Navegar para próxima página se necessário
      if (nextStep.nextRoute && location.pathname !== nextStep.nextRoute) {
        navigate(nextStep.nextRoute);
      }

      return {
        ...prev,
        currentStepIndex: nextIndex,
      };
    });
  }, [markTourAsCompleted, location.pathname, navigate]);

  // Passo anterior
  const previousStep = useCallback(() => {
    setState((prev) => {
      if (!prev.currentTour || !prev.isActive || prev.currentStepIndex === 0) {
        return prev;
      }

      const prevIndex = prev.currentStepIndex - 1;
      const prevStep = prev.currentTour.steps[prevIndex];

      // Navegar para página anterior se necessário
      if (prevStep.nextRoute && location.pathname !== prevStep.nextRoute) {
        navigate(prevStep.nextRoute);
      }

      return {
        ...prev,
        currentStepIndex: prevIndex,
      };
    });
  }, [location.pathname, navigate]);

  // Pular tour
  const skipTour = useCallback(() => {
    setState((prev) => {
      if (prev.currentTour) {
        markTourAsCompleted(prev.currentTour.id);
      }
      return {
        ...prev,
        isActive: false,
        currentStepIndex: 0,
        currentTour: null,
      };
    });
  }, [markTourAsCompleted]);

  // Finalizar tour
  const finishTour = useCallback(() => {
    setState((prev) => {
      if (prev.currentTour) {
        markTourAsCompleted(prev.currentTour.id);
      }
      return {
        ...prev,
        isActive: false,
        currentStepIndex: 0,
        currentTour: null,
      };
    });
  }, [markTourAsCompleted]);

  // Ir para um passo específico
  const goToStep = useCallback(
    (stepIndex: number) => {
      setState((prev) => {
        if (!prev.currentTour || !prev.isActive) return prev;

        if (stepIndex < 0 || stepIndex >= prev.currentTour.steps.length) {
          return prev;
        }

        const step = prev.currentTour.steps[stepIndex];

        // Navegar para página do passo se necessário
        if (step.nextRoute && location.pathname !== step.nextRoute) {
          navigate(step.nextRoute);
        }

        return {
          ...prev,
          currentStepIndex: stepIndex,
        };
      });
    },
    [location.pathname, navigate]
  );

  // Resetar tour
  const resetTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      currentStepIndex: 0,
      currentTour: null,
      error: null,
    }));
  }, []);

  // Auto-iniciar tour para novos usuários
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("whatleads_welcome_tour_seen");
    if (!hasSeenWelcome && !isTourCompleted("welcome")) {
      // Delay para garantir que a página carregou
      const timer = setTimeout(() => {
        startTour("welcome");
        localStorage.setItem("whatleads_welcome_tour_seen", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isTourCompleted, startTour]);

  // Obter passo atual
  const getCurrentStep = useCallback((): TourStep | null => {
    if (!state.currentTour || !state.isActive) return null;
    return state.currentTour.steps[state.currentStepIndex] || null;
  }, [state.currentTour, state.isActive, state.currentStepIndex]);

  // Verificar se o passo atual é válido para a página atual
  const isCurrentStepValid = useCallback((): boolean => {
    const currentStep = getCurrentStep();
    if (!currentStep) {
      return false;
    }

    // Se o passo tem uma página específica, verificar se estamos nela
    if (currentStep.page) {
      return location.pathname.includes(currentStep.page);
    }

    return true;
  }, [getCurrentStep, location.pathname]);

  return {
    state,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    finishTour,
    goToStep,
    resetTour,
    markTourAsCompleted,
    isTourCompleted,
    getCurrentStep,
    isCurrentStepValid,
  };
}
