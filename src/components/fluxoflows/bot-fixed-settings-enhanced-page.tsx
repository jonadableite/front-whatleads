"use client";
import type { BotData } from "@/types/bot";
import _ from "lodash";
import {
	BarChart2,
	CheckCircle,
	ChevronRight,
	Clock,
	Code,
	Edit,
	Eye,
	FileText,
	Globe,
	MessageSquare,
	Plus,
	PlusCircle,
	TestTube,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
// src/components/fluxoflows/bot-fixed-settings-enhanced-page.tsx
// import {
//   saveFlexBotNewSettings,
//   saveFlexBotSettings,
// } from "@/actions/companies/companyUnit/patch-IsResponderBot-company-unit.action";
//import { saveBotSettings } from "@/actions/companies/companyUnit/patch-IsResponderBot-company-unit.action";
// Update the BotData type to match the new structure
import updateBot from "../../services/api/campaigns";

// Replace the exampleBotData with the new structure format
const exampleBotData: any = {
	steps: {
		inicio: {
			mensagem:
				"Olá {{pushNameUser}}! 👋 Como podemos te ajudar hoje?\n\n1️⃣ - Financeiro\n2️⃣ - Comercial\n3️⃣ - Suporte Técnico\n4️⃣ - Segunda via de Boleto",
			respostas: {
				"1": {
					next: "cidade",
					valor: "financeiro",
				},
				"2": {
					next: "cidade",
					valor: "comercial",
				},
				"3": {
					next: "cidade",
					valor: "suporte",
				},
				"4": {
					next: "cidade",
					valor: "boleto",
				},
				financeiro: {
					next: "cidade",
					valor: "financeiro",
				},
				comercial: {
					next: "cidade",
					valor: "comercial",
				},
				suporte: {
					next: "cidade",
					valor: "suporte",
				},
				boleto: {
					next: "cidade",
					valor: "boleto",
				},
			},
			naoentendi:
				"Não entendi {{pushNameUser}} 🤔. Por favor, escolha uma das opções digitando o número ou nome:\n1 - Financeiro\n2 - Comercial\n3 - Suporte\n4 - Boleto",
		},
		cidade: {
			mensagem: "Legal {{pushNameUser}}! 🏙️ Qual a sua cidade?",
			inputLivre: true,
			next: "empreendimento",
			respostas: "cidade",
			naoentendi:
				"Desculpe, não consegui identificar. Pode repetir o nome da sua cidade? 📍",
		},
		empreendimento: {
			mensagem:
				"Qual o empreendimento que você tem interesse, {{pushNameUser}}?\n\n1️⃣ - Jardim das Acácias\n2️⃣ - Vila das Flores\n3️⃣ - Parque dos Sonhos\n4️⃣ - Residencial Aurora",
			respostas: {
				"1": {
					next: "confirmar-servico",
					valor: "Jardim das Acácias",
				},
				"2": {
					next: "confirmar-servico",
					valor: "Vila das Flores",
				},
				"3": {
					next: "confirmar-servico",
					valor: "Parque dos Sonhos",
				},
				"4": {
					next: "confirmar-servico",
					valor: "Residencial Aurora",
				},
				"jardim das acácias": {
					next: "confirmar-servico",
					valor: "Jardim das Acácias",
				},
				"vila das flores": {
					next: "confirmar-servico",
					valor: "Vila das Flores",
				},
				"parque dos sonhos": {
					next: "confirmar-servico",
					valor: "Parque dos Sonhos",
				},
				"residencial aurora": {
					next: "confirmar-servico",
					valor: "Residencial Aurora",
				},
			},
			naoentendi:
				"Empreendimento não reconhecido. Por favor, Qual o empreendimento que você tem interesse, {{pushNameUser}}?\n\n1️⃣ - Jardim das Acácias\n2️⃣ - Vila das Flores\n3️⃣ - Parque dos Sonhos\n4️⃣ - Residencial Aurora",
		},
		"confirmar-servico": {
			mensagem:
				"Perfeito {{pushNameUser}}! Só pra confirmar, você quer agendar: *{{servicoSelecionado}}*, correto?\n\n1️⃣ - Sim\n2️⃣ - Não, quero trocar o serviço",
			respostas: {
				"1": {
					next: "horario",
					valor: "horario",
				},
				"2": {
					next: "horario",
					valor: "trocar",
				},
				sim: {
					next: "horario",
					valor: "horario",
				},
				não: {
					next: "empreendimento",
					valor: "trocar",
				},
				nao: {
					next: "empreendimento",
					valor: "trocar",
				},
			},
			naoentendi:
				"Não entendi sua resposta, {{pushNameUser}}. Por favor, digite 1 para confirmar ou 2 para trocar o serviço. 😉",
		},
		horario: {
			mensagem:
				"Perfeito! localização {{ cidade }}, Agora escolha o melhor horário de atendimento:\n\n1️⃣ - Manhã\n2️⃣ - Tarde\n3️⃣ - Noite",
			respostas: {
				"1": {
					next: "finalizar",
					valor: "manha",
				},
				"2": {
					next: "finalizar",
					valor: "tarde",
				},
				"3": {
					next: "finalizar",
					valor: "noite",
				},
				manhã: {
					next: "finalizar",
					valor: "manha",
				},
				manha: {
					next: "finalizar",
					valor: "manha",
				},
				tarde: {
					next: "finalizar",
					valor: "tarde",
				},
				noite: {
					next: "finalizar",
					valor: "noite",
				},
			},
			naoentendi:
				"Horário não reconhecido. Pode repetir digitando 1, 2 ou 3? ⏰",
		},
		finalizar: {
			mensagemFinal: {
				financeiro: {
					mensagem:
						"Certo {{pushNameUser}}! 💸 Vou te conectar com o time Financeiro.",
					setorId: "67b8d47c5b7b4fa03aad2e2c",
				},
				comercial: {
					mensagem:
						"Show {{pushNameUser}}! 🧑‍💼 Nosso time Comercial vai te atender.",
					setorId: "67b8d47c5b7b4fa03aad2e2c",
				},
				suporte: {
					mensagem: "Beleza {{pushNameUser}}! 🛠️ Suporte Técnico chegando!",
					setorId: "67b8d47c5b7b4fa03aad2e2c",
				},
				boleto: {
					mensagem:
						"Sem problema {{pushNameUser}}! 🧾 Vamos te ajudar com o boleto agora mesmo.",
					setorId: "67b8d47c5b7b4fa03aad2e2c",
				},
			},
		},
		expediente_off: {
			mensagem:
				"Olá {{pushNameUser}}! Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Deixe sua mensagem e retornaremos em breve.",
		},
	},
};

// Templates de mensagens predefinidos
const messageTemplates = [
	{
		name: "Saudação",
		text: "Olá {{pushNameUser}}, como posso ajudar você hoje?",
	},
	{
		name: "Agradecimento",
		text: "Obrigado por entrar em contato, {{pushNameUser}}! Estamos à disposição.",
	},
	{
		name: "Aguarde Atendimento",
		text: "Um momento {{pushNameUser}}, estou transferindo para um atendente especializado.",
	},
	{
		name: "Fora do Horário",
		text: "Olá {{pushNameUser}}! Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Deixe sua mensagem e retornaremos em breve.",
	},
	{
		name: "Opções Numéricas",
		text: "Por favor escolha uma opção:\n\n1 - Informação\n2 - Suporte\n3 - Vendas\n4 - Financeiro",
	},
];

// Variáveis de personalização disponíveis
const personalizationVariables = [
	{ name: "pushNameUser", description: "Nome do usuário" },
	{ name: "lastPurchase", description: "Último produto comprado" },
	{ name: "accountType", description: "Tipo de conta" },
	{ name: "daysSinceLastVisit", description: "Dias desde a última visita" },
	{ name: "companyName", description: "Nome da empresa" },
];

// Idiomas disponíveis
const availableLanguages = [
	{ code: "pt-BR", name: "Português", active: true },
	{ code: "en-US", name: "Inglês", active: false },
	{ code: "es-ES", name: "Espanhol", active: false },
];

// Interface para o modal de novo fluxo
interface NewFlowModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (flowData: {
		name: string;
		mensagem: string;
		naoentendi: string;
		inputLivre?: boolean;
		next?: string;
	}) => void;
	currentFlows: string[];
}

// Componente do modal para adicionar novo fluxo
const NewFlowModal = ({
	isOpen,
	onClose,
	onSave,
	currentFlows,
}: NewFlowModalProps) => {
	const [flowName, setFlowName] = useState("");
	const [mensagem, setMensagem] = useState("");
	const [naoentendi, setNaoentendi] = useState("");
	const [inputLivre, setInputLivre] = useState(false);
	const [nextFlow, setNextFlow] = useState("");
	const [nameError, setNameError] = useState("");

	useEffect(() => {
		if (isOpen) {
			// Reset form when modal opens
			setFlowName("");
			setMensagem("");
			setNaoentendi("");
			setInputLivre(false);
			setNextFlow("");
			setNameError("");
		}
	}, [isOpen]);

	const handleSave = () => {
		// Validate flow name
		if (!flowName.trim()) {
			setNameError("Nome do fluxo é obrigatório");
			return;
		}

		// Check if name already exists
		if (currentFlows.includes(flowName)) {
			setNameError("Este nome de fluxo já existe");
			return;
		}

		// Validate flow name format (kebab-case)
		if (
			!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(flowName) &&
			flowName !== flowName.toLowerCase()
		) {
			setNameError(
				"Nome do fluxo deve estar em formato kebab-case (ex: nome-do-fluxo)",
			);
			return;
		}

		onSave({
			name: flowName,
			mensagem,
			naoentendi,
			inputLivre,
			next: nextFlow || undefined,
		});

		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-[##0D0D0D] rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-200">
						Adicionar Novo Fluxo
					</h3>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-400 dark:hover:text-gray-200"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="space-y-6">
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-300">
							Nome do Fluxo*
						</label>
						<input
							type="text"
							value={flowName}
							onChange={(e) => {
								setFlowName(e.target.value);
								setNameError("");
							}}
							placeholder="Ex: modelo-roupas"
							className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-gray-200"
						/>
						{nameError && (
							<p className="text-red-500 text-sm mt-1">{nameError}</p>
						)}
						<p className="text-xs text-gray-400">
							Use formato kebab-case (letras minúsculas separadas por hífen)
						</p>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-300">
							Mensagem
						</label>
						<textarea
							value={mensagem}
							onChange={(e) => setMensagem(e.target.value)}
							placeholder="Digite a mensagem que será exibida neste fluxo..."
							rows={4}
							className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-gray-200"
						/>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-300">
							Mensagem de Não Entendi
						</label>
						<textarea
							value={naoentendi}
							onChange={(e) => setNaoentendi(e.target.value)}
							placeholder="Mensagem quando o bot não entender a resposta..."
							rows={3}
							className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-gray-200"
						/>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="inputLivre"
							checked={inputLivre}
							onChange={(e) => setInputLivre(e.target.checked)}
							className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
						/>
						<label
							htmlFor="inputLivre"
							className="text-sm font-medium text-gray-300"
						>
							Permitir entrada livre de texto
						</label>
					</div>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-300">
							Próximo Fluxo (Opcional)
						</label>
						<select
							value={nextFlow}
							onChange={(e) => setNextFlow(e.target.value)}
							className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-gray-200"
						>
							<option value="">Selecione o próximo fluxo</option>
							{currentFlows.map((flow) => (
								<option key={flow} value={flow}>
									{flow}
								</option>
							))}
						</select>
					</div>

					<div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
						>
							Cancelar
						</button>
						<button
							onClick={handleSave}
							className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
						>
							Adicionar Fluxo
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

// Interface para o modal de edição de respostas
interface ResponsesModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (responses: Record<string, any>) => void;
	currentResponses: Record<string, any>;
	currentFlows: string[];
}

// Componente do modal para editar respostas
const ResponsesModal = ({
	isOpen,
	onClose,
	onSave,
	currentResponses,
	currentFlows,
}: ResponsesModalProps) => {
	const [responses, setResponses] = useState<
		Array<{ key: string; next: string; valor: string }>
	>([]);

	useEffect(() => {
		if (isOpen && currentResponses) {
			// Convert responses object to array for easier editing
			const responsesArray = Object.entries(currentResponses).map(
				([key, value]) => {
					if (typeof value === "object" && value !== null) {
						return {
							key,
							next: (value as any).next || "",
							valor: (value as any).valor || "",
						};
					}
					return {
						key,
						next: "",
						valor: value as string,
					};
				},
			);
			setResponses(responsesArray);
		}
	}, [isOpen, currentResponses]);

	const handleAddResponse = () => {
		setResponses([...responses, { key: "", next: "", valor: "" }]);
	};

	const handleRemoveResponse = (index: number) => {
		const newResponses = [...responses];
		newResponses.splice(index, 1);
		setResponses(newResponses);
	};

	const handleResponseChange = (
		index: number,
		field: "key" | "next" | "valor",
		value: string,
	) => {
		const newResponses = [...responses];
		newResponses[index][field] = value;
		setResponses(newResponses);
	};

	const handleSave = () => {
		// Convert array back to object
		const responsesObject: Record<string, any> = {};
		responses.forEach(({ key, next, valor }) => {
			if (key) {
				responsesObject[key] = next ? { next, valor } : valor;
			}
		});
		onSave(responsesObject);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-[##0D0D0D] rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-xl font-semibold text-gray-200">
						Editar Respostas
					</h3>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-400 dark:hover:text-gray-200"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<div className="space-y-4">
					<div className="grid grid-cols-12 gap-2 mb-2 font-medium text-sm text-gray-300">
						<div className="col-span-3">Chave</div>
						<div className="col-span-4">Próximo Fluxo</div>
						<div className="col-span-4">Valor</div>
						<div className="col-span-1"></div>
					</div>

					{responses.map((response, index) => (
						<div key={index} className="grid grid-cols-12 gap-2 items-center">
							<div className="col-span-3">
								<input
									type="text"
									value={response.key}
									onChange={(e) =>
										handleResponseChange(index, "key", e.target.value)
									}
									placeholder="Ex: 1, sim, opção"
									className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-gray-200 text-sm"
								/>
							</div>
							<div className="col-span-4">
								<select
									value={response.next}
									onChange={(e) =>
										handleResponseChange(index, "next", e.target.value)
									}
									className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-gray-200 text-sm"
								>
									<option value="">Selecione o próximo fluxo</option>
									{currentFlows.map((flow) => (
										<option key={flow} value={flow}>
											{flow}
										</option>
									))}
								</select>
							</div>
							<div className="col-span-4">
								<input
									type="text"
									value={response.valor}
									onChange={(e) =>
										handleResponseChange(index, "valor", e.target.value)
									}
									placeholder="Valor da resposta"
									className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-gray-200 text-sm"
								/>
							</div>
							<div className="col-span-1 flex justify-center">
								<button
									onClick={() => handleRemoveResponse(index)}
									className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
						</div>
					))}

					<button
						onClick={handleAddResponse}
						className="flex items-center gap-1 text-indigo-400 text-sm font-medium mt-2"
					>
						<Plus className="w-4 h-4" />
						<span>Adicionar Resposta</span>
					</button>

					<div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-6">
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
						>
							Cancelar
						</button>
						<button
							onClick={handleSave}
							className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
						>
							Salvar Respostas
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

interface BotSettingsEnhancedProps {
	botData: BotData;
	onStatusUpdate: (status: { success?: boolean; message?: string }) => void;
	campaignId: string;
}

// Update the BotSettingsEnhanced component to handle the new structure
const BotSettingsEnhanced = ({
	botData = exampleBotData,
	onStatusUpdate,
	campaignId,
}: BotSettingsEnhancedProps) => {
	const [companyDataState, setCompanyData] = useState<BotData>(botData);
	const [editedData, setEditedData] = useState<any>(botData);
	const [activeTab, setActiveTab] = useState(
		Object.keys(botData.steps || {})[0],
	);
	const [isDirty, setIsDirty] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [showAdvancedMode, setShowAdvancedMode] = useState(false);
	const [activeLanguage, setActiveLanguage] = useState("pt-BR");
	const [showTemplates, setShowTemplates] = useState(false);
	const [showVariables, setShowVariables] = useState(false);
	const [previewMessages, setPreviewMessages] = useState<
		Array<{ text: string; isBot: boolean }>
	>([]);
	const [currentField, setCurrentField] = useState<{
		section: string;
		key: string | null;
		subKey?: string;
	} | null>(null);

	// New state for modals
	const [showNewFlowModal, setShowNewFlowModal] = useState(false);
	const [showResponsesModal, setShowResponsesModal] = useState(false);
	const [currentResponses, setCurrentResponses] = useState<Record<string, any>>(
		{},
	);
	const [currentSection, setCurrentSection] = useState("");

	const [saveStatus, setSaveStatus] = useState<{
		success?: boolean;
		message?: string;
	}>({});

	// Inicializa a visualização prévia
	useEffect(() => {
		if (showPreview) {
			simulateConversation();
		}
	}, [showPreview]);

	useEffect(() => {
		setIsDirty(true);
	}, [editedData]);

	const handleChange = (
		section: string,
		key: string | null,
		value: string,
		subKey?: string,
	) => {
		setEditedData((prev: any) => {
			// For the new structure with steps
			if (!prev.steps) {
				prev.steps = {};
			}

			// Special case for "mensagemFinal" in "finalizar" step
			if (section === "finalizar" && key === "mensagemFinal" && subKey) {
				const [serviceType, field] = subKey.split(".");
				return {
					...prev,
					steps: {
						...prev.steps,
						[section]: {
							...prev.steps[section],
							[key]: {
								...prev.steps[section][key],
								[serviceType]: {
									...prev.steps[section][key][serviceType],
									[field]: value,
								},
							},
						},
					},
				};
			}

			// Special case for "respostas" that are objects
			if (key === "respostas" && typeof value === "string") {
				try {
					const linhas = value.split("\n");
					const respostas: Record<string, any> = {};

					linhas.forEach((linha) => {
						if (linha.trim()) {
							const [chave, valor] = linha
								.split(":")
								.map((item) => item.trim());
							if (chave && valor) {
								// Check if the value should be an object with next and valor
								if (
									prev.steps[section][key] &&
									typeof prev.steps[section][key] === "object" &&
									prev.steps[section][key][chave] &&
									typeof prev.steps[section][key][chave] === "object"
								) {
									respostas[chave] = {
										next: prev.steps[section][key][chave].next || "",
										valor: valor,
									};
								} else {
									respostas[chave] = valor;
								}
							}
						}
					});

					return {
						...prev,
						steps: {
							...prev.steps,
							[section]: {
								...prev.steps[section],
								[key]: respostas,
							},
						},
					};
				} catch (error) {
					console.error("Erro ao processar respostas:", error);
					return prev;
				}
			}

			// Default case for other fields
			if (key === null) {
				return {
					...prev,
					steps: {
						...prev.steps,
						[section]: String(value),
					},
				};
			}

			return {
				...prev,
				steps: {
					...prev.steps,
					[section]: {
						...prev.steps[section],
						[key]: subKey
							? {
									...prev.steps[section][key],
									[subKey]: value,
								}
							: typeof value === "object"
								? JSON.stringify(value)
								: String(value),
					},
				},
			};
		});
	};

	// Function to add a new flow
	const handleAddFlow = (flowData: {
		name: string;
		mensagem: string;
		naoentendi: string;
		inputLivre?: boolean;
		next?: string;
	}) => {
		setEditedData((prev: any) => {
			const newFlow = {
				mensagem: flowData.mensagem,
				naoentendi: flowData.naoentendi,
				respostas: {}, // Inicializa com um objeto vazio
				next: flowData.next || undefined,
			};

			if (flowData.inputLivre) {
				newFlow.inputLivre = true;
			}

			const updatedData = {
				...prev,
				steps: {
					...prev.steps,
					[flowData.name]: newFlow,
				},
			};

			// Console log para verificar a criação do novo fluxo
			console.log("Novo fluxo adicionado:", flowData.name);
			console.log("JSON atualizado:", updatedData);

			return updatedData;
		});

		// Set the new flow as active tab
		setActiveTab(flowData.name);
		setIsDirty(true);

		// Abre automaticamente o modal de respostas para o novo fluxo
		setTimeout(() => {
			openResponsesModal(flowData.name);
		}, 500);
	};

	// Function to update responses
	const handleUpdateResponses = (responses: Record<string, any>) => {
		setEditedData((prev: any) => {
			return {
				...prev,
				steps: {
					...prev.steps,
					[currentSection]: {
						...prev.steps[currentSection],
						respostas: responses,
					},
				},
			};
		});
		setIsDirty(true);
	};

	const handleSave = () => {
		// onSave(editedData);
		setIsDirty(false);
	};
	const [cooldown, setCooldown] = useState(0);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	//Modificar a função handleSaveBotSettings no componente BotSettingsEnhanced para mostrar uma notificação mais visível
	const ssshandleSaveBotSettings = async () => {
		try {
			// Verificar se houve alterações comparando os dados originais com os editados
			const isDataChanged = !_.isEqual(companyDataState, editedData); // Usando lodash para comparação profunda

			if (!isDataChanged) {
				// Se não houver alterações, você pode retornar ou mostrar uma notificação
				console.log("Nenhuma alteração detectada para salvar.");
				return;
			}

			// Atualiza o estado no componente pai através da prop onStatusUpdate
			onStatusUpdate({ message: "Salvando..." });
			setIsDirty(false);
			setLoading(true);
			setMessage("");

			// Chama a função para salvar os dados com a implementação real
			const result = await updateBot(
				campaignId,
				editedData as BotData,
				companyDataState as any,
			);

			if (result.success && result.data && result.retryAfter) {
				const updatedBotData = (result.data as { isAiResponder: BotData })
					.isAiResponder;
				console.log("Bot settings updated successfully:", updatedBotData);

				// Atualiza o estado com os novos dados da API
				setCompanyData(updatedBotData);
				setEditedData(updatedBotData); // Garante que os dois estão em sincronia

				// Mostra notificação de sucesso através do componente pai
				onStatusUpdate({
					success: true,
					message: result.message || "Configurações salvas com sucesso!",
				});

				// Simula a conversa novamente para refletir as mudanças
				if (showPreview) {
					simulateConversation();
				}
			} else {
				// Se houver um erro ao salvar, atualiza o estado com a mensagem de erro
				onStatusUpdate({
					success: false,
					message: result.message || "Erro ao salvar configurações",
				});
				setCooldown(result.retryAfter || 0);
				setMessage(result.message);

				const interval = setInterval(() => {
					setCooldown((prev) => {
						if (prev <= 1) {
							clearInterval(interval);
							setMessage("");
							return 0;
						}
						return prev - 1;
					});
				}, 1000);
			}

			setLoading(false);
		} catch (error) {
			console.error("Error saving bot settings:", error);
			onStatusUpdate({
				success: false,
				message:
					error instanceof Error
						? error.message
						: "Erro ao salvar configurações",
			});
			setLoading(false);
		}
	};

	// Update the sectionNames to get steps keys
	const sectionNames = Object.keys(editedData.steps || {});

	// Update formatRespostas to handle the new response format
	const formatRespostas = (respostas: any): string => {
		if (typeof respostas === "string") {
			return respostas;
		}

		return Object.entries(respostas)
			.map(([chave, valor]) => {
				if (typeof valor === "object" && valor !== null) {
					return `${chave}: ${(valor as any).valor || JSON.stringify(valor)}`;
				}
				return `${chave}: ${valor}`;
			})
			.join("\n");
	};

	// Função para obter o ícone da seção
	const getSectionIcon = (section: string) => {
		switch (section) {
			case "inicio":
				return <MessageSquare className="w-4 h-4" />;
			case "pergunta_horario":
				return <Clock className="w-4 h-4" />;
			case "finished":
				return <CheckCircle className="w-4 h-4" />;
			default:
				return <ChevronRight className="w-4 h-4" />;
		}
	};

	// Update simulateConversation to work with the new structure
	const simulateConversation = () => {
		const messages: Array<{ text: string; isBot: boolean }> = [];

		if (!editedData.steps) {
			return;
		}

		// Initial message from the bot
		const initialMessage =
			editedData.steps.inicio?.mensagem?.replace("{{pushNameUser}}", "João") ||
			"Olá! Como posso ajudar?";
		messages.push({ text: initialMessage, isBot: true });

		// User response
		messages.push({ text: "1", isBot: false });

		// Next message (cidade)
		const secondMessage =
			editedData.steps.cidade?.mensagem?.replace("{{pushNameUser}}", "João") ||
			"Qual a sua cidade?";
		messages.push({ text: secondMessage, isBot: true });

		// User response
		messages.push({ text: "São Paulo", isBot: false });

		// Next message (empreendimento)
		const thirdMessage =
			editedData.steps.empreendimento?.mensagem?.replace(
				"{{pushNameUser}}",
				"João",
			) || "Qual empreendimento?";
		messages.push({ text: thirdMessage, isBot: true });

		// User response
		messages.push({ text: "1", isBot: false });

		// Final message
		const finalMessage =
			editedData.steps.finalizar?.mensagemFinal?.financeiro?.mensagem?.replace(
				"{{pushNameUser}}",
				"João",
			) || "Obrigado pelo contato!";
		messages.push({ text: finalMessage, isBot: true });

		setPreviewMessages(messages);
	};

	// Função para inserir um template no campo atual
	const insertTemplate = (templateText: string) => {
		if (!currentField) return;

		const { section, key, subKey } = currentField;
		handleChange(section, key, templateText, subKey);
		setShowTemplates(false);
	};

	// Função para inserir uma variável de personalização no campo atual
	const insertVariable = (variable: string) => {
		if (!currentField) return;

		const { section, key, subKey } = currentField;

		let currentValue = "";
		if (section === "finalizar" && key === "mensagemFinal" && subKey) {
			const [serviceType, field] = subKey.split(".");
			currentValue = editedData.steps[section][key][serviceType][field] || "";
		} else if (key) {
			currentValue = editedData.steps[section][key] || "";
		} else {
			currentValue = editedData.steps[section] || "";
		}

		const newValue = currentValue + `{{${variable}}}`;
		handleChange(section, key, newValue, subKey);
		setShowVariables(false);
	};

	// Function to open responses modal
	const openResponsesModal = (section: string) => {
		setCurrentSection(section);
		setCurrentResponses(editedData.steps[section].respostas || {});
		setShowResponsesModal(true);
	};

	// Adicione este useEffect após os outros useEffects existentes
	useEffect(() => {
		// Verifica se houve mudanças no estado editedData
		if (isDirty) {
			console.log("Estado atualizado após modificação:");
			console.log("Fluxos disponíveis:", Object.keys(editedData.steps || {}));
			console.log("JSON completo:", JSON.stringify(editedData, null, 2));
		}
	}, [editedData, isDirty]);

	return (
		<div className="w-full">
			{/* Header and controls remain the same */}
			{/* <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-900/30 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-medium leading-none text-gray-900 dark:text-gray-200">
            Configuração do Bot Produção
          </h2>
        </div>
      </div> */}

			{/* Language selector and controls remain the same */}
			<div className="mb-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-2">
				<div className="flex gap-2 items-center">
					<Globe className="w-5 h-5 text-gray-500" />
					<span className="text-sm font-medium text-gray-400">Idioma:</span>
					<div className="flex gap-1 ">
						{availableLanguages.map((lang) => (
							<button
								key={lang.code}
								onClick={() => setActiveLanguage(lang.code)}
								className={`px-3 py-1 text-sm rounded-md transition-colors ${
									activeLanguage === lang.code
										? "bg-indigo-600 text-white"
										: "bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
								}`}
							>
								{lang.name}
							</button>
						))}
						<button className="px-2 py-1 text-sm rounded-md bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800 transition-colors">
							<PlusCircle className="w-4 h-4" />
						</button>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowAdvancedMode(!showAdvancedMode)}
						className={` px-4 py-0.5 text-sm rounded-md flex items-center gap-2 transition-all duration-300 ${
							showAdvancedMode
								? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
								: "bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800 transition-color"
						}`}
					>
						<Code className="w-4 h-4" />
						<span>{showAdvancedMode ? "Modo Básico" : "Modo Avançado"}</span>
					</button>

					<button
						onClick={() => setShowPreview(!showPreview)}
						className={` px-4 py-0.5 text-sm rounded-md flex items-center gap-2 transition-all duration-300 ${
							showPreview
								? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
								: "bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800 transition-color"
						}`}
					>
						<Eye className="w-4 h-4" />
						<span>{showPreview ? "Ocultar Prévia" : "Visualizar"}</span>
					</button>
					<button
						onClick={ssshandleSaveBotSettings}
						disabled={loading || cooldown > 0}
						className={` px-4 py-0.5 text-sm rounded-md flex items-center gap-2 transition-all duration-300 ${
							loading || cooldown > 0 || isDirty
								? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
								: "bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800 transition-color"
						}`}
					>
						{cooldown > 0
							? `Aguarde ${cooldown}s`
							: loading
								? "Salvando..."
								: "Salvar"}
					</button>
					{/* Adicione este botão próximo aos outros botões na barra de controles */}
					<button
						onClick={() => {
							console.log("Estado atual do bot:", editedData);
							alert("JSON do bot exibido no console do navegador (F12)");
						}}
						className="px-4 py-0.5 text-sm rounded-md flex items-center gap-2 transition-all duration-300 bg-neutral-900 text-gray-300 hover:bg-neutral-800"
					>
						<Code className="w-4 h-4" />
						<span>Debug JSON</span>
					</button>
				</div>
			</div>

			{/* Main layout */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				{/* Navigation sidebar */}
				<div className="md:col-span-1">
					<div className="bg-[##0D0D0D] rounded-xl shadow-sm border border-[#1B1C22] overflow-hidden">
						<div className="p-4 border-b border-[#1B1C22] flex justify-between items-center">
							<h3 className="font-medium text-gray-400 text-sm">Seções</h3>
							<button
								onClick={() => setShowNewFlowModal(true)}
								className="p-1 rounded-md bg-indigo-900/30 text-indigo-600 hover:bg-indigo-800/30 transition-colors"
								title="Adicionar novo fluxo"
							>
								<Plus className="w-4 h-4" />
							</button>
						</div>
						<nav className="p-2">
							{sectionNames.map((section) => (
								<button
									key={section}
									onClick={() => setActiveTab(section)}
									className={`w-full text-left text-sm px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-all duration-200 ${
										activeTab === section
											? "bg-indigo-700/20 text-indigo-600 font-medium"
											: "text-gray-300 hover:bg-gray-700/50"
									}`}
								>
									{getSectionIcon(section)}
									<span className="capitalize">
										{section.replace(/_/g, " ")}
									</span>
								</button>
							))}
						</nav>

						{/* Statistics section remains the same */}
						<div className="p-4 border-t border-[#1B1C22]">
							<h3 className="font-medium text-gray-400 text-sm uppercase mb-3">
								Estatísticas
							</h3>
							<div className="space-y-2">
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-400">Conversas iniciadas:</span>
									<span className="font-medium text-gray-200">1,245</span>
								</div>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-400">Taxa de conclusão:</span>
									<span className="font-medium text-gray-200">78%</span>
								</div>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-400">Tempo médio:</span>
									<span className="font-medium text-gray-200">2m 34s</span>
								</div>
								<button className="mt-2 text-sm text-indigo-400 flex items-center gap-1">
									<BarChart2 className="w-3 h-3" />
									<span>Ver relatório completo</span>
								</button>
							</div>
						</div>

						{/* A/B Testing section remains the same */}
						<div className="p-4 border-t border-[#1B1C22]">
							<div className="flex items-center justify-between mb-3">
								<h3 className="font-medium text-gray-400 text-sm uppercase">
									Testes A/B
								</h3>
								<button className="text-indigo-400">
									<PlusCircle className="w-4 h-4" />
								</button>
							</div>
							<div className="space-y-2">
								<div className="p-2 bg-gray-700/50 rounded-lg text-sm">
									<div className="flex items-center justify-between mb-1">
										<span className="font-medium text-gray-300">
											Teste de Saudação
										</span>
										<span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
											Ativo
										</span>
									</div>
									<div className="text-xs text-gray-400 flex items-center gap-1">
										<TestTube className="w-3 h-3" />
										<span>Variação A: 52% | Variação B: 48%</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Main content - Update to handle the new structure */}
				<div className={`${showPreview ? "md:col-span-2" : "md:col-span-3"}`}>
					<div className="bg-[##0D0D0D] rounded-xl shadow-sm border border-[#1B1C22] overflow-hidden">
						{showAdvancedMode ? (
							// Advanced mode (JSON)
							<div className="p-0">
								<div className="flex items-center justify-between mb-2">
									<div className="p-4 border-b border-[#1B1C22]">
										<h3 className="text-base font-semibold text-gray-200">
											Modo Avançado (JSON)
										</h3>
									</div>
								</div>
								<div className="py-1 px-4">
									<textarea
										className=" w-full h-[500px] p-4 font-mono text-sm text-gray-200 bg-transparent border border-transparent dark:border-transparent rounded-lg
                    outline-none transition focus:border-electric active:border-electric disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-electric"
										value={JSON.stringify(editedData, null, 2)}
										onChange={(e) => {
											try {
												const parsed = JSON.parse(e.target.value);
												setEditedData(parsed as BotData);
											} catch (error) {
												// Ignora erros de parsing enquanto o usuário está digitando
											}
										}}
									/>
								</div>
							</div>
						) : (
							// Normal mode - Update to handle the steps structure
							sectionNames.map((section) => (
								<div
									key={section}
									className={`${activeTab === section ? "block" : "hidden"}`}
								>
									<div className="p-0">
										<div className="p-4 border-b border-[#1B1C22] flex justify-between items-center">
											<h3 className="text-base font-semibold text-gray-200">
												{section.replace(/_/g, " ")}
											</h3>

											<div className="flex gap-2">
												{/* Botão para editar respostas do fluxo atual */}
												<button
													onClick={() => openResponsesModal(activeTab)}
													className="px-3 py-1 text-sm rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors flex items-center gap-1"
												>
													<Edit className="w-3 h-3" />
													<span>Editar Respostas</span>
												</button>

												{/* Add New Flow button */}
												<button
													onClick={() => setShowNewFlowModal(true)}
													className="px-3 py-1 text-sm rounded-md bg-indigo-900/30 text-indigo-600 hover:bg-indigo-800/30 transition-colors flex items-center gap-1"
												>
													<Plus className="w-4 h-4" />
													<span>Novo Fluxo</span>
												</button>
											</div>
										</div>

										<div className="space-y-6 p-2">
											{section === "finalizar" ? (
												// Special rendering for "finalizar" section with mensagemFinal
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{Object.keys(
														editedData.steps[section]?.mensagemFinal || {},
													).map((key) => (
														<div
															key={key}
															className="p-5 border border-[#1B1C22] rounded-xl bg-[##0D0D0D] hover:shadow-md transition-all duration-300"
														>
															<div className="flex items-center gap-2 mb-4">
																<Users className="w-4 h-4 text-indigo-500" />
																<h4 className="font-medium text-md capitalize text-gray-200">
																	{key}
																</h4>
															</div>

															<div className="space-y-4">
																<div className="space-y-2">
																	<label
																		htmlFor={`${section}-mensagemFinal-${key}-mensagem`}
																		className="block text-sm font-medium text-gray-300"
																	>
																		Mensagem:
																	</label>
																	<div className="relative">
																		<textarea
																			id={`${section}-mensagemFinal-${key}-mensagem`}
																			className=" w-full p-4 text-gray-200 bg-transparent border border-transparent dark:border-transparent rounded-lg
                                      outline-none transition focus:border-electric active:border-electric disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-electric"
																			value={
																				editedData.steps[section]
																					?.mensagemFinal?.[key]?.mensagem || ""
																			}
																			onChange={(e) =>
																				handleChange(
																					section,
																					"mensagemFinal",
																					e.target.value,
																					`${key}.mensagem`,
																				)
																			}
																			onFocus={() =>
																				setCurrentField({
																					section,
																					key: "mensagemFinal",
																					subKey: `${key}.mensagem`,
																				})
																			}
																			rows={4}
																		/>
																		<div className="absolute right-2 bottom-2 flex gap-1">
																			<button
																				className="p-1 rounded-md bg-gray-600 text-gray-300 hover:bg-gray-500"
																				onClick={() => {
																					setCurrentField({
																						section,
																						key: "mensagemFinal",
																						subKey: `${key}.mensagem`,
																					});
																					setShowTemplates(true);
																					setShowVariables(false);
																				}}
																				title="Inserir template"
																			>
																				<FileText className="w-4 h-4" />
																			</button>
																			<button
																				className="p-1 rounded-md bg-gray-600 text-gray-300 hover:bg-gray-500"
																				onClick={() => {
																					setCurrentField({
																						section,
																						key: "mensagemFinal",
																						subKey: `${key}.mensagem`,
																					});
																					setShowVariables(true);
																					setShowTemplates(false);
																				}}
																				title="Inserir variável"
																			>
																				<Code className="w-4 h-4" />
																			</button>
																		</div>
																	</div>
																</div>

																<div className="space-y-2">
																	<label
																		htmlFor={`${section}-mensagemFinal-${key}-setorId`}
																		className="block text-sm font-medium text-gray-300"
																	>
																		ID do Setor:
																	</label>
																	<input
																		type="text"
																		id={`${section}-mensagemFinal-${key}-setorId`}
																		className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 text-gray-200 transition-all duration-200"
																		value={
																			editedData.steps[section]
																				?.mensagemFinal?.[key]?.setorId || ""
																		}
																		onChange={(e) =>
																			handleChange(
																				section,
																				"mensagemFinal",
																				e.target.value,
																				`${key}.setorId`,
																			)
																		}
																		onFocus={() =>
																			setCurrentField({
																				section,
																				key: "mensagemFinal",
																				subKey: `${key}.setorId`,
																			})
																		}
																		disabled={true}
																	/>
																</div>
															</div>
														</div>
													))}
												</div>
											) : (
												// Rendering for other sections
												Object.keys(editedData.steps[section] || {}).map(
													(key) => (
														<div key={key} className="space-y-2">
															<div className="p-4 border-b border-[#1B1C22] flex justify-between items-center">
																<label
																	htmlFor={`${section}-${key}`}
																	className="text-sm font-medium capitalize text-gray-300 flex items-center gap-2"
																>
																	{key === "mensagem" && (
																		<MessageSquare className="w-4 h-4 text-indigo-500" />
																	)}
																	{key === "respostas" && (
																		<ChevronRight className="w-4 h-4 text-indigo-500" />
																	)}
																	{key === "naoentendi" && (
																		<X className="w-4 h-4 text-indigo-500" />
																	)}
																	{key}:
																</label>

																{/* Add Edit Responses button */}
																{key === "respostas" && (
																	<button
																		onClick={() => openResponsesModal(section)}
																		className="px-3 py-1 text-sm rounded-md bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
																	>
																		<Edit className="w-3 h-3" />
																		<span>Editar Respostas</span>
																	</button>
																)}
															</div>
															{key === "respostas" &&
															typeof editedData.steps[section][key] ===
																"object" ? (
																// Special rendering for "respostas" field
																<div className="relative">
																	<textarea
																		id={`${section}-${key}`}
																		className=" w-full p-4  text-gray-200 bg-transparent border border-transparent dark:border-transparent rounded-lg
                                  outline-none transition focus:border-electric active:border-electric disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-electric"
																		value={formatRespostas(
																			editedData.steps[section][key],
																		)}
																		onChange={(e) =>
																			handleChange(section, key, e.target.value)
																		}
																		onFocus={() =>
																			setCurrentField({ section, key })
																		}
																		rows={10}
																		//disabled={true}
																	/>
																	<div className="absolute top-3 right-3 bg-indigo-900/30 text-indigo-400 text-xs px-2 py-1 rounded-md">
																		Formato: chave: valor
																	</div>
																</div>
															) : key === "mensagem" ? (
																// Special rendering for "mensagem" field with template and variable buttons
																<div className="relative px-2">
																	<textarea
																		id={`${section}-${key}`}
																		className=" w-full p-4  text-gray-200 bg-transparent border border-transparent dark:border-transparent rounded-lg
                                  outline-none transition focus:border-electric active:border-electric disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-electric"
																		value={
																			typeof editedData.steps[section][key] ===
																			"object"
																				? JSON.stringify(
																						editedData.steps[section][key],
																						null,
																						2,
																					)
																				: String(
																						editedData.steps[section][key] ??
																							"",
																					)
																		}
																		onChange={(e) =>
																			handleChange(section, key, e.target.value)
																		}
																		onFocus={() =>
																			setCurrentField({ section, key })
																		}
																		rows={6}
																	/>
																	<div className="absolute right-2 bottom-2 flex gap-1">
																		<button
																			className="p-1 rounded-md bg-gray-600 text-gray-300 hover:bg-gray-500"
																			onClick={() => {
																				setCurrentField({ section, key });
																				setShowTemplates(true);
																				setShowVariables(false);
																			}}
																			title="Inserir template"
																		>
																			<FileText className="w-4 h-4" />
																		</button>
																		<button
																			className="p-1 rounded-md bg-gray-600 text-gray-300 hover:bg-gray-500"
																			onClick={() => {
																				setCurrentField({ section, key });
																				setShowVariables(true);
																				setShowTemplates(false);
																			}}
																			title="Inserir variável"
																		>
																			<Code className="w-4 h-4" />
																		</button>
																	</div>
																</div>
															) : (
																// Default rendering for other fields
																<textarea
																	id={`${section}-${key}`}
																	className=" w-full p-4  text-gray-200 bg-transparent border border-transparent dark:border-transparent rounded-lg
                                  outline-none transition focus:border-electric active:border-electric disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-electric"
																	value={
																		typeof editedData.steps[section][key] ===
																		"object"
																			? JSON.stringify(
																					editedData.steps[section][key],
																					null,
																					2,
																				)
																			: String(
																					editedData.steps[section][key] ?? "",
																				)
																	}
																	onChange={(e) =>
																		handleChange(section, key, e.target.value)
																	}
																	onFocus={() =>
																		setCurrentField({ section, key })
																	}
																	rows={6}
																/>
															)}
														</div>
													),
												)
											)}
										</div>
									</div>
								</div>
							))
						)}
					</div>

					{/* Templates and Variables sections remain the same */}
					{showTemplates && (
						<div className="mt-4 p-4 bg-neutral-800 rounded-xl shadow-sm border border-[#1B1C22]">
							<div className="flex items-center justify-between mb-3">
								<h3 className="font-medium text-gray-200">
									Templates de Mensagens
								</h3>
								<button
									className="text-gray-500 hover:text-gray-400 dark:hover:text-gray-200"
									onClick={() => setShowTemplates(false)}
								>
									<X className="w-4 h-4" />
								</button>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{messageTemplates.map((template, index) => (
									<button
										key={index}
										className="p-3 text-left border border-[#1B1C22] rounded-lg hover:hover:bg-gray-700 transition-colors"
										onClick={() => insertTemplate(template.text)}
									>
										<div className="font-medium text-sm text-gray-200 mb-1">
											{template.name}
										</div>
										<div className="text-xs text-gray-400 line-clamp-2">
											{template.text}
										</div>
									</button>
								))}
							</div>
						</div>
					)}

					{showVariables && (
						<div className="mt-4 p-4 bg-neutral-800 rounded-xl shadow-sm border border-[#1B1C22]">
							<div className="flex items-center justify-between mb-3">
								<h3 className="font-medium text-gray-200">
									Variáveis de Personalização
								</h3>
								<button
									className="text-gray-500 hover:text-gray-400 dark:hover:text-gray-200"
									onClick={() => setShowVariables(false)}
								>
									<X className="w-4 h-4" />
								</button>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
								{personalizationVariables.map((variable, index) => (
									<button
										key={index}
										className="p-2 text-left border border-[#1B1C22] rounded-lg hover:hover:bg-gray-700 transition-colors"
										onClick={() => insertVariable(variable.name)}
									>
										<div className="font-medium text-sm text-gray-200">{`{{${variable.name}}}`}</div>
										<div className="text-xs text-gray-400">
											{variable.description}
										</div>
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Preview section - Update to work with the new structure */}
				{showPreview && (
					<div className="md:col-span-1">
						<div className="bg-[##0D0D0D] rounded-xl shadow-sm border border-[#1B1C22] overflow-hidden sticky top-4">
							<div className="p-4 border-b border-[#1B1C22] flex items-center justify-between">
								<h3 className="font-medium text-gray-200 flex items-center gap-2">
									<Eye className="w-4 h-4 text-indigo-500" />
									<span>Visualização</span>
								</h3>
								<button
									className="text-gray-500 hover:text-gray-400 dark:hover:text-gray-200"
									onClick={() => simulateConversation()}
									title="Atualizar visualização"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-4 h-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M21 2v6h-6"></path>
										<path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
										<path d="M3 22v-6h6"></path>
										<path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
									</svg>
								</button>
							</div>
							<div className="p-4  h-[600px] overflow-y-auto">
								<div className="flex flex-col gap-4">
									{previewMessages.map((message, index) => (
										<div
											key={index}
											className={`flex ${
												message.isBot ? "justify-start" : "justify-end"
											}`}
										>
											<div
												className={`p-3 rounded-lg max-w-[85%] ${
													message.isBot
														? "bg-white  dark:bg-[#16171d]  text-gray-200 shadow-sm border border-[#1B1C22]"
														: "bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
												}`}
											>
												{message.text}
											</div>
										</div>
									))}
								</div>
							</div>
							<div className="p-3 border-t border-[#1B1C22] bg-gray-800 flex items-center gap-2">
								<input
									type="text"
									className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-700 text-gray-200"
									placeholder="Digite uma mensagem..."
									disabled
								/>
								<button className="p-2 rounded-lg bg-indigo-600 text-white">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-5 h-5"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="m22 2-7 20-4-9-9-4Z"></path>
										<path d="M22 2 11 13"></path>
									</svg>
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* New Flow Modal */}
			<NewFlowModal
				isOpen={showNewFlowModal}
				onClose={() => setShowNewFlowModal(false)}
				onSave={handleAddFlow}
				currentFlows={sectionNames}
			/>

			{/* Responses Modal */}
			<ResponsesModal
				isOpen={showResponsesModal}
				onClose={() => setShowResponsesModal(false)}
				onSave={handleUpdateResponses}
				currentResponses={currentResponses}
				currentFlows={sectionNames}
			/>
		</div>
	);
};

// Modificar o componente BotFixedSettingsEnhancedPage para mostrar a notificação de forma mais visível
const BotFixedSettingsEnhancedPage = ({
	campaignId = "",
	botData,
}: {
	campaignId?: string;
	botData: BotData;
}) => {
	const [saveStatus, setSaveStatus] = useState<{
		success?: boolean;
		message?: string;
	}>({});

	// Função para atualizar o estado de status
	const handleStatusUpdate = (status: {
		success?: boolean;
		message?: string;
	}) => {
		setSaveStatus(status);
		// Limpa a notificação após 5 segundos apenas se for uma mensagem de sucesso
		if (status.success || status.message) {
			setTimeout(() => {
				setSaveStatus({});
			}, 5000);
		}
	};

	// Função para salvar as configurações do bot
	const handleSaveBotSettings = async () => {
		try {
			const updatedBotData = await updateBot({
				id: campaignId,
				data: botData,
			});
			handleStatusUpdate({
				success: true,
				message: "Bot atualizado com sucesso!",
			});
		} catch (error) {
			console.error("Erro ao atualizar o bot:", error);
			handleStatusUpdate({
				success: false,
				message: "Erro ao atualizar o bot.",
			});
		}
	};

	return (
		<div className="relative">
			<div className="flex justify-center items-center z-50 transition-opacity duration-300">
				<div className="bg-[#0d0e12] shadow-xl w-full overflow-hidden relative transition-all duration-300">
					<div className="p-6">
						{/* Componente para configurações do bot */}
						<BotSettingsEnhanced
							botData={botData}
							onStatusUpdate={handleStatusUpdate}
							campaignId={campaignId}
						/>
						{/* Botão para salvar as configurações do bot */}
						<button
							onClick={handleSaveBotSettings}
							className="mt-4 bg-blue-500 text-white p-2 rounded"
						>
							Salvar Configurações do Bot
						</button>
					</div>

					{/* Notificação de status flutuante - mais visível e persistente */}
					{saveStatus.message && (
						<div
							className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[9999] ${
								saveStatus.success
									? "bg-green-100 text-green-800 dark:bg-green-800/70 dark:text-green-100 border-2 border-green-500"
									: saveStatus.message ===
											"Nenhuma alteração detectada para salvar"
										? "bg-blue-100 text-blue-800 dark:bg-blue-800/70 dark:text-blue-100 border-2 border-blue-500"
										: "bg-red-100 text-red-800 dark:bg-red-800/70 dark:text-red-100 border-2 border-red-500"
							}`}
							style={{ minWidth: "300px" }}
						>
							<div className="flex items-center gap-2">
								{saveStatus.success ? (
									<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
								) : saveStatus.message ===
									"Nenhuma alteração detectada para salvar" ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="w-6 h-6 text-blue-600 dark:text-blue-400"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="16" x2="12" y2="12"></line>
										<line x1="12" y1="8" x2="12.01" y2="8"></line>
									</svg>
								) : (
									<X className="w-6 h-6 text-red-600 dark:text-red-400" />
								)}
								<span className="font-medium text-base">
									{saveStatus.message}
								</span>
							</div>
							<button
								onClick={() => setSaveStatus({})}
								className="absolute top-2 right-2 text-gray-500 hover:text-gray-400 dark:hover:text-gray-200"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default BotFixedSettingsEnhancedPage;
