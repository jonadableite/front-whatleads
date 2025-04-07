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
	ownerJid: string | null;
	profileName: string | null;
	profilePicUrl: string | null;
	number: string | null;
	integration: string;
	typebot: any;
	warmupStatus: WarmupStatus;
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

export interface StartCampaignPayload {
	instanceName: string;
	message: string;
	media: any;
	minDelay: number;
	maxDelay: number;
	segmentation?: { segment: string }; // Optional segmentation property
}

export type MediaPayload =
	| { type: "image"; base64: string; fileName: string; mimetype: string }
	| { type: "audio"; base64: string; fileName: string; mimetype: string }
	| { type: "video"; base64: string; fileName: string; mimetype: string };

export interface StartCampaignPayload {
	instanceName: string;
	message: string;
	media: MediaPayload; // Updated to use MediaPayload type
	minDelay: number;
	maxDelay: number;
	segmentation?: { segment: string }; // Optional segmentation property
}

export interface WarmerApiResponse<T> {
	data: T;
	success: boolean;
	error?: string;
}
