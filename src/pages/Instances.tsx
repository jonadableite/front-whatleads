// src/pages/Instances.tsx
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Instance } from "@/interface";
import { authService } from "@/services/auth.service";
import axios from "axios";
import { motion } from "framer-motion";
import { AlertCircle, Bot, HelpCircle, Loader2, Lock, Plus, Power, Save, Settings, Trash2, Wifi, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


// Constantes
const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:9000";
const API_EVO_URL =
	import.meta.env.VITE_EVOLUTION_API_UR || "http://localhost:8080";
const API_KEY =
	import.meta.env.VITE_PUBLIC_API_KEY || "429683C4C977415CAAFCCE10F7D57E11";


// Animações
// Container principal com um Fade-in e leve scale-up
const containerVariants = {
	hidden: { opacity: 0, scale: 0.98 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			staggerChildren: 0.1, // Atraso entre a animação de cada item filho
			duration: 0.5,
			ease: "easeOut",
		},
	},
};


// Animação para cada item (cartão de instância)
const itemVariants = {
	hidden: { y: 30, opacity: 0, scale: 0.9 },
	visible: {
		y: 0,
		opacity: 1,
		scale: 1,
		transition: {
			type: "spring", // Animação mais natural
			stiffness: 120, // Rigidez da mola
			damping: 15, // Amortecimento
		},
	},
};


// Animação de pulso para o status online
const pulseAnimation = {
	scale: [1, 1.2, 1],
	opacity: [0.5, 1, 0.5],
	transition: {
		duration: 2,
		repeat: Number.POSITIVE_INFINITY,
		ease: "easeInOut",
	},
};


// Animação de hover para botões e cartões
const hoverAnimation = {
	scale: 1.03,
	boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)", // Sombra com cor neon-purple/electric
	transition: {
		duration: 0.2,
		ease: "easeOut",
	},
};

// Animação de clique para botões
const tapAnimation = {
	scale: 0.97,
	transition: {
		duration: 0.1,
		ease: "easeOut",
	},
};


interface InstanceSettings {
	rejectCall: boolean;
	msgCall: string;
	groupsIgnore: boolean;
	alwaysOnline: boolean;
	readMessages: boolean;
	syncFullHistory: boolean;
	readStatus: boolean;
	wavoipToken?: string;
}


// Interface para as configurações do Agente IA
interface AgentSettings {
	id?: string; // Opcional para criação
	instanceName: string;
	description: string;
	model: string;
	temperature: number;
	maxTokens: number;
	topP: number;
	frequencyPenalty: number;
	presencePenalty: number;
	timeout: number;
	keepOpen: boolean;
	debounceTime: number;
	keywordFinish: string;
	unknownMessage: string;
	splitMessages: boolean;
	timePerChar: number;
	ignoreJids: string[];
	createdAt?: string;
	updatedAt?: string;
}


// Componente: Connection Status
const ConnectionStatus: React.FC<{ connected: boolean }> = ({ connected }) => (
	<motion.div
		initial={{ opacity: 0, scale: 0.8 }}
		animate={{ opacity: 1, scale: 1 }}
		className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl border
      ${connected
				? "bg-neon-green/10 text-neon-green border-neon-green/30" // Bordas mais visíveis
				: "bg-red-500/10 text-red-500 border-red-500/30"
			}`}
	>
		<motion.div
			animate={connected ? pulseAnimation : {}}
			className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-neon-green" : "bg-red-500"
				}`} // Tamanho do ponto ligeiramente maior
		/>
		<span className="text-xs font-medium">
			{connected ? "Online" : "Offline"}
		</span>
	</motion.div>
);


// Componente: InstanceCard (com aprimoramento na animação da foto)
const InstanceCard: React.FC<{
	instance: Instance;
	onReconnect: (name: string) => void;
	onLogout: (name: string) => void;
	onDelete: (id: string, name: string) => void;
	onConfigureSettings: (instance: Instance) => void;
	onOpenAgentModal: (instance: Instance) => void;
	deletingInstance: string | null;
}> = ({
	instance,
	onReconnect,
	onLogout,
	onDelete,
	onConfigureSettings,
	onOpenAgentModal,
	deletingInstance,
}) => {
		const isConnected =
			instance.connectionStatus === "OPEN" ||
			instance.connectionStatus === "CONNECTED";

		// Limpa o ownerJid para exibir apenas o número
		const cleanOwnerJid = instance.ownerJid
			? instance.ownerJid.replace('@s.whatsapp.net', '')
			: 'Sem número';

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
				whileHover={hoverAnimation} // Aplicar animação de hover
				whileTap={tapAnimation} // Aplicar animação de clique
				className="relative group bg-deep/60 backdrop-blur-2xl p-6 rounded-2xl border border-electric/40 shadow-lg hover:shadow-electric/30 transition-all duration-300 flex flex-col space-y-6 overflow-hidden"
			>
				{/* Efeito de fundo sutil com gradiente animado */}
				<motion.div
					className="absolute inset-0 bg-gradient-to-tr from-electric/10 to-neon-purple/10 opacity-70"
					initial={{ backgroundPosition: '0% 0%' }}
					animate={{ backgroundPosition: '100% 100%' }}
					transition={{
						duration: 10,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
						repeatType: "reverse"
					}}
					style={{ backgroundSize: '200% 200%' }}
				/>

				{/* Conteúdo principal com espaçamento vertical entre os blocos */}
				<div className="relative z-10 flex flex-col space-y-5">
					{/* Header da Instância - Mantido flex para alinhar nome/foto e status */}
					<div className="flex justify-between items-center flex-wrap gap-4">
						<div className="flex items-center space-x-4">
							{/* Contêiner da Foto de Perfil ou Ícone Padrão */}
							<div className="relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-gray-700 border-2 border-transparent group-hover:border-neon-green/50 transition-colors duration-300">

								{/* Arco Neon Gradiente Rotativo - Visível apenas quando conectado */}
								{isConnected && (
									<motion.div
										className="absolute inset-[-5px] rounded-full" // Torna este div ligeiramente maior que o contêiner pai
										initial={{ rotate: 0 }}
										animate={{ rotate: 360 }}
										transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} // Animação de rotação
										style={{
											// Gradiente de Azul para Roxo
											background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
											padding: '5px', // Controla a espessura do anel
											// Máscara para criar o efeito de anel (corta o centro)
											WebkitMask: 'radial-gradient(circle, transparent calc(50% - 5px), black calc(50% - 5px + 1px))',
											mask: 'radial-gradient(circle, transparent calc(50% - 5px), black calc(50% - 5px + 1px))',
										}}
									/>
								)}

								{/* Foto de Perfil ou Ícone Padrão */}
								{instance.profilePicUrl ? (
									<img
										src={instance.profilePicUrl}
										alt={`Foto de perfil de ${instance.instanceName}`}
										className="w-full h-full object-cover relative z-10" // Garante que a imagem fique acima do anel
									/>
								) : (
									<FaWhatsapp className="w-9 h-9 text-green-500/80 relative z-10" /> // Garante que o ícone fique acima do anel
								)}

								{/* Removido o efeito de brilho sutil no hover para evitar conflito visual */}
							</div>

							{/* Nome e Número da Instância */}
							<div className="flex flex-col">
								<h3 className="text-2xl font-bold text-blue-400">
									{instance.instanceName}
								</h3>
								<p className="text-sm text-gray-400 flex items-center">
									<FaWhatsapp className="inline-block mr-1 text-green-500/80" /> {cleanOwnerJid}
								</p>
							</div>
						</div>
						{/* Status de Conexão */}
						<ConnectionStatus connected={isConnected} />
					</div>

					{/* Grupo de Botões de Ação (Reconectar/Logout, Config, Agente IA) */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
						{/* Botão de Reconectar ou Logout (condicional) */}
						{isConnected ? (
							<motion.div whileTap={tapAnimation} className="w-full">
								<Button
									variant="outline"
									size="lg"
									onClick={() => onLogout(instance.instanceName)}
									className="w-full bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20 hover:bg-neon-yellow/30 hover:border-neon-yellow/40 transition-all duration-300"
								>
									<Power className="w-5 h-5 mr-2" /> Logout
								</Button>
							</motion.div>
						) : (
							<motion.div whileTap={tapAnimation} className="w-full">
								<Button
									variant="outline"
									size="lg"
									onClick={() => onReconnect(instance.instanceName)}
									className="w-full bg-neon-green/10 text-neon-green border-neon-green/20 hover:bg-neon-green/30 hover:border-neon-green/40 transition-all duration-300"
								>
									<Wifi className="w-5 h-5 mr-2" /> Reconectar
								</Button>
							</motion.div>
						)}

						{/* Botão de Configuração */}
						<motion.div whileTap={tapAnimation} className="w-full">
							<Button
								variant="outline"
								size="lg"
								onClick={() => onConfigureSettings(instance)}
								className="w-full bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/30 hover:border-blue-500/40 transition-all duration-300"
							>
								<Settings className="w-5 h-5 mr-2" /> Configurar
							</Button>
						</motion.div>

						{/* Botão de Adicionar Agente IA */}
						<motion.div whileTap={tapAnimation} className="w-full">
							<Button
								variant="outline"
								size="lg"
								onClick={() => onOpenAgentModal(instance)}
								className="w-full bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/30 hover:border-purple-500/40 transition-all duration-300"
							>
								<Bot className="w-5 h-5 mr-2" /> Agente IA
							</Button>
						</motion.div>
					</div>

					{/* Botão de Excluir Instância - Separado para controle de espaçamento */}
					<motion.div whileTap={tapAnimation} className="mt-4">
						<Button
							variant="outline"
							size="lg"
							onClick={handleDeleteInstance}
							disabled={deletingInstance === instance.id}
							className="w-full bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/30 hover:border-red-500/40 transition-all duration-300"
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
							Excluir WhatsApp
						</Button>
					</motion.div>

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
	const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
		null,
	);
	const [deletingInstance, setDeletingInstance] = useState<string | null>(null);
	const [qrCodeError, setQrCodeError] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreatingInstance, setIsCreatingInstance] = useState(false);
	const [currentPlan, setCurrentPlan] = useState("");
	const [instanceLimit, setInstanceLimit] = useState(1);
	const [remainingSlots, setRemainingSlots] = useState(0);
	const [pollingIntervals, setPollingIntervals] = useState<{
		[key: string]: any;
	}>({});


	const [qrCode, setQrCode] = useState<{
		base64: string;
		pairingCode?: string;
	} | null>(null);
	const [showQrCodeModal, setShowQrCodeModal] = useState(false);
	const [newInstaceName, setNewInstaceName] = useState("");
	const [planDetails, setPlanDetails] = useState<{
		type?: string;
		isInTrial?: boolean;
		trialEndDate?: string | null;
		leadsLimit?: number;
		currentLeads?: number;
		leadsPercentage?: number;
	}>({});


	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const [instanceToConfigure, setInstanceToConfigure] = useState<Instance | null>(null);
	const [instanceSettings, setInstanceSettings] = useState<InstanceSettings | null>(null);
	const [settingsFormData, setSettingsFormData] = useState<InstanceSettings | null>(null);
	const [isLoadingSettings, setIsLoadingSettings] = useState(false);
	const [isSavingSettings, setIsSavingSettings] = useState(false);

	// Estados para o modal de Agente IA
	const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState<AgentSettings | null>(null); // Para editar um agente existente
	const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null); // Para buscar agente existente
	const [formData, setFormData] = useState<AgentSettings>({
		instanceName: "", // Será preenchido ao abrir o modal
		description: "",
		model: "gpt-4o", // Valor padrão
		temperature: 0.7, // Valor padrão
		maxTokens: 500, // Valor padrão
		topP: 1, // Valor padrão
		frequencyPenalty: 0, // Valor padrão
		presencePenalty: 0, // Valor padrão
		timeout: 60, // Valor padrão em segundos
		keepOpen: false, // Valor padrão
		debounceTime: 3, // Valor padrão em segundos
		keywordFinish: "sair", // Valor padrão
		unknownMessage: "Desculpe, não consegui entender. Pode repetir?", // Valor padrão
		splitMessages: true, // Valor padrão
		timePerChar: 50, // Valor padrão em ms
		ignoreJids: [], // Valor padrão
	});
	const [ignoreJidInput, setIgnoreJidInput] = useState("");
	const [isLoadingAgent, setIsLoadingAgent] = useState(false);
	const [isSavingAgent, setIsSavingAgent] = useState(false);


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


	const fetchUserPlan = async () => {
		const currentUser = authService.getUser();
		if (!currentUser || !currentUser.id) {
			console.warn("Usuário não autenticado ou ID do usuário ausente. Não foi possível buscar o plano.");
			// Limpar estados relevantes
			setCurrentPlan("N/A");
			setInstanceLimit(0);
			setRemainingSlots(0);
			setPlanDetails({}); // Limpa os detalhes completos também
			return;
		}

		try {
			const token = authService.getTokenInterno();
			if (!token) {
				console.error("Token interno não encontrado para buscar o plano. O usuário pode precisar fazer login novamente.");
				setCurrentPlan("N/A");
				setInstanceLimit(0);
				setRemainingSlots(0);
				setPlanDetails({});
				return;
			}

			const response = await axios.get(`${API_BASE_URL}/api/users/plan-status`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			console.log("Informações do plano recuperadas com sucesso:", response.data);

			// Validação mais robusta da estrutura da resposta
			if (!response.data || !response.data.plan || !response.data.limits || !response.data.usage) {
				console.error("Estrutura de resposta de plano inesperada:", response.data);
				toast.error("Erro ao carregar detalhes do plano.");
				setCurrentPlan("N/A");
				setInstanceLimit(0);
				setRemainingSlots(0);
				setPlanDetails({});
				return;
			}

			const { plan, limits, usage } = response.data;

			setCurrentPlan(plan.name || "Plano Desconhecido");
			const limit = limits.maxInstances || 0; // Usar maxInstances conforme API
			setInstanceLimit(limit);
			setRemainingSlots(Math.max(0, limit - usage.currentInstances)); // Usar currentInstances conforme API

			// Armazena detalhes completos do plano, incluindo limits e usage
			setPlanDetails(response.data);

		} catch (error) {
			console.error("Erro ao buscar status do plano:", error);
			handleError(error);

			setCurrentPlan("Erro ao carregar");
			setInstanceLimit(0);
			setRemainingSlots(0);
			setPlanDetails({});
		} finally {
			// setLoadingPlan(false);
		}
	};


	const fetchInstances = async () => {
		setLoading(true);
		try {
			const token = authService.getTokenInterno();
			const response = await axios.get(`${API_BASE_URL}/api/instances`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const instancesArray = response.data.instances;
			setInstances(instancesArray);
		} catch (error) {
			handleError(error);
		} finally {
			setLoading(false);
		}
	};


	const createInstance = async () => {
		if (!newInstanceName.trim()) {
			toast.error("O nome da instância não pode ser vazio.");
			return;
		}
		if (instances.length >= instanceLimit) {
			toast.error(`Você atingiu o limite de ${instanceLimit} instâncias para o seu plano.`);
			return;
		}


		setIsCreatingInstance(true);
		try {
			const token = authService.getTokenInterno();
			const response = await axios.post(
				`${API_BASE_URL}/api/instances/create`,
				{ instanceName: newInstanceName },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);


			const newInstance = response.data;
			setInstances([...instances, newInstance]);
			setNewInstanceName("");
			setIsModalOpen(false);
			toast.success(`Instância "${newInstance.instanceName}" criada com sucesso!`);


			// Iniciar polling para o QR Code
			startPolling(newInstance.instanceName);


		} catch (error) {
			handleError(error);
		} finally {
			setIsCreatingInstance(false);
		}
	};


	const startPolling = (instanceName: string) => {
		// Limpar polling anterior para esta instância, se existir
		if (pollingIntervals[instanceName]) {
			clearInterval(pollingIntervals[instanceName]);
		}


		const intervalId = setInterval(async () => {
			try {
				const token = authService.getTokenInterno();
				const response = await axios.get(
					`${API_BASE_URL}/api/instances/status/${instanceName}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);


				const { status, qrcode: currentQrCode, pairingCode } = response.data;


				// Atualizar a lista de instâncias com o novo status e QR Code
				setInstances((prevInstances) =>
					prevInstances.map((inst) =>
						inst.instanceName === instanceName
							? { ...inst, connectionStatus: status, qrcode: currentQrCode, pairingCode: pairingCode }
							: inst
					)
				);


				// Se o status for CONNECTED ou se houver um erro no QR Code, parar o polling
				if (status === "OPEN" || status === "CONNECTED" || status === "DISCONNECTED") {
					clearInterval(intervalId);
					setPollingIntervals((prev) => {
						const newIntervals = { ...prev };
						delete newIntervals[instanceName];
						return newIntervals;
					});


					// Fechar o modal de QR Code se estiver aberto para esta instância
					if (showQrCodeModal && newInstaceName === instanceName) {
						setShowQrCodeModal(false);
						setQrCode(null);
						setQrCodeError(false);
						toast.success(`Instância "${instanceName}" conectada!`);
					}


				} else if (status === "QRCODE") {
					// Se estiver no estado QRCODE e houver um QR Code, exibi-lo
					if (currentQrCode) {
						setQrCode({ base64: currentQrCode, pairingCode });
						setNewInstaceName(instanceName);
						setShowQrCodeModal(true);
						setQrCodeError(false);
					} else {
						// Se o status for QRCODE mas não houver QR Code, pode ser um erro temporário
						setQrCodeError(true);
					}
				} else if (status === "STARTING") {
					// Opcional: exibir uma mensagem de "Iniciando"
					console.log(`Instância "${instanceName}" está iniciando...`);
					setQrCode(null);
					setQrCodeError(false);
				}


			} catch (error) {
				console.error(`Erro no polling para ${instanceName}:`, error);
				// Em caso de erro, parar o polling para evitar loops infinitos
				clearInterval(intervalId);
				setPollingIntervals((prev) => {
					const newIntervals = { ...prev };
					delete newIntervals[instanceName];
					return newIntervals;
				});
				// Opcional: exibir um toast de erro
				// toast.error(`Falha na comunicação com a instância "${instanceName}".`);
			}
		}, 5000); // Polling a cada 5 segundos


		setPollingIntervals((prev) => ({ ...prev, [instanceName]: intervalId }));
	};


	const reconnectInstance = async (instanceName: string) => {
		try {
			const token = authService.getTokenInterno();
			await axios.post(
				`${API_BASE_URL}/api/instances/connect/${instanceName}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			toast.success(`Tentando reconectar a instância "${instanceName}".`);
			// Opcional: iniciar polling após tentar reconectar
			startPolling(instanceName);
		} catch (error) {
			handleError(error);
			toast.error(`Falha ao tentar reconectar a instância "${instanceName}".`);
		}
	};


	const logoutInstance = async (instanceName: string) => {
		try {
			const token = authService.getTokenInterno();
			await axios.post(
				`${API_BASE_URL}/api/instances/logout/${instanceName}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			toast.success(`Instância "${instanceName}" desconectada com sucesso.`);
			fetchInstances(); // Atualiza a lista para refletir o status
		} catch (error) {
			handleError(error);
			toast.error(`Falha ao desconectar a instância "${instanceName}".`);
		}
	};


	const deleteInstance = async (id: string, name: string) => {
		setDeletingInstance(id);
		try {
			const token = authService.getTokenInterno();
			await axios.delete(`${API_BASE_URL}/api/instances/${id}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			toast.success(`Instância "${name}" excluída com sucesso.`);
			fetchInstances(); // Atualiza a lista
		} catch (error) {
			handleError(error);
			toast.error(`Falha ao excluir a instância "${name}".`);
		} finally {
			setDeletingInstance(null);
		}
	};


	// Handler para abrir o modal de configurações da Instância
	const handleOpenSettingsModal = (instance: Instance) => {
		setInstanceToConfigure(instance);
		fetchInstanceSettings(instance.instanceName);
		setIsSettingsModalOpen(true);
	};


	// Handler para abrir o modal de configuração do Agente IA
	const handleOpenAgentModal = (instance: Instance) => {
		setSelectedInstance(instance); // Define a instância para o modal de agente
		setSelectedAgent(null); // Reseta para modo criação/busca
		setSelectedAgentId(null); // Reseta o ID do agente
		// Resetar formData para valores padrão para criação
		setFormData({
			instanceName: instance.instanceName, // Preenche com o nome da instância
			description: "",
			model: "gpt-4o",
			temperature: 0.7,
			maxTokens: 500,
			topP: 1,
			frequencyPenalty: 0,
			presencePenalty: 0,
			timeout: 60,
			keepOpen: false,
			debounceTime: 3,
			keywordFinish: "sair",
			unknownMessage: "Desculpe, não consegui entender. Pode repetir?",
			splitMessages: true,
			timePerChar: 50,
			ignoreJids: [],
		});
		setIgnoreJidInput(""); // Limpa o input de ignoreJid
		fetchAgentSettings(instance.instanceName); // Tenta buscar um agente existente para esta instância
		setIsAgentModalOpen(true);
	};


	// --- Funções para Configurações da Instância ---
	const fetchInstanceSettings = async (instanceName: string) => {
		setIsLoadingSettings(true);
		try {
			// Nota: A API de settings parece usar API Key global, não token interno.
			// Adapte conforme a sua API. Usei API_KEY e API_EVO_URL conforme suas constantes.
			const response = await axios.get(
				`${API_EVO_URL}/settings/find/${instanceName}`,
				{
					headers: {
						Apikey: API_KEY, // Usando Apikey conforme seu GET de exemplo
					},
				}
			);
			const settings = response.data as InstanceSettings;
			setInstanceSettings(settings);
			setSettingsFormData(settings); // Preenche o formulário com os dados atuais
		} catch (error) {
			console.error("Erro ao buscar configurações da instância:", error);
			handleError(error);
			setInstanceSettings(null);
			setSettingsFormData(null);
		} finally {
			setIsLoadingSettings(false);
		}
	};


	const handleSettingsFormChange = (field: keyof InstanceSettings, value: any) => {
		setSettingsFormData((prev) => (prev ? { ...prev, [field]: value } : null));
	};


	const saveInstanceSettings = async () => {
		if (!instanceToConfigure || !settingsFormData) return;


		setIsSavingSettings(true);
		try {
			// Nota: A API de settings parece usar API Key global e POST.
			// Adapte conforme a sua API. Usei API_KEY e API_EVO_URL conforme suas constantes.
			await axios.post(
				`${API_EVO_URL}/settings/set/${instanceToConfigure.instanceName}`,
				settingsFormData,
				{
					headers: {
						Apikey: API_KEY, // Usando Apikey conforme seu POST de exemplo
						"Content-Type": "application/json",
					},
				}
			);
			toast.success(
				`Configurações da instância "${instanceToConfigure.instanceName}" salvas com sucesso!`
			);
			setIsSettingsModalOpen(false);
			setInstanceToConfigure(null);
			setInstanceSettings(null);
			setSettingsFormData(null);
		} catch (error) {
			console.error("Erro ao salvar configurações da instância:", error);
			handleError(error);
			toast.error(
				`Falha ao salvar configurações da instância "${instanceToConfigure.instanceName}".`
			);
		} finally {
			setIsSavingSettings(false);
		}
	};


	const cancelSettingsEditing = () => {
		setIsSettingsModalOpen(false);
		setInstanceToConfigure(null);
		setInstanceSettings(null);
		setSettingsFormData(null);
	};


	// --- Funções para Configuração do Agente IA ---
	const fetchAgentSettings = async (instanceName: string) => {
		setIsLoadingAgent(true);
		try {
			// Busca todos os agentes para esta instância. Assumimos que só há 0 ou 1 por instância.
			const token = authService.getTokenInterno();
			const response = await axios.get(
				`${API_BASE_URL}/api/evoai/find/${instanceName}`, // Endpoint de busca de agentes por instância
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);


			const agents = response.data as AgentSettings[];


			if (agents && agents.length > 0) {
				// Se encontrar um agente, preenche o formulário com os dados dele
				const agent = agents[0]; // Pega o primeiro (e único esperado) agente
				setSelectedAgent(agent);
				setSelectedAgentId(agent.id || null);
				setFormData(agent); // Preenche o formulário com os dados do agente existente
				toast.success(`Agente IA encontrado para "${instanceName}".`);
			} else {
				// Se não encontrar, mantém o formulário com valores padrão para criação
				setSelectedAgent(null);
				setSelectedAgentId(null);
				toast("Nenhum Agente IA encontrado para esta instância. Crie um novo.", { icon: 'ℹ️' });
			}
		} catch (error) {
			console.error("Erro ao buscar configurações do agente IA:", error);
			handleError(error);
			setSelectedAgent(null);
			setSelectedAgentId(null);
			// Mantém formData com valores padrão em caso de erro na busca
		} finally {
			setIsLoadingAgent(false);
		}
	};


	const handleFormChange = (field: keyof AgentSettings, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};


	const addIgnoreJid = () => {
		const jid = ignoreJidInput.trim();
		if (jid && !formData.ignoreJids.includes(jid)) {
			setFormData((prev) => ({
				...prev,
				ignoreJids: [...prev.ignoreJids, jid],
			}));
			setIgnoreJidInput("");
		} else if (jid && formData.ignoreJids.includes(jid)) {
			toast.error("Este número já está na lista.");
		}
	};


	const removeIgnoreJid = (jidToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			ignoreJids: prev.ignoreJids.filter((jid) => jid !== jidToRemove),
		}));
	};


	const handleIgnoreJidKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault(); // Previne o envio do formulário
			addIgnoreJid();
		}
	};


	const saveAgent = async () => {
		if (!selectedInstance) {
			toast.error("Nenhuma instância selecionada para configurar o agente.");
			return;
		}


		// Validação básica
		if (!formData.description.trim()) {
			toast.error("A descrição do agente é obrigatória.");
			return;
		}
		if (!formData.keywordFinish.trim()) {
			toast.error("A palavra para encerrar é obrigatória.");
			return;
		}
		if (!formData.unknownMessage.trim()) {
			toast.error("A mensagem para quando não entender é obrigatória.");
			return;
		}


		setIsSavingAgent(true);
		try {
			const token = authService.getTokenInterno();
			let url = `${API_BASE_URL}/api/evoai`;
			let method = "POST";
			let successMessage = `Agente IA para "${selectedInstance.instanceName}" criado com sucesso!`;


			if (selectedAgentId) {
				// Se selectedAgentId existe, estamos atualizando
				url = `${API_BASE_URL}/api/evoai/update/${selectedAgentId}/${selectedInstance.instanceName}`;
				method = "PUT";
				successMessage = `Agente IA para "${selectedInstance.instanceName}" atualizado com sucesso!`;
			} else {
				// Se não, estamos criando
				url = `${API_BASE_URL}/api/evoai/create/${selectedInstance.instanceName}`;
				method = "POST";
			}


			await axios({
				method: method,
				url: url,
				data: formData, // Envia os dados do formulário
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});


			toast.success(successMessage);
			setIsAgentModalOpen(false);
			setSelectedInstance(null);
			setSelectedAgent(null);
			setSelectedAgentId(null);
			// Opcional: Atualizar lista de instâncias ou agentes se necessário
			// fetchInstances();
		} catch (error) {
			console.error("Erro ao salvar agente IA:", error);
			handleError(error);
			toast.error(`Falha ao salvar agente IA para "${selectedInstance.instanceName}".`);
		} finally {
			setIsSavingAgent(false);
		}
	};


	const cancelEditing = () => {
		setIsAgentModalOpen(false);
		setSelectedInstance(null);
		setSelectedAgent(null);
		setSelectedAgentId(null);
		// Resetar formData para valores padrão ao fechar
		setFormData({
			instanceName: "",
			description: "",
			model: "gpt-4o",
			temperature: 0.7,
			maxTokens: 500,
			topP: 1,
			frequencyPenalty: 0,
			presencePenalty: 0,
			timeout: 60,
			keepOpen: false,
			debounceTime: 3,
			keywordFinish: "sair",
			unknownMessage: "Desculpe, não consegui entender. Pode repetir?",
			splitMessages: true,
			timePerChar: 50,
			ignoreJids: [],
		});
		setIgnoreJidInput("");
	};


	useEffect(() => {
		fetchInstances();
		fetchUserPlan();


		// Limpar todos os intervalos de polling ao desmontar o componente
		return () => {
			for (const intervalId of Object.values(pollingIntervals)) {
				clearInterval(intervalId);
			}
		};
	}, []); // Executa apenas uma vez no carregamento inicial


	// Efeito para iniciar polling para instâncias que estão em estado QRCODE ou STARTING no carregamento
	useEffect(() => {
		instances.forEach(instance => {
			if (instance.connectionStatus === 'QRCODE' || instance.connectionStatus === 'STARTING') {
				startPolling(instance.instanceName);
			}
		});
	}, [instances]); // Depende da lista de instâncias


	return (
		<div className="container mx-auto px-4 py-8">
			<Toaster position="top-right" reverseOrder={false} />

			{/* Header da Página */}
			<div className="flex justify-between items-center mb-8 flex-wrap gap-4"> {/* gap-4 para espaçamento entre os blocos de métrica e o botão */}
				<div>
					<h1 className="text-4xl font-extrabold text-white mb-2">
						Minhas Instâncias
					</h1>
					<p className="text-gray-400 text-lg">
						Gerencie suas conexões do WhatsApp.
					</p>
				</div>

				{/* Bloco de Métricas - Refatorado */}
				<div className="flex items-center gap-4 bg-deep/60 backdrop-blur-xl px-6 py-3 rounded-xl border border-electric/40 shadow-lg flex-wrap"> {/* flex-wrap para quebrar em telas menores */}

					{/* Métrica: Plano */}
					<div className="flex items-center space-x-2">
						<span className="text-sm font-medium text-gray-300">Plano:</span>
						<span className="text-base font-semibold text-neon-purple">
							{currentPlan}
						</span>
					</div>

					{/* Métrica: Instâncias */}
					<div className="flex items-center space-x-2">
						<span className="text-sm font-medium text-gray-300">Instâncias:</span>
						<span className="text-base font-semibold text-neon-green">
							{/* Usar dados de usage e limits do planDetails */}
							{planDetails.usage?.currentInstances ?? '-'} / {planDetails.limits?.maxInstances ?? '-'}
						</span>
						{/* Opcional: Porcentagem de instâncias, se relevante */}
						{planDetails.usage?.instancesPercentage !== undefined && (
							<span className={`font-semibold text-sm ${planDetails.usage.instancesPercentage > 80 ? 'text-red-500' : ''}`}>
								({planDetails.usage.instancesPercentage.toFixed(0)}%)
							</span>
						)}
					</div>




					{/* Métrica: Trial End Date (Condicional) */}
					{planDetails.plan?.isInTrial && planDetails.plan?.trialEndDate && (
						<div className="flex items-center space-x-2 text-sm text-yellow-500">
							<AlertCircle className="w-4 h-4" />
							{/* Formatar a data corretamente */}
							<span>Teste até: {new Date(planDetails.plan.trialEndDate).toLocaleDateString('pt-BR')}</span>
						</div>
					)}
				</div>
				<Button
					onClick={() => {
						if (instances.length >= instanceLimit) {
							toast.error(`Você atingiu o limite de ${instanceLimit} instância(s) para o seu plano.`);
						} else {
							setIsModalOpen(true);
						}
					}}
					disabled={instances.length >= instanceLimit || isCreatingInstance}
					className={`
        font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg
        transition-opacity duration-300
        flex items-center justify-center {/* Adicionado para centralizar ícone e texto */}
        ${instances.length >= instanceLimit
							? 'bg-electric cursor-not-allowed opacity-90' // Estilo quando o limite é atingido
							: isCreatingInstance
								? 'bg-yellow-600 cursor-wait opacity-70' // Estilo quando está criando
								: 'bg-gradient-to-r from-electric to-blue-600 hover:opacity-90' // Estilo padrão
						}
    `}
				>
					{/* Conteúdo do botão dinâmico */}
					{isCreatingInstance ? (
						<>
							<Loader2 className="w-5 h-5 mr-2 animate-spin" />
							Criando...
						</>
					) : instances.length >= instanceLimit ? (
						<>
							<Lock className="w-5 h-5 mr-2" />
							Limite Atingido ({instanceLimit})
						</>
					) : (
						<>
							<Plus className="w-5 h-5 mr-2" />
							Nova Instância
						</>
					)}
				</Button>
			</div>


			{loading ? (
				<div className="text-center text-white/70">Carregando instâncias...</div>
			) : instances.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center text-white/70 p-8 border border-dashed border-electric/50 rounded-lg"
				>
					<AlertCircle className="w-12 h-12 mx-auto text-electric/70 mb-4" />
					<p className="text-lg">Nenhuma instância encontrada.</p>
					<p className="text-sm mt-2">
						Clique em "Criar Nova Instância" para começar.
					</p>
				</motion.div>
			) : (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{instances.map((instance) => (
						<InstanceCard
							key={instance.id}
							instance={instance}
							onReconnect={reconnectInstance}
							onLogout={logoutInstance}
							onDelete={deleteInstance}
							onConfigureSettings={handleOpenSettingsModal} // Passa o handler de settings
							onOpenAgentModal={handleOpenAgentModal} // Passa o handler de agente
							deletingInstance={deletingInstance}
						/>
					))}
				</motion.div>
			)}


			{/* Modal de Criação de Instância */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Criar Nova Instância"
			>
				<div className="p-4">
					<Label htmlFor="instanceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Nome da Instância
					</Label>
					<Input
						id="instanceName"
						type="text"
						value={newInstanceName}
						onChange={(e) => setNewInstanceName(e.target.value)}
						placeholder="Ex: MinhaEmpresa"
						className="mb-4"
					/>
					<Button
						onClick={createInstance}
						disabled={isCreatingInstance || !newInstanceName.trim() || remainingSlots <= 0}
						className="w-full bg-gradient-to-r from-electric to-neon-purple hover:opacity-90 text-white"
					>
						{isCreatingInstance ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Criando...
							</>
						) : (
							"Criar Instância"
						)}
					</Button>
					{remainingSlots <= 0 && (
						<p className="text-sm text-red-500 mt-2 text-center">
							Você atingiu o limite de instâncias do seu plano.
						</p>
					)}
				</div>
			</Modal>


			{/* Modal de QR Code */}
			<Modal
				isOpen={showQrCodeModal}
				onClose={closeQrCodeModal}
				title={`Conectar Instância: ${newInstaceName}`}
			>
				<div className="p-4 text-center">
					{qrCodeError ? (
						<div className="text-red-500 mb-4">
							<AlertCircle className="w-10 h-10 mx-auto mb-2" />
							<p>Erro ao gerar QR Code ou código de pareamento.</p>
							<p className="text-sm">Tente reconectar a instância mais tarde.</p>
						</div>
					) : qrCode?.base64 ? (
						<>
							<p className="mb-4 text-gray-700 dark:text-gray-300">
								Escaneie o QR Code no seu celular para conectar o WhatsApp:
							</p>
							<img
								src={`data:image/png;base64,${qrCode.base64}`}
								alt="QR Code"
								className="mx-auto mb-4 w-64 h-64 object-contain border rounded-lg p-2 bg-white"
							/>
							{qrCode.pairingCode && (
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
									Ou use o código de pareamento:{" "}
									<span className="font-bold text-electric">
										{qrCode.pairingCode}
									</span>
								</p>
							)}
						</>
					) : (
						<div className="text-center text-gray-700 dark:text-gray-300">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric mx-auto mb-4"></div>
							<p>Aguardando QR Code ou código de pareamento...</p>
						</div>
					)}
				</div>
			</Modal>


			{/* Modal de Configurações da Instância (existente) */}
			<Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
				<DialogContent className="sm:max-w-[425px] dark:bg-[#0c0b13] dark:text-white">
					<DialogHeader>
						<DialogTitle>
							Configurações da Instância: {instanceToConfigure?.instanceName}
						</DialogTitle>
					</DialogHeader>
					<div className="p-4 space-y-4">
						{isLoadingSettings ? (
							<div className="text-center">Carregando configurações...</div>
						) : settingsFormData ? (
							<>
								<div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
									<Checkbox
										id="rejectCall"
										checked={settingsFormData.rejectCall}
										onCheckedChange={(checked) =>
											handleSettingsFormChange("rejectCall", checked)
										}
									/>
									<Label htmlFor="rejectCall">Rejeitar Chamadas</Label>
								</div>
								{settingsFormData.rejectCall && (
									<div>
										<Label htmlFor="msgCall">Mensagem ao Rejeitar Chamada</Label>
										<Input
											id="msgCall"
											value={settingsFormData.msgCall}
											onChange={(e) =>
												handleSettingsFormChange("msgCall", e.target.value)
											}
										/>
									</div>
								)}
								<div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
									<Checkbox
										id="groupsIgnore"
										checked={settingsFormData.groupsIgnore}
										onCheckedChange={(checked) =>
											handleSettingsFormChange("groupsIgnore", checked)
										}
									/>
									<Label htmlFor="groupsIgnore">Ignorar Grupos</Label>
								</div>
								<div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
									<Checkbox
										id="alwaysOnline"
										checked={settingsFormData.alwaysOnline}
										onCheckedChange={(checked) =>
											handleSettingsFormChange("alwaysOnline", checked)
										}
									/>
									<Label htmlFor="alwaysOnline">Sempre Online</Label>
								</div>
								<div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
									<Checkbox
										id="readMessages"
										checked={settingsFormData.readMessages}
										onCheckedChange={(checked) =>
											handleSettingsFormChange("readMessages", checked)
										}
									/>
									<Label htmlFor="readMessages">Marcar Mensagens como Lidas</Label>
								</div>
								<div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
									<Checkbox
										id="readStatus"
										checked={settingsFormData.readStatus}
										onCheckedChange={(checked) =>
											handleSettingsFormChange("readStatus", checked)
										}
									/>
									<Label htmlFor="readStatus">Marcar Status como Lidos</Label>
								</div>
								{/* Adicionar outros campos conforme necessário */}
							</>
						) : (
							<div className="text-center text-red-500">
								Erro ao carregar configurações.
							</div>
						)}
					</div>
					<div className="flex justify-end gap-2 mt-4 text-sm text-gray-500">
						<Button
							onClick={cancelSettingsEditing}
							variant="outline"
							disabled={isSavingSettings}
						>
							Cancelar
						</Button>
						<Button
							onClick={saveInstanceSettings}
							disabled={!settingsFormData || isSavingSettings}
							className="bg-gradient-to-r from-electric to-blue-700  hover:opacity-90"
						>
							{isSavingSettings ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Salvando...
								</>
							) : (
								"Salvar Configurações"
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>


			{/* Modal de Configuração do Agente IA (adaptado do seu código) */}
			<Dialog open={isAgentModalOpen} onOpenChange={setIsAgentModalOpen}>
				<DialogContent className="sm:max-w-[600px] dark:bg-[#0c0b13] dark:text-white flex flex-col h-[90vh]">
					<DialogHeader className="shrink-0">
						<DialogTitle>
							{selectedAgentId ? "Editar" : "Conectar"} Agente IA para{" "}
							{selectedInstance?.instanceName}
						</DialogTitle>
					</DialogHeader>
					{isLoadingAgent ? (
						<div className="flex-1 flex items-center justify-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric"></div>
							<span className="ml-2">Carregando agente...</span>
						</div>
					) : (
						<div className="flex-1 overflow-hidden flex flex-col">
							<ScrollArea className="flex-1 pr-4"> {/* Adiciona padding à direita para a scrollbar */}
								<div className="space-y-6 pb-4"> {/* Adiciona padding inferior */}
									{/* Descrição do Agente */}
									<div>
										<div className="flex items-center gap-2 mb-2">
											<Label htmlFor="description">Descrição do Agente *</Label>
											<div className="group relative">
												<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
												<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
													Instruções para o agente (prompt de sistema)
												</div>
											</div>
										</div>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) => handleFormChange("description", e.target.value)}
											placeholder="Você é um assistente virtual..."
											rows={6}
											className="mt-1"
										/>
									</div>


									{/* Configurações do Modelo */}
									<div className="space-y-4 p-4 bg-gray-50 dark:bg-[#16151D]/50 rounded-lg">
										<h4 className="text-lg font-semibold text-white/90">Configurações do Modelo</h4>
										{/* Modelo */}
										<div>
											<Label htmlFor="model">Modelo</Label>

											<Input
												id="model"
												value={formData.model}
												onChange={(e) => handleFormChange("model", e.target.value)}
												placeholder="Ex: gpt-4o"
												className="mt-1"
											/>
										</div>
										{/* Temperatura */}
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="temperature">Temperatura</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Controla a aleatoriedade da resposta (0 = determinístico, 1 = criativo)
													</div>
												</div>
											</div>
											<Input
												id="temperature"
												type="number"
												step="0.1"
												min="0"
												max="2"
												value={formData.temperature}
												onChange={(e) =>
													handleFormChange("temperature", Number.parseFloat(e.target.value) || 0)
												}
												className="mt-1"
											/>
										</div>
										{/* Max Tokens */}
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="maxTokens">Máximo de Tokens</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Limite de tamanho da resposta gerada pelo modelo
													</div>
												</div>
											</div>
											<Input
												id="maxTokens"
												type="number"
												min="1"
												value={formData.maxTokens}
												onChange={(e) =>
													handleFormChange("maxTokens", Number.parseInt(e.target.value) || 0)
												}
												className="mt-1"
											/>
										</div>
										{/* Top P */}
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="topP">Top P</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Controla a diversidade da resposta usando amostragem de núcleo
													</div>
												</div>
											</div>
											<Input
												id="topP"
												type="number"
												step="0.1"
												min="0"
												max="1"
												value={formData.topP}
												onChange={(e) =>
													handleFormChange("topP", Number.parseFloat(e.target.value) || 0)
												}
												className="mt-1"
											/>
										</div>
										{/* Frequency Penalty */}
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Reduz a probabilidade de repetir tokens já usados
													</div>
												</div>
											</div>
											<Input
												id="frequencyPenalty"
												type="number"
												step="0.1"
												min="-2"
												max="2"
												value={formData.frequencyPenalty}
												onChange={(e) =>
													handleFormChange("frequencyPenalty", Number.parseFloat(e.target.value) || 0)
												}
												className="mt-1"
											/>
										</div>
										{/* Presence Penalty */}
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="presencePenalty">Presence Penalty</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Reduz a probabilidade de falar sobre novos tópicos
													</div>
												</div>
											</div>
											<Input
												id="presencePenalty"
												type="number"
												step="0.1"
												min="-2"
												max="2"
												value={formData.presencePenalty}
												onChange={(e) =>
													handleFormChange("presencePenalty", Number.parseFloat(e.target.value) || 0)
												}
												className="mt-1"
											/>
										</div>
										{/* Timeout */}
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="timeout">Timeout (segundos)</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Tempo em segundos para encerrar a conversa por inatividade
													</div>
												</div>
											</div>
											<Input
												id="timeout"
												type="number"
												min="0"
												value={formData.timeout}
												onChange={(e) =>
													handleFormChange("timeout", Number.parseInt(e.target.value) || 0)
												}
												className="mt-1"
											/>
										</div>
										{/* Keep Open */}
										<div>
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<Switch
														id="keepOpen"
														checked={formData.keepOpen}
														onCheckedChange={(checked) =>
															handleFormChange("keepOpen", checked)
														}
													/>
													<Label htmlFor="keepOpen" className="font-normal">
														Manter Aberto
													</Label>
												</div>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Se ativo, a conversa nunca expira automaticamente
													</div>
												</div>
											</div>
										</div>
										{/* Tempo de Debounce */}
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="debounceTime">
													Tempo de Debounce (segundos)
												</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Aguarda este tempo antes de processar para evitar
														múltiplas respostas seguidas
													</div>
												</div>
											</div>
											<Input
												id="debounceTime"
												type="number"
												min="0"
												value={formData.debounceTime}
												onChange={(e) =>
													handleFormChange(
														"debounceTime",
														Number.parseInt(e.target.value) || 0,
													)
												}
												className="mt-1"
											/>
										</div>
									</div>


									{/* Mensagens */}
									<div className="space-y-4">
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="keywordFinish">
													Palavra para Encerrar *
												</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Palavra que o usuário pode digitar para sair da
														conversa com o agente
													</div>
												</div>
											</div>
											<Input
												id="keywordFinish"
												value={formData.keywordFinish}
												onChange={(e) =>
													handleFormChange("keywordFinish", e.target.value)
												}
												placeholder="Ex: sair, tchau, encerrar"
												className="mt-1"
											/>
										</div>


										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="unknownMessage">
													Mensagem Quando Não Entender *
												</Label>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Mensagem enviada quando o agente não consegue
														processar a solicitação
													</div>
												</div>
											</div>
											<Textarea
												id="unknownMessage"
												value={formData.unknownMessage}
												onChange={(e) =>
													handleFormChange("unknownMessage", e.target.value)
												}
												placeholder="Desculpe, não consegui entender. Pode repetir?"
												rows={2}
												className="mt-1"
											/>
										</div>
									</div>


									{/* Divisão de Mensagens */}
									<div className="space-y-4 p-4 bg-gray-50 dark:bg-[#16151D]/50 rounded-lg">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<Switch
													id="splitMessages"
													checked={formData.splitMessages}
													onCheckedChange={(checked) =>
														handleFormChange("splitMessages", checked)
													}
												/>
												<Label htmlFor="splitMessages" className="font-normal">
													Dividir Mensagens
												</Label>
											</div>
											<div className="group relative">
												<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
												<div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
													Quebra mensagens muito longas em várias mensagens
													menores
												</div>
											</div>
										</div>


										{formData.splitMessages && (
											<div>
												<div className="flex items-center gap-2 mb-2">
													<Label htmlFor="timePerChar">
														Velocidade de Digitação (ms por caractere)
													</Label>
													<div className="group relative">
														<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
														<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
															Simula velocidade de digitação humana. Quanto
															maior o número, mais devagar (0 = instantâneo)
														</div>
													</div>
												</div>
												<Input
													id="timePerChar"
													type="number"
													min="0"
													value={formData.timePerChar}
													onChange={(e) =>
														handleFormChange(
															"timePerChar",
															Number.parseInt(e.target.value) || 0,
														)
													}
													className="mt-1"
												/>
											</div>
										)}
									</div>


									{/* Números a Ignorar */}
									<div>
										<div className="flex items-center gap-2 mb-2">
											<Label>Números para Ignorar</Label>
											<div className="group relative">
												<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
												<div className="absolute bottom-6 left-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
													Lista de números que o agente deve ignorar
													completamente
												</div>
											</div>
										</div>
										<div className="flex gap-2 mt-2">
											<Input
												value={ignoreJidInput}
												onChange={(e) => setIgnoreJidInput(e.target.value)}
												placeholder="Digite um número... (ex: 5511999999999)"
												onKeyPress={handleIgnoreJidKeyPress}
												className="flex-1"
											/>
											<Button onClick={addIgnoreJid} size="sm" type="button">
												Adicionar
											</Button>
										</div>
										{formData.ignoreJids.length > 0 && (
											<div className="flex flex-wrap gap-2 mt-2">
												{formData.ignoreJids.map((jid) => (
													<div
														key={jid}
														className="flex items-center gap-1 bg-gray-100 dark:bg-[#16151D] px-2 py-1 rounded text-sm"
													>
														<span>{jid}</span>
														<Button
															onClick={() => removeIgnoreJid(jid)}
															size="sm"
															variant="ghost"
															className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
														>
															<X className="w-3 h-3" />
														</Button>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</ScrollArea>


							{/* Form Actions */}
							<div className="flex justify-end gap-2 mt-4 pt-4 border-t bg-white dark:bg-[#0c0b13] sticky bottom-0">
								<Button
									onClick={cancelEditing}
									disabled={isSavingAgent} // Usar isSavingAgent aqui
									variant="outline"
								>
									Cancelar
								</Button>
								<Button
									onClick={saveAgent}
									disabled={
										isSavingAgent || // Usar isSavingAgent aqui
										!formData.description.trim() ||
										!formData.keywordFinish.trim() ||
										!formData.unknownMessage.trim()
									}
									className="bg-gradient-to-r from-[#9137C6] to-[#E64FA5] hover:opacity-90"
								>
									{isSavingAgent ? ( // Usar isSavingAgent aqui
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Salvando...
										</>
									) : (
										<>
											<Save className="w-4 h-4 mr-2" />
											{selectedAgentId ? "Atualizar" : "Conectar"} Agente
										</>
									)}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};


export default Instances;
