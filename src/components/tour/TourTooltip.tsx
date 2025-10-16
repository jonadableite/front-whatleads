// src/components/tour/TourTooltip.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TourStep } from '@/types/tour';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, SkipForward, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TourTooltipProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onFinish: () => void;
  isVisible: boolean;
}

export function TourTooltip({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onFinish,
  isVisible,
}: TourTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('bottom');

  useEffect(() => {
    if (!isVisible || !step.target) {
      return;
    }

    const calculatePosition = () => {
      if (step.placement === 'center') {
        setPosition({
          top: window.innerHeight / 2 - 200,
          left: window.innerWidth / 2 - 200,
        });
        setPlacement('center');
        return;
      }

      const element = document.querySelector(step.target);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const tooltipWidth = 400;
      const tooltipHeight = 200;
      const offset = 16;

      let newPosition = { top: 0, left: 0 };
      let newPlacement = step.placement || 'bottom';

      switch (newPlacement) {
        case 'top':
          newPosition = {
            top: rect.top - tooltipHeight - offset,
            left: rect.left + rect.width / 2 - tooltipWidth / 2,
          };
          break;
        case 'bottom':
          newPosition = {
            top: rect.bottom + offset,
            left: rect.left + rect.width / 2 - tooltipWidth / 2,
          };
          break;
        case 'left':
          newPosition = {
            top: rect.top + rect.height / 2 - tooltipHeight / 2,
            left: rect.left - tooltipWidth - offset,
          };
          break;
        case 'right':
          newPosition = {
            top: rect.top + rect.height / 2 - tooltipHeight / 2,
            left: rect.right + offset,
          };
          break;
      }

      // Ajustar se sair da tela
      if (newPosition.left < 16) {
        newPosition.left = 16;
      } else if (newPosition.left + tooltipWidth > window.innerWidth - 16) {
        newPosition.left = window.innerWidth - tooltipWidth - 16;
      }

      if (newPosition.top < 16) {
        newPosition.top = 16;
        newPlacement = 'bottom';
      } else if (newPosition.top + tooltipHeight > window.innerHeight - 16) {
        newPosition.top = window.innerHeight - tooltipHeight - 16;
        newPlacement = 'top';
      }

      setPosition(newPosition);
      setPlacement(newPlacement);
    };

    calculatePosition();

    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [step, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, delay: step.delay ? step.delay / 1000 : 0 }}
        className="fixed z-[10000] w-96 max-w-[90vw]"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        {/* Seta do tooltip */}
        {placement !== 'center' && (
          <div
            className={cn(
              'absolute w-0 h-0 border-8',
              placement === 'top' && 'bottom-[-16px] left-1/2 transform -translate-x-1/2 border-t-deep border-l-transparent border-r-transparent border-b-transparent',
              placement === 'bottom' && 'top-[-16px] left-1/2 transform -translate-x-1/2 border-b-deep border-l-transparent border-r-transparent border-t-transparent',
              placement === 'left' && 'right-[-16px] top-1/2 transform -translate-y-1/2 border-l-deep border-t-transparent border-b-transparent border-r-transparent',
              placement === 'right' && 'left-[-16px] top-1/2 transform -translate-y-1/2 border-r-deep border-t-transparent border-b-transparent border-l-transparent'
            )}
          />
        )}

        {/* Conteúdo do tooltip */}
        <div className="bg-deep/95 backdrop-blur-xl rounded-2xl border border-electric/30 shadow-2xl shadow-electric/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-electric/20 to-neon-blue/20 p-4 border-b border-electric/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-neon-green to-neon-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentStepIndex + 1}
                </div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Progresso</span>
                <span>{currentStepIndex + 1} de {totalSteps}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-neon-green to-neon-blue h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-white/80 leading-relaxed mb-6">
              {step.content}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {step.showPrevious && currentStepIndex > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevious}
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                )}

                {step.showSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Pular Tour
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {step.showNext && (
                  <Button
                    onClick={onNext}
                    className="bg-gradient-to-r from-neon-green to-emerald-500 hover:from-neon-green/80 hover:to-emerald-500/80 text-white border-0"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}

                {step.showFinish && (
                  <Button
                    onClick={onFinish}
                    className="bg-gradient-to-r from-neon-blue to-electric hover:from-neon-blue/80 hover:to-electric/80 text-white border-0"
                  >
                    Finalizar Tour
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
