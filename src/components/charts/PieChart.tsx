// src/components/charts/PieChart.tsx
import {
	Cell,
	Legend,
	Pie,
	PieChart as RechartsPieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

const COLORS = ["#7c3aed", "#00FF6A", "#3b82f6", "#f59e0b", "#ef4444"];

export function PieChart({ data }) {
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
					dataKey="count"
					nameKey="segment"
					label
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
				<Legend />
			</RechartsPieChart>
		</ResponsiveContainer>
	);
}
