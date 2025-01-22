import type { LeadStatsCardProps } from "@/interface";
import { motion } from "framer-motion";
// src/components/leads/LeadStatsCard.tsx
import type React from "react";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

export const LeadStatsCard: React.FC<LeadStatsCardProps> = ({
	title,
	value,
	icon,
	trend,
}) => {
	return (
		<motion.div
			whileHover={{ scale: 1.05 }}
			className="bg-deep/30 p-6 rounded-lg shadow-lg"
		>
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold text-white">{title}</h3>
				<div className="text-neon-green">{icon}</div>
			</div>
			<div className="text-3xl font-bold text-white mb-2">{value}</div>
			{trend !== null && (
				<div
					className={`flex items-center ${trend > 0 ? "text-green-500" : "text-red-500"}`}
				>
					{trend > 0 ? <FiArrowUp /> : <FiArrowDown />}
					<span className="ml-1">{Math.abs(trend)}%</span>
				</div>
			)}
		</motion.div>
	);
};
