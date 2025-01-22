// src/actions/instance.actions.ts
import { api } from "@/lib/api";
import type { InstancesResponse } from "@/types";

export const GetInstancesAction = async (): Promise<InstancesResponse> => {
	try {
		const { data } = await api.main.get<InstancesResponse>("/instances");
		return data;
	} catch (error) {
		console.error("Erro ao buscar instâncias:", error);
		throw error;
	}
};
