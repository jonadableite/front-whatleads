// src/components/ui/WarmupBadge.tsx
import { motion } from "framer-motion";

interface WarmupBadgeProps {
	progress: number;
	isRecommended: boolean;
}

export function WarmupBadge({ progress, isRecommended }: WarmupBadgeProps) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			className={`
        absolute top-2 right-2 px-3 py-1 rounded-full
        ${
					isRecommended
						? "bg-green-500/20 text-green-400 border border-green-500/30"
						: "bg-blue-500/20 text-blue-400 border border-blue-500/30"
				}
      `}
		>
			<div className="flex items-center gap-2">
				<div
					className={`w-2 h-2 rounded-full ${isRecommended ? "bg-green-400" : "bg-blue-400"} animate-pulse`}
				/>
				<span className="text-sm font-medium">
					{isRecommended ? "Recomendada" : `${progress}%`}
				</span>
			</div>
		</motion.div>
	);
}
