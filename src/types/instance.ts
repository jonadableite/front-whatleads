// src/types/instance.ts
import type { Settings } from "./bot";


// Resposta de configurações de instância
export type ISettingsResponse = Settings;

// --- TRECHO ATUALIZADO ---

// Interface para o objeto aninhado 'instance' dentro da resposta de estado de conexão
interface IConnectionStateInstanceDetails {
  instanceName: string; // O nome da instância
  // O estado da conexão. É uma string, mas usar uma union type pode ser mais seguro
  // se você souber todos os possíveis valores que a API retorna (ex: "open", "close", "connecting", "qrcode", etc.)
  state: string; // Ou use: "open" | "connected" | "connecting" | "qrcode" | "close" | "disconnected" | "error";

  // As propriedades 'connected', 'qr', 'lastSeen' da sua interface original
  // provavelmente pertencem a este objeto 'instance' quando presentes.
  // Adicione-as aqui como opcionais se a API puder retorná-las dentro de 'instance'.
  connected?: boolean;
  qr?: string; // Código QR em base64, se aplicável (quando state é "qrcode")
  lastSeen?: string; // Timestamp ISO da última conexão, se aplicável
}

// Estado de conexão de uma instância (Interface para a resposta COMPLETA da API)
export interface IConnectionStateResponse {
  instance: IConnectionStateInstanceDetails; // A resposta contém um objeto 'instance' com os detalhes
  // Se a API retornar outras propriedades no nível raiz (fora do objeto 'instance'), adicione-as aqui.
}

// --- FIM DO TRECHO ATUALIZADO ---


// Lista de instâncias do usuário
export interface Instance {
  name: any; // Considerar tipar melhor se possível (string?)
  id: string;
  instanceName: string;
  connectionStatus: string; // Mantenha este, parece ser o status simplificado usado na lista
  ownerJid: string;
  profileName: string;
  profilePicUrl: string | null;
  number: string | null;
  integration: string;
  typebot?: any | null; // Considerar tipar melhor
  warmupStats?: Array<{
    warmupTime: number;
    status: string;
    createdAt: string; // Use Date ou string dependendo de como você processa
  }>;
  warmupStatus?: {
    progress: number;
    isRecommended: boolean;
    warmupHours: number;
    status: string;
    lastUpdate: string | null; // Use Date | null ou string | null
  };
}

export interface PlanStatusApiResponse {
  instances: any;
  success: boolean;
  plan: {
    name: string;
    type: string;
    price: number;
    isInTrial: boolean;
    trialEndDate: string | null;
    subscriptionStatus: string | null;
    subscriptionId: string | null;
  };
  limits: {
    maxLeads: number;
    maxCampaigns: number;
    maxInstances: number;
    features: string[];
  };
  usage: {
    currentLeads: number;
    currentCampaigns: number;
    currentInstances: number;
    leadsPercentage: number;
    campaignsPercentage: number;
    instancesPercentage: number;
  };
}


export interface InstancesApiResponse {
  instances: Instance[];
  currentPlan: string;
  instanceLimit: number;
  remainingSlots: number;
  stats: {
    total: number;
    recommended: number;
    averageProgress: number;
  };
}


// Resposta ao iniciar conexão de instância (QR Code ou Pairing Code)
export interface IConnectResponse {
  pairingCode: string | null; // Pode ser a string do código de pareamento ou null
  code: string; // A string do código de pareamento (mesmo que pairingCode seja null, parece vir aqui também)
  base64: string; // Os dados da imagem do QR Code em base64 (inclui o prefixo data:image/...)
  count: number; // O número de vezes que o QR Code foi gerado/atualizado? (Baseado no JSON)
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
  qrcode: boolean;
  base64: boolean; // Indica se o QR code é base64?
  token?: string;
  number?: string;
  integration: string;
}
