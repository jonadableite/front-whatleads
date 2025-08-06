// src/lib/api.ts
import { authService } from '@/services/auth.service';
import axios from 'axios';

// Configuração base do axios
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'https://aquecerapi.whatlead.com.br',
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use(
	(config) => {
		const token = authService.getTokenInterno();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			// Token expirado ou inválido
			console.log('Token expirado, redirecionando para login...');
			authService.clearSession();
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default api;
