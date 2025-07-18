// services/evoaiService.ts

const evoAiUrl = import.meta.env.VITE_API_AI_UR || "http://localhost:8000";

export interface EvoAI {
	model: string;
	id: string;
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
	triggerOperator: "contains" | "equals" | "startsWith";
	triggerValue: string;
	createdAt: string;
	updatedAt: string;
	instanceId: string;
}

export interface CreateEvoAIRequest {
	description: string;
	agentUrl: string;
	apiKey?: string;
	expire?: number;
	keywordFinish?: string;
	delayMessage?: number;
	unknownMessage?: string;
	listeningFromMe?: boolean;
	stopBotFromMe?: boolean;
	keepOpen?: boolean;
	debounceTime?: number;
	ignoreJids?: string[];
	splitMessages?: boolean;
	timePerChar?: number;
	triggerType?: "all" | "keyword";
	triggerOperator?: "contains" | "equals" | "startsWith";
	triggerValue?: string;
}

export interface EvoAISettings {
	enabled: boolean;
	expire: number;
	keywordFinish: string;
	delayMessage: number;
	unknownMessage: string;
	listeningFromMe: boolean;
	stopBotFromMe: boolean;
	keepOpen: boolean;
	debounceTime: number;
	timePerChar: number;
}

// Buscar todos os agentes de uma instância
export const getInstanceEvoAIs = async (
	instanceName: string,
): Promise<EvoAI[]> => {
	const response = await evoAiUrl.get(
		`/evoai/find${instanceName}`,
	);
	return response.data;
};

// Criar novo agente
export const createEvoAI = async (
	instanceName: string,
	data: CreateEvoAIRequest,
): Promise<EvoAI> => {
	const response = await evoAiUrl.post(
		`/evoai/create${instanceName}`,
		data,
	);
	return response.data;
};

// Atualizar agente
export const updateEvoAI = async (
	evoaiId: string,
	instanceName: string,
	data: Partial<CreateEvoAIRequest>,
): Promise<EvoAI> => {
	const response = await evoAiUrl.put(
		`/evoai/update/${evoaiId}/${instanceName}`,
		data,
	);
	return response.data;
};

// Função para deletar EvoAI
export const deleteEvoAI = async (evoaiId: string, instanceName: string) => {
	const response = await evoAiUrl.delete(
		`/evoai/delete/${evoaiId}/${instanceName}`,
	);
	return response.data;
};

// Buscar configurações padrão
export const getEvoAISettings = async (
	instanceName: string,
): Promise<EvoAISettings> => {
	const response = await evoAiUrl.get(
		`/evoai/fetchSettings/${instanceName}`,
	);
	return response.data;
};

// Salvar configurações padrão
export const saveEvoAISettings = async (
	instanceName: string,
	settings: Partial<EvoAISettings>,
): Promise<EvoAISettings> => {
	const response = await evoAiUrl.post(
		`/evoai/settings/${instanceName}`,
		settings,
	);
	return response.data;
};

// Alterar status de uma sessão
export const changeEvoAIStatus = async (
	instanceName: string,
	status: "opened" | "paused" | "closed",
): Promise<void> => {
	await evoAiUrl.post(
		`/evoai/changeStatus/${instanceName}`,
		{
			status,
		},
	);
};

// Buscar sessões de um agente específico
export const getEvoAISessions = async (
	instanceName: string,
	evoaiId: string,
): Promise<any[]> => {
	const response = await evoAiUrl.get(
		`/evoai/fetchSessions/${evoaiId}/${instanceName}`,
	);
	return response.data;
};
