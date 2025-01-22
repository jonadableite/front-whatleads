// src/components/ui/use-toast.tsx
import * as React from "react";
import { Toast } from "./toast";

type ToastProps = React.ComponentProps<typeof Toast>;

const ToastContext = React.createContext<{
	toast: (props: ToastProps) => void;
}>({
	toast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<ToastProps[]>([]);

	const toast = React.useCallback((props: ToastProps) => {
		setToasts((prev) => [...prev, props]);
		setTimeout(() => {
			setToasts((prev) => prev.slice(1));
		}, 3000);
	}, []);

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			{toasts.map((toastProps, index) => (
				<Toast key={index} {...toastProps} />
			))}
		</ToastContext.Provider>
	);
}

export const useToast = () => {
	const context = React.useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};
