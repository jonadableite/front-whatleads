//src/pages/Dashboard.tsx
import CustomDatePicker from "@/components/CustomDatePicker";
import { BarChart, LineChart, PieChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/services/auth.service";
import axios from "axios";
import { addDays, endOfDay, format, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
	Activity,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	Eye,
	Send,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "https://api.whatlead.com.br";

const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
	},
};

const StatCard = ({ icon: Icon, title, value, description }) => (
	<motion.div
		variants={itemVariants}
		className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric shadow-lg hover:shadow-electric transition-all duration-300"
	>
		<div className="flex items-center justify-between mb-4">
			<div className="p-2 bg-electric/10 rounded-lg">
				<Icon className="text-electric w-6 h-6" />
			</div>
			<span className="text-sm text-white/60">24h</span>
		</div>
		<h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
		<p className="text-sm text-white/60">{title}</p>
		<p className="text-xs text-white/40 mt-1">{description}</p>
	</motion.div>
);

// Função auxiliar para formatar o número de telefone
const formatPhoneNumber = (ownerJid: string) => {
	// Remove "@s.whatsapp.net" e qualquer outro texto após o "@"
	const number = ownerJid.split("@")[0];

	// Formata o número (ajuste conforme necessário)
	if (number.startsWith("55")) {
		return `+${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 9)}-${number.slice(9)}`;
	}

	return number;
};

const InstanceCard = ({ instance }) => (
	<motion.div
		variants={itemVariants}
		className="bg-deep/60 backdrop-blur-xl p-4 rounded-lg border border-electric/30 hover:bg-deep/80 transition-all duration-300"
	>
		<div className="flex items-center justify-between">
			<div className="flex items-center space-x-3">
				{instance.profilePicUrl ? (
					<img
						src={instance.profilePicUrl}
						alt={`Perfil de ${instance.instanceName}`}
						className="w-10 h-10 rounded-full object-cover"
					/>
				) : (
					<div className="w-10 h-10 rounded-full bg-electric/20 flex items-center justify-center">
						<User className="text-electric w-6 h-6" />
					</div>
				)}
				<div>
					<h4 className="font-medium text-white">{instance.instanceName}</h4>
					<p className="text-xs text-white/60">
						{instance.ownerJid
							? formatPhoneNumber(instance.ownerJid)
							: "Sem número"}
					</p>
				</div>
			</div>
			<div className="flex flex-col items-end">
				<span
					className={`text-xs px-2 py-1 rounded-full ${
						instance.connectionStatus === "open"
							? "bg-neon-green/20 text-neon-green"
							: "bg-red-500/20 text-red-500"
					}`}
				>
					{instance.connectionStatus === "open" ? "Conectado" : "Desconectado"}
				</span>
			</div>
		</div>
	</motion.div>
);

const getStatusIcon = (status) => {
	switch (status) {
		case "SERVER_ACK":
			return <Server className="text-yellow-500" />;
		case "DELIVERY_ACK":
			return <CheckCircle className="text-green-500" />;
		case "READ":
			return <Eye className="text-blue-500" />;
		default:
			return <Clock className="text-gray-500" />;
	}
};

const MessageLogItem = ({ log }) => (
	<div className="flex items-center justify-between p-4 bg-deep/40 rounded-lg border border-electric/20">
		<div className="flex items-center space-x-4">
			<div className="p-2 bg-electric/10 rounded-lg">
				{getStatusIcon(log.status)}
			</div>
			<div>
				<h4 className="font-medium text-white">{log.content}</h4>
				<div className="flex items-center space-x-2 text-sm text-white/60">
					<span>Enviado para: {log.campaignLead?.phone || "Sem número"}</span>
					<span>•</span>
					<span>
						{format(new Date(log.messageDate), "PP 'às' HH:mm", {
							locale: ptBR,
						})}
					</span>
				</div>
			</div>
		</div>
		<div className="text-right">
			<span
				className={`px-3 py-1 text-sm rounded-full ${
					log.status === "SERVER_ACK"
						? "bg-yellow-500/20 text-yellow-500"
						: log.status === "DELIVERY_ACK"
							? "bg-green-500/20 text-green-500"
							: log.status === "READ"
								? "bg-blue-500/20 text-blue-500"
								: "bg-gray-500/20 text-gray-500"
				}`}
			>
				{log.status === "SERVER_ACK"
					? "Enviado"
					: log.status === "DELIVERY_ACK"
						? "Entregue"
						: log.status === "READ"
							? "Lido"
							: "Pendente"}
			</span>
		</div>
	</div>
);

const PaginationButton = ({ onClick, disabled, children }) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className={`px-3 py-2 rounded-md ${
			disabled
				? "bg-deep/40 text-white/40 cursor-not-allowed"
				: "bg-electric/20 text-electric hover:bg-electric/30 transition-colors"
		}`}
	>
		{children}
	</button>
);

export default function Dashboard() {
	const [isLoading, setIsLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState<any>(null);
	const [messagesByDay, setMessagesByDay] = useState<Record<string, number>>(
		{},
	);
	const [instances, setInstances] = useState([]);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const { toast } = useToast();
	const user = authService.getUser();
	const [chartType, setChartType] = useState<"bar" | "line">("bar");
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [segmentDistribution, setSegmentDistribution] = useState<
		Record<string, number>
	>({});

	const logsPerPage = 5;
	const totalPages = Math.ceil(
		(dashboardData?.messageLogs?.length || 0) / logsPerPage,
	);
	const currentLogs =
		dashboardData?.messageLogs?.slice(
			(currentPage - 1) * logsPerPage,
			currentPage * logsPerPage,
		) || [];

	useEffect(() => {
		fetchDailyData(selectedDate);
	}, [selectedDate]);

	useEffect(() => {
		fetchMessagesByDay();
	}, []);

	const fetchDailyData = async (date: Date) => {
		try {
			setIsLoading(true);
			const token = authService.getToken();

			// Adicione um dia à data selecionada
			const adjustedDate = addDays(date, 1);
			const formattedDate = format(adjustedDate, "yyyy-MM-dd");

			console.log("Data ajustada para busca:", formattedDate);

			const [dashboardResponse, instancesResponse, leadsResponse] =
				await Promise.all([
					axios.get(`${API_URL}/api/message-logs/daily`, {
						headers: { Authorization: `Bearer ${token}` },
						params: { date: formattedDate },
					}),
					axios.get(`${API_URL}/api/instances`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					axios.get(`${API_URL}/api/leads`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

			console.log(
				"Resposta completa da API de leads:",
				JSON.stringify(leadsResponse.data, null, 2),
			);

			const segments = processSegmentData(leadsResponse.data);
			setSegmentDistribution(segments);

			setDashboardData(dashboardResponse.data);
			setInstances(instancesResponse.data.instances || []);

			setError(null);
		} catch (error) {
			console.error("Erro ao buscar dados diários:", error);
			setError("Erro ao carregar dados do dashboard");
			toast({
				title: "Erro",
				description: "Não foi possível carregar os dados do dashboard",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const processSegmentData = (data) => {
		let leads = [];
		if (data.data && Array.isArray(data.data.leads)) {
			leads = data.data.leads;
		} else if (Array.isArray(data.leads)) {
			leads = data.leads;
		} else if (Array.isArray(data)) {
			leads = data;
		}

		const segments = leads.reduce((acc, lead) => {
			if (lead.segment) {
				acc[lead.segment] = (acc[lead.segment] || 0) + 1;
			}
			return acc;
		}, {});

		console.log("Distribuição de segmentos processada:", segments);
		return segments;
	};

	const fetchMessagesByDay = async () => {
		try {
			const token = authService.getToken();
			const response = await axios.get(`${API_URL}/api/message-logs/by-day`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setMessagesByDay(response.data.messagesByDay);
		} catch (error) {
			console.error("Erro ao buscar mensagens por dia:", error);
		}
	};

	const formatChartData = (messagesByDay: Record<string, number>) => {
		const today = new Date();
		const end = endOfDay(today);
		const start = startOfDay(subDays(today, 6));

		const formattedData = [];
		for (let d = start; d <= end; d = addDays(d, 1)) {
			const dateKey = format(d, "yyyy-MM-dd");
			formattedData.push({
				date: format(d, "dd/MM", { locale: ptBR }),
				count: messagesByDay[dateKey] || 0,
			});
		}
		return formattedData;
	};

	const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedDate = new Date(event.target.value + "T00:00:00");
		setSelectedDate(selectedDate);
	};

	const stats = [
		{
			title: "Total de Mensagens",
			icon: Send,
			value: dashboardData?.stats?.total?.toLocaleString() || "0",
			description: "Total de mensagens enviadas",
		},
		{
			title: "Entregues",
			icon: CheckCircle,
			value: dashboardData?.stats?.delivered?.toLocaleString() || "0",
			description: "Mensagens entregues",
		},
		{
			title: "Lidas",
			icon: Eye,
			value: dashboardData?.stats?.read?.toLocaleString() || "0",
			description: "Mensagens lidas",
		},
		{
			title: "Taxa de Entrega",
			icon: Zap,
			value: `${dashboardData?.stats?.deliveryRate?.toFixed(2) || 0}%`,
			description: "Taxa de entrega",
		},
		{
			title: "Taxa de Leitura",
			icon: Activity,
			value: `${dashboardData?.stats?.readRate?.toFixed(2) || 0}%`,
			description: "Taxa de leitura",
		},
	];

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					{[...Array(6)].map((_, i) => (
						<Skeleton key={i} className="h-32 bg-deep/80" />
					))}
				</div>
				<Skeleton className="h-96 bg-deep/80 mb-8" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<Skeleton className="h-64 bg-deep/80 lg:col-span-2" />
					<Skeleton className="h-64 bg-deep/80" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8 flex items-center justify-center">
				<Card className="p-6 bg-deep/80 text-white">
					<h2 className="text-xl font-bold mb-2">Erro</h2>
					<p>{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-electric rounded-md hover:bg-electric/80 transition-colors"
					>
						Tentar novamente
					</button>
				</Card>
			</div>
		);
	}

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8"
		>
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-white mb-2">
					Bem-vindo, {user?.name}
				</h1>
				<p className="text-white/80">Aqui está um resumo das suas atividades</p>
			</div>

			<div className="mb-4">
				<CustomDatePicker
					selectedDate={selectedDate}
					onChange={(date: Date) => {
						// Subtraia um dia da data selecionada pelo usuário
						const adjustedDate = subDays(date, 1);
						setSelectedDate(adjustedDate);
					}}
					maxDate={subDays(new Date(), 1)} // Limite a seleção até ontem
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
				{stats.map((stat, index) => (
					<StatCard key={index} {...stat} />
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
				<motion.div
					variants={itemVariants}
					className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric lg:col-span-2"
				>
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-white">Mensagens por Dia</h2>
						<div className="space-x-2">
							<Button
								onClick={() => setChartType("bar")}
								variant={chartType === "bar" ? "default" : "outline"}
								className={`${
									chartType === "bar"
										? "bg-electric text-white"
										: "text-electric hover:bg-electric/10"
								}`}
							>
								Barra
							</Button>
							<Button
								onClick={() => setChartType("line")}
								variant={chartType === "line" ? "default" : "outline"}
								className={`${
									chartType === "line"
										? "bg-neon-green text-white"
										: "text-neon-green hover:bg-neon-green/10"
								}`}
							>
								Linha
							</Button>
						</div>
					</div>
					{chartType === "bar" ? (
						<BarChart
							data={formatChartData(messagesByDay)}
							xKey="date"
							yKey="count"
							fill="#7c3aed"
						/>
					) : (
						<LineChart
							data={formatChartData(messagesByDay)}
							xKey="date"
							yKey="count"
							stroke="#19eb4e"
						/>
					)}
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
				>
					<h2 className="text-2xl font-bold text-white mb-6">
						Distribuição de Segmentos
					</h2>
					{Object.keys(segmentDistribution).length > 0 ? (
						<PieChart
							data={Object.entries(segmentDistribution).map(
								([segment, count]) => ({
									segment: segment.replace("_", " ").toLowerCase(),
									count,
								}),
							)}
						/>
					) : (
						<p className="text-white">Nenhum dado de segmento disponível</p>
					)}
				</motion.div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
				<motion.div
					variants={itemVariants}
					className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric lg:col-span-2"
				>
					<h2 className="text-2xl font-bold text-white mb-6">
						Logs de Mensagens Recentes
					</h2>
					<div className="space-y-4 mb-4">
						{currentLogs.map((log, index) => (
							<MessageLogItem key={index} log={log} />
						))}
					</div>
					<div className="flex justify-between items-center mt-4">
						<p className="text-white/60">
							Página {currentPage} de {totalPages}
						</p>
						<div className="flex space-x-2">
							<PaginationButton
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="w-5 h-5" />
							</PaginationButton>
							<PaginationButton
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								disabled={currentPage === totalPages}
							>
								<ChevronRight className="w-5 h-5" />
							</PaginationButton>
						</div>
					</div>
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
				>
					<h2 className="text-2xl font-bold text-white mb-6">
						Suas Instâncias
					</h2>
					<div className="space-y-4">
						{instances.map((instance, index) => (
							<InstanceCard key={index} instance={instance} />
						))}
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}
