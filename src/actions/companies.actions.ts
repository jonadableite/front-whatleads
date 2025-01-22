// src/actions/companies.actions.ts
import { api } from "@/lib/api";
import type { Empresa } from "@/types";

export const getCompaniesAction = async (): Promise<Empresa[]> => {
	try {
		const { data } = await api.main.get<Empresa[]>("/companies");
		return data || [];
	} catch (error) {
		console.error("Error fetching companies:", error);
		return [];
	}
};
