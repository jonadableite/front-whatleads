// src/lib/bot.ts

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

// Função para obter dados do bot
export const getBotData = async (campaignId: string, token: string) => {
	try {
		const response = await axios.get(
			`${API_URL}/api/bot/campaigns/${campaignId}/bot`,
			{
				headers: {
					Authorization: `Bearer ${token}`, // Adiciona o token ao cabeçalho
				},
			},
		);

		return response.data;
	} catch (error) {
		console.error("Erro ao obter dados do bot:", error);
		throw error;
	}
};

// Função para enviar uma mensagem
export const sendMessage = async (campaignId: string, message: string) => {
	try {
		const response = await axios.post(
			`${API_URL}/api/bot/campaigns/${campaignId}/messages`,
			{ message },
		);
		return response.data;
	} catch (error) {
		console.error("Erro ao enviar mensagem:", error);
		throw error;
	}
};

// Função para atualizar as configurações do bot
export const updateBotSettings = async (campaignId: string, settings: any) => {
	try {
		const response = await axios.put(
			`${API_URL}/api/bot/campaigns/${campaignId}/settings`,
			settings,
		);
		return response.data;
	} catch (error) {
		console.error("Erro ao atualizar configurações do bot:", error);
		throw error;
	}
};
