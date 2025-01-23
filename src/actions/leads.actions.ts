// src/actions/leads.actions.ts
import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "https://https://api.whatlead.com.br";

export async function saveCreateLead(
	name: string,
	phone: string,
	email: string,
	configId: string,
	dialog: any[],
) {
	try {
		const token = localStorage.getItem("token");
		if (!token) {
			throw new Error("Token não encontrado");
		}

		const response = await axios.post(
			`${API_BASE_URL}/leads`,
			{
				name,
				phone,
				email,
				config_id: configId,
				dialog,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);
		return response.data;
	} catch (error) {
		console.error("Error saving lead:", error);
		throw error;
	}
}
