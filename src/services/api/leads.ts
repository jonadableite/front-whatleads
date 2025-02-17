// src/services/api/leads.ts
import type { Lead, SegmentationRule } from "@/interface";
import { api } from "@/lib/api";

export interface LeadsResponse {
	success: boolean;
	data: {
		leads: Lead[];
		totalLeads: number;
		activeLeads: number;
		conversionRate: number;
	};
}

export interface UserPlanResponse {
	success: boolean;
	data: {
		maxLeads: number;
		maxCampaigns: number;
		features: string[];
		name: string;
		price: number;
		currentUsage: {
			leads: number;
			campaigns: number;
		};
	};
}

export const leadsApi = {
	fetchLeads: async () => {
		const response = await api.main.get<LeadsResponse>("/leads");
		return response.data;
	},

	fetchCampaigns: async () => {
		const response = await api.main.get("/campaigns", {
			params: {
				status: ["draft", "active", "completed"],
				sort: "createdAt:desc",
			},
		});
		return response.data;
	},

	deleteLead: async (leadId: string) => {
		const response = await api.main.delete(`/leads/${leadId}`);
		return response.data;
	},

	updateLead: async (leadId: string, data: Partial<Lead>) => {
		const response = await api.main.put(`/leads/${leadId}`, data);
		return response.data;
	},

	fetchUserPlan: async () => {
		const response = await api.main.get<UserPlanResponse>("/users/plan");
		return response.data;
	},

	importLeads: async (campaignId: string, file: File) => {
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
	},

	async segmentLeads(rules: SegmentationRule[]) {
		const response = await api.main.post("/leads/segment", { rules });
		return response.data;
	},
};
