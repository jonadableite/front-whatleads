// src/lib/api.ts
import axios from "axios";

const API_URL =
	import.meta.env.VITE_API_URL ||
	"https://whatlead-api-saas.hlvhsf.easypanel.host";

export const api = {
	main: axios.create({
		baseURL: `${API_URL}/api`,
		headers: {
			"Content-Type": "application/json",
		},
	}),
	warmer: axios.create({
		baseURL: `${API_URL}/api`,
		headers: {
			"Content-Type": "application/json",
		},
	}),
};

// Adicionar interceptors para ambas as instâncias
[api.main, api.warmer].forEach((instance) => {
	instance.interceptors.request.use(
		(config) => {
			const token = localStorage.getItem("@whatlead:token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error) => {
			return Promise.reject(error);
		},
	);
});
