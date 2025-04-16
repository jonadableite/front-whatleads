import type { User } from "@/interface";
// src/services/api/index.ts
import { api } from "@/lib/api";

export const getAuthenticatedUser = async (): Promise<User | null> => {
	try {
		const response = await api.main.get<User>("/user/me");
		return response.data;
	} catch (error) {
		console.error("Erro ao buscar usuário autenticado:", error);
		return null;
	}
};

export const getFullCompanyUnities = async (companyId: string) => {
	try {
		const response = await api.main.get(`/campaigns/${companyId}`);
		return response.data;
	} catch (error) {
		console.error("Erro ao buscar dados da campanha:", error);
		return null;
	}
};

export const getCurrentUserCampaigns = async () => {
	try {
		const user = await getAuthenticatedUser();
		if (!user) return null;

		const response = await api.main.get("/campaigns");
		return response.data;
	} catch (error) {
		console.error("Erro ao buscar campanhas do usuário:", error);
		return null;
	}
};
