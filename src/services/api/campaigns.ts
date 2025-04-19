import type { Campaign, CampaignLeads } from "@/interface";
// src/services/api/campaigns.ts
import { api } from "@/lib/api";

export const campaignsApi = {
	fetchCampaigns: async (): Promise<
		(Campaign & { leads: CampaignLeads })[]
	> => {
		try {
			const { data } = await api.main.get<Campaign[]>("/campaigns");

			// Buscar estatísticas em paralelo para todas as campanhas
			const statsPromises = (Array.isArray(data) ? data : []).map((campaign) =>
				api.main
					.get(`/campaigns/${campaign.id}/stats`)
					.then((response) => ({
						campaignId: campaign.id,
						statistics: response.data,
					}))
					.catch(() => ({
						campaignId: campaign.id,
						statistics: null,
					})),
			);

			const statsResults = await Promise.all(statsPromises);
			const statsMap = new Map(
				statsResults.map((result) => [result.campaignId, result.statistics]),
			);

			return (Array.isArray(data) ? data : []).map((campaign) =>
				normalizeCampaignData({
					...campaign,
					statistics: statsMap.get(campaign.id),
				}),
			);
		} catch (error) {
			console.error("Erro ao buscar campanhas:", error);
			return [];
		}
	},

	createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
		try {
			const response = await api.main.post<Campaign>("/campaigns", data);
			return response.data;
		} catch (error) {
			console.error("Erro ao criar campanha:", error);
			throw error;
		}
	},

	updateCampaign: async ({
		id,
		data,
	}: {
		id: string;
		data: Partial<Campaign>;
	}): Promise<Campaign> => {
		try {
			const response = await api.main.put<Campaign>(`/campaigns/${id}`, data);
			return response.data;
		} catch (error) {
			console.error("Erro ao atualizar campanha:", error);
			throw error;
		}
	},

	updateBot: async ({
		id,
		data,
	}: {
		id: string;
		data: Partial<Campaign>;
	}): Promise<Campaign> => {
		try {
			const response = await api.main.put<Campaign>(`/campaigns/${id}`, data);
			return response.data;
		} catch (error) {
			console.error("Erro ao atualizar bot:", error);
			throw error;
		}
	},

	deleteCampaign: async (id: string): Promise<void> => {
		try {
			await api.main.delete(`/campaigns/${id}`);
		} catch (error) {
			console.error("Erro ao excluir campanha:", error);
			throw error;
		}
	},

	startCampaign: async (id: string): Promise<void> => {
		try {
			await api.main.post(`/campaigns/${id}/start`);
		} catch (error) {
			console.error("Erro ao iniciar campanha:", error);
			throw error;
		}
	},

	pauseCampaign: async (id: string): Promise<void> => {
		try {
			await api.main.post(`/campaigns/${id}/pause`);
		} catch (error) {
			console.error("Erro ao pausar campanha:", error);
			throw error;
		}
	},

	stopCampaign: async (id: string): Promise<void> => {
		try {
			await api.main.post(`/campaigns/${id}/stop`);
		} catch (error) {
			console.error("Erro ao parar campanha:", error);
			throw error;
		}
	},

	importLeads: async (
		campaignId: string,
		file: File,
	): Promise<{ success: boolean; count: number }> => {
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await api.main.post(
				`/campaigns/${campaignId}/leads/import`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);

			return response.data;
		} catch (error) {
			console.error("Erro ao importar leads:", error);
			throw error;
		}
	},
};

// Função de normalização dos dados da campanha
const normalizeCampaignData = (
	campaign: any,
): Campaign & { leads: CampaignLeads } => {
	const stats = campaign.statistics || {
		totalLeads: 0,
		sentCount: 0,
		deliveredCount: 0,
		readCount: 0,
		failedCount: 0,
	};

	return {
		...campaign,
		leads: {
			total: stats.totalLeads,
			sent: stats.sentCount,
			delivered: stats.deliveredCount,
			read: stats.readCount,
			failed: stats.failedCount,
		},
		progress: campaign.progress || 0,
		status: campaign.status || "draft",
	};
};

export default campaignsApi;
