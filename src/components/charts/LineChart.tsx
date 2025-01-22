// src/components/charts/LineChart.tsx
import {
	CartesianGrid,
	Line,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const data = [
	{ name: "Jan", value: 65 },
	{ name: "Fev", value: 59 },
	{ name: "Mar", value: 80 },
	{ name: "Abr", value: 81 },
	{ name: "Mai", value: 56 },
	{ name: "Jun", value: 75 },
	{ name: "Jul", value: 85 },
];

export function LineChart() {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsLineChart data={data}>
				<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
				<XAxis dataKey="name" stroke="#94a3b8" />
				<YAxis stroke="#94a3b8" />
				<Tooltip
					contentStyle={{
						backgroundColor: "#1e293b",
						border: "1px solid #7c3aed",
						borderRadius: "8px",
					}}
					labelStyle={{ color: "#f8fafc" }}
				/>
				<Line
					type="monotone"
					dataKey="value"
					stroke="#00FF6A"
					strokeWidth={2}
					dot={{ fill: "#00FF6A", strokeWidth: 2 }}
				/>
			</RechartsLineChart>
		</ResponsiveContainer>
	);
}
