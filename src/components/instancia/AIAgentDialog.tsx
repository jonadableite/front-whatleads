// src/components/instancia/AIAgentDialog.tsx
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { listAgents } from "@/services/agentService";
import { createBot, deleteBot, fetchBots, updateBot } from "@/services/evolutionApi.service";
import type { Agent } from "@/types/agent";
import { Bot, Edit, HelpCircle, Plus, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Types para Evolution API
interface EvoAIConfig {
	enabled: boolean;
	description: string;
	agentUrl: string;
	apiKey: string;
	expire: number;
	keywordFinish: string;
	delayMessage: number;
	unknownMessage: string;
	listeningFromMe: boolean;
	stopBotFromMe: boolean;
	keepOpen: boolean;
	debounceTime: number;
	ignoreJids: string[];
	splitMessages: boolean;
	timePerChar: number;
	triggerType: "all" | "keyword";
	triggerOperator: "contains" | "equals" | "startsWith" | "endsWith";
	triggerValue: string;
}

interface EvoAI {
	id: string;
	name: string;
	description?: string;
	enabled: boolean;
	agentUrl: string;
	apiKey: string;
	expire: number;
	keywordFinish: string;
	delayMessage: number;
	unknownMessage: string;
	listeningFromMe: boolean;
	stopBotFromMe: boolean;
	keepOpen: boolean;
	debounceTime: number;
	ignoreJids: string[];
	splitMessages: boolean;
	timePerChar: number;
	triggerType: "all" | "keyword";
	triggerOperator: "contains" | "equals" | "startsWith" | "endsWith";
	triggerValue: string;
	updatedAt: string;
}

interface EvoAIFormData extends EvoAIConfig {
	name: string;
	systemMessage: string;
	model: string;
	temperature: number;
	maxTokens: number;
	topP: number;
	triggerKeywords: string[];
	onlyBusinessHours: boolean;
	businessHoursStart: string;
	businessHoursEnd: string;
	welcomeMessage: string;
	fallbackMessage: string;
}

interface AIAgentDialogProps {
	instanceName: string;
	onUpdate: () => void;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

const defaultFormData: EvoAIFormData = {
	// EvoAI Config
	enabled: true,
	description: "",
	agentUrl: "",
	apiKey: "",
	expire: 0,
	keywordFinish: "sair",
	delayMessage: 1,
	unknownMessage: "Desculpe, não consegui entender sua solicitação.",
	listeningFromMe: false,
	stopBotFromMe: true,
	keepOpen: false,
	debounceTime: 0,
	ignoreJids: [],
	splitMessages: false,
	timePerChar: 0,
	triggerType: "all",
	triggerOperator: "contains",
	triggerValue: "",

	// Additional fields
	name: "",
	systemMessage: "",
	model: "gpt-3.5-turbo",
	temperature: 0.7,
	maxTokens: 2000,
	topP: 1,
	triggerKeywords: [],
	onlyBusinessHours: false,
	businessHoursStart: "09:00",
	businessHoursEnd: "18:00",
	welcomeMessage: "",
	fallbackMessage:
		"Desculpe, não consegui entender. Pode reformular sua pergunta?",
};

// Componente para tooltip responsivo
const HelpTooltip = ({ content }: { content: string }) => (
	<div className="group relative inline-flex">
		<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
		<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-nowrap z-50 max-w-xs text-center">
			{content}
			<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
		</div>
	</div>
);

export function AIAgentDialog({
	instanceName,
	isOpen,
	onOpenChange,
	onUpdate,
}: AIAgentDialogProps) {
	// Estados
	const [agents, setAgents] = useState<Agent[]>([]);
	const [availableAgents, setAvailableAgents] = useState<EvoAI[]>([]);
	const [selectedAgent, setSelectedAgent] = useState<EvoAI | null>(null);
	const [selectedAgentId, setSelectedAgentId] = useState<string>("");
	const [formData, setFormData] = useState<EvoAIFormData>(defaultFormData);
	const [loading, setLoading] = useState(false);
	const [ignoreJidInput, setIgnoreJidInput] = useState("");
	const [isCreatingNew, setIsCreatingNew] = useState(false);

	// CORRIGIDO: Obtenha o user, clientId e userLoading do UserContext
	const { user, clientId, loading: userLoading } = useUser(); // Use o hook useUser
	console.log("Client ID from useUser:", clientId);


	// Carregar agentes do usuário
	const loadUserAgents = useCallback(async () => {
		// CORRIGIDO: Verifique se clientId está disponível antes de carregar
		if (!clientId || userLoading) {
			console.log("clientId not available or user loading, skipping agent load.");
			return;
		}

		try {
			console.log("Carregando agentes do usuário com clientId:", clientId);
			const response = await listAgents(clientId, 0, 100);
			console.log("Agentes carregados:", response);
			setAgents(response.data || []);
		} catch (error) {
			console.error("Erro ao carregar agentes:", error);
			toast({
				title: "Erro",
				description: "Não foi possível carregar seus agentes",
				variant: "destructive",
			});
		}
	}, [clientId, userLoading]); // Adicione userLoading como dependência


	// Carregar EvoAIs da instância
	const loadAvailableAgents = useCallback(async () => {
		if (!instanceName) return;

		setLoading(true);
		try {
			console.log("Carregando agentes da instância:", instanceName);
			const response = await fetchBots(instanceName);
			console.log("Resposta da API:", response);

			// Verificar diferentes estruturas de resposta possíveis
			const agentsData = Array.isArray(response) ? response : response?.data || [];
			console.log("Dados dos agentes:", agentsData);

			setAvailableAgents(Array.isArray(agentsData) ? agentsData : []);
		} catch (error) {
			console.error("Erro ao carregar agentes da instância:", error);
			toast({
				title: "Erro",
				description: "Não foi possível carregar os agentes da instância",
				variant: "destructive",
			});
			setAvailableAgents([]);
		} finally {
			setLoading(false);
		}
	}, [instanceName]);


	// Carregar dados quando abrir o dialog ou clientId/userLoading mudar
	useEffect(() => {
		if (isOpen) {
			loadUserAgents();
			loadAvailableAgents();
			// Reset states when opening
			setSelectedAgent(null);
			setIsCreatingNew(false);
			setFormData(defaultFormData);
			setSelectedAgentId("");
		}
	}, [isOpen, loadUserAgents, loadAvailableAgents]); // Dependências incluem loadUserAgents e loadAvailableAgents


	// Handlers
	const handleFormChange = useCallback(
		(field: keyof EvoAIFormData, value: any) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
		},
		[],
	);


	const handleAgentSelection = useCallback(
		(agentId: string) => {
			const agent = agents.find((a) => a.id === agentId);
			if (agent) {
				setSelectedAgentId(agentId);

				const agentUrl = `${import.meta.env.VITE_API_AI_URL}/api/v1/a2a/${agentId}`;
				setFormData((prev) => ({
					...prev,
					agentUrl,
					description: agent.name, // Ou agent.description se preferir
					name: agent.name,
				}));
			}
		},
		[agents],
	);

	const addIgnoreJid = useCallback(() => {
		if (
			ignoreJidInput.trim() &&
			!formData.ignoreJids.includes(ignoreJidInput.trim())
		) {
			handleFormChange("ignoreJids", [
				...formData.ignoreJids,
				ignoreJidInput.trim(),
			]);
			setIgnoreJidInput("");
		}
	}, [ignoreJidInput, formData.ignoreJids, handleFormChange]);

	const removeIgnoreJid = useCallback(
		(jid: string) => {
			handleFormChange(
				"ignoreJids",
				formData.ignoreJids.filter((j) => j !== jid),
			);
		},
		[formData.ignoreJids, handleFormChange],
	);

	const handleIgnoreJidKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				addIgnoreJid();
			}
		},
		[addIgnoreJid],
	);

	const editAgent = useCallback((agent: EvoAI) => {
		console.log("Editando agente:", agent);
		setSelectedAgent(agent);
		setIsCreatingNew(false);
		setFormData((prev) => ({
			...prev,
			...agent,
			// Garantir que os campos obrigatórios estejam presentes
			name: agent.name || agent.description || "",
			systemMessage: "",
			model: "gpt-3.5-turbo",
			temperature: 0.7,
			maxTokens: 2000,
			topP: 1,
			triggerKeywords: [],
			onlyBusinessHours: false,
			businessHoursStart: "09:00",
			businessHoursEnd: "18:00",
			welcomeMessage: "",
			fallbackMessage:
				"Desculpe, não consegui entender. Pode reformular sua pergunta?",
		}));
	}, []);

	const startCreatingNew = useCallback(() => {
		console.log("Iniciando criação de novo agente");
		setSelectedAgent(null);
		setIsCreatingNew(true);
		setFormData(defaultFormData);
		setSelectedAgentId("");
	}, []);

	const cancelEditing = useCallback(() => {
		setSelectedAgent(null);
		setIsCreatingNew(false);
		setSelectedAgentId("");
		setFormData(defaultFormData);
	}, []);

	const saveAgent = useCallback(async () => {
		// Validações
		if (!formData.description.trim()) {
			toast({
				title: "Campo obrigatório",
				description: "Nome do agente é obrigatório",
				variant: "destructive",
			});
			return;
		}

		if (!selectedAgentId && !formData.agentUrl.trim()) {
			toast({
				title: "Campo obrigatório",
				description: "Selecione um agente ou forneça uma URL",
				variant: "destructive",
			});
			return;
		}

		if (!formData.keywordFinish.trim()) {
			toast({
				title: "Campo obrigatório",
				description: "Palavra para encerrar é obrigatória",
				variant: "destructive",
			});
			return;
		}

		if (!formData.unknownMessage.trim()) {
			toast({
				title: "Campo obrigatório",
				description: "Mensagem quando não entender é obrigatória",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);
		try {
			const agentData: EvoAIConfig = {
				enabled: formData.enabled,
				description: formData.description,
				agentUrl: formData.agentUrl,
				apiKey: formData.apiKey,
				expire: formData.expire,
				keywordFinish: formData.keywordFinish,
				delayMessage: formData.delayMessage,
				unknownMessage: formData.unknownMessage,
				listeningFromMe: formData.listeningFromMe,
				stopBotFromMe: formData.stopBotFromMe,
				keepOpen: formData.keepOpen,
				debounceTime: formData.debounceTime,
				ignoreJids: formData.ignoreJids,
				splitMessages: formData.splitMessages,
				timePerChar: formData.timePerChar,
				triggerType: formData.triggerType,
				triggerOperator: formData.triggerOperator,
				triggerValue: formData.triggerValue,
			};

			console.log("Salvando agente:", { selectedAgent, agentData });

			if (selectedAgent && selectedAgent.id) {
				// Atualizar agente existente
				await updateBot(selectedAgent.id, instanceName, agentData);
				toast({
					title: "Sucesso",
					description: `Agente ${formData.description} atualizado com sucesso!`,
				});
			} else {
				// Criar novo agente
				await createBot(instanceName, {
					id: selectedAgentId || formData.agentUrl || "", // Use o id do agente selecionado ou a URL como fallback
					...agentData,
				});
				toast({
					title: "Sucesso",
					description: `Agente ${formData.description} conectado com sucesso!`,
				});
			}

			await loadAvailableAgents();
			onUpdate();
			cancelEditing();
			onOpenChange(false);
		} catch (error) {
			console.error("Erro ao salvar agente:", error);
			toast({
				title: "Erro",
				description: "Não foi possível salvar o agente",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [
		formData,
		selectedAgent,
		instanceName,
		selectedAgentId,
		loadAvailableAgents,
		onUpdate,
		cancelEditing,
		onOpenChange,
	]);

	const deleteAgent = useCallback(
		async (agentId: string) => {
			if (!confirm("Tem certeza que deseja remover este agente?")) return;

			setLoading(true);
			try {
				await deleteBot(agentId, instanceName);
				toast({
					title: "Sucesso",
					description: "Agente removido com sucesso!",
				});
				await loadAvailableAgents();
				onUpdate();
			} catch (error) {
				console.error("Erro ao deletar agente:", error);
				toast({
					title: "Erro",
					description: "Não foi possível remover o agente",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		},
		[instanceName, loadAvailableAgents, onUpdate],
	);

	// Determinar se está editando ou criando
	const isEditing = selectedAgent && selectedAgent.id;
	const isFormVisible = isCreatingNew || isEditing;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
				<DialogHeader className="px-6 py-4 border-b flex-shrink-0">
					<DialogTitle className="flex items-center gap-2 text-indigo-900">
						<Bot className="w-5 h-5" />
						Agentes de IA - {instanceName}
					</DialogTitle>
					<DialogDescription className="text-sm text-gray-500">
						Gerencie os agentes de IA conectados a esta instância do WhatsApp
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-hidden">
					{!isFormVisible && (
						<div className="p-6 h-full flex flex-col">
							<div className="flex justify-between items-center mb-4 flex-shrink-0">
								<h3 className="text-lg font-semibold text-blue-700">Agentes Conectados</h3>
								<Button
									onClick={startCreatingNew}
									className="bg-gradient-to-r from-electric to-blue-500 text-white flex items-center hover:opacity-90"
								>
									<Plus className="w-4 h-4 mr-2" />
									Conectar Novo Agente
								</Button>
							</div>

							<div className="flex-1 overflow-y-auto">
								{loading ? (
									<div className="flex items-center justify-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9137C6]"></div>
									</div>
								) : availableAgents.length === 0 ? (
									<div className="text-center py-8 text-gray-500">
										<Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
										<p>Nenhum agente conectado ainda</p>
										<p className="text-sm">
											Clique em "Conectar Novo Agente" para começar
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{availableAgents.map((agent) => (
											<div
												key={agent.id}
												className={cn(
													"flex items-center justify-between p-4 border rounded-lg",
													agent.enabled
														? "border-green-800 bg-green-900/20"
														: "border-gray-700 bg-[#16151D]/20",
												)}
											>
												<div className="flex-1">
													<h4 className="font-medium text-indigo-800">
														{agent.description || agent.name}
													</h4>
													<p className="text-sm text-gray-400">
														Tipo:{" "}
														{agent.triggerType === "all"
															? "Todas as mensagens"
															: `Palavra-chave: ${agent.triggerValue}`}
													</p>
													<p className="text-sm text-gray-500">
														Status:{" "}
														{agent.enabled ? (
															<span className="text-green-600 font-medium">
																Ativo
															</span>
														) : (
															<span className="text-gray-500">Inativo</span>
														)}
													</p>
												</div>
												<div className="flex items-center gap-2">
													<Button
														onClick={() => editAgent(agent)}
														size="sm"
														variant="outline"
														className="bg-electric text-indigo-700 border border-indigo-500 rounded-md hover:bg-indigo-950 hover:border-indigo-950 transition-colors duration-200"
													>
														<Edit className="w-4 h-4" />
													</Button>
													<Button
														onClick={() => deleteAgent(agent.id)}
														size="sm"
														variant="outline"
														className="bg-shock/20 text-red-700 border border-shock/20 rounded-md hover:bg-shock/35 hover:border-shock/35 transition-colors duration-200"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{isFormVisible && (
						<div className="h-full flex flex-col">
							<div className="px-6 py-4 border-b flex-shrink-0">
								<h3 className="text-lg font-semibold text-blue-700">
									{isEditing ? "Editar Agente" : "Conectar Novo Agente"}
								</h3>
							</div>

							<ScrollArea className="flex-1 px-6 py-4">
								<div className="space-y-6 pr-4">
									{/* Informações Básicas */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="description" className="text-blue-900">Nome do Agente *</Label>
											<Input
												id="description"
												value={formData.description}
												onChange={(e) =>
													handleFormChange("description", e.target.value)
												}
												placeholder="Ex: Atendimento Cliente"
												className="mt-1 bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
											/>
										</div>

										<div className="flex items-center space-x-2 pt-6">
											<Switch
												id="enabled"
												checked={formData.enabled}
												onCheckedChange={(checked) =>
													handleFormChange("enabled", checked)
												}
											/>
											<Label htmlFor="enabled" className="text-blue-900 font-normal">
												Agente Ativo
											</Label>
										</div>
									</div>

									{/* Seleção do Agente - Apenas para novos agentes */}
									{!isEditing && (
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="agentSelect" className="text-blue-900">Selecionar Agente *</Label>
												<HelpTooltip content="Escolha um dos seus agentes criados para conectar ao WhatsApp" />
											</div>
											<Select
												value={selectedAgentId}
												onValueChange={handleAgentSelection}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione um agente..." />
												</SelectTrigger>
												<SelectContent>
													{agents.map((agent) => (
														<SelectItem key={agent.id} value={agent.id}>
															<div className="flex flex-col">
																<span className="font-medium">
																	{agent.name}
																</span>
																{agent.description && (
																	<span className="text-sm text-gray-500">
																		{agent.description}
																	</span>
																)}
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{selectedAgentId && (
												<p className="text-sm text-gray-500 mt-1">
													URL: {formData.agentUrl}
												</p>
											)}
										</div>
									)}

									{/* Configurações de Gatilho */}
									<div className="space-y-4 p-4 bg-[#16151D]/50 rounded-lg">
										<h4 className="font-medium text-indigo-900">Quando Ativar o Agente</h4>

										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="triggerType" className="text-blue-900">Tipo de Ativação *</Label>
												<HelpTooltip content="Escolha se o agente responde a todas as mensagens ou apenas palavras específicas" />
											</div>
											<Select
												value={formData.triggerType}
												onValueChange={(value) =>
													handleFormChange("triggerType", value)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Selecione como ativar" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">
														Todas as Mensagens
													</SelectItem>
													<SelectItem value="keyword">
														Palavra-chave Específica
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{formData.triggerType === "keyword" && (
											<>
												<div>
													<div className="flex items-center gap-2 mb-2">
														<Label htmlFor="triggerValue" className="text-blue-900">Palavra-chave</Label>
														<HelpTooltip content="Palavra que ativa o agente (ex: 'oi', 'ajuda')" />
													</div>
													<Input
														id="triggerValue"
														value={formData.triggerValue}
														onChange={(e) =>
															handleFormChange("triggerValue", e.target.value)
														}
														placeholder="Ex: oi, ajuda, suporte"
														className=" bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white"
													/>
												</div>

												<div>
													<div className="flex items-center gap-2 mb-2">
														<Label htmlFor="triggerOperator" className="text-blue-900">
															Como Encontrar a Palavra
														</Label>
														<HelpTooltip content="Define se a palavra deve estar exata ou pode estar dentro de outras palavras" />
													</div>
													<Select
														value={formData.triggerOperator}
														onValueChange={(value) =>
															handleFormChange("triggerOperator", value)
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Selecione" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="contains">
																Contém a palavra
															</SelectItem>
															<SelectItem value="equals">
																Palavra exata
															</SelectItem>
															<SelectItem value="startsWith">
																Começa com
															</SelectItem>
															<SelectItem value="endsWith">
																Termina com
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</>
										)}
									</div>

									{/* Configurações de Tempo */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<div className="flex items-center gap-2  text-blue-900">
												<Label htmlFor="expire">
													Conversa Expira em (minutos)
												</Label>
												<HelpTooltip content="Após quantos minutos sem resposta a conversa é encerrada (0 = nunca expira)" />
											</div>
											<Input
												id="expire"
												type="number"
												min="0"
												value={formData.expire}
												onChange={(e) =>
													handleFormChange(
														"expire",
														Number.parseInt(e.target.value) || 0,
													)
												}
												className=" bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
											/>
										</div>

										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="delayMessage" className="text-blue-900">
													Atraso Entre Mensagens (segundos)
												</Label>
												<HelpTooltip content="Tempo que o agente espera antes de enviar a resposta (0 = instantâneo)" />
											</div>
											<Input
												id="delayMessage"
												type="number"
												min="0"
												value={formData.delayMessage}
												onChange={(e) =>
													handleFormChange(
														"delayMessage",
														Number.parseInt(e.target.value) || 0,
													)
												}
												className=" bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
											/>
										</div>
									</div>

									<div>
										<div className="flex items-center gap-2 mb-2">
											<Label htmlFor="debounceTime" className="text-blue-900">
												Tempo de Debounce (segundos)
											</Label>
											<HelpTooltip content="Aguarda este tempo antes de processar para evitar múltiplas respostas seguidas" />
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
											className=" bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
										/>
									</div>

									{/* Mensagens */}
									<div className="space-y-4">
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="keywordFinish" className="text-blue-900">
													Palavra para Encerrar *
												</Label>
												<HelpTooltip content="Palavra que o usuário pode digitar para sair da conversa com o agente" />
											</div>
											<Input
												id="keywordFinish"
												value={formData.keywordFinish}
												onChange={(e) =>
													handleFormChange("keywordFinish", e.target.value)
												}
												placeholder="Ex: sair, tchau, encerrar"
												className=" bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
											/>
										</div>

										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="unknownMessage" className="text-blue-900">
													Mensagem Quando Não Entender *
												</Label>
												<HelpTooltip content="Mensagem enviada quando o agente não consegue processar a solicitação" />
											</div>
											<Textarea
												id="unknownMessage"
												value={formData.unknownMessage}
												onChange={(e) =>
													handleFormChange("unknownMessage", e.target.value)
												}
												placeholder="Desculpe, não consegui entender. Pode repetir?"
												rows={2}
												className=" bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
											/>
										</div>
									</div>

									{/* Comportamentos */}
									<div className="space-y-4 p-4 bg-[#16151D]/50 rounded-lg">
										<h4 className="font-medium text-indigo-900">Comportamentos do Agente</h4>

										<div className="grid grid-cols-1 gap-4">
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<Switch
														id="listeningFromMe"
														checked={formData.listeningFromMe}
														onCheckedChange={(checked) =>
															handleFormChange("listeningFromMe", checked)
														}
													/>
													<Label
														htmlFor="listeningFromMe"
														className="text-blue-900 font-normal"
													>
														Ouvir de Mim
													</Label>
												</div>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Se ativo, o agente também responde quando você envia
														mensagens
													</div>
												</div>
											</div>

											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<Switch
														id="stopBotFromMe"
														checked={formData.stopBotFromMe}
														onCheckedChange={(checked) =>
															handleFormChange("stopBotFromMe", checked)
														}
													/>
													<Label
														htmlFor="stopBotFromMe"
														className="text-blue-900 font-normal"
													>
														Parar Bot de Mim
													</Label>
												</div>
												<div className="group relative">
													<HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
													<div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-normal max-w-xs z-50">
														Se ativo, quando você responde numa conversa, o
														agente para de responder
													</div>
												</div>
											</div>

											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<Switch
														id="keepOpen"
														checked={formData.keepOpen}
														onCheckedChange={(checked) =>
															handleFormChange("keepOpen", checked)
														}
													/>
													<Label htmlFor="keepOpen" className="text-blue-900 font-normal">
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
									</div>

									{/* Tempo de Debounce */}
									<div>
										<div className="flex items-center gap-2 mb-2">
											<Label htmlFor="debounceTime" className="text-blue-900">
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
											className="mt-1  bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
										/>
									</div>

									{/* Mensagens */}
									<div className="space-y-4">
										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="keywordFinish" className="text-blue-900">
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
												className="mt-1  bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
											/>
										</div>

										<div>
											<div className="flex items-center gap-2 mb-2">
												<Label htmlFor="unknownMessage" className="text-blue-900">
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
												className="mt-1  bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
											/>
										</div>
									</div>

									{/* Divisão de Mensagens */}
									<div className="space-y-4 p-4 bg-[#16151D]/50 rounded-lg">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<Switch
													id="splitMessages"
													checked={formData.splitMessages}
													onCheckedChange={(checked) =>
														handleFormChange("splitMessages", checked)
													}
												/>
												<Label htmlFor="splitMessages" className="text-blue-900 font-normal">
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
													<Label htmlFor="timePerChar" className="text-blue-900">
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
													className="mt-1  bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
												/>
											</div>
										)}
									</div>

									{/* Números a Ignorar */}
									<div>
										<div className="flex items-center gap-2 mb-2">
											<Label className="text-blue-900">Números para Ignorar</Label>
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
												className="flex-1  bg-deep/30 border border-electric/25 rounded-md focus:border-indigo-500 focus:ring-indigo-500 text-white	"
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
														className="flex items-center gap-1 bg-[#16151D] px-2 py-1 rounded text-sm"
													>
														<span>{jid}</span>
														<Button
															onClick={() => removeIgnoreJid(jid)}
															size="sm"
															variant="ghost"
															className="h-4 w-4 p-0 hover:bg-gray-700"
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
							<div className="flex justify-end gap-2 mt-4 pt-4 border-t bg-deep sticky bottom-0">
								<Button
									onClick={cancelEditing}
									disabled={loading}
									variant="outline"
									className="text-gray-400 hover:text-gray-300 bg-shock-dark/40 hover:bg-shock-dark/20 border-shock-dark/40 hover:border-shock-dark/20"
								>
									Cancelar
								</Button>
								<Button
									onClick={saveAgent}
									disabled={
										loading ||
										!formData.description.trim() ||
										(!selectedAgent?.id && !selectedAgentId) ||
										!formData.keywordFinish.trim() ||
										!formData.unknownMessage.trim()
									}
									className="bg-gradient-to-r from-indigo-900 to-electric hover:opacity-90"
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Salvando...
										</>
									) : (
										<>
											<Save className="w-4 h-4 mr-2" />
											{selectedAgent?.id ? "Atualizar" : "Conectar"} Agente
										</>
									)}
								</Button>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
