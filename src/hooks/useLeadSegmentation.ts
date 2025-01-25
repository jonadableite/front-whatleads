import { Toast } from "@/components/ui/toast";
import type { SegmentationRule } from "@/interface";
import { leadsApi } from "@/services/api/leads";
// src/hooks/useLeadSegmentation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLeadSegmentation = () => {
	const queryClient = useQueryClient();

	const leadsApiMutation = useMutation({
		mutationFn: (rules: SegmentationRule[]) => leadsApi.segmentLeads(rules),

		onSuccess: () => {
			Toast.success("Segmentação realizada com sucesso!");
			queryClient.invalidateQueries({ queryKey: ["leads"] });
			queryClient.invalidateQueries({ queryKey: ["userPlan"] });
			queryClient.invalidateQueries({ queryKey: ["segmentedLeads"] });
			queryClient.invalidateQueries({ queryKey: ["statistics"] });
		},
		onError: (error: Error) => {
			Toast.error(`Erro ao segmentar leads: ${error.message}`);
			queryClient.invalidateQueries({ queryKey: ["leads"] });
		},
	});

	const handleSegmentation = async (rules: SegmentationRule[]) => {
		await leadsApiMutation.mutateAsync(rules);
		return leadsApiMutation.data;
	};

	return {
		handleSegmentation,
		isSegmenting: leadsApiMutation.status === "pending",
		isError: leadsApiMutation.isError,
		error: leadsApiMutation.error,
		data: leadsApiMutation.data,
		isSuccess: leadsApiMutation.isSuccess,
	};
};
