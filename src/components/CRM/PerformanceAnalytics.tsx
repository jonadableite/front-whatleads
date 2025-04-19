import { motion } from "framer-motion";
import { Clock, DollarSign, Target, TrendingUp } from "lucide-react";
// src/components/CRM/PerformanceAnalytics.tsx
import type React from "react";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const performanceData = [
	{ month: "Jan", conversions: 40, revenue: 2400 },
	{ month: "Fev", conversions: 30, revenue: 1398 },
	{ month: "Mar", conversions: 50, revenue: 3200 },
	{ month: "Abr", conversions: 45, revenue: 2800 },
	{ month: "Mai", conversions: 60, revenue: 4000 },
];

const PerformanceAnalytics: React.FC = () => {
	const kpis = [
		{
			icon: TrendingUp,
			label: "Taxa de Conversão",
			value: "45%",
			color: "text-green-500",
		},
		{
			icon: Target,
			label: "Leads Qualificados",
			value: "120",
			color: "text-blue-500",
		},
		{
			icon: DollarSign,
			label: "Receita Gerada",
			value: "R$ 85.000",
			color: "text-yellow-500",
		},
		{
			icon: Clock,
			label: "Tempo Médio de Conversão",
			value: "15 dias",
			color: "text-purple-500",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="bg-deep/50 rounded-xl p-6 text-white"
		>
			<h2 className="text-2xl font-bold mb-6">Performance Analytics</h2>

			<div className="grid md:grid-cols-4 gap-4 mb-8">
				{kpis.map((kpi, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="bg-deep/30 p-4 rounded-lg flex items-center space-x-4"
					>
						<kpi.icon className={`w-8 h-8 ${kpi.color}`} />
						<div>
							<p className="text-sm text-white/70">{kpi.label}</p>
							<p className="text-xl font-bold">{kpi.value}</p>
						</div>
					</motion.div>
				))}
			</div>

			<div className="bg-deep/30 rounded-lg p-6">
				<h3 className="text-lg font-semibold mb-4">Performance Mensal</h3>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={performanceData}>
						<XAxis dataKey="month" stroke="#888" />
						<YAxis stroke="#888" />
						<Tooltip
							contentStyle={{
								backgroundColor: "#1e1e2f",
								border: "none",
							}}
						/>
						<Bar dataKey="conversions" fill="#3182ce" barSize={20} />
						<Bar dataKey="revenue" fill="#48bb78" barSize={20} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default PerformanceAnalytics;
