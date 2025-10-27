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
  UpdateBotResponse,
} from "../types/bot";
import type {
  CreateInstanceBackendResponse,
  IConnectionStateResponse,
  IConnectResponse,
  ICreateInstancePayload,
  ISettingsResponse,
} from "../types/instance";
import { authService } from "./auth.service";

const EVOLUTION_API_URL =
  import.meta.env.VITE_EVOLUTION_API_URL || "https://evo.whatlead.com.br";
const VITE_API_URL =
  import.meta.env.VITE_API_URL || "https://aquecerapi.whatlead.com.br";
const API_KEY =
  import.meta.env.VITE_EVOLUTION_API_KEY ||
  import.meta.env.VITE_PUBLIC_API_KEY ||
  "6A4F8E34A2F41D2B9E8B52F63E3C8A1";

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
export const fetchUserInstances = async (): Promise<InstancesApiResponse> => {
  try {
    const response = await backendApi.get<InstancesApiResponse>(
      "/api/instances/"
    );
    const fetchedInstances = response.data.instances; // Supondo que a estrutura seja { instances: [...] }

    // --- ADICIONE ESTE FILTRO AQUI ---
    // Filtra elementos que são null ou undefined
    const validInstances = fetchedInstances.filter(
      (instance) => instance != null
    );

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
  instanceName: string
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
  const response = await evolutionApi.delete(
    `/instance/logout/${instanceName}`
  );
  return response.data;
};

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
 * DELETE /api/instances/instance/:id
 */
export const deleteInstance = async (
  instanceId: string
): Promise<{ message: string }> => {
  const response = await backendApi.delete(
    `/api/instances/instance/${instanceId}`
  );
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

// ===== GROUP MANAGEMENT FUNCTIONS =====

/**
 * Busca todos os grupos de uma instância específica.
 * GET /group/fetchAllGroups/:instanceName?getParticipants=true
 */
export const fetchAllGroups = async (
  instanceName: string,
  getParticipants: boolean = true
): Promise<any> => {
  try {
    console.log(`[Groups] Buscando grupos para instância: ${instanceName}`);
    const response = await evolutionApi.get(
      `/group/fetchAllGroups/${instanceName}?getParticipants=${getParticipants}`
    );
    console.log(`[Groups] Grupos encontrados:`, response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      `[Groups] Erro ao buscar grupos para ${instanceName}:`,
      error
    );
    console.error(
      `[Groups] Detalhes do erro:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

/**
 * Cria um novo grupo.
 * POST /group/create/:instanceName
 */
export const createGroup = async (
  instanceName: string,
  payload: {
    subject: string;
    description?: string;
    participants: string[];
  }
): Promise<any> => {
  try {
    console.log(`[Groups] Criando grupo para instância: ${instanceName}`);
    console.log(`[Groups] Dados do grupo:`, payload);
    const response = await evolutionApi.post(
      `/group/create/${instanceName}`,
      payload
    );
    console.log(`[Groups] Grupo criado:`, response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`[Groups] Erro ao criar grupo para ${instanceName}:`, error);
    console.error(
      `[Groups] Detalhes do erro:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

/**
 * Busca informações de um grupo específico.
 * GET /group/findGroupInfos/:instanceName?groupJid=:groupJid
 */
export const findGroupInfos = async (
  instanceName: string,
  groupJid: string
): Promise<any> => {
  try {
    console.log(
      `[Groups] Buscando informações do grupo ${groupJid} para instância: ${instanceName}`
    );
    const response = await evolutionApi.get(
      `/group/findGroupInfos/${instanceName}?groupJid=${groupJid}`
    );
    console.log(`[Groups] Informações do grupo:`, response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      `[Groups] Erro ao buscar informações do grupo ${groupJid}:`,
      error
    );
    console.error(
      `[Groups] Detalhes do erro:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

/**
 * Busca o código de convite de um grupo.
 * GET /group/inviteCode/:instanceName?groupJid=:groupJid
 */
export const fetchGroupInviteCode = async (
  instanceName: string,
  groupJid: string
): Promise<any> => {
  try {
    console.log(
      `[Groups] Buscando código de convite do grupo ${groupJid} para instância: ${instanceName}`
    );
    const response = await evolutionApi.get(
      `/group/inviteCode/${instanceName}?groupJid=${groupJid}`
    );
    console.log(`[Groups] Código de convite:`, response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      `[Groups] Erro ao buscar código de convite do grupo ${groupJid}:`,
      error
    );
    console.error(
      `[Groups] Detalhes do erro:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

/**
 * Atualiza as configurações de um grupo.
 * POST /group/updateSetting/:instanceName?groupJid=:groupJid
 */
export const updateGroupSettings = async (
  instanceName: string,
  groupJid: string,
  payload: {
    action: "announcement" | "not_announcement" | "locked" | "unlocked";
  }
): Promise<any> => {
  try {
    console.log(
      `[Groups] Atualizando configurações do grupo ${groupJid} para instância: ${instanceName}`
    );
    console.log(`[Groups] Configurações:`, payload);
    const response = await evolutionApi.post(
      `/group/updateSetting/${instanceName}?groupJid=${groupJid}`,
      payload
    );
    console.log(`[Groups] Configurações atualizadas:`, response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      `[Groups] Erro ao atualizar configurações do grupo ${groupJid}:`,
      error
    );
    console.error(
      `[Groups] Detalhes do erro:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

// Funcções de serviço para agentes na Evolution API

/**
 * Busca todos os bots de uma instância específica.
 * GET /evoai/find/:instanceName
 */
export const fetchBots = async (instanceName: string): Promise<EvoAI[]> => {
  console.log(
    `[evolutionApi.service] Chamando GET /evoai/find/${instanceName}`
  );
  try {
    const response = await evolutionApi.get(`/evoai/find/${instanceName}`);
    console.log(
      `[evolutionApi.service] Resposta de /evoai/find/${instanceName}:`,
      response.data
    ); // Log da resposta
    return response.data;
  } catch (error) {
    console.error(
      `[evolutionApi.service] Erro ao buscar bots para ${instanceName}:`,
      error
    ); // Log de erro
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

// Funções para gerenciar proxy

/**
 * Busca as configurações de proxy de uma instância.
 * GET /proxy/find/:instanceName
 */
export const getProxyConfig = async (instanceName: string): Promise<any> => {
  try {
    console.log(`[Proxy] Buscando configuração de proxy para: ${instanceName}`);
    console.log(`[Proxy] URL: ${EVOLUTION_API_URL}/proxy/find/${instanceName}`);
    console.log(`[Proxy] API Key: ${API_KEY}`);

    const response = await evolutionApi.get(`/proxy/find/${instanceName}`);
    console.log(`[Proxy] Resposta da API:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      `[Proxy] Erro ao buscar configuração de proxy para ${instanceName}:`,
      error
    );

    // Se for erro 404 (não encontrado), retorna null
    if (error.response?.status === 404) {
      console.log(
        `[Proxy] Nenhuma configuração de proxy encontrada para ${instanceName}`
      );
      return null;
    }

    // Se for erro 401 (não autorizado), pode ser problema com API key
    if (error.response?.status === 401) {
      console.error(`[Proxy] Erro de autenticação - verifique a API key`);
    }

    throw error;
  }
};

/**
 * Define as configurações de proxy de uma instância.
 * POST /proxy/set/:instanceName
 */
export const setProxyConfig = async (
  instanceName: string,
  proxyConfig: {
    enabled: boolean;
    host: string;
    port: string;
    protocol: string;
    username?: string;
    password?: string;
  }
): Promise<any> => {
  try {
    console.log(
      `[Proxy] Definindo configuração de proxy para: ${instanceName}`
    );
    console.log(`[Proxy] Configuração:`, proxyConfig);
    console.log(`[Proxy] URL: ${EVOLUTION_API_URL}/proxy/set/${instanceName}`);

    const response = await evolutionApi.post(
      `/proxy/set/${instanceName}`,
      proxyConfig
    );
    console.log(`[Proxy] Resposta da API:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      `[Proxy] Erro ao definir configuração de proxy para ${instanceName}:`,
      error
    );
    console.error(
      `[Proxy] Detalhes do erro:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
