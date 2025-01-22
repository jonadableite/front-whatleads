import { BarChart, PieChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/services/auth.service";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
	Activity,
	CheckCircle,
	Clock,
	Eye,
	Send,
	Wifi,
	WifiOff,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:9000";

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

const InstanceCard = ({ instance }) => (
	<motion.div
		variants={itemVariants}
		className="bg-deep/60 backdrop-blur-xl p-4 rounded-lg border border-electric/30 hover:bg-deep/80 transition-all duration-300"
	>
		<div className="flex items-center justify-between">
			<div className="flex items-center space-x-3">
				<div
					className={`p-2 rounded-full ${instance.connectionStatus === "open" ? "bg-neon-green/20" : "bg-red-500/20"}`}
				>
					{instance.connectionStatus === "open" ? (
						<Wifi className="text-neon-green w-4 h-4" />
					) : (
						<WifiOff className="text-red-500 w-4 h-4" />
					)}
				</div>
				<div>
					<h4 className="font-medium text-white">{instance.instanceName}</h4>
					<p className="text-xs text-white/60">
						{instance.phoneNumber || "Sem número"}
					</p>
				</div>
			</div>
			<span
				className={`text-xs px-2 py-1 rounded-full ${instance.connectionStatus === "open" ? "bg-neon-green/20 text-neon-green" : "bg-red-500/20 text-red-500"}`}
			>
				{instance.connectionStatus === "open" ? "Conectado" : "Desconectado"}
			</span>
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
				<p className="text-sm text-white/60">
					Enviado em {format(new Date(log.messageDate), "PP", { locale: ptBR })}
				</p>
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

export default function Dashboard() {
	const [isLoading, setIsLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState<any>(null);
	const [instances, setInstances] = useState([]);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();
	const user = authService.getUser();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				const token = authService.getToken();
				const [dashboardResponse, instancesResponse] = await Promise.all([
					axios.get(`${API_URL}/api/message-logs`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					axios.get(`${API_URL}/api/instances`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				setDashboardData(dashboardResponse.data);
				setInstances(instancesResponse.data.instances || []);
				setError(null);
			} catch (error) {
				console.error("Erro ao buscar dados:", error);
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

		fetchData();

		const interval = setInterval(async () => {
			try {
				const token = authService.getToken();
				const realtimeStats = await axios.get(
					`${API_URL}/api/message-logs/realtime`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				setDashboardData((prev) => ({
					...prev,
					stats: {
						...prev.stats,
						...realtimeStats.data,
					},
				}));
			} catch (error) {
				console.error("Erro ao atualizar dados em tempo real:", error);
			}
		}, 30000);

		return () => clearInterval(interval);
	}, []);

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

	const calculateStats = (messageLogs) => {
		const total = messageLogs.length;
		const delivered = messageLogs.filter(
			(log) => log.status === "DELIVERY_ACK" || log.status === "READ",
		).length;
		const read = messageLogs.filter((log) => log.status === "READ").length;

		return {
			total,
			delivered,
			read,
			deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
			readRate: total > 0 ? (read / total) * 100 : 0,
		};
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
			value: `${dashboardData?.stats?.deliveryRate.toFixed(2) || 0}%`,
			description: "Taxa de entrega",
		},
		{
			title: "Taxa de Leitura",
			icon: Activity,
			value: `${dashboardData?.stats?.readRate.toFixed(2) || 0}%`,
			description: "Taxa de leitura",
		},
	];

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
					<h2 className="text-2xl font-bold text-white mb-6">
						Mensagens por Dia
					</h2>
					<BarChart
						data={Object.entries(dashboardData?.messagesByDay || {}).map(
							([date, count]) => ({ date, count }),
						)}
						xKey="date"
						yKey="count"
						fill="#6EE7B7"
					/>
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
				>
					<h2 className="text-2xl font-bold text-white mb-6">
						Distribuição de Status
					</h2>
					<PieChart
						data={Object.entries(dashboardData?.statusDistribution || {}).map(
							([status, count]) => ({ status, count }),
						)}
						nameKey="status"
						dataKey="count"
					/>
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
					<div className="space-y-4">
						{(dashboardData?.messageLogs || []).map((log, index) => (
							<MessageLogItem key={index} log={log} />
						))}
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
