import { apiInternal } from './api';

export interface ChatSession {
  id: string;
  app_name: string;
  user_id: string;
  state: Record<string, any>;
  events: any[];
  last_update_time: number;
  update_time: string;
  create_time: string;
  created_at: string;
  agent_id: string;
  client_id: string;
}

export interface ChatPart {
  text?: string;
  functionCall?: any;
  function_call?: any;
  functionResponse?: any;
  function_response?: any;
  inline_data?: {
    data: string;
    mime_type: string;
    metadata?: {
      filename?: string;
      [key: string]: any;
    };
    fileId?: string;
  };
  videoMetadata?: any;
  thought?: any;
  codeExecutionResult?: any;
  executableCode?: any;
  file_data?: {
    filename?: string;
    fileId?: string;
    [key: string]: any;
  };
}

export interface AttachedFile {
  filename: string;
  content_type: string;
  data?: string;
  size?: number;
}

export interface InlineData {
  type: string;
  data: string;
}

export interface ChatMessage {
  id: string;
  content: {
    parts: ChatPart[];
    role: string;
    inlineData?: InlineData[];
    files?: AttachedFile[];
  };
  author: string;
  timestamp: number;
  [key: string]: any;
}

export const generateExternalId = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    '0',
  )}${String(now.getDate()).padStart(2, '0')}_${String(
    now.getHours(),
  ).padStart(2, '0')}${String(now.getMinutes()).padStart(
    2,
    '0',
  )}${String(now.getSeconds()).padStart(2, '0')}`;
};

export const listSessions = (clientId: string) =>
  apiInternal.get<ChatSession[]>(`/api/v1/sessions/client/${clientId}`);

export const getSessionMessages = (sessionId: string) =>
  apiInternal.get<ChatMessage[]>(`/api/v1/sessions/${sessionId}/messages`);

export const createSession = (clientId: string, agentId: string) => {
  const externalId = generateExternalId();
  const sessionId = `${externalId}_${agentId}`;
  return apiInternal.post<ChatSession>(`/api/v1/sessions/`, {
    id: sessionId,
    client_id: clientId,
    agent_id: agentId,
  });
};

export const deleteSession = (sessionId: string) => {
  return apiInternal.delete<ChatSession>(`/api/v1/sessions/${sessionId}`);
};

export const sendMessage = (
  sessionId: string,
  agentId: string,
  message: string,
) => {
  const externalId = sessionId.split('_')[0];
  return api.post<ChatMessage>(`/api/v1/chat`, {
    agent_id: agentId,
    external_id: externalId,
    message: message,
  });
};
