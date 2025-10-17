// src/pages/Dashboard.tsx
import CustomDatePicker from "@/components/CustomDatePicker";
import { BarChart, LineChart, PieChart } from "@/components/charts";
import {
	Area,
	AreaChart,
	CartesianGrid,
	PolarAngleAxis,
	PolarGrid,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { TerminalCard, useTerminalCardConfig } from "@/components/ui/TerminalCard";
import { authService } from "@/services/auth.service";
import { addDays, endOfDay, format, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
	Activity,
	AlertCircle,
	BarChart3,
	CheckCircle,
	Clock,
	Eye,
	MessageCircle,
	Send,
	Server,
	Thermometer,
	TrendingUp,
	User,
	X,
	Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { useConversationSocket } from "@/hooks/useSocket";

// Interfaces para tipagem mais específica
interface WarmupStat {
	id: string;
	warmupTime: number;
	createdAt: string;
	updatedAt: string;
}

interface WarmupDashboardStats {
	totalWarmups: number;
	activeInstances: number;
	totalMessages: number;
	averageTime: string;
	instanceProgress: Array<{
		label: string;
		value: number;
		color: string;
	}>;
	messageTypes: Array<{
		label: string;
		value: number;
	}>;
	instances: Array<{
		id: string;
		instanceName: string;
		status: string;
		messagesSent: number;
		messagesReceived: number;
		warmupTime: number;
		lastActive: string;
		progress: number;
		instance: {
			connectionStatus: string;
			ownerJid?: string;
			profilePicUrl?: string;
			profileName?: string;
		};
		mediaStats?: {
			text: number;
			image: number;
			video: number;
			audio: number;
			sticker: number;
			reaction: number;
		} | null;
		mediaReceived?: {
			text: number;
			image: number;
			video: number;
			audio: number;
			sticker: number;
			reaction: number;
		} | null;
	}>;
	previousPeriod?: {
		totalWarmups: number;
		activeInstances: number;
		averageTime: number;
	};
	// Propriedades calculadas
	warmupTrend?: number;
	instanceTrend?: number;
	messageTrend?: number;
	timeTrend?: number;
}

interface Instance {
	id: string;
	instanceName: string;
	profileName?: string;
	connectionStatus: string;
	profilePicUrl?: string;
	ownerJid?: string;
	lastActive?: string;
	createdAt: string;
	updatedAt: string;
	warmupStats?: WarmupStat[];
	warmupStatus?: {
		warmupTime: number;
		messagesSent: number;
		messagesReceived: number;
	};
}

// Interfaces removidas pois não estão sendo usadas diretamente
// Os tipos são inferidos dos dados da API
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
	mediaStats?: {
		text: number;
		image: number;
		video: number;
		audio: number;
		sticker: number;
		reaction: number;
	};
	receivedStats?: {
		text: number;
		image: number;
		video: number;
		audio: number;
		sticker: number;
		reaction: number;
		totalAllTime: number;
	} | null;
}

// Interface para estatísticas de mensagens em tempo real
interface MessageStats {
	sent: number;
	delivered: number;
	read: number;
	failed: number;
	pending: number;
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

// StatCard removido - usando TerminalCard no lugar

const WarmupStatCard = ({ icon: Icon, title, value, trend, color, description }) => (
	<motion.div
		variants={itemVariants}
		className={`relative overflow-hidden bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
	>
		<div className="absolute top-0 right-0 mt-4 mr-4">
			<Icon className="w-8 h-8 text-white/30" />
		</div>
		<div className="relative z-10">
			<h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
			<p className="text-3xl font-bold text-white mb-2">{value}</p>
			<p className="text-sm text-white/70">{description}</p>
			{trend && (
				<div className="mt-4 flex items-center gap-2">
					<div
						className={`flex items-center text-sm ${trend.direction === "up" ? "text-green-200" : "text-red-200"
							} bg-white/10 px-2 py-1 rounded-full`}
					>
						{trend.direction === "up" ? "↑" : "↓"}
						<span className="ml-1">{trend.percentage}%</span>
					</div>
					<span className="text-xs text-white/60">vs. período anterior</span>
				</div>
			)}
		</div>
		<div className="absolute bottom-0 right-0 transform translate-y-1/3 translate-x-1/3">
			<div className="w-24 h-24 bg-white/10 rounded-full" />
		</div>
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
	const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
	const [selectedInstance, setSelectedInstance] = useState<string>("all");
	const { getCardConfig } = useTerminalCardConfig();

	// Estado para estatísticas de mensagens em tempo real
	const [messageStats, setMessageStats] = useState<MessageStats>({
		sent: 0,
		delivered: 0,
		read: 0,
		failed: 0,
		pending: 0
	});

	// Estado para modal de detalhes da instância
	const [selectedInstanceDetails, setSelectedInstanceDetails] = useState<InstanceHealth | null>(null);

	// Preparar URLs para SWR
	const adjustedDate = addDays(selectedDate, 1);
	const formattedDate = format(adjustedDate, "yyyy-MM-dd");

	// SWR hooks para buscar dados
	const { data: dashboardData, error: dashboardError, isLoading: isDashboardLoading } = useSWR(
		`/api/message-logs/daily?date=${formattedDate}${selectedCampaign !== 'all' ? `&campaignId=${selectedCampaign}` : ''}${selectedInstance !== 'all' ? `&instanceName=${selectedInstance}` : ''}`,
		fetcher
	);

	// Inicializar messageStats com dados do backend quando disponíveis
	useEffect(() => {
		if (dashboardData?.stats) {
			setMessageStats({
				sent: dashboardData.stats.total || 0,
				delivered: dashboardData.stats.delivered || 0,
				read: dashboardData.stats.read || 0,
				failed: dashboardData.stats.failed || 0,
				pending: dashboardData.stats.pending || 0
			});
		}
	}, [dashboardData]);

	const { data: instancesData, error: instancesError, isLoading: isInstancesLoading } = useSWR(
		"/api/instances",
		fetcher
	);

	const { data: leadsData, error: leadsError, isLoading: isLeadsLoading } = useSWR(
		"/api/leads",
		fetcher
	);

	const { data: messagesByDayData, error: messagesByDayError, isLoading: isMessagesByDayLoading } = useSWR(
		`/api/message-logs/by-day${selectedCampaign !== 'all' ? `?campaignId=${selectedCampaign}` : ''}${selectedInstance !== 'all' ? `${selectedCampaign !== 'all' ? '&' : '?'}instanceName=${selectedInstance}` : ''}`,
		fetcher
	);

	// Hooks para dados reais
	const { data: campaignsData } = useSWR('/api/campaigns', fetcher);
	const { data: messageLogsData } = useSWR('/api/message-logs', fetcher);

	// Hook para dados de aquecimento
	const { data: warmupData, error: warmupError } = useSWR(
		'/api/dashboard',
		fetcher,
		{
			refreshInterval: 30000, // Atualizar a cada 30 segundos
			errorRetryCount: 3,
			shouldRetryOnError: true
		}
	);

	// Socket.IO para atualizações em tempo real
	const socket = useConversationSocket();

	// Configurar listeners de eventos em tempo real
	useEffect(() => {
		const removeConversationListener = socket.onConversationUpdate((data) => {
			console.log('[Dashboard] Conversa atualizada:', data);
			// Revalidar dados de mensagens e campanhas
			mutate('/api/message-logs');
			mutate('/api/campaigns');
			mutate(`/api/message-logs/daily?date=${formattedDate}`);
		});

		const removeMessageStatusListener = socket.onMessageStatusUpdate((data) => {
			console.log('[Dashboard] Status de mensagem atualizado:', data);

			// Atualizar contadores em tempo real baseado no status
			if (data.status) {
				setMessageStats(prev => {
					const newStats = { ...prev };

					// Remover da categoria anterior se existir (assumindo que existe previousStatus no contexto)
					const previousStatus = (data as { previousStatus?: string }).previousStatus;
					if (previousStatus) {
						switch (previousStatus.toLowerCase()) {
							case 'read':
								newStats.read = Math.max(0, newStats.read - 1);
								break;
							case 'delivered':
							case 'delivery_ack':
								newStats.delivered = Math.max(0, newStats.delivered - 1);
								break;
							case 'server_ack':
							case 'sent':
								newStats.pending = Math.max(0, newStats.pending - 1);
								break;
							case 'failed':
							case 'error':
								newStats.failed = Math.max(0, newStats.failed - 1);
								break;
							case 'pending':
								newStats.pending = Math.max(0, newStats.pending - 1);
								break;
						}
					}

					// Adicionar na nova categoria
					switch (data.status.toLowerCase()) {
						case 'read':
							newStats.read += 1;
							break;
						case 'delivered':
						case 'delivery_ack':
							newStats.delivered += 1;
							break;
						case 'server_ack':
						case 'sent':
							newStats.pending += 1;
							break;
						case 'failed':
						case 'error':
							newStats.failed += 1;
							break;
						case 'pending':
							newStats.pending += 1;
							break;
					}

					console.log('[Dashboard] Estatísticas atualizadas:', {
						previous: previousStatus,
						current: data.status,
						newStats
					});
					return newStats;
				});
			}

			// Revalidar dados de mensagens para refletir novos status
			mutate('/api/message-logs');
			mutate(`/api/message-logs/daily?date=${formattedDate}`);
		});

		const removeWebhookListener = socket.onWebhookReceived((data) => {
			console.log('[Dashboard] Webhook recebido:', data);
			// Revalidar todos os dados relevantes
			mutate('/api/instances');
			mutate('/api/leads');
			mutate('/api/message-logs');
			mutate('/api/campaigns');
		});

		// Cleanup listeners quando o componente for desmontado
		return () => {
			removeConversationListener();
			removeMessageStatusListener();
			removeWebhookListener();
		};
	}, [socket, formattedDate]);

	// Estados derivados - sem dependência de warmup-stats
	const isLoading = isDashboardLoading || isInstancesLoading || isLeadsLoading || isMessagesByDayLoading;
	const error = dashboardError || instancesError || leadsError || messagesByDayError;
	const instances = instancesData?.instances || [];
	const messagesByDay = messagesByDayData?.messagesByDay || {};

	// Processar dados de aquecimento - apenas dados reais
	const processWarmupData = (): WarmupDashboardStats => {
		// Se não há dados da API, retornar estrutura vazia
		if (!warmupData || warmupError) {
			return {
				totalWarmups: 0,
				activeInstances: 0,
				totalMessages: 0,
				averageTime: "0h",
				instanceProgress: [],
				messageTypes: [
					{ label: "Text", value: 0 },
					{ label: "Image", value: 0 },
					{ label: "Video", value: 0 },
					{ label: "Audio", value: 0 },
					{ label: "Sticker", value: 0 },
					{ label: "Reaction", value: 0 }
				],
				instances: []
			};
		}

		// Usar dados reais da API
		const data = warmupData as WarmupDashboardStats;

		// Garantir que messageTypes tenha todos os tipos necessários
		const requiredTypes = ["Text", "Image", "Video", "Audio", "Sticker", "Reaction"];
		const completeMessageTypes = requiredTypes.map(type => {
			const existing = data.messageTypes?.find(mt => mt.label === type);
			return existing || { label: type, value: 0 };
		});

		// Calcular tendências se há dados do período anterior
		const calculateTrend = (current: number, previous: number) => {
			if (previous === 0) return current > 0 ? 100 : 0;
			return Math.round(((current - previous) / previous) * 100);
		};

		return {
			...data,
			messageTypes: completeMessageTypes,
			// Adicionar tendências calculadas
			warmupTrend: data.previousPeriod ? calculateTrend(data.totalWarmups, data.previousPeriod.totalWarmups) : 0,
			instanceTrend: data.previousPeriod ? calculateTrend(data.activeInstances, data.previousPeriod.activeInstances) : 0,
			messageTrend: 0, // Será calculado se necessário
			timeTrend: data.previousPeriod ? calculateTrend(parseFloat(data.averageTime), data.previousPeriod.averageTime) : 0
		};
	};

	const warmupStats = processWarmupData();

	// Função para gerar atividades recentes baseadas em dados reais
	const generateRecentActivities = (): Activity[] => {
		const activities: Activity[] = [];
		const now = new Date();
		const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 horas atrás

		// Debug: Log dos dados recebidos
		console.log('🔍 [DEBUG] Dados das campanhas:', campaignsData);
		console.log('🔍 [DEBUG] Dados dos message logs:', messageLogsData);
		console.log('🔍 [DEBUG] Dados das instâncias:', instancesData);
		console.log('🔍 [DEBUG] Dados do dashboard:', dashboardData);

		// Atividades de campanhas (apenas das últimas 24 horas)
		if (campaignsData && Array.isArray(campaignsData)) {
			console.log('📊 [DEBUG] Processando campanhas:', campaignsData.length);
			campaignsData
				.filter((campaign: { id: string; name: string; status: string; startedAt?: string; completedAt?: string; updatedAt: string }) => {
					const campaignDate = new Date(campaign.updatedAt || campaign.startedAt || now);
					return campaignDate >= oneDayAgo;
				})
				.slice(0, 3)
				.forEach((campaign: { id: string; name: string; status: string; startedAt?: string; completedAt?: string; updatedAt: string }) => {
					console.log('🔍 [DEBUG] Campanha:', campaign.id, 'Status:', campaign.status, 'Nome:', campaign.name);

					if (campaign.status === 'running') {
						console.log('✅ [DEBUG] Adicionando atividade de campanha iniciada');
						activities.push({
							id: `campaign-${campaign.id}`,
							type: 'campaign',
							title: 'Campanha iniciada',
							description: `Campanha "${campaign.name}" foi iniciada`,
							timestamp: new Date(campaign.startedAt || campaign.updatedAt || now),
							status: 'success'
						});
					} else if (campaign.status === 'completed') {
						console.log('✅ [DEBUG] Adicionando atividade de campanha finalizada');
						activities.push({
							id: `campaign-completed-${campaign.id}`,
							type: 'campaign',
							title: 'Campanha finalizada',
							description: `Campanha "${campaign.name}" foi finalizada`,
							timestamp: new Date(campaign.completedAt || campaign.updatedAt || now),
							status: 'info'
						});
					} else if (campaign.status === 'paused') {
						console.log('✅ [DEBUG] Adicionando atividade de campanha pausada');
						activities.push({
							id: `campaign-paused-${campaign.id}`,
							type: 'campaign',
							title: 'Campanha pausada',
							description: `Campanha "${campaign.name}" foi pausada`,
							timestamp: new Date(campaign.updatedAt || now),
							status: 'warning'
						});
					} else if (campaign.status === 'scheduled') {
						console.log('✅ [DEBUG] Adicionando atividade de campanha agendada');
						activities.push({
							id: `campaign-scheduled-${campaign.id}`,
							type: 'campaign',
							title: 'Campanha agendada',
							description: `Campanha "${campaign.name}" foi agendada`,
							timestamp: new Date(campaign.updatedAt || now),
							status: 'info'
						});
					} else {
						console.log('❌ [DEBUG] Status de campanha não reconhecido:', campaign.status);
					}
				});
		}

		// Atividades de instâncias (apenas mudanças de status das últimas 24 horas)
		if (instancesData?.instances) {
			instancesData.instances
				.filter((instance: { id: string; instanceName: string; connectionStatus: string; updatedAt: string; createdAt?: string }) => {
					const instanceDate = new Date(instance.updatedAt || now);
					const createdDate = new Date(instance.createdAt || now);

					// Só mostrar como atividade se:
					// 1. Foi atualizado nas últimas 24 horas E
					// 2. A data de atualização é diferente da data de criação (indica mudança de status)
					return instanceDate >= oneDayAgo &&
						Math.abs(instanceDate.getTime() - createdDate.getTime()) > 60000; // Diferença maior que 1 minuto
				})
				.slice(0, 3)
				.forEach((instance: { id: string; instanceName: string; connectionStatus: string; updatedAt: string; createdAt?: string }) => {
					// Só adicionar atividades para status que indicam mudanças significativas
					if (instance.connectionStatus === 'OPEN') {
						activities.push({
							id: `instance-connected-${instance.id}-${instance.updatedAt}`,
							type: 'instance',
							title: 'Instância conectada',
							description: `Instância "${instance.instanceName}" foi conectada com sucesso`,
							timestamp: new Date(instance.updatedAt || now),
							status: 'success'
						});
					} else if (instance.connectionStatus === 'DISCONNECTED' || instance.connectionStatus === 'CLOSED') {
						activities.push({
							id: `instance-disconnected-${instance.id}-${instance.updatedAt}`,
							type: 'instance',
							title: 'Instância desconectada',
							description: `Instância "${instance.instanceName}" foi desconectada`,
							timestamp: new Date(instance.updatedAt || now),
							status: 'error'
						});
					}
					// Removido o status 'CONNECTING' para evitar atividades repetitivas
				});
		}

		// Atividades de mensagens (logs recentes das últimas 24 horas)
		if (messageLogsData?.data) {
			console.log('💬 [DEBUG] Processando message logs:', messageLogsData.data.length);
			messageLogsData.data
				.filter((log: { id: string; status: string; sentAt?: string; createdAt: string; lead?: { phone: string }; campaignLead?: { phone: string }; campaign?: { name: string } }) => {
					const logDate = new Date(log.sentAt || log.createdAt || now);
					return logDate >= oneDayAgo;
				})
				.slice(0, 5)
				.forEach((log: { id: string; status: string; sentAt?: string; createdAt: string; lead?: { phone: string }; campaignLead?: { phone: string }; campaign?: { name: string } }) => {
					console.log('📝 [DEBUG] Processando log:', log.id, 'Status:', log.status);
					const phone = log.lead?.phone || log.campaignLead?.phone;
					const campaignName = log.campaign?.name;

					if (log.status === 'delivered') {
						activities.push({
							id: `message-delivered-${log.id}`,
							type: 'message',
							title: '✅ Mensagem entregue',
							description: `Mensagem ${campaignName ? `da campanha "${campaignName}"` : ''} entregue para ${phone || 'contato'}`,
							timestamp: new Date(log.sentAt || log.createdAt || now),
							status: 'success'
						});
					} else if (log.status === 'read') {
						activities.push({
							id: `message-read-${log.id}`,
							type: 'message',
							title: '👁️ Mensagem lida',
							description: `Mensagem ${campaignName ? `da campanha "${campaignName}"` : ''} foi lida por ${phone || 'contato'}`,
							timestamp: new Date(log.sentAt || log.createdAt || now),
							status: 'success'
						});
					} else if (log.status === 'failed') {
						activities.push({
							id: `message-failed-${log.id}`,
							type: 'message',
							title: '❌ Falha no envio',
							description: `Falha ao enviar mensagem para ${phone || 'contato'}`,
							timestamp: new Date(log.sentAt || log.createdAt || now),
							status: 'error'
						});
					} else if (log.status === 'sent') {
						activities.push({
							id: `message-sent-${log.id}`,
							type: 'message',
							title: '📤 Mensagem enviada',
							description: `Mensagem enviada para ${phone || 'contato'}`,
							timestamp: new Date(log.sentAt || log.createdAt || now),
							status: 'info'
						});
					} else if (log.status === 'pending') {
						activities.push({
							id: `message-pending-${log.id}`,
							type: 'message',
							title: '⏳ Mensagem pendente',
							description: `Mensagem aguardando envio para ${phone || 'contato'}`,
							timestamp: new Date(log.sentAt || log.createdAt || now),
							status: 'warning'
						});
					}
				});
		}

		// Atividades baseadas em estatísticas reais
		if (dashboardData?.stats) {
			const stats = dashboardData.stats;

			// Alerta de alto volume apenas se realmente houver muitas mensagens
			if (stats.total > 100) {
				activities.push({
					id: 'high-volume-alert',
					type: 'warning',
					title: 'Alto volume de mensagens',
					description: `${stats.total} mensagens enviadas hoje. Monitorando para evitar bloqueios`,
					timestamp: new Date(Date.now() - 1800000), // 30 minutos atrás
					status: 'warning'
				});
			}

			// Alerta de baixa taxa de entrega
			if (stats.deliveryRate < 80 && stats.total > 10) {
				activities.push({
					id: 'low-delivery-rate',
					type: 'warning',
					title: 'Taxa de entrega baixa',
					description: `Taxa de entrega em ${stats.deliveryRate.toFixed(1)}%. Verificar instâncias`,
					timestamp: new Date(Date.now() - 900000), // 15 minutos atrás
					status: 'warning'
				});
			}

			// Sucesso na taxa de entrega
			if (stats.deliveryRate >= 95 && stats.total > 5) {
				activities.push({
					id: 'high-delivery-rate',
					type: 'info',
					title: 'Excelente taxa de entrega',
					description: `Taxa de entrega de ${stats.deliveryRate.toFixed(1)}% mantida`,
					timestamp: new Date(Date.now() - 600000), // 10 minutos atrás
					status: 'success'
				});
			}
		}

		// Ordenar por timestamp (mais recente primeiro) e limitar
		const sortedActivities = activities
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, 8); // Limitar a 8 atividades mais recentes

		console.log('🎯 [DEBUG] Total de atividades geradas:', activities.length);
		console.log('🎯 [DEBUG] Atividades finais:', sortedActivities);

		return sortedActivities;
	};

	// Preparar dados de saúde das instâncias usando dados reais da API de aquecimento
	const prepareInstancesHealth = (): InstanceHealth[] => {
		// Se não há dados de aquecimento, usar dados das instâncias normais
		if (!warmupStats.instances || warmupStats.instances.length === 0) {
			return instances.map((instance: Instance) => ({
				profileName: instance.profileName || '',
				instanceName: instance.instanceName || 'Instância',
				status: instance.connectionStatus || 'DISCONNECTED',
				ownerJid: instance.ownerJid,
				profilePicUrl: instance.profilePicUrl,
				lastActive: instance.lastActive ? new Date(instance.lastActive) : undefined,
				messagesSent: 0,
				messagesReceived: 0,
				warmupProgress: 0,
				warmupTime: 0,
				mediaStats: undefined,
				receivedStats: null,
			}));
		}

		// Usar dados reais da API de aquecimento
		return warmupStats.instances.map((warmupInstance) => {
			// Calcular progresso baseado no warmupTime (400 horas = 100%)
			const warmupProgress = warmupInstance.warmupTime > 0
				? Math.min((warmupInstance.warmupTime / (400 * 3600)) * 100, 100)
				: 0;

			return {
				profileName: warmupInstance.instance.profileName || warmupInstance.instanceName,
				instanceName: warmupInstance.instanceName,
				status: warmupInstance.instance.connectionStatus || 'DISCONNECTED',
				ownerJid: warmupInstance.instance.ownerJid,
				profilePicUrl: warmupInstance.instance.profilePicUrl,
				lastActive: warmupInstance.lastActive ? new Date(warmupInstance.lastActive) : undefined,
				messagesSent: warmupInstance.messagesSent || 0,
				messagesReceived: warmupInstance.messagesReceived || 0,
				warmupProgress,
				warmupTime: warmupInstance.warmupTime || 0,
				// Usar dados reais de mediaStats se disponíveis
				mediaStats: warmupInstance.mediaStats || undefined,
				// Usar dados reais de mediaReceived se disponíveis
				receivedStats: warmupInstance.mediaReceived ? {
					...warmupInstance.mediaReceived,
					totalAllTime: warmupInstance.mediaReceived.text +
						warmupInstance.mediaReceived.image +
						warmupInstance.mediaReceived.video +
						warmupInstance.mediaReceived.audio +
						warmupInstance.mediaReceived.sticker +
						warmupInstance.mediaReceived.reaction
				} : null,
			};
		});
	};

	const recentActivities = generateRecentActivities();
	const instancesHealth = prepareInstancesHealth();

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
			value: messageStats.sent.toLocaleString(),
			description: "Total de mensagens enviadas",
			...getCardConfig('total'),
		},
		{
			title: "Entregues",
			icon: CheckCircle,
			value: messageStats.delivered.toLocaleString(),
			description: "Mensagens entregues",
			...getCardConfig('delivered'),
		},
		{
			title: "Lidas",
			icon: Eye,
			value: messageStats.read.toLocaleString(),
			description: "Mensagens lidas",
			...getCardConfig('read'),
		},
		{
			title: "Pendentes",
			icon: Clock,
			value: messageStats.pending.toLocaleString(),
			description: "Mensagens pendentes",
			...getCardConfig('pending'),
		},
		{
			title: "Falharam",
			icon: AlertCircle,
			value: messageStats.failed.toLocaleString(),
			description: "Mensagens com falha",
			...getCardConfig('failed'),
		},
	];

	// Tratamento de erro com useEffect para evitar setState durante render
	useEffect(() => {
		if (error) {
			// console.error("Erro ao buscar dados:", error);

			// Apenas mostrar toast se não for erro de autenticação
			if (!(error.message?.includes("Token") || error.status === 401)) {
				toast.error("Não foi possível carregar os dados do dashboard");
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
			data-tour="dashboard-container"
		>
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-white mb-2">
					Bem-vindo, {user?.name}
				</h1>
				<p className="text-white/80">Aqui está um resumo das suas atividades</p>
			</div>
			<div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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

				{/* Filtros por Campanha e Instância */}
				<div className="flex gap-4">
					<Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
						<SelectTrigger className="w-[200px] bg-deep/50 border-electric text-white">
							<SelectValue placeholder="Filtrar por campanha" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas as campanhas</SelectItem>
							{campaignsData && Array.isArray(campaignsData) && campaignsData.map((campaign: { id: string; name: string }) => (
								<SelectItem key={campaign.id} value={campaign.id}>
									{campaign.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={selectedInstance} onValueChange={setSelectedInstance}>
						<SelectTrigger className="w-[200px] bg-deep/50 border-electric text-white">
							<SelectValue placeholder="Filtrar por instância" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas as instâncias</SelectItem>
							{instancesData && Array.isArray(instancesData) && instancesData.map((instance: { id: string; instanceName: string }) => (
								<SelectItem key={instance.id} value={instance.instanceName}>
									{instance.instanceName}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8" data-tour="dashboard-stats">
				{stats.map((stat, index) => (
					<TerminalCard key={index} {...stat} />
				))}
			</div>

			{/* Seção de Aquecimento */}
			<motion.div
				variants={itemVariants}
				className="mb-8"
			>
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-neon-green/10 rounded-lg">
							<Thermometer className="text-neon-green w-6 h-6" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-white">Sistema de Aquecimento</h2>
							<p className="text-white/60">Monitoramento em tempo real do aquecimento das instâncias</p>
						</div>
					</div>
					<div className="flex items-center gap-2 text-sm text-white/60">
						<Zap className="w-4 h-4" />
						<span>Atualizado em tempo real</span>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
					<WarmupStatCard
						icon={TrendingUp}
						title="Total de Aquecimentos"
						value={warmupStats.totalWarmups}
						trend={{ direction: (warmupStats.warmupTrend || 0) >= 0 ? "up" : "down", percentage: Math.abs(warmupStats.warmupTrend || 0) }}
						color="from-emerald-400 to-teal-600"
						description="Instâncias em processo de aquecimento"
					/>
					<WarmupStatCard
						icon={Activity}
						title="Instâncias Ativas"
						value={warmupStats.activeInstances}
						trend={{ direction: (warmupStats.instanceTrend || 0) >= 0 ? "up" : "down", percentage: Math.abs(warmupStats.instanceTrend || 0) }}
						color="from-blue-400 to-indigo-600"
						description="Instâncias atualmente aquecendo"
					/>
					{/* <WarmupStatCard
						icon={MessageCircle}
						title="Mensagens Enviadas"
						value={warmupStats.totalMessages.toLocaleString()}
						trend={{ direction: warmupStats.messageTrend >= 0 ? "up" : "down", percentage: Math.abs(warmupStats.messageTrend) }}
						color="from-violet-400 to-purple-600"
						description="Total de mensagens de aquecimento"
					/> */}
					<WarmupStatCard
						icon={Clock}
						title="Tempo Médio"
						value={warmupStats.averageTime}
						trend={{ direction: (warmupStats.timeTrend || 0) >= 0 ? "up" : "down", percentage: Math.abs(warmupStats.timeTrend || 0) }}
						color="from-pink-400 to-rose-600"
						description="Tempo médio de aquecimento"
					/>
				</div>

				{/* Gráficos de Aquecimento */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
					<motion.div
						variants={itemVariants}
						className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric/30"
					>
						<h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-neon-green" />
							Progresso das Instâncias
						</h3>
						<div className="space-y-4">
							{instancesHealth.length > 0 ? (
								instancesHealth.map((instance, index) => (
									<div key={index} className="flex items-center mb-4">
										<div className="flex-grow mr-4">
											<ProgressBar
												label={instance.instanceName}
												value={instance.warmupProgress || 0}
												color={
													(instance.warmupProgress || 0) >= 100
														? "bg-gradient-to-r from-neon-green to-green-400"
														: (instance.warmupProgress || 0) >= 75
															? "bg-gradient-to-r from-yellow-400 to-orange-400"
															: (instance.warmupProgress || 0) >= 50
																? "bg-gradient-to-r from-neon-blue to-blue-400"
																: (instance.warmupProgress || 0) >= 25
																	? "bg-gradient-to-r from-purple-400 to-pink-400"
																	: "bg-gradient-to-r from-red-400 to-red-500"
												}
											/>
										</div>
										<button
											className="text-neon-blue hover:text-neon-green transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
											onClick={() => setSelectedInstanceDetails(instance)}
											title="Ver detalhes da instância"
										>
											<Eye className="w-6 h-6" />
										</button>
									</div>
								))
							) : (
								<div className="text-center py-8">
									<Thermometer className="w-12 h-12 text-white/40 mx-auto mb-4" />
									<p className="text-white/60">Nenhuma instância em aquecimento</p>
								</div>
							)}
						</div>
					</motion.div>

					<motion.div
						variants={itemVariants}
						className="bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric/30"
					>
						<h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
							<MessageCircle className="w-5 h-5 text-neon-blue" />
							Distribuição de Mensagens
						</h3>
						<ResponsiveContainer width="100%" height={350}>
							<RadarChart
								cx="50%"
								cy="50%"
								outerRadius="80%"
								data={warmupStats.messageTypes}
							>
								<PolarGrid
									stroke="rgba(0, 255, 136, 0.2)"
									strokeDasharray="2 2"
									gridType="polygon"
								/>
								<PolarAngleAxis
									dataKey="label"
									tick={{
										fill: "#00d4ff",
										fontSize: 13,
										fontWeight: 600,
									}}
									className="text-neon-blue"
								/>
								<Radar
									name="Distribuição"
									dataKey="value"
									stroke="#00ff88"
									fill="#00ff88"
									fillOpacity={0.4}
									strokeWidth={2}
									dot={{ fill: "#00ff88", strokeWidth: 2, r: 4 }}
								/>
								<RechartsTooltip
									cursor={{
										stroke: "rgba(0, 255, 136, 0.5)",
										strokeWidth: 2,
									}}
									contentStyle={{
										backgroundColor: "rgba(0, 20, 40, 0.95)",
										borderRadius: "12px",
										color: "white",
										border: "1px solid #00ff88",
										boxShadow: "0 8px 32px rgba(0, 255, 136, 0.3)",
									}}
									labelStyle={{
										color: "#00d4ff",
										fontWeight: "bold",
									}}
									formatter={(value, name) => [`${value}%`, name]}
								/>
							</RadarChart>
						</ResponsiveContainer>
					</motion.div>
				</div>
			</motion.div>
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
					<div className="space-y-4 flex flex-col">
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

			{/* Modal de Detalhes da Instância */}
			{selectedInstanceDetails && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="bg-deep/95 backdrop-blur-xl rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-electric/30 mx-4"
					>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-2xl font-bold text-white flex items-center gap-3">
								<div className="p-2 bg-neon-green/10 rounded-lg">
									<Server className="w-6 h-6 text-neon-green" />
								</div>
								Detalhes da Instância: {selectedInstanceDetails.instanceName}
							</h3>
							<button
								onClick={() => setSelectedInstanceDetails(null)}
								className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white/60 hover:text-white"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						<div className="grid md:grid-cols-3 gap-6">
							{/* Coluna de Informações Básicas */}
							<div className="bg-deep/60 rounded-xl p-6 border border-electric/20">
								<h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
									<Activity className="w-5 h-5 text-neon-blue" />
									Informações Básicas
								</h4>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="font-medium text-white/70">Status:</span>
										<span
											className={`font-bold px-3 py-1 rounded-full text-sm ${selectedInstanceDetails.status === "OPEN" || selectedInstanceDetails.status === "CONNECTED"
												? "bg-neon-green/20 text-neon-green"
												: "bg-red-500/20 text-red-400"
												}`}
										>
											{selectedInstanceDetails.status === "OPEN" ? "CONECTADO" :
												selectedInstanceDetails.status === "CONNECTED" ? "CONECTADO" :
													selectedInstanceDetails.status === "CONNECTING" ? "CONECTANDO" : "DESCONECTADO"}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-white/70">Mensagens Enviadas:</span>
										<span className="font-bold text-white">
											{selectedInstanceDetails.messagesSent || 0}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-white/70">Mensagens Recebidas:</span>
										<span className="font-bold text-white">
											{selectedInstanceDetails.messagesReceived || 0}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-white/70">Tempo de Aquecimento:</span>
										<span className="font-bold text-white">
											{selectedInstanceDetails.warmupTime
												? `${Math.round(selectedInstanceDetails.warmupTime / 3600)}h`
												: "0h"
											}
										</span>
									</div>
									{selectedInstanceDetails.ownerJid && (
										<div className="flex justify-between items-center">
											<span className="text-white/70">Número:</span>
											<span className="font-bold text-white">
												{formatPhoneNumber(selectedInstanceDetails.ownerJid)}
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Coluna de Progresso */}
							<div className="bg-deep/60 rounded-xl p-6 border border-electric/20">
								<h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
									<TrendingUp className="w-5 h-5 text-neon-green" />
									Progresso de Aquecimento
								</h4>
								<div className="space-y-4">
									<div className="text-center">
										<div className="text-3xl font-bold text-neon-green mb-2">
											{(selectedInstanceDetails.warmupProgress || 0).toFixed(1)}%
										</div>
										<p className="text-white/60">Progresso Atual</p>
									</div>
									<div className="w-full bg-deep/60 rounded-full h-4 overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${selectedInstanceDetails.warmupProgress || 0}%` }}
											transition={{ duration: 1, type: "spring" }}
											className={`h-full rounded-full ${(selectedInstanceDetails.warmupProgress || 0) >= 100
												? "bg-gradient-to-r from-neon-green to-green-400"
												: "bg-gradient-to-r from-neon-blue to-blue-400"
												}`}
										/>
									</div>
									<div className="text-center text-sm text-white/60">
										{(selectedInstanceDetails.warmupProgress || 0) >= 100
											? "Aquecimento Completo!"
											: `${(400 - ((selectedInstanceDetails.warmupProgress || 0) * 400 / 100)).toFixed(0)}h restantes`
										}
									</div>
								</div>
							</div>

							{/* Coluna de Estatísticas */}
							<div className="bg-deep/60 rounded-xl p-6 border border-electric/20">
								<h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
									<MessageCircle className="w-5 h-5 text-neon-purple" />
									Estatísticas
								</h4>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-white/70">Taxa de Resposta:</span>
										<span className="font-bold text-neon-green">
											{selectedInstanceDetails.messagesSent > 0
												? `${((selectedInstanceDetails.messagesReceived || 0) / selectedInstanceDetails.messagesSent * 100).toFixed(1)}%`
												: "0%"
											}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-white/70">Eficiência:</span>
										<span className="font-bold text-neon-blue">
											{(selectedInstanceDetails.warmupProgress || 0) > 50 ? "Alta" :
												(selectedInstanceDetails.warmupProgress || 0) > 20 ? "Média" : "Baixa"}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-white/70">Última Atividade:</span>
										<span className="font-bold text-white">
											{selectedInstanceDetails.lastActive
												? format(new Date(selectedInstanceDetails.lastActive), "dd/MM HH:mm", { locale: ptBR })
												: "Nunca"
											}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Gráfico Comparativo de Mensagens Enviadas e Recebidas */}
						{selectedInstanceDetails.mediaStats && (
							<div className="mt-8 bg-deep/60 rounded-xl p-6 border border-electric/20">
								<h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
									<BarChart3 className="w-5 h-5 text-neon-purple" />
									Comparativo de Mensagens
								</h4>
								<ResponsiveContainer width="100%" height={300}>
									<AreaChart
										data={[
											{
												name: "Textos",
												enviadas: selectedInstanceDetails.mediaStats?.text || 0,
												recebidas: selectedInstanceDetails.receivedStats?.text || 0,
											},
											{
												name: "Imagens",
												enviadas: selectedInstanceDetails.mediaStats?.image || 0,
												recebidas: selectedInstanceDetails.receivedStats?.image || 0,
											},
											{
												name: "Vídeos",
												enviadas: selectedInstanceDetails.mediaStats?.video || 0,
												recebidas: selectedInstanceDetails.receivedStats?.video || 0,
											},
											{
												name: "Áudios",
												enviadas: selectedInstanceDetails.mediaStats?.audio || 0,
												recebidas: selectedInstanceDetails.receivedStats?.audio || 0,
											},
											{
												name: "Stickers",
												enviadas: selectedInstanceDetails.mediaStats?.sticker || 0,
												recebidas: selectedInstanceDetails.receivedStats?.sticker || 0,
											},
										]}
									>
										<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
										<XAxis
											dataKey="name"
											tick={{ fill: "#ffffff", fontSize: 12 }}
											axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
										/>
										<YAxis
											tick={{ fill: "#ffffff", fontSize: 12 }}
											axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
										/>
										<RechartsTooltip
											contentStyle={{
												backgroundColor: "rgba(0,0,0,0.8)",
												borderRadius: "12px",
												color: "white",
												border: "1px solid #00d4ff",
											}}
										/>
										<Area
											type="monotone"
											dataKey="enviadas"
											stroke="#00ff88"
											fill="#00ff88"
											fillOpacity={0.3}
											name="Enviadas"
										/>
										<Area
											type="monotone"
											dataKey="recebidas"
											stroke="#00d4ff"
											fill="#00d4ff"
											fillOpacity={0.3}
											name="Recebidas"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						)}

						<div className="mt-8 flex justify-end">
							<Button
								onClick={() => setSelectedInstanceDetails(null)}
								className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
							>
								Fechar
							</Button>
						</div>
					</motion.div>
				</div>
			)}
		</motion.div>
	);
}
