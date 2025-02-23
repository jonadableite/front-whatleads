/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/ui/toast.tsx
import { toast as ReactToast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Tipo de opções de toast
export interface ToastOptions {
	position?:
		| "top-right"
		| "top-center"
		| "top-left"
		| "bottom-right"
		| "bottom-center"
		| "bottom-left";
	autoClose?: number | false;
	hideProgressBar?: boolean;
	closeOnClick?: boolean;
	pauseOnHover?: boolean;
	draggable?: boolean;
	progress?: undefined;
	theme?: "light" | "dark" | "colored";
	style?: React.CSSProperties;
}

// Estilo padrão para toasts
const defaultStyle: React.CSSProperties = {
	background: "rgba(13, 13, 13, 0.9)",
	backdropFilter: "blur(10px)",
	color: "#fff",
};

// Função de toast personalizada
export const toast = {
	success: (
		message: string,
		options: Omit<ToastOptions, "style"> & {
			style?: Partial<React.CSSProperties>;
		} = {},
	) => {
		const toastId = ReactToast.success(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "dark",
			style: {
				...defaultStyle,
				border: "1px solid rgba(0, 255, 106, 0.3)",
				...options.style,
			},
			...options,
		});

		// Disparar evento personalizado
		window.dispatchEvent(
			new CustomEvent("toast", {
				detail: {
					id: toastId,
					message,
					type: "success",
					...options,
				},
			}),
		);

		return toastId;
	},

	error: (
		message: string,
		options: Omit<ToastOptions, "style"> & {
			style?: Partial<React.CSSProperties>;
		} = {},
	) => {
		const toastId = ReactToast.error(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "dark",
			style: {
				...defaultStyle,
				border: "1px solid rgba(255, 0, 0, 0.3)",
				...options.style,
			},
			...options,
		});

		// Disparar evento personalizado
		window.dispatchEvent(
			new CustomEvent("toast", {
				detail: {
					id: toastId,
					message,
					type: "error",
					...options,
				},
			}),
		);

		return toastId;
	},

	warning: (
		message: string,
		options: Omit<ToastOptions, "style"> & {
			style?: Partial<React.CSSProperties>;
		} = {},
	) => {
		const toastId = ReactToast.warn(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "dark",
			style: {
				...defaultStyle,
				border: "1px solid rgba(255, 165, 0, 0.3)",
				...options.style,
			},
			...options,
		});

		// Disparar evento personalizado
		window.dispatchEvent(
			new CustomEvent("toast", {
				detail: {
					id: toastId,
					message,
					type: "warning",
					...options,
				},
			}),
		);

		return toastId;
	},

	info: (
		message: string,
		options: Omit<ToastOptions, "style"> & {
			style?: Partial<React.CSSProperties>;
		} = {},
	) => {
		const toastId = ReactToast.info(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "dark",
			style: {
				...defaultStyle,
				border: "1px solid rgba(0, 123, 255, 0.3)",
				...options.style,
			},
			...options,
		});

		// Disparar evento personalizado
		window.dispatchEvent(
			new CustomEvent("toast", {
				detail: {
					id: toastId,
					message,
					type: "info",
					...options,
				},
			}),
		);

		return toastId;
	},

	// Método para fechar um toast específico
	dismiss: (toastId?: React.ReactText) => {
		if (toastId) {
			ReactToast.dismiss(toastId);
		} else {
			ReactToast.dismiss();
		}
	},

	// Método para limpar todos os toasts
	clearAll: () => {
		ReactToast.clearWaitingQueue();
	},
};

// Componente de toast para renderização
export const Toast: React.FC<ToastProps> = ({
	message,
	type = "info",
	onClose,
	...options
}) => {
	// Renderização personalizada do toast
	return (
		<div className="toast-custom-container">
			{message}
			{onClose && (
				// biome-ignore lint/a11y/useButtonType: <explanation>
				<button onClick={onClose} className="toast-close-button">
					Fechar
				</button>
			)}
		</div>
	);
};

// Interface de props do toast
export interface ToastProps extends ToastOptions {
	id?: string;
	message: string;
	type?: "success" | "error" | "warning" | "info";
	onClose?: () => void;
}
