// src/components/tour/TourOverlay.tsx
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TourOverlayProps {
  target: string;
  isVisible: boolean;
  onClose?: () => void;
  padding?: number;
}

export function TourOverlay({ target, isVisible, onClose, padding = 8 }: TourOverlayProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isVisible || !target) {
      return;
    }

    const updateTargetRect = () => {
      const element = document.querySelector(target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    // Atualizar imediatamente
    updateTargetRect();

    // Atualizar quando a janela for redimensionada
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    // Observar mudanças no DOM
    const observer = new MutationObserver(updateTargetRect);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
      observer.disconnect();
    };
  }, [target, isVisible]);

  if (!isVisible || !targetRect) {
    return null;
  }

  const overlayStyle = {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay escuro sutil */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Destaque do elemento */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="fixed z-[9999] pointer-events-none"
            style={overlayStyle}
          >
            {/* Borda sutil */}
            <div className="absolute inset-0 rounded-lg border-2 border-neon-green/70 shadow-md shadow-neon-green/30">
              <motion.div
                className="absolute inset-0 rounded-lg border border-neon-green/20"
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Efeito de brilho sutil */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-green/5 via-neon-blue/5 to-neon-green/5"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Pontos de destaque sutis */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-neon-green/80 rounded-full shadow-sm shadow-neon-green/40" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green/80 rounded-full shadow-sm shadow-neon-green/40" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-neon-green/80 rounded-full shadow-sm shadow-neon-green/40" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-neon-green/80 rounded-full shadow-sm shadow-neon-green/40" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
