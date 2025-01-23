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

interface LineChartProps {
	data: { date: string; count: number }[];
	xKey: string;
	yKey: string;
	stroke: string;
}

export function LineChart({ data, xKey, yKey, stroke }: LineChartProps) {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsLineChart data={data}>
				<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
				<XAxis dataKey={xKey} stroke="#94a3b8" />
				<YAxis stroke="#94a3b8" />
				<Tooltip
					cursor={{ stroke: "rgba(100, 100, 100, 0.2)", strokeWidth: 2 }}
					contentStyle={{
						backgroundColor: "#1e293b",
						border: "1px solid #7c3aed",
						borderRadius: "8px",
						boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
					}}
					labelStyle={{ color: "#f8fafc" }}
					itemStyle={{ color: "#f8fafc" }}
				/>
				<Line
					type="monotone"
					dataKey={yKey}
					stroke={stroke}
					strokeWidth={2}
					dot={{ fill: stroke, strokeWidth: 2 }}
				/>
			</RechartsLineChart>
		</ResponsiveContainer>
	);
}
