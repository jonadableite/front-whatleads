// src/components/charts/PieChart.tsx
import {
	Cell,
	Pie,
	PieChart as RechartsPieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

const data = [
	{ name: "Ativos", value: 400 },
	{ name: "Inativos", value: 300 },
	{ name: "Novos", value: 200 },
];

const COLORS = ["#7c3aed", "#00FF6A", "#3b82f6"];

export function PieChart() {
	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsPieChart>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={60}
					outerRadius={80}
					fill="#8884d8"
					paddingAngle={5}
					dataKey="value"
				>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
					))}
				</Pie>
				<Tooltip
					contentStyle={{
						backgroundColor: "#1e293b",
						border: "1px solid #7c3aed",
						borderRadius: "8px",
					}}
					labelStyle={{ color: "#f8fafc" }}
				/>
			</RechartsPieChart>
		</ResponsiveContainer>
	);
}
