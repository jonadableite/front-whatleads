import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { cn } from '../../lib/utils';

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center" />
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className={cn(
            'relative bg-deep border border-electric/30 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg lg:max-w-2xl overflow-hidden',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogClose
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-200"
            onClick={onClose}
          >
            <FiX size={24} />
          </DialogClose>
          <DialogTitle className="text-3xl font-bold text-white mb-6 border-b border-electric/20 pb-4">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {title}
          </DialogDescription>
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {children}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
