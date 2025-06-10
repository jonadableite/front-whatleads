// src/types/instance.ts
import type { Settings } from "./bot";

// Resposta de configurações de instância
export type ISettingsResponse = Settings;

// Estado de conexão de uma instância
export interface IConnectionStateResponse {
  state: string;               // ex: "connected" | "disconnected" | "connecting"
  connected: boolean;          // indica se está conectado
  qr?: string;                 // código QR em base64, se aplicável
  lastSeen?: string;           // timestamp ISO da última conexão
}

// Lista de instâncias do usuário
export type InstancesResponse = Array<{
  id: string;
  instanceName: string;
  token: string;
  number?: string;
  integration: string;
  createdAt: string;          // ISO Date string
  updatedAt: string;          // ISO Date string
}>;

// Resposta ao iniciar conexão de instância (QR Code ou Pairing Code)
export interface IConnectResponse {
  qrcode?: string;            // QR Code em base64
  pairingCode?: string;       // código de pareamento
  sessionId?: string;         // id da sessão, se retornado
}

// Payload para criação de instância via backend
export interface ICreateInstancePayload {
  instanceName: string;
  token?: string;
  number?: string;
  qrcode?: boolean;
  integration?: "WHATSAPP-BAILEYS" | "WHATSAPP-BUSINESS" | "EVOLUTION";
  settings?: Partial<{
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
    syncFullHistory: boolean;
  }>;
  proxy?: Partial<{
    proxyHost: string;
    proxyPort: number;
    proxyProtocol: string;
    proxyUsername: string;
    proxyPassword: string;
  }>;
  webhook?: {
    url: string;
    byEvents?: boolean;
    base64?: boolean;
    headers?: Record<string, string>;
    events?: string[];
  };
  rabbitmq?: {
    enabled: boolean;
    events: string[];
  };
  sqs?: {
    enabled: boolean;
    events: string[];
  };
  chatwootAccountId?: string;
  chatwootToken?: string;
  chatwootUrl?: string;
  chatwootSignMsg?: boolean;
  chatwootReopenConversation?: boolean;
  chatwootConversationPending?: boolean;
  chatwootImportContacts?: boolean;
  chatwootNameInbox?: string;
  chatwootMergeBrazilContacts?: boolean;
  chatwootImportMessages?: boolean;
  chatwootDaysLimitImportMessages?: number;
  chatwootOrganization?: string;
  chatwootLogo?: string;
}

// Resposta do backend ao criar instância
export interface CreateInstanceBackendResponse {
  id: string;
  instanceName: string;
  token: string;
  number?: string;
  integration: string;
  createdAt: string;          // ISO Date string
  updatedAt: string;          // ISO Date string
}
