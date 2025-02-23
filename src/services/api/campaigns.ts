// @ts-nocheck

// src/services/api/campaigns.ts
import { api } from "@/lib/api";

export const campaignsApi = {
	fetchCampaigns: async () => {
		const response = await api.get("/campaigns");
		return response.data;
	},

	createCampaign: async (data: any) => {
		const response = await api.post("/campaigns", data);
		return response.data;
	},

	// ... outros métodos necessários
};
