import { authService } from "@/services/auth.service";
// src/lib/api.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://api.whatlead.com.br";
const API_KEY = "429683C4C977415CAAFCCE10F7D57E11";

const apiExternal = axios.create({
	baseURL: "https://evo.whatlead.com.br",
});

apiExternal.interceptors.request.use((config) => {
	config.headers.apikey = API_KEY;
	return config;
});

const createApiInstance = (baseURL: string) => {
	const instance = axios.create({
		baseURL: `${baseURL}/api`,
		headers: {
			"Content-Type": "application/json",
		},
	});

	instance.interceptors.request.use(
		(config) => {
			const token = authService.getToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			console.log(
				"Config da requisição (token enviado):",
				config.headers.Authorization,
			);
			return config;
		},
		(error) => {
			console.error("Erro na requisição:", error);
			return Promise.reject(error);
		},
	);

	instance.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response && error.response.status === 401) {
				// Token expirado ou inválido
				authService.logout();
				// Redirecionar para a página de login
				window.location.href = "/login";
			}
			return Promise.reject(error);
		},
	);

	return instance;
};

export const api = {
	main: createApiInstance(API_URL),
	warmer: createApiInstance(API_URL),
	external: apiExternal,
};

export default api;
