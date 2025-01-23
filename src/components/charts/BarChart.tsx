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

interface BarChartProps {
	data: { date: string; count: number }[];
	xKey: string;
	yKey: string;
	fill: string;
}

export function BarChart({ data, xKey, yKey, fill }: BarChartProps) {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsBarChart data={data}>
				<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
				<XAxis dataKey={xKey} stroke="#94a3b8" />
				<YAxis stroke="#94a3b8" />
				<Tooltip
					cursor={{ fill: "rgba(100, 100, 100, 0.2)" }}
					contentStyle={{
						backgroundColor: "#1e293b",
						border: "1px solid #7c3aed",
						borderRadius: "8px",
						boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
					}}
					labelStyle={{ color: "#f8fafc" }}
					itemStyle={{ color: "#f8fafc" }}
				/>
				<Bar dataKey={yKey} fill={fill} radius={[4, 4, 0, 0]} />
			</RechartsBarChart>
		</ResponsiveContainer>
	);
}
