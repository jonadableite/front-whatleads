import { toast } from "@/components/ui/toast";
import axios from "axios";
// src/hooks/useLeadsData.ts
import { useEffect, useState } from "react";

// Definição de tipos
interface Lead {
	id: string;
	name?: string;
	phone: string;
	email?: string;
	status: string;
	segment?: string;
	createdAt: Date;
}

interface LeadStatistics {
	totalLeads: number;
	activeLeads: number;
	conversionRate: number;
	leadLimit: number;
	currentLeadCount: number;
}

interface UserPlan {
	plan: string;
	leadLimit: number;
	currentLeadCount: number;
}

interface UseLeadsDataReturn {
	leads: Lead[];
	isLoading: boolean;
	error: Error | null;
	statistics: LeadStatistics;
	userPlan: UserPlan;
	refetchLeads: () => Promise<void>;
}

export const useLeadsData = (): UseLeadsDataReturn => {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);
	const [statistics, setStatistics] = useState<LeadStatistics>({
		totalLeads: 0,
		activeLeads: 0,
		conversionRate: 0,
		leadLimit: 1000,
		currentLeadCount: 0,
	});
	const [userPlan, setUserPlan] = useState<UserPlan>({
		plan: "",
		leadLimit: 0,
		currentLeadCount: 0,
	});

	const fetchLeadsData = async () => {
		try {
			setIsLoading(true);

			// Buscar leads com paginação
			const leadsResponse = await axios.get("/api/leads", {
				params: {
					page: 1,
					limit: 100, // Ajuste conforme necessário
				},
			});

			// Buscar estatísticas do plano do usuário
			const planResponse = await axios.get("/api/leads/user-plan");

			setLeads(leadsResponse.data.data);

			// Configurar estatísticas baseadas na resposta do plano
			setStatistics({
				totalLeads: planResponse.data.data.currentLeadCount,
				activeLeads: leadsResponse.data.data.filter(
					(lead: Lead) => lead.status === "active",
				).length,
				conversionRate: 0, // Você pode calcular isso no backend
				leadLimit: planResponse.data.data.leadLimit,
				currentLeadCount: planResponse.data.data.currentLeadCount,
			});

			setUserPlan({
				plan: planResponse.data.data.plan,
				leadLimit: planResponse.data.data.leadLimit,
				currentLeadCount: planResponse.data.data.currentLeadCount,
			});

			setError(null);
		} catch (err) {
			const error = err as Error;
			setError(error);
			toast.error(`Erro ao carregar leads: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const refetchLeads = async () => {
		await fetchLeadsData();
	};

	useEffect(() => {
		fetchLeadsData();
	}, []);

	return {
		leads,
		isLoading,
		error,
		statistics,
		userPlan,
		refetchLeads,
	};
};

// Funções de suporte para operações de leads
export const leadsService = {
	async updateLead(leadId: string, data: Partial<Lead>) {
		try {
			const response = await axios.patch(`/api/leads/${leadId}`, data);
			return response.data;
		} catch (error) {
			toast.error(`Erro ao atualizar lead: ${(error as Error).message}`);
			throw error;
		}
	},

	async deleteLead(leadId: string) {
		try {
			const response = await axios.delete(`/api/leads/${leadId}`);
			return response.data;
		} catch (error) {
			toast.error(`Erro ao deletar lead: ${(error as Error).message}`);
			throw error;
		}
	},

	async importLeads(campaignId: string, file: File) {
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("campaignId", campaignId);

			const response = await axios.post("/api/leads/import", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			return response.data;
		} catch (error) {
			toast.error(`Erro ao importar leads: ${(error as Error).message}`);
			throw error;
		}
	},

	async segmentLeads(rules: any[]) {
		try {
			const response = await axios.post("/api/leads/segment", { rules });
			return response.data;
		} catch (error) {
			toast.error(`Erro ao segmentar leads: ${(error as Error).message}`);
			throw error;
		}
	},
};
