// src/components/tour/TourButton.tsx
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tourConfigs } from '@/config/tours';
import { useTourContext } from '@/hooks/useTourContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CheckCircle, HelpCircle, Play } from 'lucide-react';

interface TourButtonProps {
  variant?: 'default' | 'floating' | 'minimal';
  className?: string;
}

export function TourButton({ variant = 'default', className }: TourButtonProps) {
  const { startTour, isTourCompleted, state } = useTourContext();

  const handleStartTour = (tourId: string) => {
    try {
      startTour(tourId);
    } catch (error) {
      console.error('Erro ao iniciar tour:', error);
    }
  };

  if (variant === 'floating') {
    return (
      <AnimatePresence>
        {!state.isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'fixed bottom-6 right-6 z-[9999]',
              className
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 bg-gradient-to-r from-neon-green via-emerald-500 to-neon-blue hover:from-neon-green/90 hover:via-emerald-500/90 hover:to-neon-blue/90 text-white border-0 shadow-2xl shadow-neon-green/50 transition-all duration-300"
                  title="Iniciar Tour Guiado"
                >
                  <HelpCircle className="w-7 h-7" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-deep/95 backdrop-blur-xl border-electric/30">
                <DropdownMenuLabel className="text-white">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Tours Disponíveis
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-electric/30" />
                {tourConfigs.map((tour) => (
                  <DropdownMenuItem
                    key={tour.id}
                    onClick={() => handleStartTour(tour.id)}
                    className="text-white hover:bg-electric/20 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        <div>
                          <p className="font-medium">{tour.name}</p>
                          <p className="text-xs text-white/60">{tour.description}</p>
                        </div>
                      </div>
                      {isTourCompleted(tour.id) && (
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleStartTour('welcome')}
        className={cn('text-white/60 hover:text-white hover:bg-white/10', className)}
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Tour Guiado
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'bg-white/5 border-white/20 text-white hover:bg-white/10',
            className
          )}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Tour Guiado
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-deep/95 backdrop-blur-xl border-electric/30">
        <DropdownMenuLabel className="text-white">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Tours Disponíveis
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-electric/30" />
        {tourConfigs.map((tour) => (
          <DropdownMenuItem
            key={tour.id}
            onClick={() => handleStartTour(tour.id)}
            className="text-white hover:bg-electric/20 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                <div>
                  <p className="font-medium">{tour.name}</p>
                  <p className="text-xs text-white/60">{tour.description}</p>
                </div>
              </div>
              {isTourCompleted(tour.id) && (
                <CheckCircle className="w-4 h-4 text-neon-green" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
