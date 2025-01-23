// src/services/auth.service.ts
import { API_URL } from "@/config/api";
import type { LoginCredentials, LoginResponse, User } from "@/interface";
import axios from "axios";

class AuthService {
	private readonly storagePrefix = "@whatlead:";
	private readonly TOKEN_KEY = "@whatlead:token";
	private readonly USER_KEY = "@whatlead:user";

	// Função para criar headers autenticados
	getAuthHeaders() {
		const token = this.getToken();
		return {
			Authorization: token ? `Bearer ${token}` : "",
			"Content-Type": "application/json",
		};
	}

	// Login com tipagem forte e melhor tratamento de erro
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			const response = await axios.post(`${API_URL}/api/session`, credentials);
			const { token, user } = response.data;

			if (token) {
				this.setToken(token);
				this.setUser(user);
			}

			return response.data;
		} catch (error: any) {
			throw new Error(
				error.response?.data?.message || "Erro ao realizar login",
			);
		}
	}

	// Verificação de autenticação melhorada
	isAuthenticated(): boolean {
		try {
			const token = this.getToken();
			if (!token) return false;

			const payload = JSON.parse(atob(token.split(".")[1]));
			const expiration = payload.exp * 1000;
			const isValid = expiration > Date.now();

			if (!isValid) {
				this.logout(); // Logout automático se expirado
				return false;
			}

			return true;
		} catch {
			this.logout();
			return false;
		}
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
	}

	getToken(): string | null {
		return localStorage.getItem(this.TOKEN_KEY);
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
		try {
			const token = this.getToken();
			if (!token) return false;

			if (this.isTokenExpired(token)) {
				const response = await axios.post(
					`${API_URL}/api/auth/refresh-token`,
					{ token },
					{ headers: this.getAuthHeaders() },
				);

				if (response.data.access_token) {
					this.setToken(response.data.access_token);
					return true;
				}
			}

			return !this.isTokenExpired(token);
		} catch (error) {
			console.error("Erro ao renovar token:", error);
			this.logout();
			return false;
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
