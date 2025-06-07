// src/services/evolutionApi.service.ts
import axios from "axios";
import {
  CreateInstanceBackendResponse,
  IConnectionStateResponse,
  IConnectResponse,
  ICreateInstancePayload,
  IEvoAI,
  IEvoAISession,
  IEvoAISettings,
  InstancesResponse,
  ISettingsResponse
} from "../types";
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
  instanceName: string,
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
  settings: Partial<ISettingsResponse>,
): Promise<ISettingsResponse> => {
  const response = await evolutionApi.post(
    `/settings/set/${instanceName}`,
    settings,
  );
  return response.data;
};

/**
 * Obtém o status de conexão de uma instância.
 * GET /instance/connectionState/:instanceName
 */
export const getConnectionState = async (
  instanceName: string,
): Promise<IConnectionStateResponse> => {
  const response = await evolutionApi.get(
    `/instance/connectionState/${instanceName}`,
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
    return response.data;
  } catch (error: any) {
    console.error("Erro ao listar instâncias:", error?.response?.data || error);
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
  number?: string,
): Promise<IConnectResponse> => {
  const response = await evolutionApi.get(`/instance/connect/${instanceName}`, {
    params: { number }, // Adiciona o número como query param se fornecido
  });
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
 * Define o status de presença de uma instância.
 * POST /instance/setPresence/:instanceName
 * @param presence 'available' | 'unavailable'
 */
export const setPresence = async (
  instanceName: string,
  presence: "available" | "unavailable",
): Promise<any> => {
  const response = await evolutionApi.post(
    `/instance/setPresence/${instanceName}`,
    { presence },
  );
  return response.data;
};

/**
 * Deleta uma instância do backend (não da Evolution API).
 * DELETE /api/instances/:id
 */
export const deleteInstance = async (
  instanceId: string,
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
// Funções de serviço para EvoAI

/**
 * Busca todos os EvoAIs de uma instância específica.
 * GET /evoai/find/:instanceName
 */
export const fetchEvoAIs = async (
  instanceName: string,
): Promise<IEvoAI[]> => {
  const response = await evolutionApi.get(`/evoai/find/${instanceName}`);
  return response.data;
};

/**
 * Cria um novo EvoAI na instância.
 * POST /evoai/create/:instanceName
 * @param payload O corpo da requisição para criar o EvoAI. Defina a interface IEvoAICreatePayload se necessário.
 */
export const createEvoAI = async (
  instanceName: string,
  payload: any, // Substituir 'any' por uma interface específica (IEvoAICreatePayload)
): Promise<IEvoAI> => {
  const response = await evolutionApi.post(`/evoai/create/${instanceName}`, payload);
  return response.data; // Assumindo que retorna o EvoAI criado
};

/**
 * Atualiza um EvoAI específico.
 * PUT /evoai/update/:evoaiId/:instanceName
 * @param evoaiId O ID do EvoAI a ser atualizado.
 * @param instanceName O nome da instância.
 * @param payload O corpo da requisição para atualizar o EvoAI. Defina a interface IEvoAIUpdatePayload se necessário.
 */
export const updateEvoAI = async (
  evoaiId: string,
  instanceName: string,
  payload: any, // Substituir 'any' por uma interface específica (IEvoAIUpdatePayload)
): Promise<IEvoAI> => {
  const response = await evolutionApi.put(`/evoai/update/${evoaiId}/${instanceName}`, payload);
  return response.data; // Assumindo que retorna o EvoAI atualizado
};

/**
 * Deleta um EvoAI específico.
 * DELETE /evoai/delete/:evoaiId/:instanceName
 * @param evoaiId O ID do EvoAI a ser deletado.
 * @param instanceName O nome da instância.
 */
export const deleteEvoAI = async (
  evoaiId: string,
  instanceName: string,
): Promise<any> => { // Ajuste o tipo de retorno se a API retornar algo específico na deleção
  const response = await evolutionApi.delete(`/evoai/delete/${evoaiId}/${instanceName}`);
  return response.data;
};

/**
 * Salva configurações padrão para EvoAI.
 * POST /evoai/settings/:instanceName
 * @param payload As configurações a serem salvas. Defina a interface IEvoAISettingsPayload se necessário.
 */
export const saveEvoAISettings = async (
  instanceName: string,
  payload: IEvoAISettings, // Substituir por interface específica
): Promise<IEvoAISettings> => { // Ajuste o tipo de retorno se a API retornar algo diferente
  const response = await evolutionApi.post(`/evoai/settings/${instanceName}`, payload);
  return response.data;
};

/**
 * Obtém configurações padrão salvas para EvoAI.
 * GET /evoai/fetchSettings/:instanceName
 */
export const fetchEvoAISettings = async (
  instanceName: string,
): Promise<IEvoAISettings> => { // Ajuste o tipo de retorno se a API retornar algo diferente
  const response = await evolutionApi.get(`/evoai/fetchSettings/${instanceName}`);
  return response.data;
};

/**
 * Altera o status de uma sessão de EvoAI.
 * POST /evoai/changeStatus/:instanceName
 * @param payload O corpo da requisição para alterar o status. Defina a interface IEvoAIChangeStatusPayload se necessário.
 * Ex: { sessionId: string, status: 'opened' | 'paused' | 'closed' }
 */
export const changeEvoAISessionStatus = async (
  instanceName: string,
  payload: any, // Substituir por interface específica (IEvoAIChangeStatusPayload)
): Promise<any> => { // Ajuste o tipo de retorno
  const response = await evolutionApi.post(`/evoai/changeStatus/${instanceName}`, payload);
  return response.data;
};

/**
 * Obtém sessões atreladas a um EvoAI específico.
 * GET /evoai/fetchSessions/:evoaiId/:instanceName
 * @param evoaiId O ID do EvoAI.
 * @param instanceName O nome da instância.
 */
export const fetchEvoAISessions = async (
  evoaiId: string,
  instanceName: string,
): Promise<IEvoAISession[]> => { // Ajuste o tipo de retorno se a API retornar algo diferente
  const response = await evolutionApi.get(`/evoai/fetchSessions/${evoaiId}/${instanceName}`);
  return response.data; // Assumindo que retorna um array de sessões
};

