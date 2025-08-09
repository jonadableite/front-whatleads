// src/lib/api.ts
import { authService } from '@/services/auth.service';
import axios from 'axios';

// Configuração base do axios sem timeout fixo
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'https://aquecerapi.whatlead.com.br',
	// Removido timeout fixo - será configurado por requisição
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

		// Configurar timeout dinâmico baseado na URL
		if (!config.timeout) {
			if (config.url?.includes('/groups/fetchAllGroups')) {
				// Timeout maior para buscar grupos com participantes
				config.timeout = 30000; // 30 segundos
			} else if (config.url?.includes('/instances')) {
				// Timeout médio para buscar instâncias
				config.timeout = 15000; // 15 segundos
			} else {
				// Timeout padrão para outras operações
				config.timeout = 10000; // 10 segundos
			}
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
		if (error.code === 'ECONNABORTED') {
			console.warn('Timeout da requisição:', error.config?.url);
			// Não fazer logout em caso de timeout, apenas mostrar erro
			return Promise.reject({
				...error,
				message: 'Tempo limite da requisição excedido. Tente novamente.',
			});
		}

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
