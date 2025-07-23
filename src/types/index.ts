// src/types/index.ts
export interface IUser {
  id: string;
  name: string;
  email: string;
  profile: string;
  plan?: string;
  companyId?: string;
}

export interface WarmupStatus {
  progress: number;
  isRecommended: boolean;
  warmupHours: number;
  status: string;
  lastUpdate: Date | null;
}

export interface Instancia {
  id: string;
  instanceName: string;
  connectionStatus: string;
  ownerJid: string;
  profileName: string;
  profilePicUrl?: string;
  integration: string;
  number: string | null;
  warmupStatus?: {
    progress: number;
    status: string;
    isRecommended: boolean;
    warmupHours: number;
    lastUpdate: string | null;
  };
  warmupStats?: Array<{
    warmupTime: number;
    status: string;
    createdAt: string;
  }>;
}

export interface InstancesResponse {
  instances: Instancia[];
  currentPlan: string;
  instanceLimit: number;
  remainingSlots: number;
  stats: {
    total: number;
    recommended: number;
    averageProgress: number;
  };
}

export interface Empresa {
  id: string;
  name: string;
  acelera_parceiro_configs: {
    id: string;
    name: string;
    campaign_number_business?: string;
  }[];
}

export interface MainApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// ✅ Interface corrigida e otimizada para payload de campanha
export interface StartCampaignPayload {
  instanceName: string;
  message: string;
  media?: MediaPayload | null;
  minDelay: number;
  maxDelay: number;
  segmentation?: {
    segment: string;
  };
}

// ✅ Interface de mídia mais específica e tipada
export interface MediaPayload {
  type: 'image' | 'video' | 'audio';
  base64: string;
  fileName?: string;
  mimetype?: string;
  caption?: string;
}

// ✅ Interface para diferentes tipos de mídia (opcional, para uso específico)
export type SpecificMediaPayload =
  | {
      type: 'image';
      base64: string;
      fileName?: string;
      mimetype?: string;
      caption?: string;
    }
  | {
      type: 'audio';
      base64: string;
      fileName?: string;
      mimetype?: string;
      caption?: string;
    }
  | {
      type: 'video';
      base64: string;
      fileName?: string;
      mimetype?: string;
      caption?: string;
    };

// ✅ Interface para agendamento de campanhas
export interface ScheduleCampaignPayload {
  campaignId: string;
  scheduledDate: string; // ISO string
  instanceName: string;
  message?: string;
  mediaPayload?: MediaPayload | null;
  minDelay?: number;
  maxDelay?: number;
}

// ✅ Interface para resposta de campanha
export interface CampaignResponse {
  success: boolean;
  message: string;
  data?: {
    campaignId: string;
    dispatchId?: string;
    scheduleId?: string;
  };
  error?: string;
}

// ✅ Interface para estatísticas de campanha
export interface CampaignStatistics {
  totalLeads: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
}

// ✅ Interface para progresso de campanha
export interface CampaignProgress {
  status: 'preparing' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  statistics: CampaignStatistics;
}

export interface WarmerApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// ✅ Tipos para status de campanha
export type CampaignStatus =
  | 'draft'
  | 'preparing'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'scheduled';

// ✅ Tipos para segmentação
export type SegmentationType =
  | 'ALTAMENTE_ENGAJADO'
  | 'MODERADAMENTE_ENGAJADO'
  | 'LEVEMENTE_ENGAJADO'
  | 'BAIXO_ENGAJAMENTO';

// ✅ Interface para leads
export interface Lead {
  id: string;
  name: string | null;
  phone: string;
  email?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Interface para campanha
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  type: string;
  instance?: string;
  connectionStatus?: string;
  progress: number;
  statistics: CampaignStatistics | null;
  createdAt?: string;
  updatedAt?: string;
  scheduledDate?: string | null;
  message?: string;
  mediaType?: string;
  mediaUrl?: string;
  mediaCaption?: string;
}
