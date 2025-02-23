// src/components/charts/LineChart.tsx
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	CartesianGrid,
	Line,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Interface para definir a estrutura dos dados do gráfico
interface ChartDataPoint {
	[key: string]: number | string;
	date: string;
	count: number;
	completed?: number;
	pending?: number;
	overdue?: number;
}

interface LineChartProps {
	data?: ChartDataPoint[];
	xKey?: keyof ChartDataPoint;
	yKeys?: (keyof ChartDataPoint)[];
	colors?: string[];
}

export function LineChart({
	data = [],
	xKey = "date",
	yKeys = ["count"],
	colors = ["#19eb4e"],
}: LineChartProps) {
	const formatDate = (dateString: string) => {
		const date = parseISO(dateString);
		return isValid(date)
			? format(date, "dd/MM/yyyy", { locale: ptBR })
			: dateString;
	};

	// Adicione uma verificação para dados vazios
	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center h-full text-white/60"></div>
		);
	}

	const formattedData = data.map((item) => ({
		...item,
		[xKey]: formatDate(item[xKey] as string),
	}));

	return (
		<ResponsiveContainer width="100%" height={300}>
			<RechartsLineChart data={formattedData}>
				<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
				<XAxis
					dataKey={xKey as string}
					stroke="#94a3b8"
					tickFormatter={(value) => {
						const date = parseISO(value);
						return isValid(date)
							? format(date, "dd/MM", { locale: ptBR })
							: value;
					}}
				/>
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
					labelFormatter={(label) => {
						const date = parseISO(label);
						return isValid(date)
							? format(date, "dd/MM/yyyy", { locale: ptBR })
							: label;
					}}
				/>
				{yKeys.map((key, index) => (
					<Line
						key={String(key)}
						type="monotone"
						dataKey={key as string}
						stroke={colors[index % colors.length]}
						strokeWidth={2}
						dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
					/>
				))}
			</RechartsLineChart>
		</ResponsiveContainer>
	);
}
