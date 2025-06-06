// src/components/ui/modal.tsx
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import * as React from "react";

// Variantes de estilo para diferentes tipos de modal
const modalVariants = cva(
	"fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 " +
	"bg-deep/95 backdrop-blur-xl border-none p-0 overflow-hidden rounded-2xl shadow-lg " +
	"data-[state=open]:animate-in data-[state=closed]:animate-out " +
	"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
	"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
	{
		variants: {
			type: {
				default: "border-l-4 border-electric",
				success: "border-l-4 border-neon-green",
				error: "border-l-4 border-red-500",
				warning: "border-l-4 border-yellow-500",
				info: "border-l-4 border-blue-500",
			},
			size: {
				default: "max-w-lg",
				sm: "max-w-md",
				lg: "max-w-xl",
				xl: "max-w-2xl",
				full: "max-w-full h-full",
			},
		},
		defaultVariants: {
			type: "default",
			size: "default",
		},
	}
);

// Ícones para diferentes tipos de modal
const getModalIcon = (type: ModalProps['type']) => {
	const iconProps = {
		className: "w-6 h-6 mr-3",
	};
	const icons = {
		success: <CheckCircle2 {...iconProps} className={`${iconProps.className} text-neon-green`} />,
		error: <XCircle {...iconProps} className={`${iconProps.className} text-red-500`} />,
		warning: <AlertCircle {...iconProps} className={`${iconProps.className} text-yellow-500`} />,
		info: <Info {...iconProps} className={`${iconProps.className} text-blue-500`} />,
		default: null,
	};
	return icons[type || 'default'];
};

// Definição de props para o Modal
interface ModalProps extends React.HTMLAttributes<HTMLDivElement>,
	VariantProps<typeof modalVariants> {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
	progress?: number;
	closeOnOverlayClick?: boolean;
	showCloseButton?: boolean;
}

// Componente Modal Principal
const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
	(
		{
			isOpen,
			onClose,
			title,
			description,
			children,
			className,
			progress,
			type = "default",
			size = "default",
			closeOnOverlayClick = true,
			showCloseButton = true,
			...props
		},
		ref
	) => {
		const iconElement = getModalIcon(type);

		return (
			<DialogPrimitive.Root
				open={isOpen}
				onOpenChange={(open) => !open && onClose()}
			>
				<DialogPrimitive.Portal>
					<DialogPrimitive.Overlay
						className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
						onClick={closeOnOverlayClick ? onClose : undefined}
					/>
					<DialogPrimitive.Content
						ref={ref}
						className={cn(
							modalVariants({ type, size }),
							className
						)}
						{...props}
					>
						{/* Cabeçalho do Modal */}
						<div className="flex items-center p-6 border-b border-electric/30">
							{iconElement}
							<div>
								<DialogPrimitive.Title
									className="text-2xl font-bold bg-gradient-to-r from-electric to-blue-500 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]"
								>
									{title || ''}
								</DialogPrimitive.Title>
								<DialogPrimitive.Description
									className="text-white/70 mt-1"
								>
									{description || ''}
								</DialogPrimitive.Description>
							</div>
							{/* Botão de Fechar */}
							{showCloseButton && (
								<DialogPrimitive.Close
									className="ml-auto p-2 rounded-full
                  bg-electric/10 text-white/70
                  hover:bg-electric/20 hover:text-white
                  transition-colors"
									aria-label="Fechar modal"
								>
									<X className="h-5 w-5" />
								</DialogPrimitive.Close>
							)}
						</div>

						{/* Barra de Progresso */}
						{progress !== undefined && (
							<div className="px-6 pt-4">
								<div className="relative w-full bg-deep/50 rounded-full h-2 overflow-hidden">
									<motion.div
										className="absolute inset-0 bg-gradient-to-r
                    from-electric via-neon-green to-electric opacity-20"
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
							</div>
						)}

						{/* Conteúdo do Modal */}
						<div className="p-6">{children}</div>
					</DialogPrimitive.Content>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>
		);
	}
);

Modal.displayName = "Modal";

export const DialogContent = DialogPrimitive.Content;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogOverlay = DialogPrimitive.Overlay;
export const DialogRoot = DialogPrimitive.Root;

export { Modal };
