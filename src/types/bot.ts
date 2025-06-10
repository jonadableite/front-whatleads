// src/types/bot.ts

export interface Bot {
  id: string;
  enabled: boolean;
  description: string;
  agentUrl: string;
  apiKey: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids: string[];
  splitMessages: boolean;
  timePerChar: number;
  triggerType: "all" | "keyword" | "advanced" | "none";
  triggerOperator: "contains" | "equals" | "regex" | "startsWith" | "endsWith";
  triggerValue: string;
  createdAt: string;  // ISO Date string
  updatedAt: string;  // ISO Date string
  instanceId: string;
}

export interface CreateBotPayload {
  id: string;
  enabled: boolean;
  description: string;
  agentUrl: string;
  apiKey: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids: string[];
  splitMessages: boolean;
  timePerChar: number;
	triggerType: "all" | "keyword" | "advanced" | "none";
  triggerOperator: "contains" | "equals" | "regex" | "startsWith" | "endsWith";
  triggerValue: string;
  createdAt?: string;
  updatedAt?: string;
  instanceId?: string;
}

export interface UpdateBotPayload {
  description?: string;
  agentUrl?: string;
  enabled?: boolean;
  triggerType?: "all" | "keyword" | "advanced" | "none";
  triggerOperator?: "contains" | "equals" | "regex" | "startsWith" | "endsWith";
  triggerValue?: string;
}

export interface DeleteBotPayload {
  bot: {
    id: string;
  };
}

export interface Settings {
  delayMessage: number;
  keywordFinish: string;
  unknownMessage: string;
  expire: number;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids: string[];
  splitMessages: boolean;
  timePerChar: number;
  evoaiIdFallback?: string | null;
  fallback?: string | null;
}

export interface ChangeStatusPayload {
  status: "paused" | "active" | string;
  remoteJid: string;
}

// Resposta das rotas:

export type GetBotsResponse = Bot[];

export type CreateBotResponse = Bot;

export type UpdateBotResponse = Bot;

export interface ChangeStatusResponse {
  bot: {
    instanceName: string;
    bot: {
      remoteJid: string;
      status: string;
      session: {
        count: number;
      };
    };
  };
}


