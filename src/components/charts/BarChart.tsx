// src/components/charts/BarChart.tsx
import {
	Bar,
	CartesianGrid,
	BarChart as RechartsBarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

const data = [
	{ name: "Seg", value: 400 },
	{ name: "Ter", value: 300 },
	{ name: "Qua", value: 600 },
	{ name: "Qui", value: 800 },
	{ name: "Sex", value: 500 },
	{ name: "Sab", value: 200 },
	{ name: "Dom", value: 300 },
];

export function BarChart() {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsBarChart data={data}>
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
				<Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
			</RechartsBarChart>
		</ResponsiveContainer>
	);
}
