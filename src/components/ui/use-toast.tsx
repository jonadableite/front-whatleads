// src/components/ui/use-toast.tsx
import * as React from "react";
import { Toast, type ToastProps, toast } from "./toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<ToastProps[]>([]);

	React.useEffect(() => {
		const handleToast = (event: CustomEvent) => {
			const toastProps = event.detail as ToastProps;
			const newToast = {
				...toastProps,
				id: toastProps.id ?? Date.now().toString(),
			};

			setToasts((prev) => [...prev, newToast]);
		};

		window.addEventListener(
			"toast" as keyof WindowEventMap,
			handleToast as EventListener,
		);

		return () => {
			window.removeEventListener(
				"toast" as keyof WindowEventMap,
				handleToast as EventListener,
			);
		};
	}, []);

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
		toast.dismiss(id);
	};

	return (
		<>
			{children}
			<div className="fixed z-[100] flex flex-col space-y-2 p-4">
				{toasts.map((toastProps) => (
					<Toast
						key={toastProps.id}
						{...toastProps}
						onClose={() => removeToast(toastProps.id!)}
					/>
				))}
			</div>
		</>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
	return { toast };
};

export { toast };
