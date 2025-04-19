// src/components/CRM/PerformanceAnalytics.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PerformanceAnalytics = () => {
	// Dados de exemplo
	const conversationData = [
		{ name: 'Seg', mensagens: 40 },
		{ name: 'Ter', mensagens: 30 },
		{ name: 'Qua', mensagens: 60 },
		{ name: 'Qui', mensagens: 45 },
		{ name: 'Sex', mensagens: 72 },
		{ name: 'Sab', mensagens: 25 },
		{ name: 'Dom', mensagens: 15 },
	];

	const statusData = [
		{ name: 'Abertas', value: 35, color: '#3b82f6' },
		{ name: 'Pendentes', value: 15, color: '#eab308' },
		{ name: 'Fechadas', value: 50, color: '#22c55e' },
	];

	const COLORS = statusData.map(item => item.color);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div className="bg-deep/30 rounded-xl p-6">
				<h2 className="text-xl font-bold mb-4 text-white">Volume de Mensagens</h2>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={conversationData}
							margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#333" />
							<XAxis dataKey="name" stroke="#fff" />
							<YAxis stroke="#fff" />
							<Tooltip
								contentStyle={{ backgroundColor: '#192233', borderColor: '#0ea5e9', color: '#fff' }}
								labelStyle={{ color: '#fff' }}
							/>
							<Bar dataKey="mensagens" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="bg-deep/30 rounded-xl p-6">
				<h2 className="text-xl font-bold mb-4 text-white">Status das Conversas</h2>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={statusData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
								outerRadius={80}
								fill="#8884d8"
								dataKey="value"
							>
								{statusData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{ backgroundColor: '#192233', borderColor: '#0ea5e9', color: '#fff' }}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
				<div className="flex justify-center mt-4 space-x-4">
					{statusData.map((entry, index) => (
						<div key={`legend-${index}`} className="flex items-center">
							<div
								className="w-3 h-3 rounded-full mr-1"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="text-white text-sm">{entry.name}: {entry.value}</span>
						</div>
					))}
				</div>
			</div>

			{/* Indicadores de Desempenho */}
			<div className="bg-deep/30 rounded-xl p-6 col-span-1 lg:col-span-2">
				<h2 className="text-xl font-bold mb-4 text-white">Indicadores de Desempenho</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{[
						{ title: "Tempo Médio de Resposta", value: "5.2 min", change: "+0.8%", positive: true },
						{ title: "Taxa de Resolução", value: "78%", change: "+2.4%", positive: true },
						{ title: "Satisfação do Cliente", value: "4.7/5.0", change: "-0.3%", positive: false }
					].map((metric, index) => (
						<div key={index} className="bg-deep/30 rounded-lg p-4">
							<h3 className="text-white/70 text-sm font-medium">{metric.title}</h3>
							<p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
							<div className={`text-sm mt-2 ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
								{metric.change} vs semana anterior
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PerformanceAnalytics;
