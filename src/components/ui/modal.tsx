import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
// src/components/ui/modal.tsx
import * as React from "react"; // Adicione esta importação

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
	progress?: number;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	description,
	children,
	className,
	progress,
}) => {
	const [showGlow, setShowGlow] = React.useState(false);
	const modalId = React.useId();

	React.useEffect(() => {
		if (isOpen) {
			setTimeout(() => setShowGlow(true), 300);
		} else {
			setShowGlow(false);
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
					/>
				)}
			</AnimatePresence>
			<DialogContent
				className={cn(
					"fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
					"bg-deep/95 backdrop-blur-xl border-none p-0 overflow-hidden rounded-2xl shadow-lg",
					className,
				)}
				aria-labelledby={`${modalId}-title`}
				aria-describedby={description ? `${modalId}-description` : undefined}
			>
				<DialogHeader className="p-6 border-b border-electric/30">
					<DialogTitle
						id={`${modalId}-title`}
						className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-electric to-white"
					>
						{title}
					</DialogTitle>

					{description && (
						<DialogDescription
							id={`${modalId}-description`}
							className="text-white/70 mt-2"
						>
							{description}
						</DialogDescription>
					)}
				</DialogHeader>

				<div className="p-6">
					{progress !== undefined && (
						<motion.div
							className="mb-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							role="progressbar"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={progress}
						>
							<div className="relative w-full bg-deep/50 rounded-full h-2 overflow-hidden">
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-electric via-neon-green to-electric opacity-20"
									animate={{
										x: ["0%", "100%"],
										transition: {
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
										},
									}}
								/>
								<motion.div
									className="relative bg-neon-green h-full rounded-full"
									initial={{ width: "0%" }}
									animate={{ width: `${progress}%` }}
									transition={{ duration: 0.5 }}
								/>
							</div>
							<p className="text-white text-center mt-2">
								{progress}% concluído
							</p>
						</motion.div>
					)}

					{children}
				</div>

				<button
					className="absolute right-4 top-4 p-2 rounded-full bg-electric/10 text-white/70 hover:bg-electric/20 hover:text-white transition-colors"
					onClick={onClose}
					aria-label="Fechar modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</DialogContent>
		</Dialog>
	);
};

export { DialogContent, DialogTitle };
