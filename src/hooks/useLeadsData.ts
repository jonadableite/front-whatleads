import { Toast } from "@/components/ui/toast";
import { leadsApi } from "@/services/api/leads";
// src/hooks/useLeadsData.ts
import { useQuery } from "@tanstack/react-query";

export const useLeadsData = () => {
	const {
		data: leadsData,
		isLoading,
		refetch: refetchLeads,
	} = useQuery({
		queryKey: ["leads"],
		queryFn: async () => {
			try {
				return await leadsApi.fetchLeads();
			} catch (error) {
				Toast.error(`Erro ao carregar leads: ${(error as Error).message}`);
				throw error;
			}
		},
	});

	const { data: userPlan } = useQuery({
		queryKey: ["userPlan"],
		queryFn: async () => {
			try {
				return await leadsApi.fetchUserPlan();
			} catch (error) {
				Toast.error(`Erro ao carregar plano: ${(error as Error).message}`);
				throw error;
			}
		},
	});

	const statistics = {
		totalLeads: leadsData?.data?.totalLeads || 0,
		activeLeads: leadsData?.data?.activeLeads || 0,
		conversionRate: leadsData?.data?.conversionRate || 0,
		leadLimit: userPlan?.data?.maxLeads || 0,
	};

	return {
		leads: leadsData?.data?.leads,
		isLoading,
		userPlan: userPlan?.data,
		statistics,
		refetchLeads,
	};
};
