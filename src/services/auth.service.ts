// src/services/auth.service.ts
import { API_URL } from "@/config/api";
import type { LoginCredentials, LoginResponse, User } from "@/interface";
import axios from "axios";

class AuthService {
	private readonly storagePrefix = "@whatlead:";
	private readonly TOKEN_KEY = "@whatlead:token";
	private readonly USER_KEY = "@whatlead:user";

	// Login com tipagem forte e melhor tratamento de erro
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			const response = await axios.post(`${API_URL}/api/session`, credentials);
			const { token, user } = response.data;

			if (token) {
				this.setToken(token);
				this.setUser(user);
				console.log("Token armazenado após login:", token);
			}

			return response.data;
		} catch (error: any) {
			console.error("Erro durante o login:", error);
			throw new Error(
				error.response?.data?.message || "Erro ao realizar login",
			);
		}
	}

	// Verificação de autenticação melhorada
	isAuthenticated(): boolean {
		const token = this.getToken();
		if (!token) {
			console.log("Token não encontrado");
			return false;
		}

		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			const expiration = payload.exp * 1000;
			const isValid = expiration > Date.now();

			console.log("Token válido:", isValid);
			return isValid;
		} catch (error) {
			console.error("Erro ao validar token:", error);
			return false;
		}
	}

	getAuthHeaders() {
		const token = this.getToken();
		console.log("Token para headers:", token ? "Presente" : "Ausente");
		return {
			Authorization: token ? `Bearer ${token}` : "",
		};
	}

	// Logout com callback opcional
	logout(callback?: () => void): void {
		localStorage.removeItem(this.TOKEN_KEY);
		localStorage.removeItem(this.USER_KEY);

		if (callback) {
			callback();
		} else {
			window.location.href = "/login";
		}
	}

	// Gerenciamento de token
	setToken(token: string): void {
		localStorage.setItem(this.TOKEN_KEY, token);
		console.log("Token armazenado:", token);
	}

	getToken(): string | null {
		const token = localStorage.getItem(this.TOKEN_KEY);
		console.log("Token recuperado:", token);
		return token;
	}

	// Gerenciamento de usuário
	setUser(user: User): void {
		localStorage.setItem(this.USER_KEY, JSON.stringify(user));
	}

	getUser(): User | null {
		try {
			const userStr = localStorage.getItem(this.USER_KEY);
			return userStr ? JSON.parse(userStr) : null;
		} catch {
			return null;
		}
	}

	// Verificação de token expirado
	private isTokenExpired(token: string): boolean {
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			const expiration = payload.exp * 1000;
			return expiration <= Date.now();
		} catch {
			return true;
		}
	}

	// Refresh token com melhor tratamento de erro
	async refreshTokenIfNeeded(): Promise<boolean> {
		const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
		if (!refreshToken) {
			return false; // Não há refresh token disponível
		}

		try {
			const response = await axios.post(`${API_URL}/api/refresh-token`, {
				token: refreshToken,
			});
			const { token } = response.data;
			this.setToken(token); // Armazena o novo token
			return true; // Token renovado com sucesso
		} catch (error) {
			console.error("Erro ao renovar o token:", error);
			return false; // Falha na renovação do token
		}
	}

	// Método para inicializar o serviço de autenticação
	async initialize(): Promise<boolean> {
		try {
			if (!this.isAuthenticated()) {
				return false;
			}

			await this.refreshTokenIfNeeded();
			return true;
		} catch {
			return false;
		}
	}

	// Método para limpar todos os dados da sessão
	clearSession(): void {
		const keys = Object.keys(localStorage);
		keys.forEach((key) => {
			if (key.startsWith(this.storagePrefix)) {
				localStorage.removeItem(key);
			}
		});
	}
}

export const authService = new AuthService();
