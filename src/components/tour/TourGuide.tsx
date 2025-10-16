// src/components/tour/TourGuide.tsx
import { useTourContext } from '@/hooks/useTourContext';
import { useCallback, useEffect } from 'react';
import { TourOverlay } from './TourOverlay';
import { TourTooltip } from './TourTooltip';

export function TourGuide() {
  const tourContext = useTourContext();
  const {
    state,
    nextStep,
    previousStep,
    skipTour,
    finishTour,
  } = tourContext;

  // Funções auxiliares
  const getCurrentStep = useCallback(() => {
    if (!state.currentTour || !state.isActive) return null;
    return state.currentTour.steps[state.currentStepIndex] || null;
  }, [state.currentTour, state.isActive, state.currentStepIndex]);

  const isCurrentStepValid = useCallback(() => {
    const currentStep = getCurrentStep();
    if (!currentStep) return false;
    // Para simplificar, vamos sempre retornar true por enquanto
    return true;
  }, [getCurrentStep]);

  const currentStep = getCurrentStep();
  const stepValid = isCurrentStepValid();
  const isActive = state.isActive && currentStep && stepValid;


  // Scroll para o elemento quando o passo mudar
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const scrollToTarget = () => {
      const element = document.querySelector(currentStep.target);
      if (element && currentStep.placement !== 'center') {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    };

    // Delay para garantir que o elemento existe
    const timer = setTimeout(scrollToTarget, 100);
    return () => clearTimeout(timer);
  }, [isActive, currentStep]);

  // Executar ações do passo
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const executeAction = () => {
      if (currentStep.action === 'highlight') {
        const element = document.querySelector(currentStep.target);
        if (element) {
          element.classList.add('tour-highlight');
          return () => element.classList.remove('tour-highlight');
        }
      }
    };

    const cleanup = executeAction();
    return cleanup;
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) {
    return null;
  }

  return (
    <>
      {/* Overlay de destaque */}
      <TourOverlay
        target={currentStep.target}
        isVisible={isActive}
        onClose={skipTour}
      />

      {/* Tooltip com conteúdo */}
      <TourTooltip
        step={currentStep}
        currentStepIndex={state.currentStepIndex}
        totalSteps={state.currentTour?.steps.length || 0}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipTour}
        onFinish={finishTour}
        isVisible={isActive}
      />
    </>
  );
}
