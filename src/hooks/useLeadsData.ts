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
				console.error("Error fetching leads:", error);
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
		leadLimit: userPlan?.limits?.maxLeads || 0,
	};

	return {
		leads,
		isLoading,
		userPlan,
		statistics,
		refetchLeads,
	};
};
