// src/types/chat.ts
export interface Chat {
  id: string;
  contactName: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  remoteJid: string;
  profilePicUrl?: string;
}
