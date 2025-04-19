// @ts-nocheck

// src/pages/Instances.tsx
import ProxyConfigModal from "@/components/ProxyConfigModal";
import TypebotConfigForm from "@/components/TypebotConfigForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Instance } from "@/interface";
import { authService } from "@/services/auth.service";
import axios from "axios";
import { motion } from "framer-motion";
import {
	AlertCircle,
	MessageSquareMore,
	Plus,
	Power,
	Trash2,
	Wifi,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Constantes
const API_BASE_URL =
	import.meta.env.VITE_API_URL || "https://api.whatlead.com.br";
const API_KEY =
	import.meta.env.VITE_PUBLIC_API_KEY || "429683C4C977415CAAFCCE10F7D57E11";

// Animações
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

interface TypebotConfig {
	id?: string;
	instanceId: string;
	url: string;
	typebot: string;
	description: string;
	triggerType: "keyword" | "all" | "none";
	triggerOperator?: "contains" | "equals" | "startsWith" | "endsWith";
	triggerValue?: string;
	enabled: boolean;
	expire: number;
	keywordFinish: string;
	delayMessage: number;
	unknownMessage: string;
	listeningFromMe: boolean;
	stopBotFromMe: boolean;
	keepOpen: boolean;
	debounceTime: number;
}

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			type: "spring",
			stiffness: 100,
		},
	},
};

const pulseAnimation = {
	scale: [1, 1.2, 1],
	opacity: [0.5, 1, 0.5],
	transition: {
		duration: 2,
		repeat: Number.POSITIVE_INFINITY,
		ease: "easeInOut",
	},
};

// Componente: Connection Status
const ConnectionStatus: React.FC<{ connected: boolean }> = ({ connected }) => (
	<motion.div
		initial={{ opacity: 0, scale: 0.8 }}
		animate={{ opacity: 1, scale: 1 }}
		className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl border
      ${
				connected
					? "bg-neon-green/10 text-neon-green border-neon-green/20"
					: "bg-red-500/10 text-red-500 border-red-500/20"
			}`}
	>
		<motion.div
			animate={connected ? pulseAnimation : {}}
			className={`w-2 h-2 rounded-full ${
				connected ? "bg-neon-green" : "bg-red-500"
			}`}
		/>
		<span className="text-xs font-medium">
			{connected ? "Online" : "Offline"}
		</span>
	</motion.div>
);

// Componente: InstanceCard
const InstanceCard: React.FC<{
	instance: Instance;
	onReconnect: (name: string) => void;
	onLogout: (name: string) => void;
	onDelete: (id: string, name: string) => void;
	deletingInstance: string | null;
	typebotFlows: TypebotConfig[];
	onAddTypebotFlow: (instanceId: string, flowData: TypebotConfig) => void;
	onEditTypebotFlow: (
		instanceId: string,
		flowId: string,
		flowData: TypebotConfig,
	) => void;
	onDeleteTypebotFlow: (instanceId: string, flowId: string) => void;
}> = ({
	instance,
	onReconnect,
	onLogout,
	onDelete,
	deletingInstance,
	typebotFlows,
	onAddTypebotFlow,
	onEditTypebotFlow,
	onDeleteTypebotFlow,
}) => {
	const isConnected =
		instance.connectionStatus === "OPEN" ||
		instance.connectionStatus === "CONNECTED";
	const [showTypebotModal, setShowTypebotModal] = useState(false);
	const [selectedTypebotFlow, setSelectedTypebotFlow] =
		useState<TypebotConfig | null>(null);

	const instanceTypebotFlows = typebotFlows.filter(
		(flow) => flow.instanceId === instance.id,
	);

	const handleAddTypebot = () => {
		setSelectedTypebotFlow(null);
		setShowTypebotModal(true);
	};

	const handleEditTypebot = (flow: TypebotConfig) => {
		setSelectedTypebotFlow(flow);
		setShowTypebotModal(true);
	};

	const handleDeleteTypebot = (flowId: string) => {
		if (window.confirm("Tem certeza que deseja remover este Typebot?")) {
			onDeleteTypebotFlow(instance.id, flowId);
		}
	};

	const handleDeleteInstance = () => {
		if (
			window.confirm(
				`Tem certeza que deseja excluir a instância ${instance.instanceName}?`,
			)
		) {
			onDelete(instance.id, instance.instanceName);
		}
	};

	return (
		<motion.div
			variants={itemVariants}
			whileHover={{ scale: 1.02 }}
			className="relative bg-deep/80 backdrop-blur-xl p-6 rounded-xl border border-electric shadow-lg hover:shadow-electric transition-all duration-300"
		>
			<div className="absolute inset-0 bg-gradient-to-tr from-electric/5 to-neon-purple/5 opacity-50" />

			<div className="relative z-10 space-y-6">
				{/* Header da Instância */}
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-4">
						<div className="relative">
							{instance.profilePicUrl ? (
								<img
									src={instance.profilePicUrl}
									alt="Profile"
									className={`w-12 h-12 rounded-full object-cover border-2 ${
										isConnected ? "border-neon-green" : "border-red-500"
									}`}
								/>
							) : (
								<div
									className={`w-12 h-12 rounded-full flex items-center justify-center ${
										isConnected
											? "bg-neon-green/10 text-neon-green"
											: "bg-red-500/20 text-red-500"
									}`}
								>
									<FaWhatsapp className="w-6 h-6" />
								</div>
							)}
						</div>
						<div>
							<h3 className="text-lg font-bold text-white">
								{instance.instanceName}
							</h3>
							<p className="text-sm text-white/70">
								{instance.phoneNumber || "Sem número"}
							</p>
						</div>
					</div>
					<ConnectionStatus connected={isConnected} />
				</div>

				{/* Ações Principais */}
				<div className="space-y-4">
					{!isConnected && (
						<Button
							variant="outline"
							size="lg"
							onClick={() => onReconnect(instance.instanceName)}
							className="w-full bg-neon-green/10 text-white border-neon-green/20 hover:bg-neon-green/20 hover:border-neon-green/30"
						>
							<Wifi className="w-5 h-5 mr-2" /> Reconectar
						</Button>
					)}

					<div className="grid grid-cols-2 gap-3">
						<Button
							variant="outline"
							size="lg"
							onClick={() => onLogout(instance.instanceName)}
							className="bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20 hover:bg-neon-yellow/20 hover:border-neon-yellow/30"
						>
							<Power className="w-5 h-5 mr-2" /> Logout
						</Button>

						<Button
							variant="outline"
							size="lg"
							onClick={handleAddTypebot}
							className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 w-full"
						>
							<MessageSquareMore className="w-5 h-5 mr-2" />
							{instanceTypebotFlows.length > 0
								? "Typebots"
								: "Adicionar Typebot"}
						</Button>
					</div>

					{/* Botão de Excluir Instância */}
					<Button
						variant="outline"
						size="lg"
						onClick={handleDeleteInstance}
						disabled={deletingInstance === instance.id}
						className="w-full bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30"
					>
						{deletingInstance === instance.id ? (
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 1,
									repeat: Number.POSITIVE_INFINITY,
									ease: "linear",
								}}
								className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full mr-2"
							/>
						) : (
							<Trash2 className="w-5 h-5 mr-2" />
						)}
						Excluir Instância
					</Button>
				</div>

				{/* Lista de Typebots */}
				{instanceTypebotFlows.length > 0 && (
					<div className="mt-4 bg-electric/5 p-4 rounded-lg">
						<h4 className="text-lg font-semibold text-white mb-3">Typebots</h4>
						<div className="space-y-2">
							{instanceTypebotFlows.map((flow) => (
								<div
									key={flow.id || `${instance.id}-${flow.typebot}`}
									className="flex justify-between items-center bg-deep/20 p-3 rounded-lg"
								>
									<div>
										<p className="text-white font-medium">
											{flow.typebot || "Typebot sem nome"}
										</p>
										<p className="text-white/70 text-sm">
											{flow.triggerType === "all"
												? "Ativado para todas mensagens"
												: flow.triggerType === "keyword"
													? `Ativado por palavra-chave: ${flow.triggerValue}`
													: "Desativado"}
										</p>
									</div>
									<div className="flex space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditTypebot(flow)}
											className="text-blue-500 border-blue-500/20 hover:bg-blue-500/10"
										>
											Editar
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeleteTypebot(flow.id || "")}
											className="text-red-500 border-red-500/20 hover:bg-red-500/10"
										>
											Excluir
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Modal de Configuração do Typebot */}
				{showTypebotModal && (
					<Modal
						isOpen={showTypebotModal}
						onClose={() => {
							setShowTypebotModal(false);
							setSelectedTypebotFlow(null);
						}}
						title={
							selectedTypebotFlow ? "Editar Typebot" : "Adicionar Novo Typebot"
						}
					>
						<TypebotConfigForm
							instance={instance}
							initialData={selectedTypebotFlow || undefined}
							onUpdate={(flowData) => {
								selectedTypebotFlow
									? onEditTypebotFlow(
											instance.id,
											selectedTypebotFlow.id || "",
											flowData,
										)
									: onAddTypebotFlow(instance.id, flowData);
								setShowTypebotModal(false);
								setSelectedTypebotFlow(null);
							}}
							onDelete={
								selectedTypebotFlow
									? () => handleDeleteTypebot(selectedTypebotFlow.id || "")
									: undefined
							}
							isEditing={!!selectedTypebotFlow}
						/>
					</Modal>
				)}
			</div>
		</motion.div>
	);
};

// Componente principal: Instances
const Instances: React.FC = () => {
	const [newInstanceName, setNewInstanceName] = useState("");
	const navigate = useNavigate();
	const [instances, setInstances] = useState<Instance[]>([]);
	const [loading, setLoading] = useState(true);
	const [showTypebotConfig, setShowTypebotConfig] = useState(false);
	const [showProxyConfig, setShowProxyConfig] = useState(false);
	const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
		null,
	);
	const [deletingInstance, setDeletingInstance] = useState<string | null>(null);
	const [qrCodeError, setQrCodeError] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreatingInstance, setIsCreatingInstance] = useState(false);
	const [currentPlan, setCurrentPlan] = useState("Gratuito");
	const [instanceLimit, setInstanceLimit] = useState(1);
	const [remainingSlots, setRemainingSlots] = useState(0);
	const [typebotFlows, setTypebotFlows] = useState<TypebotConfig[]>([]);
	const [showTypebotModal, setShowTypebotModal] = useState(false);
	const [selectedTypebotFlow, setSelectedTypebotFlow] =
		useState<TypebotConfig | null>(null);
	const [pollingIntervals, setPollingIntervals] = useState<{
		[key: string]: any;
	}>({});

	const [selectedInstanceForProxy, setSelectedInstanceForProxy] =
		useState<Instance | null>(null);

	const [qrCode, setQrCode] = useState<{
		base64: string;
		pairingCode?: string;
	} | null>(null);
	const [showQrCodeModal, setShowQrCodeModal] = useState(false);
	const [newInstaceName, setNewInstaceName] = useState("");
	const [planDetails, setPlanDetails] = useState<{
		type?: string;
		isInTrial?: boolean;
		trialEndDate?: string;
		leadsLimit?: number;
		currentLeads?: number;
		leadsPercentage?: number;
	}>({});

	const closeQrCodeModal = () => {
		setShowQrCodeModal(false);
		setQrCode(null);
		setQrCodeError(false);
	};

	const handleError = (error: any) => {
		if (error.response) {
			const status = error.response.status;
			if (status === 401) {
				toast.error("Sessão expirada. Faça login novamente.");
				navigate("/login");
			} else if (status === 403) {
				toast.error("Você não tem permissão para acessar este recurso.");
			} else {
				toast.error(
					error.response.data?.message || "Erro ao executar operação",
				);
			}
		} else if (error.request) {
			toast.error("Sem resposta do servidor. Verifique sua conexão.");
		} else {
			toast.error("Erro ao configurar a requisição.");
		}
	};

	const fetchTypebotFlows = async () => {
		try {
			// Busca os fluxos para cada instância
			const flowPromises = instances.map(async (instance) => {
				const token = authService.getToken();
				const url = `${API_BASE_URL}/api/instances/instance/${instance.id}/typebot/flows`;

				try {
					const response = await axios.get(url, {
						headers: { Authorization: `Bearer ${token}` },
					});

					// Verifica se a resposta tem a estrutura esperada
					const flows = response.data?.flows || response.data || [];

					// Adiciona o instanceId aos fluxos
					return flows.map((flow) => ({
						...flow,
						instanceId: instance.id,
					}));
				} catch (error) {
					console.error(
						`Erro ao buscar fluxos para instância ${instance.id}:`,
						error,
					);
					return [];
				}
			});

			// Aguarda todas as promises de busca de fluxos
			const allFlows = await Promise.all(flowPromises);

			// Achata o array de fluxos
			const flattenedFlows = allFlows.flat();

			setTypebotFlows(flattenedFlows);
		} catch (error) {
			console.error("Erro ao buscar fluxos do Typebot:", error);
			toast.error("Erro ao carregar fluxos do Typebot");
			setTypebotFlows([]);
		}
	};

	// Modifique o useEffect para depender de instances
	useEffect(() => {
		if (instances.length > 0) {
			fetchTypebotFlows();
		}
	}, [instances]);

	const handleAddTypebotFlow = async (
		instanceId: string,
		flowData: TypebotConfig,
	) => {
		try {
			const token = authService.getToken();
			const response = await axios.post(
				`${API_BASE_URL}/api/instances/instance/${instanceId}/typebot`,
				{
					typebot: {
						...flowData,
						instanceId: instanceId,
					},
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				},
			);

			// Atualiza a lista de instâncias para refletir a mudança
			await fetchInstances();

			toast.success("Typebot adicionado com sucesso!");
			setShowTypebotConfig(false);
		} catch (error) {
			console.error("Erro ao adicionar Typebot:", error);

			// Log mais detalhado do erro
			if (axios.isAxiosError(error)) {
				console.error("Detalhes do erro:", error.response?.data);
				console.error("Status:", error.response?.status);
			}

			toast.error("Erro ao adicionar Typebot");
		}
	};

	const handleEditTypebotFlow = async (
		instanceId: string,
		flowId: string,
		flowData: TypebotConfig,
	) => {
		try {
			const token = authService.getToken();
			const response = await axios.put(
				`${API_BASE_URL}/api/instance/${instanceId}/typebot/${flowId}`,
				{
					typebot: {
						...flowData,
						instanceId: instanceId,
						id: flowId,
					},
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			// Atualiza a lista de instâncias para refletir a mudança
			await fetchInstances();

			// Atualiza os fluxos do Typebot
			await fetchTypebotFlows();

			toast.success("Typebot atualizado com sucesso!");
			setShowTypebotConfig(false);
		} catch (error) {
			console.error("Erro ao editar Typebot:", error);
			toast.error("Erro ao editar Typebot");
		}
	};

	const handleDeleteTypebotFlow = async (
		instanceId: string,
		flowId: string,
	) => {
		if (!window.confirm("Tem certeza que deseja remover este Typebot?")) return;

		try {
			const token = authService.getToken();
			await axios.delete(
				`${API_BASE_URL}/api/instances/instance/${instanceId}/typebot/${flowId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			// Atualiza a lista de instâncias para refletir a mudança
			await fetchInstances();

			// Atualiza os fluxos do Typebot
			await fetchTypebotFlows();

			toast.success("Typebot removido com sucesso!");
			setShowTypebotConfig(false);
		} catch (error) {
			console.error("Erro ao remover Typebot:", error);
			toast.error("Erro ao remover Typebot");
		}
	};

	const fetchUserPlan = async () => {
		try {
			const token = authService.getToken();
			const response = await axios.get(`${API_BASE_URL}/api/users/plan`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.data) {
				const { currentPlan, limits } = response.data;

				// Atualiza o nome do plano
				setCurrentPlan(currentPlan.name);

				// Define o limite de instâncias (usando maxCampaigns como limite de instâncias)
				const maxInstances = limits.maxCampaigns || 3;
				setInstanceLimit(maxInstances);

				// Calcula slots restantes
				const usedInstances = instances.length;
				const remaining = maxInstances - usedInstances;
				setRemainingSlots(Math.max(0, remaining));

				// Atualiza detalhes do plano
				setPlanDetails({
					type: currentPlan.type,
					isInTrial: currentPlan.isInTrial,
					trialEndDate: currentPlan.trialEndDate,
				});
			}
		} catch (error) {
			console.error("Erro ao carregar dados do plano:", error);
			// Valores padrão em caso de erro
			setCurrentPlan("Gratuito");
			setInstanceLimit(1);
			setRemainingSlots(Math.max(0, 1 - instances.length));
		}
	};

	const fetchInstances = async () => {
		try {
			setLoading(true);
			const token = authService.getToken();
			const response = await axios.get(`${API_BASE_URL}/api/instances`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setInstances(response.data.instances || []);
		} catch (error) {
			toast.error("Erro ao carregar instâncias");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const loadData = async () => {
			await fetchInstances();
			await fetchUserPlan();
		};

		loadData();
	}, []);

	// Adicione outro useEffect para atualizar os slots quando as instâncias mudarem
	useEffect(() => {
		if (instanceLimit > 0) {
			const remaining = instanceLimit - instances.length;
			setRemainingSlots(Math.max(0, remaining));
		}
	}, [instances.length, instanceLimit]);

	useEffect(() => {
		if (!isModalOpen) {
			setNewInstanceName("");
		}
	}, [isModalOpen]);

	const handleCreateInstance = async () => {
		if (!newInstanceName.trim()) {
			toast.error("Nome da instância é obrigatório");
			return;
		}

		if (remainingSlots <= 0) {
			toast.error(`Limite de instâncias atingido para o plano ${currentPlan}`);
			return;
		}

		setIsCreatingInstance(true);

		try {
			const token = authService.getToken();

			if (!token) {
				toast.error("Sessão expirada. Faça login novamente.");
				navigate("/login");
				return;
			}

			const response = await axios.post(
				`${API_BASE_URL}/api/instances/create`,
				{
					instanceName: newInstanceName,
					qrcode: true,
					integration: "WHATSAPP-BAILEYS",
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				},
			);

			console.log("Dados recebidos do backend:", response.data);

			// Aqui é onde a nova parte se encaixa
			// biome-ignore lint/complexity/useOptionalChain: <explanation>
			if (response.data && response.data.instance) {
				const newInstance = response.data.instance;
				setInstances((prev) => [...prev, newInstance]);
				startPolling(newInstance.id, newInstance.instanceName);

				// Configura o QR Code com os dados recebidos
				if (response.data.qrcode) {
					const { qrcode } = response.data;
					const qrBase64 =
						qrcode.base64 ||
						(qrcode.code ? `data:image/png;base64,${qrcode.code}` : null);

					if (qrBase64) {
						setQrCode({
							base64: qrBase64,
							pairingCode: qrcode.pairingCode || null,
						});

						setShowQrCodeModal(true);
						setIsModalOpen(false);
						setNewInstanceName("");

						console.log("QR Code configurado:", {
							// biome-ignore lint/style/useTemplate: <explanation>
							base64: qrBase64.substring(0, 100) + "...",
							pairingCode: qrcode.pairingCode,
						});

						toast.success(
							"Instância criada com sucesso! Escaneie o QR Code para conectar.",
						);
					} else {
						console.error("QR Code não encontrado na resposta:", qrcode);
						toast.error("Erro ao gerar QR Code");
					}
				}
			} else {
				console.error("Resposta inválida do servidor:", response.data);
				toast.error("Erro ao processar resposta do servidor");
			}

			// Atualiza a lista de instâncias
			await fetchInstances();
		} catch (error: any) {
			console.error("Erro ao criar instância:", error);
			toast.error(
				error.response?.data?.error ||
					error.response?.data?.message ||
					"Erro ao criar instância",
			);
		} finally {
			setIsCreatingInstance(false);
		}
	};

	useEffect(() => {
		if (qrCode) {
			console.log("QR Code atualizado:", {
				base64Length: qrCode.base64?.length,
				// biome-ignore lint/style/useTemplate: <explanation>
				base64Preview: qrCode.base64?.substring(0, 100) + "...",
				pairingCode: qrCode.pairingCode,
			});
		}
	}, [qrCode]);

	useEffect(() => {
		console.log("Modal QR Code:", {
			showModal: showQrCodeModal,
			hasQRCode: !!qrCode,
		});
	}, [showQrCodeModal, qrCode]);

	const startPolling = (instanceId: string, instanceName: string) => {
		const pollInterval = setInterval(async () => {
			try {
				const response = await axios.get(
					`${API_BASE_URL}/instance/connectionState/${instanceName}`,
					{
						headers: {
							apikey: API_KEY,
						},
					},
				);

				const currentStatus =
					response.data?.instance?.connectionStatus ||
					response.data?.instance?.state;

				if (
					currentStatus?.toUpperCase() === "OPEN" ||
					currentStatus?.toUpperCase() === "CONNECTED"
				) {
					updateInstanceStatus(instanceId, currentStatus.toUpperCase());
					clearInterval(pollInterval);
				}
			} catch (error) {
				console.error("Erro ao verificar status da instância:", error);
			}
		}, 5000); // Verifica a cada 5 segundos

		setPollingIntervals((prev) => ({ ...prev, [instanceId]: pollInterval }));
	};

	const updateInstanceStatus = (instanceId: string, status: string) => {
		setInstances((prevInstances) =>
			prevInstances.map((instance) =>
				instance.id === instanceId
					? { ...instance, connectionStatus: status }
					: instance,
			),
		);
	};

	const handleDeleteInstance = async (id: string, name: string) => {
		if (!window.confirm(`Tem certeza que deseja excluir a instância ${name}?`))
			return;

		setDeletingInstance(id);

		try {
			const token = authService.getToken();
			if (!token) {
				toast.error("Sessão expirada. Faça login novamente.");
				navigate("/login");
				return;
			}

			const response = await axios.delete(
				`${API_BASE_URL}/api/instances/instance/${id}`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			if (response.data.success) {
				toast.success("Instância excluída com sucesso!");
				await fetchInstances();
			} else {
				toast.error("Erro ao excluir instância.");
			}
		} catch (error) {
			console.error("Erro ao excluir instância:", error);
			handleError(error);
		} finally {
			setDeletingInstance(null);
		}
	};

	const handleReconnectInstance = async (instanceName) => {
		try {
			// Tenta conectar e obter o QR code
			const response = await axios.get(
				`${API_BASE_URL}/instance/connect/${instanceName}`,
				{
					headers: {
						apikey: API_KEY,
					},
				},
			);

			if (response.status === 200) {
				const qrCodeData = response.data;

				if (qrCodeData && (qrCodeData.base64 || qrCodeData.code)) {
					setQrCode({
						base64:
							qrCodeData.base64 || `data:image/png;base64,${qrCodeData.code}`,
						pairingCode: qrCodeData.pairingCode,
					});
					setShowQrCodeModal(true);
					toast.success("Escaneie o QR Code para conectar");
					startPolling(instanceName, instanceName);

					let attempts = 0;
					const maxAttempts = 60;

					// Inicia o monitoramento
					const intervalId = setInterval(async () => {
						try {
							attempts++;
							console.log(`Verificando status (tentativa ${attempts})`);

							const statusResponse = await axios.get(
								`${API_BASE_URL}/instance/connectionState/${instanceName}`,
								{
									headers: {
										apikey: API_KEY,
									},
								},
							);

							console.log("Status response:", statusResponse.data);
							const currentStatus =
								statusResponse.data?.instance?.connectionStatus ||
								statusResponse.data?.instance?.state;

							console.log("Current status:", currentStatus);

							if (currentStatus === "OPEN") {
								const token = localStorage.getItem("token");
								const instanceToUpdate = instances.find(
									(instance) => instance.instanceName === instanceName,
								);

								if (instanceToUpdate) {
									try {
										const updateResponse = await axios.put(
											`${API_BASE_URL}/api/instances/instance/${instanceToUpdate.instanceId}/connection-status`,
											{
												connectionStatus: "OPEN",
											},
											{
												headers: {
													Authorization: `Bearer ${token}`,
												},
											},
										);

										console.log("Update response:", updateResponse.data);
										toast.success("Instância conectada com sucesso!");
										setShowQrCodeModal(false);
										await fetchInstances();
										clearInterval(intervalId);
									} catch (updateError) {
										console.error("Erro ao atualizar status:", updateError);
										console.log(
											"Update error details:",
											updateError.response?.data,
										);
										toast.error("Erro ao atualizar status da instância");
									}
								}
							} else if (attempts >= maxAttempts) {
								toast.error("Tempo limite de conexão excedido");
								clearInterval(intervalId);
							}
						} catch (error) {
							console.error("Erro ao verificar status:", error);
							if (attempts >= maxAttempts) {
								clearInterval(intervalId);
							}
						}
					}, 2000);
					setTimeout(() => {
						clearInterval(intervalId);
					}, 120000);
				} else {
					console.error("QR code não encontrado na resposta:", qrCodeData);
					toast.error("Erro ao obter QR code para reconexão");
				}
			} else {
				toast.error("Erro ao tentar reconectar a instância");
			}
		} catch (error) {
			console.error("Erro ao reconectar instância:", error);
			handleError(error);
		}
	};

	const handleLogoutInstance = async (instanceName) => {
		try {
			// Primeiro faz logout na API externa
			await axios.delete(`${API_BASE_URL}/instance/logout/${instanceName}`, {
				headers: {
					apikey: API_KEY,
				},
			});

			// Após logout bem-sucedido, atualiza o status no banco local
			const token = localStorage.getItem("token");
			const instanceToUpdate = instances.find(
				(instance) => instance.instanceName === instanceName,
			);

			if (instanceToUpdate) {
				try {
					await axios.put(
						`${API_BASE_URL}/api/instances/instance/${instanceToUpdate.instanceId}/connection-status`,
						{
							connectionStatus: "close",
						},
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						},
					);

					toast.success("Instância desconectada com sucesso!");
					await fetchInstances(); // Recarrega os dados atualizados
				} catch (updateError) {
					console.error(
						"Erro ao atualizar status no banco local:",
						updateError,
					);
					toast.error("Erro ao atualizar status da instância no banco local");
				}
			}
		} catch (error) {
			console.error("Erro ao desconectar instância:", error);
			toast.error(
				error.response?.data?.message || "Erro ao desconectar instância",
			);
		}
	};

	function handleConfigureTypebot(instance: Instance): void {
		setSelectedInstance(instance);
		setShowTypebotConfig(true);
	}

	const handleConfigureProxy = (instance: Instance) => {
		setSelectedInstanceForProxy(instance);
		setShowProxyConfig(true);
	};

	const handleSaveProxyConfig = async (config: ProxyConfig) => {
		if (!selectedInstanceForProxy) return;

		try {
			const token = authService.getToken();
			if (!token) {
				toast.error("Sessão expirada. Faça login novamente.");
				navigate("/login");
				return;
			}

			const response = await axios.put(
				`${API_BASE_URL}/api/instances/instance/${selectedInstanceForProxy.id}/proxy`,
				config,
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			if (response.data) {
				toast.success("Configurações de proxy atualizadas com sucesso!");
				setInstances((prevInstances) =>
					prevInstances.map((instance) =>
						instance.id === selectedInstanceForProxy.id
							? { ...instance, proxyConfig: config }
							: instance,
					),
				);
				setShowProxyConfig(false);
				setSelectedInstanceForProxy(null);
			} else {
				throw new Error("Falha ao atualizar configurações de proxy");
			}
		} catch (error) {
			console.error("Erro ao atualizar configurações de proxy:", error);
			toast.error("Erro ao atualizar configurações de proxy");
		}
	};

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			className="min-h-screen bg-gradient-to-br from-deep to-neon-purple/10 p-8"
		>
			<Toaster position="top-right" />

			{/* Status Bar */}
			<div className="max-w-7xl mx-auto mb-6">
				<motion.div
					variants={itemVariants}
					className="bg-deep/80 backdrop-blur-xl p-4 rounded-xl border border-electric/20 shadow-lg"
				>
					<div className="flex flex-wrap gap-6 justify-between items-center">
						<div className="flex items-center gap-2">
							<span className="text-white/60">Plano:</span>
							<span className="text-electric font-semibold">{currentPlan}</span>
						</div>

						{planDetails.isInTrial && (
							<div className="flex items-center gap-2">
								<span className="text-white/60">Teste até:</span>
								<span className="text-white font-semibold">
									{new Date(planDetails.trialEndDate || "").toLocaleDateString(
										"pt-BR",
									)}
								</span>
							</div>
						)}

						<div className="flex items-center gap-2">
							<span className="text-white/60">Instâncias:</span>
							<span className="text-white font-semibold">
								<span className="text-neon-green">{instances.length}</span>
								{" / "}
								<span>{instanceLimit}</span>
							</span>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-white/60">Disponível:</span>
							<span
								className={`font-semibold ${
									remainingSlots > 0 ? "text-neon-green" : "text-red-500"
								}`}
							>
								{remainingSlots}
							</span>
						</div>
					</div>
				</motion.div>
			</div>
			{/* Header */}
			<div className="flex justify-between max-w-7xl mx-auto mb-8 items-center">
				<h1 className="text-3xl font-bold text-white">Instâncias WhatsApp</h1>
				<Button
					variant="gradient"
					size="lg"
					onClick={() => setIsModalOpen(true)}
					disabled={remainingSlots <= 0}
					className={`
    bg-gradient-to-r from-electric via-neon-purple to-electric
    hover:shadow-lg hover:shadow-electric/30 transition-all duration-300
    ${remainingSlots <= 0 ? "opacity-50 cursor-not-allowed" : ""}
  `}
				>
					<Plus className="w-5 h-5 mr-2" />
					Nova Instância
					{remainingSlots <= 0 && " (Limite atingido)"}
				</Button>
			</div>
			{/* Modal de Configuração do Proxy */}
			{showProxyConfig && selectedInstanceForProxy && (
				<ProxyConfigModal
					instanceName={selectedInstanceForProxy.instanceName}
					onClose={() => setShowProxyConfig(false)}
					onSave={handleSaveProxyConfig}
				/>
			)}

			{/* Modal de Configuração do Typebot */}
			{showTypebotConfig && selectedInstance && (
				<Modal
					isOpen={showTypebotConfig}
					onClose={() => {
						setShowTypebotConfig(false);
						setSelectedInstance(null);
					}}
					title={
						selectedInstance.typebot ? "Editar Typebot" : "Adicionar Typebot"
					}
				>
					<TypebotConfigForm
						instance={selectedInstance}
						onUpdate={(config) =>
							handleUpdateTypebotConfig(config, selectedInstance.id)
						}
						onDelete={handleDeleteTypebotConfig}
						isEditing={!!selectedInstance.typebot}
					/>
				</Modal>
			)}

			{/* Grid de Instâncias */}
			{loading ? (
				<div className="flex justify-center items-center h-64">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{
							duration: 1,
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
						}}
						className="w-12 h-12 border-4 border-electric border-t-transparent rounded-full
                shadow-lg shadow-electric/30"
					/>
				</div>
			) : (
				<motion.div
					variants={containerVariants}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
				>
					{instances.map((instance) => (
						<InstanceCard
							key={instance.id}
							instance={instance}
							onReconnect={handleReconnectInstance}
							onLogout={handleLogoutInstance}
							onDelete={handleDeleteInstance}
							deletingInstance={deletingInstance}
							typebotFlows={typebotFlows}
							onAddTypebotFlow={handleAddTypebotFlow}
							onEditTypebotFlow={handleEditTypebotFlow}
							onDeleteTypebotFlow={handleDeleteTypebotFlow}
						/>
					))}
				</motion.div>
			)}

			{/* Modal de Nova Instância */}
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<div className="p-6 bg-deep/80 backdrop-blur-xl rounded-xl border border-electric/20">
					<h2 className="text-2xl font-bold text-white mb-4">
						Nova Instância WhatsApp
					</h2>

					<p className="text-white/70 mb-4">
						Você está no plano{" "}
						<span className="text-electric font-semibold">{currentPlan}</span>.
						Limite de instâncias:{" "}
						<span className="text-electric font-semibold">{instanceLimit}</span>
						. Disponível:{" "}
						<span
							className={`${
								remainingSlots > 0 ? "text-neon-green" : "text-red-500"
							}`}
						>
							{remainingSlots}
						</span>
						.
					</p>

					<Input
						placeholder="Nome da instância (ex: Vendas, Suporte)"
						value={newInstanceName}
						onChange={(e) => setNewInstanceName(e.target.value)}
						disabled={isCreatingInstance}
						className="mb-4 bg-deep/50 border-electric/20 text-white placeholder:text-white/50"
					/>

					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => setIsModalOpen(false)}
							disabled={isCreatingInstance}
							className="text-white/70 border-white/20 hover:bg-white/10"
						>
							Cancelar
						</Button>
						<Button
							variant="gradient"
							onClick={async () => await handleCreateInstance()}
							disabled={
								isCreatingInstance ||
								!newInstanceName.trim() ||
								remainingSlots <= 0
							}
							className={`
                bg-gradient-to-r from-electric to-neon-purple
                hover:shadow-lg hover:shadow-electric/50
                ${
									isCreatingInstance ||
									!newInstanceName.trim() ||
									remainingSlots <= 0
										? "opacity-50 cursor-not-allowed"
										: ""
								}
              `}
						>
							{isCreatingInstance ? (
								<div className="flex items-center">
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Number.POSITIVE_INFINITY,
											ease: "linear",
										}}
										className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
									/>
									Criando...
								</div>
							) : (
								"Criar Instância"
							)}
						</Button>
					</div>
				</div>
			</Modal>

			{/* Modal do QR Code */}
			{showQrCodeModal && qrCode?.base64 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4"
				>
					<motion.div
						initial={{ y: 20, opacity: 0, scale: 0.95 }}
						animate={{ y: 0, opacity: 1, scale: 1 }}
						exit={{ y: 20, opacity: 0, scale: 0.95 }}
						className="bg-deep/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-electric/20 w-full max-w-md relative"
					>
						{/* Botão Fechar */}
						<button
							onClick={closeQrCodeModal}
							className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
						>
							<X className="w-5 h-5 text-white" />
						</button>

						{/* Cabeçalho */}
						<div className="text-center mb-6">
							<h2 className="text-2xl font-bold text-white mb-2">
								Conectar WhatsApp
							</h2>
							<p className="text-white/70">
								Escaneie o QR Code com seu WhatsApp
							</p>
						</div>

						{/* Container do QR Code */}
						<div className="bg-white p-4 rounded-xl shadow-inner mb-6">
							{!qrCodeError ? (
								<img
									src={qrCode.base64}
									alt="QR Code"
									className="w-full aspect-square object-contain"
									onError={() => {
										console.error("Erro ao carregar QR code");
										setQrCodeError(true);
									}}
								/>
							) : (
								<div className="flex flex-col items-center justify-center h-64 text-red-500">
									<AlertCircle className="w-12 h-12 mb-2" />
									<p>Erro ao carregar QR code. Tente novamente.</p>
								</div>
							)}
						</div>

						{/* Instruções */}
						<div className="space-y-4 mb-6">
							<p className="text-white/80 text-sm">
								1. Abra o WhatsApp no seu celular
							</p>
							<p className="text-white/80 text-sm">
								2. Toque em Menu ou Configurações e selecione Aparelhos
								Conectados
							</p>
							<p className="text-white/80 text-sm">
								3. Aponte seu celular para esta tela para capturar o código
							</p>
						</div>

						{/* Botão Fechar */}
						<motion.button
							onClick={closeQrCodeModal}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="w-full py-3 px-4 bg-gradient-to-r from-electric to-neon-purple rounded-lg
                 text-white font-medium shadow-lg hover:shadow-electric/25
                 transition-all duration-300"
						>
							Fechar
						</motion.button>
					</motion.div>
				</motion.div>
			)}
		</motion.div>
	);
};

export default Instances;
