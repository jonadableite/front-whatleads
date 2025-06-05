// services/api.ts
import { getApiUrl } from "@/lib/env";
import { authService } from "@/services/auth.service";
import axios from "axios";

// URL do backend principal
const apiUrlInternal = getApiUrl();

// URL do backend da Evo AI
const apiUrlEvoAi = import.meta.env.VITE_API_AI_URL;

if (!apiUrlEvoAi) {
    console.error("VITE_API_AI_URL não está definido no ambiente. As chamadas para a API da Evo AI podem falhar.");
}


// --- Instância Axios para o Backend Interno (Seu SaaS) ---
// Esta instância será usada para chamadas como /api/session, /users, /clients,
// e também para as rotas de agentes compartilhados que usam x-api-key.
const apiInternal = axios.create({
  baseURL: apiUrlInternal,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição para apiInternal: Adiciona token interno ou x-api-key
apiInternal.interceptors.request.use(
  (config) => {
    console.log(`[apiInternal] Making request to: ${config.baseURL}${config.url}`);

    // Não adicione headers de autenticação para requisições que não precisam (ex: login, register)
    const isAuthEndpoint =
      config.url &&
      (config.url.includes("/api/session") ||
       config.url.includes("/auth/register") ||
       config.url.includes("/auth/forgot-password") ||
       config.url.includes("/auth/reset-password"));

    if (isAuthEndpoint) {
      console.log(`[apiInternal Interceptor] Skipping auth headers for auth endpoint: ${config.url}`);
      return config; // Não adiciona headers para endpoints de autenticação
    }

    // Verificar se estamos em uma rota de agente compartilhado ou página de chat compartilhado
    const isSharedAgentRequest =
      config.url &&
      (config.url.includes("/agents/shared") ||
       config.url.includes("/chat/ws/")); // Ajuste se as URLs de chat compartilhado forem diferentes

    const isSharedChatPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/shared-chat");

    // Lógica para agentes compartilhados (usa x-api-key) - Esta lógica fica na apiInternal
    if ((isSharedAgentRequest || isSharedChatPage) && localStorage.getItem("shared_agent_api_key")) {
      const apiKey = localStorage.getItem("shared_agent_api_key");
      if (!config.headers) config.headers = {} as import("axios").AxiosRequestHeaders;
      (config.headers as any)["x-api-key"] = apiKey;
      // Remove o header Authorization se existir, para garantir que apenas x-api-key seja usado
      delete (config.headers as any)["Authorization"];
      console.log(`[apiInternal Interceptor] Using shared agent API key for: ${config.url}`);
    } else {
      // Para todos os outros endpoints da API interna, usar o token interno
      const internalToken = authService.getTokenInterno();
      if (internalToken) {
         if (!config.headers) config.headers = {} as import("axios").AxiosRequestHeaders;
         (config.headers as any)["Authorization"] = `Bearer ${internalToken}`;
         console.log(`[apiInternal Interceptor] Adding Internal token for: ${config.url}`);
      } else {
         console.warn(`[apiInternal Interceptor] Internal token not found for ${config.url}. This may cause a 401.`);
         // O 401 response interceptor lidará com isso
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- Instância Axios para o Backend da Evo AI ---
// Esta instância será usada para chamadas como /api/v1/agents/...
const apiEvoAi = axios.create({
  baseURL: apiUrlEvoAi,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição para apiEvoAi: Adiciona token Evo AI
apiEvoAi.interceptors.request.use(
  (config) => {
    console.log(`[apiEvoAi] Making request to: ${config.baseURL}${config.url}`);

    // Para endpoints da API Evo AI, usar o token Evo AI
    const evoAiToken = authService.getEvoAiToken();
    if (evoAiToken) {
      if (!config.headers) config.headers = {} as import("axios").AxiosRequestHeaders;
      (config.headers as any)["Authorization"] = `Bearer ${evoAiToken}`;
      console.log(`[apiEvoAi Interceptor] Adding Evo AI token for: ${config.url}`);
    } else {
      console.warn(`[apiEvoAi Interceptor] Evo AI token not found for ${config.url}. This may cause a 401.`);
      // O 401 response interceptor lidará com isso
    }

    // Não há lógica de x-api-key ou token interno aqui, pois é para o backend Evo AI direto.
    // Se o backend Evo AI também precisar de x-client-id, ele deve ser adicionado aqui
    // ou nas funções de serviço que usam apiEvoAi.

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- Interceptor de Resposta Compartilhado para 401 Unauthorized ---
// Esta lógica se aplica a AMBAS as instâncias (apiInternal e apiEvoAi)
const handleUnauthorizedResponse = async (error: any) => {
  // Check if we have a 401 Unauthorized error and we're in a browser context
  if (
    error.response &&
    error.response.status === 401 &&
    typeof window !== "undefined"
  ) {
    const originalRequest = error.config;

    // Skip logout for login endpoint and other auth endpoints (only relevant for apiInternal)
    const isAuthEndpoint =
      originalRequest.url &&
      (originalRequest.url.includes("/api/session") || // Endpoint de login/sessão
       originalRequest.url.includes("/auth/register") ||
       originalRequest.url.includes("/auth/forgot-password") ||
       originalRequest.url.includes("/auth/reset-password"));

    // Skip logout for shared chat page (relevant for apiInternal if it handles shared chat)
    const isSharedChatPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/shared-chat");

    // Se o erro 401 não for em um endpoint de autenticação ou página de chat compartilhado,
    // significa que o token (interno ou Evo AI, dependendo da instância que falhou)
    // usado na requisição falhou.
    // Neste caso, a sessão principal está inválida e devemos fazer logout.
    // Nota: Um 401 na apiEvoAi também deve invalidar a sessão principal, pois
    // o token Evo AI é obtido durante o login principal.
    if (!isAuthEndpoint && !isSharedChatPage) {
       console.warn(`[API Interceptor] Received 401 Unauthorized from ${error.config.baseURL}. Initiating logout.`);
       // Opcional: Implementar lógica de refresh token aqui se necessário para o token interno
       // if (error.config.baseURL === apiUrlInternal && !originalRequest._retry) {
       //    originalRequest._retry = true;
       //    const refreshed = await authService.refreshTokenIfNeeded(); // Assumindo que refresh token é para o token interno
       //    if (refreshed) {
       //       // Tentar novamente a requisição original com o novo token interno
       //       originalRequest.headers['Authorization'] = `Bearer ${authService.getTokenInterno()}`;
       //       return axios(originalRequest); // Use axios global para evitar loop com interceptor da instância
       //    }
       // }
       // Se não for uma chamada interna que pode ser renovada, ou a renovação falhou, ou é uma falha da apiEvoAi:
       authService.logout(); // Centraliza a limpeza da sessão e redirecionamento
       // O authService.logout() já fará o window.location.replace('/login'),
       // então não precisamos fazer o redirect aqui novamente.
    } else {
        console.log(`[API Interceptor] Received 401 Unauthorized from ${error.config.baseURL} for an auth or shared chat endpoint. Skipping logout.`);
        // Se for um 401 em um endpoint de login, por exemplo, é uma falha de credenciais,
        // não um problema de sessão expirada que exija logout.
    }
  }

  return Promise.reject(error);
};


apiInternal.interceptors.response.use((response) => response, handleUnauthorizedResponse);
apiEvoAi.interceptors.response.use((response) => response, handleUnauthorizedResponse);



export { apiEvoAi, apiInternal };

