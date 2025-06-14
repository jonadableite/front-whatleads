// services/agentService.ts

import { escapePromptBraces, sanitizeAgentName } from "@/lib/utils";
import type { Agent, AgentCreate } from "../types/agent";
// Importa as duas instâncias nomeadas do Axios
import { apiEvoAi } from "./api";

const processAgentData = (
  data: AgentCreate | Partial<AgentCreate>,
): AgentCreate | Partial<AgentCreate> => {
  const updatedData = { ...data };
  if (updatedData.instruction) {
    updatedData.instruction = escapePromptBraces(updatedData.instruction);
  }
  if (updatedData.name) {
    updatedData.name = sanitizeAgentName(updatedData.name);
  }
  return updatedData;
};

// Funções para Agentes
export const createAgent = (data: AgentCreate) =>
  // Usa apiEvoAi para criar agente no backend da Evo AI
  apiEvoAi.post<Agent>("/api/v1/agents/", processAgentData(data));

export const listAgents = (
  clientId: string,
  skip = 0,
  limit = 100,
  folderId?: string,
) => {
  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (folderId) {
    queryParams.append("folder_id", folderId);
  }
  // Usa apiEvoAi para listar agentes no backend da Evo AI
  return apiEvoAi.get<Agent[]>(`/api/v1/agents/?${queryParams.toString()}`, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });
};

export const getAgent = (agentId: string, clientId: string) =>
  // Usa apiEvoAi para obter agente específico no backend da Evo AI
  apiEvoAi.get<Agent>(`/api/v1/agents/${agentId}`, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

export const getSharedAgent = (agentId: string) =>
  // Usa apiInternal para obter agente compartilhado (assumindo que esta rota está no seu backend principal)
apiEvoAi.get<Agent>(`/api/v1/agents/${agentId}/shared`); // O interceptor de apiInternal cuidará do x-api-key se aplicável

export const updateAgent = (agentId: string, data: Partial<AgentCreate>) =>
  // Usa apiEvoAi para atualizar agente no backend da Evo AI
  apiEvoAi.put<Agent>(`/api/v1/agents/${agentId}`, processAgentData(data));

export const deleteAgent = (agentId: string) =>
  // Usa apiEvoAi para deletar agente no backend da Evo AI
  apiEvoAi.delete(`/api/v1/agents/${agentId}`);

// New functions for the folder system
export interface Folder {
  id: string;
  name: string;
  description: string;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export interface FolderCreate {
  name: string;
  description: string;
  client_id: string;
}

export interface FolderUpdate {
  name?: string;
  description?: string;
}

export const createFolder = (data: FolderCreate) =>
  // Usa apiEvoAi para criar pasta no backend da Evo AI
  apiEvoAi.post<Folder>("/api/v1/agents/folders", data);

export const listFolders = (clientId: string, skip = 0, limit = 100) =>
  // Usa apiEvoAi para listar pastas no backend da Evo AI
  apiEvoAi.get<Folder[]>(`/api/v1/agents/folders?skip=${skip}&limit=${limit}`, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

export const getFolder = (folderId: string, clientId: string) =>
  // Usa apiEvoAi para obter pasta específica no backend da Evo AI
  apiEvoAi.get<Folder>(`/api/v1/agents/folders/${folderId}`, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

export const updateFolder = (
  folderId: string,
  data: FolderUpdate,
  clientId: string,
) =>
  // Usa apiEvoAi para atualizar pasta no backend da Evo AI
  apiEvoAi.put<Folder>(`/api/v1/agents/folders/${folderId}`, data, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

export const deleteFolder = (folderId: string, clientId: string) =>
  // Usa apiEvoAi para deletar pasta no backend da Evo AI
  apiEvoAi.delete(`/api/v1/agents/folders/${folderId}`, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

export const listAgentsInFolder = (
  folderId: string,
  clientId: string,
  skip = 0,
  limit = 100,
) =>
  // Usa apiEvoAi para listar agentes em pasta no backend da Evo AI
  apiEvoAi.get<Agent[]>(
    `/api/v1/agents/folders/${folderId}/agents?skip=${skip}&limit=${limit}`,
    {
      headers: { "x-client-id": clientId }, // Mantém o header x-client-id
    },
  );

export const assignAgentToFolder = (
  agentId: string,
  folderId: string | null,
  clientId: string,
) => {
  const url = folderId
    ? `/api/v1/agents/${agentId}/folder?folder_id=${folderId}`
    : `/api/v1/agents/${agentId}/folder`;
  // Usa apiEvoAi para atribuir agente a pasta no backend da Evo AI
  return apiEvoAi.put<Agent>(
    url,
    {}, // PUT requests often require a body, even if empty
    {
      headers: { "x-client-id": clientId }, // Mantém o header x-client-id
    },
  );
};

export const shareAgent = (agentId: string, clientId: string) =>
  // Usa apiEvoAi para compartilhar agente no backend da Evo AI
  apiEvoAi.post<{ api_key: string }>(
    `/api/v1/agents/${agentId}/share`,
    {}, // POST requests often require a body, even if empty
    {
      headers: { "x-client-id": clientId }, // Mantém o header x-client-id
    },
  );

// API Key Interfaces and Services
export interface ApiKey {
  id: string;
  name: string;
  provider: string;
  client_id: string; // This remains as it's part of the returned object structure
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Interface for the request body when creating a key
export interface ApiKeyCreateBody {
  name: string;
  provider: string;
  key_value: string;
  // client_id is removed from the body interface
}

// Modified createApiKey function to send client_id in headers
export const createApiKey = (data: ApiKeyCreateBody, clientId: string) =>
  // Uses apiEvoAi to create API Key in the Evo AI backend
  apiEvoAi.post<ApiKey>("/api/v1/agents/apikeys", data, {
    headers: { "x-client-id": clientId }, // Send client_id in headers
  });


export const listApiKeys = (clientId: string, skip = 0, limit = 100) =>
  // Usa apiEvoAi para listar API Keys no backend da Evo AI
  apiEvoAi.get<ApiKey[]>(`/api/v1/agents/apikeys?skip=${skip}&limit=${limit}`, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

export const getApiKey = (keyId: string, clientId: string) =>
  // Usa apiEvoAi para obter API Key específica no backend da Evo AI
  apiEvoAi.get<ApiKey>(`/api/v1/agents/apikeys/${keyId}`, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

export const updateApiKey = (
  keyId: string,
  data: ApiKeyUpdate,
  clientId: string,
) =>
  // Usa apiEvoAi para atualizar API Key no backend da Evo AI
  apiEvoAi.put<ApiKey>(`/api/v1/agents/apikeys/${keyId}`, data, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

export const deleteApiKey = (keyId: string, clientId: string) =>
  // Usa apiEvoAi para deletar API Key no backend da Evo AI
  apiEvoAi.delete(`/api/v1/agents/apikeys/${keyId}`, {
    headers: { "x-client-id": clientId }, // Mantém o header x-client-id
  });

// Import agent from JSON file
export const importAgentFromJson = (file: File, clientId: string, folderId?: string | null) => {
  const formData = new FormData();
  formData.append('file', file);
  // Add folder_id to formData if it exists
  if (folderId) {
    formData.append('folder_id', folderId);
  }
  // Usa apiEvoAi para importar agente no backend da Evo AI
  return apiEvoAi.post('/api/v1/agents/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-client-id': clientId // Mantém o header x-client-id
    }
  });
};
