// src/services/botSettings.service.ts
export interface BotData {
	id?: string;
	steps?: Record<string, any>;
	_meta?: {
		nodePositions?: Record<string, { x: number; y: number }>;
		groups?: Record<string, string[]>;
	};
	expediente_off?: any;
}

export const saveFlexBotNewSettings = async (
	campaignId: string,
	botSettings: BotData,
	companyDataState?: any,
): Promise<{ success: boolean; error?: string }> => {
	try {
		console.log("Salvando configurações do bot para campanha:", campaignId);
		console.log("Detalhes das configurações:", botSettings);

		// Simulação de uma chamada de API
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Validações básicas
		if (!campaignId) {
			return {
				success: false,
				error: "ID da campanha é obrigatório",
			};
		}

		// Simulação de sucesso
		return {
			success: true,
		};
	} catch (error) {
		console.error("Erro ao salvar configurações do bot:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
};

// Função para buscar dados do bot (mock)
export const fetchBotSettings = async (
	campaignId: string,
): Promise<BotData | null> => {
	try {
		console.log("Buscando configurações do bot para campanha:", campaignId);

		// Simulação de busca de dados
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Retorna um mock de dados do bot
		return {
			id: campaignId,
			steps: {},
			_meta: {
				nodePositions: {},
				groups: {},
			},
		};
	} catch (error) {
		console.error("Erro ao buscar configurações do bot:", error);
		return null;
	}
};
