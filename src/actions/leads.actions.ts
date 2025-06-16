// src/actions/leads.actions.ts
import { api } from "@/lib/api";

export async function saveCreateLead(
	name: string,
	phone: string,
	email: string,
	configId: string,
	dialog: any[],
) {
	try {
		const response = await api.main.post(`/leads`, {
			name,
			phone,
			email,
			config_id: configId,
			dialog,
		});
		return response.data;
	} catch (error) {
		console.error("Error saving lead:", error);
		throw error;
	}
}
