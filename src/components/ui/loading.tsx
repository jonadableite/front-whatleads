// src/components/ui/loading.tsx
import { motion } from "framer-motion";

export const Loading = () => {
	return (
		<div className="flex items-center justify-center space-x-2">
			<motion.div
				animate={{
					scale: [1, 2, 2, 1, 1],
					rotate: [0, 0, 270, 270, 0],
					borderRadius: ["20%", "20%", "50%", "50%", "20%"],
				}}
				transition={{
					duration: 2,
					ease: "easeInOut",
					times: [0, 0.2, 0.5, 0.8, 1],
					repeat: Number.POSITIVE_INFINITY,
					repeatDelay: 1,
				}}
				className="h-4 w-4 bg-primary"
			/>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="text-sm text-primary"
			>
				Carregando...
			</motion.div>
		</div>
	);
};
