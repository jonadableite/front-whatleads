// src/services/evolutionApi.service.ts
import { EvoAI } from "@/interface";
import axios from "axios";
import type {
  ChangeStatusPayload,
  ChangeStatusResponse,
  CreateBotPayload,
  CreateBotResponse,
  Settings,
  UpdateBotPayload,
  UpdateBotResponse
} from "../types/bot";
import type {
  CreateInstanceBackendResponse,
  IConnectionStateResponse,
  IConnectResponse,
  ICreateInstancePayload,
  InstancesResponse,
  ISettingsResponse,
} from "../types/instance";
import { authService } from "./auth.service";

const EVOLUTION_API_URL =
  import.meta.env.VITE_EVOLUTION_API_URL || "http://localhost:8080";
const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";
const API_KEY =
  import.meta.env.VITE_PUBLIC_API_KEY || "429683C4C977415CAAFCCE10F7D57E11";

// Axios instance configurada para a Evolution API
export const evolutionApi = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    "Content-Type": "application/json",
    apikey: API_KEY, // API Key para autenticação na Evolution API
  },
});

// Axios para Backend principal
export const backendApi = axios.create({
  baseURL: VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token de autenticação do usuário logado
backendApi.interceptors.request.use(
  (config) => {
    const token = authService.getTokenInterno();
    if (!token) {
      console.warn("Token de autenticação não encontrado.");
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funções de serviço para a Evolution API

/**
 * Busca as configurações de uma instância específica.
 * GET /settings/find/:instanceName
 */
export const getSettings = async (
  instanceName: string
): Promise<ISettingsResponse> => {
  const response = await evolutionApi.get(`/settings/find/${instanceName}`);
  return response.data;
};

/**
 * Define as configurações de uma instância específica.
 * POST /settings/set/:instanceName
 */
export const setSettings = async (
  instanceName: string,
  settings: Partial<ISettingsResponse>
): Promise<ISettingsResponse> => {
  const response = await evolutionApi.post(
    `/settings/set/${instanceName}`,
    settings
  );
  return response.data;
};

/**
 * Obtém o status de conexão de uma instância.
 * GET /instance/connectionState/:instanceName
 */
export const getConnectionState = async (
  instanceName: string
): Promise<IConnectionStateResponse> => {
  const response = await evolutionApi.get(
    `/instance/connectionState/${instanceName}`
  );
  return response.data;
};

/**
 * Lista todas as instâncias do usuário autenticado.
 * GET /api/instances/
 */
export const fetchUserInstances = async (): Promise<InstancesResponse> => {
  try {
    const response = await backendApi.get<InstancesResponse>("/api/instances/");
    const fetchedInstances = response.data.instances; // Supondo que a estrutura seja { instances: [...] }

    // --- ADICIONE ESTE FILTRO AQUI ---
    // Filtra elementos que são null ou undefined
    const validInstances = fetchedInstances.filter(instance => instance != null);

    // Se a sua interface InstancesResponse espera um objeto com a propriedade 'instances':
    return { ...response.data, instances: validInstances };
    // Se a sua interface espera apenas o array:
    // return validInstances as InstancesResponse; // Ajuste o tipo conforme necessário
    // ----------------------------------

  } catch (error) {
    console.error("Erro ao buscar instâncias:", error);
    throw error;
  }
};


/**
 * Inicia o processo de conexão para uma instância (geralmente retorna QR Code ou Pairing Code).
 * GET /instance/connect/:instanceName
 * @param number (Optional) Recipient number with Country Code for pairing code
 */
export const connectInstance = async (
  instanceName: string,
): Promise<IConnectResponse> => {
  const response = await evolutionApi.get(`/instance/connect/${instanceName}`);
  return response.data;
};

/**
 * Reinicia uma instância.
 * POST /instance/restart/:instanceName
 */
export const restartInstance = async (instanceName: string): Promise<any> => {
  // A documentação não especifica o tipo de retorno, use 'any' ou crie uma interface
  const response = await evolutionApi.post(`/instance/restart/${instanceName}`);
  return response.data;
};


/**
 * Desconecta uma instância.
 * POST /instance/logout/:instanceName
 */

export const logoutInstance = async (instanceName: string): Promise<any> => {
  const response = await evolutionApi.delete(`/instance/logout/${instanceName}`);
  return response.data;
}

/**
 * Define o status de presença de uma instância.
 * POST /instance/setPresence/:instanceName
 * @param presence 'available' | 'unavailable'
 */
export const setPresence = async (
  instanceName: string,
  presence: "available" | "unavailable"
): Promise<any> => {
  const response = await evolutionApi.post(
    `/instance/setPresence/${instanceName}`,
    { presence }
  );
  return response.data;
};

/**
 * Deleta uma instância do backend (não da Evolution API).
 * DELETE /api/instances/:id
 */
export const deleteInstance = async (
  instanceId: string
): Promise<{ message: string }> => {
  const response = await backendApi.delete(`/api/instances/${instanceId}`);
  return response.data;
};

/**
 * Cria uma nova instância via backend da aplicação.
 * POST /api/instances/create
 */
export const createInstance = async (
  payload: ICreateInstancePayload
): Promise<CreateInstanceBackendResponse> => {
  try {
    const response = await backendApi.post<CreateInstanceBackendResponse>(
      "/api/instances/create",
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error("Erro ao criar instância:", error?.response?.data || error);
    throw error;
  }
};

// Funcções de serviço para agentes na Evolution API

/**
 * Busca todos os bots de uma instância específica.
 * GET /evoai/find/:instanceName
 */
export const fetchBots = async (
  instanceName: string
): Promise<EvoAI[]> => {
  console.log(`[evolutionApi.service] Chamando GET /evoai/find/${instanceName}`);
  try {
    const response = await evolutionApi.get(
      `/evoai/find/${instanceName}`
    );
    console.log(`[evolutionApi.service] Resposta de /evoai/find/${instanceName}:`, response.data); // Log da resposta
    return response.data;
  } catch (error) {
    console.error(`[evolutionApi.service] Erro ao buscar bots para ${instanceName}:`, error); // Log de erro
    throw error;
  }
};


/**
 * Cria um novo bot na instância.
 * POST /evoai/create/:instanceName
 */
export const createBot = async (
  instanceName: string,
  payload: CreateBotPayload
): Promise<CreateBotResponse> => {
  const response = await evolutionApi.post<CreateBotResponse>(
    `/evoai/create/${instanceName}`,
    payload
  );
  return response.data;
};

/**
 * Atualiza um bot específico.
 * PUT /evoai/update/:botId/:instanceName
 */
export const updateBot = async (
  botId: string,
  instanceName: string,
  payload: UpdateBotPayload
): Promise<UpdateBotResponse> => {
  const response = await evolutionApi.put<UpdateBotResponse>(
    `/evoai/update/${botId}/${instanceName}`,
    payload
  );
  return response.data;
};

/**
 * Deleta um bot específico.
 * DELETE /evoai/delete/:botId/:instanceName
 */
export const deleteBot = async (
  botId: string,
  instanceName: string
): Promise<void> => {
  await evolutionApi.delete(`/evoai/delete/${botId}/${instanceName}`);
};

/**
 * Salva configurações padrão para bots.
 * POST /evoai/settings/:instanceName
 */
export const saveBotSettings = async (
  instanceName: string,
  payload: Settings
): Promise<Settings> => {
  const response = await evolutionApi.post<Settings>(
    `/evoai/settings/${instanceName}`,
    payload
  );
  return response.data;
};

/**
 * Obtém configurações padrão salvas para bots.
 * GET /evoai/fetchSettings/:instanceName
 */
export const fetchBotSettings = async (
  instanceName: string
): Promise<Settings> => {
  const response = await evolutionApi.get<Settings>(
    `/evoai/fetchSettings/${instanceName}`
  );
  return response.data;
};

/**
 * Altera o status de um bot.
 * POST /evoai/changeStatus/:instanceName
 */
export const changeBotStatus = async (
  instanceName: string,
  payload: ChangeStatusPayload
): Promise<ChangeStatusResponse> => {
  const response = await evolutionApi.post<ChangeStatusResponse>(
    `/evoai/changeStatus/${instanceName}`,
    payload
  );
  return response.data;
};
