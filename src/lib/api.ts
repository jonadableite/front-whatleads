// src/lib/api.ts
import { authService } from "@/services/auth.service";
import axios from "axios";
import { toast } from "react-hot-toast"; // Se estiver usando react-hot-toast

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";
const API_KEY = "429683C4C977415CAAFCCE10F7D57E11";

const apiExternal = axios.create({
	baseURL: "http://localhost:8080",
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
			const token = authService.getTokenInterno();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error) => Promise.reject(error),
	);

	instance.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response) {
				switch (error.response.status) {
					case 401:
						// Token expirado ou inválido
						toast.error("Sessão expirada. Faça login novamente.");
						authService.logout(() => {
							// Redireciona para login
							window.location.href = "/login";
						});
						break;

					case 403:
						toast.error("Você não tem permissão para acessar este recurso.");
						break;

					case 404:
						toast.error("Recurso não encontrado.");
						break;

					case 500:
						toast.error(
							"Erro interno do servidor. Tente novamente mais tarde.",
						);
						break;

					default:
						// Outros erros de servidor
						// biome-ignore lint/complexity/useOptionalChain: <explanation>
						if (error.response.data && error.response.data.message) {
							toast.error(error.response.data.message);
						}
						break;
				}
			} else if (error.request) {
				// Erro de rede
				toast.error("Sem conexão com o servidor. Verifique sua internet.");
			} else {
				// Erro genérico
				toast.error("Ocorreu um erro inesperado.");
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
