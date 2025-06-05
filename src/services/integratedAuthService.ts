// services/integratedAuthService.ts
import axios from "axios";

const BACKEND_INTEGRATOR_URL =
	process.env.NEXT_PUBLIC_BACKEND_INTEGRATOR_URL || "http://localhost:3001";

// Interface para resposta de login integrado
export interface IntegratedLoginResponse {
	message: string;
	user: {
		id: string;
		email: string;
		name: string;
		isAdmin: boolean;
		evoIaUserId: string;
		instances?: any[];
	};
	tokens: {
		integrator: string;
		evoIa: string;
	};
}

// Interface para dados de login
export interface IntegratedLoginRequest {
	email: string;
	password: string;
}

// Criar instância do axios para o backend integrador
const api = axios.create({
	baseURL: BACKEND_INTEGRATOR_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor para adicionar token do integrador automaticamente
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("integrator_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Login integrado (autentica na Evo-IA e sincroniza com o integrador)
export const integratedLogin = async (
	data: IntegratedLoginRequest,
): Promise<IntegratedLoginResponse> => {
	console.log("🔄 Attempting integrated login...");

	try {
		const response = await api.post("/api/integration/login", data);
		console.log("✅ Integrated login successful:", response.data);
		return response.data;
	} catch (error) {
		console.error("❌ Integrated login failed:", error);
		throw error;
	}
};

// Verificar se usuário está autenticado no integrador
export const checkAuth = async () => {
	try {
		const response = await api.get("/api/integration/dashboard");
		return response.data;
	} catch (error) {
		throw error;
	}
};

// Obter token do integrador
export const getIntegratorToken = (): string | null => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("integrator_token");
	}
	return null;
};

// Obter token da Evo-IA
export const getEvoIaToken = (): string | null => {
	if (typeof window !== "undefined") {
		return (
			localStorage.getItem("evo_ia_token") ||
			localStorage.getItem("access_token")
		);
	}
	return null;
};

// Verificar se está autenticado
export const isAuthenticated = (): boolean => {
	return !!(getIntegratorToken() && getEvoIaToken());
};

// Logout (limpar todos os tokens)
export const logout = () => {
	if (typeof window !== "undefined") {
		// Remover todos os tokens
		localStorage.removeItem("access_token");
		localStorage.removeItem("integrator_token");
		localStorage.removeItem("evo_ia_token");
		localStorage.removeItem("user");
		localStorage.removeItem("integrator_user");

		// Limpar cookies
		document.cookie =
			"access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
		document.cookie =
			"integrator_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
		document.cookie =
			"evo_ia_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
		document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
		document.cookie =
			"integrator_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
	}
};

export default api;
