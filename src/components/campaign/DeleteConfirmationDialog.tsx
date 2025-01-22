// src/components/campaign/DeleteConfirmationDialog.tsx
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";

interface DeleteConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isDeleting: boolean;
	campaignName: string;
}

export function DeleteConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	isDeleting,
	campaignName,
}: DeleteConfirmationDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="bg-deep border border-electric text-white sm:max-w-[425px]">
				<DialogHeader>
					<motion.div
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100/10"
					>
						<FiAlertTriangle className="h-6 w-6 text-red-500" />
					</motion.div>
					<DialogTitle className="text-center text-xl font-semibold">
						Excluir Campanha
					</DialogTitle>
					<DialogDescription className="text-center text-white/70">
						Tem certeza que deseja excluir a campanha "{campaignName}"? Esta
						ação não pode ser desfeita.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex gap-2 justify-center mt-4">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
						className="border-electric text-white hover:bg-electric/20"
					>
						Cancelar
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleting}
						className="relative"
					>
						{isDeleting ? (
							<>
								<motion.div
									className="absolute inset-0 flex items-center justify-center"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>
									<div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
								</motion.div>
								<span className="opacity-0">Excluindo...</span>
							</>
						) : (
							"Excluir"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
