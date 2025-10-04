// src/pages/Dashboard.tsx
import CustomDatePicker from "@/components/CustomDatePicker";
import { BarChart, LineChart, PieChart } from "@/components/charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/services/auth.service";
import { addDays, endOfDay, format, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
	Activity,
	BarChart3,
	CheckCircle,
	Clock,
	Eye,
	Send,
	Server,
	User,
	Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";

// Adicionar novos tipos para atividades
interface Activity {
	id: string;
	type: 'campaign' | 'instance' | 'message' | 'warning' | 'info';
	title: string;
	description: string;
	timestamp: Date;
	status: 'success' | 'warning' | 'error' | 'info';
}

interface InstanceHealth {
	profileName: string;
	instanceName: string;
	status: string;
	profilePicUrl?: string;
	ownerJid?: string;
	lastActive?: Date;
	messagesSent?: number;
	messagesReceived?: number;
	warmupProgress?: number;
	warmupTime?: number;
}

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

const getActivityIcon = (type: Activity['type']) => {
	switch (type) {
		case 'campaign':
			return <Send className="w-5 h-5" />;
		case 'instance':
			return <Server className="w-5 h-5" />;
		case 'message':
			return <CheckCircle className="w-5 h-5" />;
		case 'warning':
			return <Clock className="w-5 h-5" />;
		case 'info':
			return <Activity className="w-5 h-5" />;
		default:
			return <Activity className="w-5 h-5" />;
	}
};

const getActivityColor = (status: Activity['status']) => {
	switch (status) {
		case 'success':
			return 'text-neon-green bg-neon-green/20';
		case 'warning':
			return 'text-yellow-500 bg-yellow-500/20';
		case 'error':
			return 'text-red-500 bg-red-500/20';
		case 'info':
			return 'text-electric bg-electric/20';
		default:
			return 'text-white/60 bg-white/10';
	}
};

const ActivityItem = ({ activity }: { activity: Activity }) => (
	<motion.div
		variants={itemVariants}
		className="flex items-start space-x-4 p-4 bg-deep/40 rounded-lg border border-electric/20 hover:bg-deep/60 transition-all duration-300"
	>
		<div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
			{getActivityIcon(activity.type)}
		</div>
		<div className="flex-1 min-w-0">
			<h4 className="font-medium text-white truncate">{activity.title}</h4>
			<p className="text-sm text-white/60 mt-1">{activity.description}</p>
			<span className="text-xs text-white/40 mt-2 block">
				{format(activity.timestamp, "PPp", { locale: ptBR })}
			</span>
		</div>
		<div className={`px-2 py-1 rounded-full text-xs ${getActivityColor(activity.status)}`}>
			{activity.status === 'success' ? 'Sucesso' :
				activity.status === 'warning' ? 'Atenção' :
					activity.status === 'error' ? 'Erro' : 'Info'}
		</div>
	</motion.div>
);

// Componente ProgressBar baseado no front-warmup
const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
	<div className="mb-6">
		<div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
			<span className="font-medium text-gray-300">{label}</span>
			<span className="font-bold">{value.toFixed(2)}%</span>
		</div>
		<div className="w-full bg-gray-200 dark:bg-whatsapp-profundo rounded-full h-3 overflow-hidden">
			<motion.div
				initial={{ width: 0 }}
				animate={{ width: `${value}%` }}
				transition={{ duration: 0.8, type: "spring" }}
				className={`${color} h-full rounded-full`}
			/>
		</div>
	</div>
);

const InstanceHealthCard = ({ instance }: { instance: InstanceHealth }) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'OPEN':
			case 'CONNECTED':
				return 'bg-neon-green/20 text-neon-green border-neon-green/30';
			case 'CONNECTING':
				return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
			case 'DISCONNECTED':
			case 'CLOSED':
			case 'OFFLINE':
				return 'bg-red-500/20 text-red-500 border-red-500/30';
			default:
				return 'bg-white/20 text-white/60 border-white/30';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'OPEN':
			case 'CONNECTED':
				return 'Conectado';
			case 'CONNECTING':
				return 'Conectando';
			case 'DISCONNECTED':
			case 'CLOSED':
				return 'Desconectado';
			case 'OFFLINE':
				return 'Offline';
			default:
				return status;
		}
	};

	// Usar o progresso de warmup já calculado ou calcular baseado no warmupTime
	const progressValue = instance.warmupProgress !== undefined
		? instance.warmupProgress
		: (typeof instance.warmupTime === "number" && instance.warmupTime > 0
			? Math.min((instance.warmupTime / (400 * 3600)) * 100, 100)
			: 0);

	console.log(`Dashboard - InstanceCard ${instance.instanceName}:`, {
		warmupProgress: instance.warmupProgress,
		warmupTime: instance.warmupTime,
		progressValue: progressValue.toFixed(2) + '%'
	});

	return (
		<motion.div
			variants={itemVariants}
			className="bg-deep/60 backdrop-blur-xl p-4 rounded-lg border border-electric/30 hover:bg-deep/80 transition-all duration-300"
		>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center space-x-3">
					{instance.profilePicUrl ? (
						<img
							src={instance.profilePicUrl}
							alt={`Perfil de ${instance.instanceName}`}
							className="w-8 h-8 rounded-full object-cover"
						/>
					) : (
						<div className="w-8 h-8 rounded-full bg-electric/20 flex items-center justify-center">
							<User className="text-electric w-4 h-4" />
						</div>
					)}
					<div>
						<h4 className="font-medium text-white text-sm">{instance.profileName}</h4>
						<p className="text-xs text-white/60">
							{instance.ownerJid ? formatPhoneNumber(instance.ownerJid) : "Sem número"}
						</p>
					</div>
				</div>
				<span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(instance.status)}`}>
					{getStatusText(instance.status)}
				</span>
			</div>

			{/* Nova seção com barra de progresso individual para cada instância */}
			<div className="mt-4">
				<div className="flex-grow">
					<ProgressBar
						label={instance.instanceName}
						value={progressValue}
						color={
							progressValue >= 100 ? "bg-green-500" : "bg-blue-500"
						}
					/>
				</div>
			</div>
		</motion.div>
	);
};

// Função auxiliar para formatar o número de telefone
const formatPhoneNumber = (ownerJid: string) => {
	// Remove "@s.whatsapp.net" e qualquer outro texto após o "@"
	const number = ownerJid.split("@")[0];
	// Formata o número (ajuste conforme necessário)
	if (number.startsWith("55")) {
		// Exemplo: 5511987654321 -> +55 11 98765-4321
		return `+${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(4, 9)}-${number.slice(9)}`;
	}
	return number;
};





export default function Dashboard() {
	const { toast } = useToast();
	const user = authService.getUser();
	const [chartType, setChartType] = useState<"bar" | "line">("bar");
	const [selectedDate, setSelectedDate] = useState(new Date());

	// Preparar URLs para SWR
	const adjustedDate = addDays(selectedDate, 1);
	const formattedDate = format(adjustedDate, "yyyy-MM-dd");

	// SWR hooks para buscar dados
	const { data: dashboardData, error: dashboardError, isLoading: isDashboardLoading } = useSWR(
		`/api/message-logs/daily?date=${formattedDate}`,
		fetcher
	);

	const { data: instancesData, error: instancesError, isLoading: isInstancesLoading } = useSWR(
		"/api/instances",
		fetcher
	);

	const { data: leadsData, error: leadsError, isLoading: isLeadsLoading } = useSWR(
		"/api/leads",
		fetcher
	);

	const { data: messagesByDayData, error: messagesByDayError, isLoading: isMessagesByDayLoading } = useSWR(
		"/api/message-logs/by-day",
		fetcher
	);

	// Hooks para dados reais
	const { data: campaignsData } = useSWR('/api/campaigns', fetcher);
	const { data: messageLogsData } = useSWR('/api/message-logs', fetcher);

	// Estados derivados - sem dependência de warmup-stats
	const isLoading = isDashboardLoading || isInstancesLoading || isLeadsLoading || isMessagesByDayLoading;
	const error = dashboardError || instancesError || leadsError || messagesByDayError;
	const instances = instancesData?.instances || [];
	const messagesByDay = messagesByDayData?.messagesByDay || {};

	// Função para gerar atividades recentes baseadas em dados reais
	const generateRecentActivities = (): Activity[] => {
		const activities: Activity[] = [];
		const now = new Date();

		// Atividades de campanhas
		if (campaignsData?.data) {
			campaignsData.data.slice(0, 3).forEach((campaign: { id: string; name: string; status: string; startedAt?: string; completedAt?: string; updatedAt: string }) => {
				if (campaign.status === 'running') {
					activities.push({
						id: `campaign-${campaign.id}`,
						type: 'campaign',
						title: 'Campanha iniciada',
						description: `Campanha "${campaign.name}" foi iniciada`,
						timestamp: new Date(campaign.startedAt || campaign.updatedAt || now),
						status: 'success'
					});
				} else if (campaign.status === 'completed') {
					activities.push({
						id: `campaign-completed-${campaign.id}`,
						type: 'campaign',
						title: 'Campanha finalizada',
						description: `Campanha "${campaign.name}" foi finalizada`,
						timestamp: new Date(campaign.completedAt || campaign.updatedAt || now),
						status: 'info'
					});
				}
			});
		}

		// Atividades de instâncias
		if (instancesData?.instances) {
			instancesData.instances.slice(0, 2).forEach((instance: { id: string; instanceName: string; connectionStatus: string; updatedAt: string }) => {
				if (instance.connectionStatus === 'OPEN') {
					activities.push({
						id: `instance-${instance.id}`,
						type: 'instance',
						title: 'Instância conectada',
						description: `Instância "${instance.instanceName}" foi conectada`,
						timestamp: new Date(instance.updatedAt || now),
						status: 'success'
					});
				}
			});
		}

		// Atividades de mensagens (logs recentes)
		if (messageLogsData?.data) {
			messageLogsData.data.slice(0, 2).forEach((log: { id: string; status: string; sentAt?: string; createdAt: string; lead?: { phone: string }; campaignLead?: { phone: string } }) => {
				activities.push({
					id: `message-${log.id}`,
					type: 'message',
					title: 'Mensagem enviada',
					description: `Mensagem enviada para ${log.lead?.phone || log.campaignLead?.phone || 'contato'}`,
					timestamp: new Date(log.sentAt || log.createdAt || now),
					status: log.status === 'delivered' ? 'success' : log.status === 'failed' ? 'error' : 'info'
				});
			});
		}

		// Atividade de limite de mensagens (simulada)
		if (dashboardData?.stats?.total > 50) {
			activities.push({
				id: 'limit-warning',
				type: 'warning',
				title: 'Alto volume de mensagens',
				description: 'Monitorando uso para evitar bloqueios',
				timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
				status: 'warning'
			});
		}

		// Atividade informativa
		activities.push({
			id: 'info-activity',
			type: 'info',
			title: 'Sistema atualizado',
			description: 'Dashboard atualizado com novas funcionalidades',
			timestamp: new Date(Date.now() - 21600000), // 6 horas atrás
			status: 'info'
		});

		// Ordenar por timestamp (mais recente primeiro)
		return activities
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, 10); // Limitar a 10 atividades mais recentes
	};

	// Preparar dados de saúde das instâncias com fallback
	const prepareInstancesHealth = (instances: any[]): InstanceHealth[] => {
		if (!Array.isArray(instances)) return [];

		console.log('Dashboard - Dados recebidos das instâncias:', instances);

		return instances.map((instance: any) => {
			// Usar dados reais de warmupStatus se disponíveis (já calculado pelo backend)
			let warmupProgress = 0;
			let warmupTime = 0;
			let messagesSent = 0;
			let messagesReceived = 0;

			console.log(`Dashboard - Processando instância ${instance.instanceName}:`, {
				warmupStatus: instance.warmupStatus,
				warmupStats: instance.warmupStats,
				connectionStatus: instance.connectionStatus
			});

			// Priorizar warmupStats se disponível, senão usar warmupStatus
			if (instance.warmupStats && Array.isArray(instance.warmupStats) && instance.warmupStats.length > 0) {
				// Ordenar por createdAt e pegar o mais recente
				const sortedStats = instance.warmupStats.sort((a: any, b: any) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
				const latestStat = sortedStats[0];

				if (latestStat && latestStat.warmupTime) {
					warmupTime = latestStat.warmupTime;
					warmupProgress = Math.min((warmupTime / (400 * 3600)) * 100, 100);
				}

				console.log(`Dashboard - Usando warmupStats para ${instance.instanceName}:`, {
					warmupTime,
					progress: warmupProgress,
					latestStat
				});
			}
			// Usar warmupStatus do backend se warmupStats não estiver disponível
			else if (instance.warmupStatus && instance.warmupStatus.progress > 0) {
				warmupProgress = instance.warmupStatus.progress || 0;
				warmupTime = instance.warmupStatus.warmupHours ? instance.warmupStatus.warmupHours * 3600 : 0;

				console.log(`Dashboard - Usando warmupStatus para ${instance.instanceName}:`, {
					progress: warmupProgress,
					warmupHours: instance.warmupStatus.warmupHours
				});
			}
			// Fallback: simular baseado no status e tempo ativo (apenas se não houver dados reais)
			else {
				console.log(`Dashboard - Usando fallback para ${instance.instanceName}`);

				const now = new Date();
				const createdAt = instance.createdAt ? new Date(instance.createdAt) : now;
				const hoursActive = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

				if (instance.connectionStatus === 'OPEN') {
					// Usar 400 horas como o backend para consistência
					warmupTime = Math.min(hoursActive * 3600, 400 * 3600); // Máximo 400 horas em segundos
					warmupProgress = Math.min((warmupTime / (400 * 3600)) * 100, 100);
				}
			}

			// Calcular mensagens baseado no progresso (mantendo a lógica existente)
			if (warmupProgress > 0) {
				messagesSent = Math.floor(warmupProgress * 2); // 2 mensagens por % de progresso
				messagesReceived = Math.floor(warmupProgress * 1.5); // 1.5 mensagens recebidas por % de progresso
			}

			return {
				profileName: instance.profileName || instance.profileName || '',
				instanceName: instance.instanceName || instance.name || 'Instância',
				status: instance.connectionStatus || 'DISCONNECTED',
				ownerJid: instance.ownerJid || instance.owner,
				profilePicUrl: instance.profilePicUrl,
				messagesSent,
				messagesReceived,
				warmupProgress,
				warmupTime
			};
		});
	};

	const recentActivities = generateRecentActivities();
	const instancesHealth = prepareInstancesHealth(instances);

	const processSegmentData = (data: { data?: { leads?: Array<{ segment?: string }> }; leads?: Array<{ segment?: string }> } | Array<{ segment?: string }>) => {
		let leads: Array<{ segment?: string }> = [];
		if (data && typeof data === 'object' && 'data' in data && data.data && Array.isArray(data.data.leads)) {
			leads = data.data.leads;
		} else if (data && typeof data === 'object' && 'leads' in data && Array.isArray(data.leads)) {
			leads = data.leads;
		} else if (Array.isArray(data)) {
			leads = data;
		}

		const segments = leads.reduce((acc: Record<string, number>, lead: { segment?: string }) => {
			if (lead.segment) {
				acc[lead.segment] = (acc[lead.segment] || 0) + 1;
			}
			return acc;
		}, {});

		return segments;
	};

	// Processar dados de segmentos
	const segmentDistribution = leadsData ? processSegmentData(leadsData) : {};

	const formatChartData = (messagesByDay: Record<string, number>) => {
		const today = new Date();
		const end = endOfDay(today);
		const start = startOfDay(subDays(today, 6));
		const formattedData: Array<{ date: string; count: number }> = [];

		for (let d = start; d <= end; d = addDays(d, 1)) {
			const dateKey = format(d, "yyyy-MM-dd");
			formattedData.push({
				date: format(d, "dd/MM", { locale: ptBR }),
				count: messagesByDay[dateKey] || 0,
			});
		}
		return formattedData;
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

	// Tratamento de erro com useEffect para evitar setState durante render
	useEffect(() => {
		if (error) {
			// console.error("Erro ao buscar dados:", error);

			// Apenas mostrar toast se não for erro de autenticação
			if (!(error.message?.includes("Token") || error.status === 401)) {
				toast({
					title: "Erro ao carregar dados",
					description: "Não foi possível carregar os dados do dashboard",
					variant: "destructive",
				});
			}

			// Redirecionar para login apenas se for erro de autenticação e não estivermos já redirecionando
			if ((error.message?.includes("Token") || error.status === 401) && window.location.pathname !== "/login") {
				authService.logout(() => {
					// Usar navigate ao invés de window.location para evitar recarregamento forçado
					setTimeout(() => {
						window.location.href = "/login";
					}, 100);
				});
			}
		}
	}, [error, toast]);

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
					<p>{error.message || "Erro ao carregar dados"}</p>
					<button
						onClick={() => {
							// Revalidar dados sem recarregar a página
							mutate('/api/dashboard-stats');
							mutate('/api/campaigns');
							mutate('/api/message-logs');
							mutate('/api/instances');
						}}
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
						// Isso é necessário porque o componente DatePicker pode retornar a data no fuso horário local
						// e a API espera a data no formato 'yyyy-MM-dd'.
						// Subtrair um dia garante que a data enviada para a API seja o dia selecionado pelo usuário.
						const adjustedDate = subDays(date, 1); // Subtrai 1 dia
						setSelectedDate(adjustedDate);
					}}
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
						<div className="flex items-center space-x-2 bg-deep/50 rounded-full p-1">
							<Button
								onClick={() => setChartType("bar")}
								variant={chartType === "bar" ? "default" : "ghost"}
								className={`
        rounded-full transition-all duration-300
        ${chartType === "bar"
										? "bg-electric text-white shadow-lg shadow-electric/30"
										: "text-white/60 hover:text-white hover:bg-electric/10"
									}
      `}
							>
								<BarChart3 className="w-5 h-5 mr-2" />
								Barra
							</Button>
							<Button
								onClick={() => setChartType("line")}
								variant={chartType === "line" ? "default" : "ghost"}
								className={`
        rounded-full transition-all duration-300
        ${chartType === "line"
										? "bg-neon-green text-white shadow-lg shadow-neon-green/30"
										: "text-white/60 hover:text-white hover:bg-neon-green/10"
									}
      `}
							>
								<Activity className="w-5 h-5 mr-2" />
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
							yKeys={["count"]}
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
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-white">Atividades Recentes</h2>
						<div className="flex items-center space-x-2">
							<Activity className="w-5 h-5 text-electric" />
						</div>
					</div>
					<div className="space-y-4">
						{recentActivities.length > 0 ? (
							recentActivities.map((activity) => (
								<ActivityItem key={activity.id} activity={activity} />
							))
						) : (
							<div className="text-center py-8">
								<Activity className="w-12 h-12 text-white/40 mx-auto mb-4" />
								<p className="text-white/60">Nenhuma atividade recente</p>
							</div>
						)}
					</div>
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric"
				>
					<h2 className="text-2xl font-bold text-white mb-6">
						Instâncias
					</h2>
					<div className="space-y-4">
						{instancesHealth.length > 0 ? (
							instancesHealth.map((instance) => (
								<InstanceHealthCard key={instance.instanceName} instance={instance} />
							))
						) : (
							<div className="text-center py-8">
								<Server className="w-12 h-12 text-white/40 mx-auto mb-4" />
								<p className="text-white/60">Nenhuma instância encontrada</p>
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}
