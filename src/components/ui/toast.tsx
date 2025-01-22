// src/components/ui/toast.tsx
import { toast } from "react-toastify";

export const Toast = {
	success: (message: string) => {
		toast.success(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "dark",
			style: {
				background: "rgba(13, 13, 13, 0.9)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(0, 255, 106, 0.3)",
				color: "#fff",
			},
		});
	},
	error: (message: string) => {
		toast.error(message, {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "dark",
			style: {
				background: "rgba(13, 13, 13, 0.9)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(255, 0, 0, 0.3)",
				color: "#fff",
			},
		});
	},
};
