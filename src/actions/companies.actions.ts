// src/actions/companies.actions.ts
import api from "@/lib/api";
import type { Empresa } from "@/types";

export const getCompaniesAction = async (): Promise<Empresa[]> => {
	try {
		const { data } = await api.get<Empresa[]>("/api/companies");
		return data || [];
	} catch (error) {
		console.error("Erro ao buscar empresas:", error);
		return [];
	}
};
