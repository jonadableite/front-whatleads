// src/services/api/leads.ts
import type { Lead, SegmentationRule } from "@/interface";
import { api } from "@/lib/api";

// Interface para a resposta de leads
export interface LeadsResponse {
	success: boolean;
	data: {
		leads: Lead[];
		total: number; // Alterado de totalLeads para total
		activeLeads: number;
		conversionRate: number;
	};
}

// Interface para a resposta do plano do usuário
export interface UserPlanResponse {
	success: boolean;
	data: {
		limits: {
			maxLeads: number;
			maxCampaigns: number;
		};
		features: string[];
		name: string;
		price: number;
		currentUsage: {
			leads: number;
			campaigns: number;
		};
	};
}

// Tipo para o retorno de métodos que não retornam dados específicos
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export const leadsApi = {
	// Método para buscar leads
	fetchLeads: async () => {
		const response = await api.main.get<LeadsResponse>("/leads");
		return response.data;
	},

	// Método para buscar campanhas
	fetchCampaigns: async () => {
		const response = await api.main.get<ApiResponse>("/campaigns", {
			params: {
				status: ["draft", "active", "completed"],
				sort: "createdAt:desc",
			},
		});
		return response.data;
	},

	// Método para deletar lead
	deleteLead: async (leadId: string) => {
		const response = await api.main.delete<ApiResponse>(`/leads/${leadId}`);
		return response.data;
	},

	// Método para atualizar lead
	updateLead: async (leadId: string, data: Partial<Lead>) => {
		const response = await api.main.put<ApiResponse<Lead>>(
			`/leads/${leadId}`,
			data,
		);
		return response.data;
	},

	// Método para buscar plano do usuário
	fetchUserPlan: async () => {
		const response = await api.main.get<UserPlanResponse>("/users/plan");
		return response.data;
	},

	// Método para importar leads
	importLeads: async (campaignId: string, file: File) => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await api.main.post<ApiResponse>(
			`/campaigns/${campaignId}/leads/import`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);

		return response.data;
	},

	// Método para segmentar leads
	segmentLeads: async (rules: SegmentationRule[]) => {
		const response = await api.main.post<ApiResponse>("/leads/segment", {
			rules,
		});
		return response.data;
	},
};
