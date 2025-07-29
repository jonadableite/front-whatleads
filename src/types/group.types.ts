// src/types/group.types.ts

export interface Grupo {
  id: string;
  subject: string;
  desc?: string;
  subjectOwner?: string;
  size: number;
  participants?: Participant[];
  pictureUrl?: string;
  creation?: number;
  ephemeralDuration?: number;
  announce?: boolean;
  restrict?: boolean;
  inviteCode?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export interface Participant {
  id: string;
  admin?: 'admin' | 'superadmin' | null;
  name?: string;
  notify?: string;
}

export interface GroupSettings {
  announce?: boolean;
  restrict?: boolean;
  ephemeralDuration?: number;
}

export interface CreateGroupRequest {
  subject: string;
  description?: string;
  participants: string[];
}

export interface UpdateParticipantRequest {
  groupJid: string;
  action: 'add' | 'remove' | 'promote' | 'demote';
  participants: string[];
}

export interface UpdateGroupPictureRequest {
  groupJid: string;
  image: string;
}

export interface UpdateGroupSubjectRequest {
  groupJid: string;
  subject: string;
}

export interface UpdateGroupDescriptionRequest {
  groupJid: string;
  description: string;
}

export interface UpdateGroupSettingRequest {
  groupJid: string;
  action: 'announcement' | 'not_announcement' | 'locked' | 'unlocked';
}

export interface ToggleEphemeralRequest {
  groupJid: string;
  expiration: 0 | 86400 | 604800 | 7776000;
}

export interface SendInviteRequest {
  groupJid: string;
  description: string;
  numbers: string[];
}

export interface GroupApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface GroupStatistics {
  totalGroups: number;
  adminGroups: number;
  memberGroups: number;
  totalParticipants: number;
}

export interface GroupInviteInfo {
  groupJid: string;
  groupName: string;
  groupDescription?: string;
  inviteCode: string;
  createdAt: string;
  expiresAt?: string;
}
