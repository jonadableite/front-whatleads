import type { LeadsResponse, UserPlanResponse } from "@/interface";
// src/hooks/useLeadsData.ts
import { leadsApi } from "@/services/api/leads";
import { useQuery } from "@tanstack/react-query";

export const useLeadsData = () => {
	const {
		data: leadsData,
		isLoading,
		refetch: refetchLeads,
	} = useQuery<LeadsResponse>({
		queryKey: ["leads"],
		queryFn: async () => {
			try {
				return await leadsApi.fetchLeads();
			} catch (error) {
				console.error("Error fetching leads:", error);
				throw error;
			}
		},
	});

	const { data: userPlanResponse, isLoading: isLoadingUserPlan } =
		useQuery<UserPlanResponse>({
			queryKey: ["userPlan"],
			queryFn: async () => {
				try {
					return await leadsApi.fetchUserPlan();
				} catch (error) {
					console.error("Error fetching user plan:", error);
					throw error;
				}
			},
		});

	const totalLeads = leadsData?.data?.total || 0;
	const leads = leadsData?.data?.leads || [];
	const activeLeads = leads.filter((lead) => lead.status === "READ").length;
	const conversionRate = totalLeads > 0 ? (activeLeads / totalLeads) * 100 : 0;

	const statistics = {
		totalLeads,
		activeLeads,
		conversionRate,
		leadLimit: userPlanResponse?.data?.limits?.maxLeads || 0, // Acesso correto à propriedade
	};

	return {
		leads,
		isLoading: isLoading || isLoadingUserPlan,
		userPlan: userPlanResponse?.data, // Retorna apenas a parte de dados
		statistics,
		refetchLeads,
	};
};
