// src/types/warmup.ts

export interface WarmupInstance {
  id: string;
  instanceName: string;
  connectionStatus: "OPEN" | "CONNECTING" | "DISCONNECTED";
  ownerJid: string | null;
  profileName: string | null;
}

export interface MediaContent {
  type: "image" | "video" | "audio" | "sticker";
  base64: string;
  fileName: string;
  mimetype: string;
  caption?: string;
  preview?: string;
}

export interface WarmupConfig {
  phoneInstances: Array<{
    phoneNumber: string;
    instanceId: string;
    ownerJid?: string;
  }>;
  contents: {
    texts: string[];
    images: MediaContent[];
    audios: MediaContent[];
    videos: MediaContent[];
    stickers: MediaContent[];
    emojis: string[];
  };
  config: {
    textChance: number;
    audioChance: number;
    reactionChance: number;
    stickerChance: number;
    imageChance: number;
    videoChance: number;
    minDelay: number;
    maxDelay: number;
    messageLimit?: number;
  };
}

export interface WarmupStatus {
  success: boolean;
  instances: {
    [key: string]: {
      status: "active" | "paused" | "stopped";
      dailyTotal?: number;
      lastActive?: string;
    };
  };
  globalStatus: "active" | "inactive" | "paused";
}

export interface WarmupResponse {
  success: boolean;
  message?: string;
}
