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

export interface WarmerApiResponse<T> {
	data: T;
	success: boolean;
	error?: string;
}
