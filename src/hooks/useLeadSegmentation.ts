// src/hooks/useLeadSegmentation.ts
import { toast } from "@/components/ui/toast";
import type { SegmentationRule } from "@/interface";
import { leadsApi } from "@/services/api/leads";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLeadSegmentation = () => {
	const queryClient = useQueryClient();

	const leadsApiMutation = useMutation({
		mutationFn: (rules: SegmentationRule[]) => leadsApi.segmentLeads(rules),

		onSuccess: () => {
			toast.success("Segmentação realizada com sucesso!");
			queryClient.invalidateQueries({ queryKey: ["leads"] });
			queryClient.invalidateQueries({ queryKey: ["userPlan"] });
			queryClient.invalidateQueries({ queryKey: ["segmentedLeads"] });
			queryClient.invalidateQueries({ queryKey: ["statistics"] });
		},
		onError: (error: Error) => {
			toast.error(`Erro ao segmentar leads: ${error.message}`); // Use toast.error
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
