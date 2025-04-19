// src/components/CRM/LeadFunnel.tsx
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";

const stageTitles = [
	"Prospecção",
	"Qualificação",
	"Proposta",
	"Negociação",
	"Fechamento",
];

const stageColors = [
	"bg-blue-500/20",
	"bg-yellow-500/20",
	"bg-green-500/20",
	"bg-purple-500/20",
	"bg-neon-green/20",
];

export default function LeadFunnel() {
	const funnelStages = [
		{
			title: "Prospecção",
			color: "bg-blue-500/20",
			leads: 150,
			conversion: 60,
		},
		{
			title: "Qualificação",
			color: "bg-yellow-500/20",
			leads: 90,
			conversion: 45,
		},
		{
			title: "Proposta",
			color: "bg-green-500/20",
			leads: 45,
			conversion: 30,
		},
		{
			title: "Negociação",
			color: "bg-purple-500/20",
			leads: 15,
			conversion: 10,
		},
		{
			title: "Fechamento",
			color: "bg-neon-green/20",
			leads: 5,
			conversion: 5,
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
		>
			<div className="flex items-center mb-6">
				<TrendingUp className="text-electric mr-3 w-8 h-8" />
				<h2 className="text-2xl font-bold text-white">Funil de Vendas</h2>
			</div>

			<div className="flex justify-between items-stretch space-x-4">
				{funnelStages.map((stage, index) => (
					<motion.div
						key={stage.title}
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{
							delay: index * 0.2,
							type: "spring",
							stiffness: 300,
						}}
						className={`
              flex-1 p-4 rounded-lg ${stage.color}
              flex flex-col justify-between
              hover:scale-105 transition-transform
            `}
					>
						<div>
							<h3 className="text-lg font-bold text-white mb-2">
								{stage.title}
							</h3>
							<div className="flex justify-between text-white/80 mb-2">
								<span>Leads:</span>
								<span>{stage.leads}</span>
							</div>
							<div className="flex justify-between text-white/80">
								<span>Conversão:</span>
								<span>{stage.conversion}%</span>
							</div>
						</div>
						{index < funnelStages.length - 1 && (
							<div className="mt-4 flex justify-center">
								<ArrowRight className="text-white/50" />
							</div>
						)}
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}
