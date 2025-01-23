// src/interface/index.ts
export interface Plan {
	name: string;
	price: {
		monthly: number;
		annual: number;
	};
	features: string[];
	icon: React.ReactNode;
	bgGradient: string;
	recommended: boolean;
	priceId: {
		monthly: string;
		annual: string;
	};
}

export interface LeadStatsCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	trend?: number | null;
}

export interface EmptyStateProps {
  searchTerm: string;
  onNewCampaign: () => void;
  onImportLeads: () => void;
}
export interface SegmentationRule {
	field: string;
	operator: string;
	value: string;
}

export interface SegmentationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSegment: (rules: SegmentationRule[]) => Promise<void>;
}

export interface ImportLeadsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (campaignId: string, file: File) => Promise<void>;
}
export interface Lead {
	id: string;
	name: string | null;
	phone: string;
	email?: string | null;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface LeadsResponse {
	leads: Lead[];
	totalLeads: number;
	activeLeads: number;
	conversionRate: number;
}

export interface UserPlan {
	maxLeads: number;
	maxCampaigns: number;
	features: string[];
	name: string;
	price: number;
}

export interface LeadTableProps {
	leads: Lead[];
	currentPage: number;
	pageCount: number;
	onPageChange: (page: number) => void;
}

export interface ScheduledCampaign extends Campaign {
	scheduledDate: string;
	message?: string;
	mediaType?: string;
	id: string;
	name: string;
	status:
		| "draft"
		| "scheduled"
		| "running"
		| "paused"
		| "completed"
		| "failed"
		| "pending";
	totalLeads: number;
	mediaUrl?: string;
	mediaCaption?: string;
	instance?: string;
	statistics: CampaignStatistics;
}

export interface HistoricoProps {
	campaigns: ScheduledCampaign[];
}

export interface Dispatch {
	id: string;
	campaignId: string;
	campaignName: string;
	campaignDescription: string | null;
	instanceName: string;
	instanceStatus: string;
	status: string;
	startedAt: string;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	error?: string;
}

export interface StatsCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
}

export interface LoadingStateProps {
	className?: string;
	itemCount?: number;
}

export interface CampaignStatistics {
	totalLeads: number;
	sentCount: number;
	deliveredCount: number;
	readCount: number;
	failedCount: number;
	startedAt?: string;
	completedAt?: string;
}

export interface Campaign {
	id: string;
	name: string;
	description?: string;
	status:
		| "draft"
		| "scheduled"
		| "running"
		| "paused"
		| "completed"
		| "failed"
		| "pending";
	scheduledDate?: string;
	type: string;
	scheduledStatus?: string;
	startedAt?: Date;
	completedAt?: Date;
	pausedAt?: Date;
	progress: number;
	minDelay: number;
	maxDelay: number;
	userId: string;
	instanceName: string;
	createdAt: Date;
	updatedAt: Date;
	statistics?: CampaignStatistics;
}

export interface CampaignLeads {
	total: number;
	sent: number;
	delivered: number;
	read: number;
	failed: number;
}

export interface CampaignStatistics {
	totalLeads: number;
	sentCount: number;
	deliveredCount: number;
	readCount: number;
	failedCount: number;
}

export interface CampaignsResponse {
	campaigns: Campaign[];
	total: number;
	page: number;
	limit: number;
}

expoert export interface Instance {
	id: string;
	instanceName: string;
	connectionStatus: string;
	profilePicUrl?: string;
	profileName?: string;
	phoneNumber?: string;
	typebot?: {
		enabled: boolean;
		url: string;
		typebot: string;
		description?: string;
	};
}

export interface StatsCardProps {
	title: string;
	value: number | string;
	icon: React.ReactNode;
	trend?: number;
	trendLabel?: string;
}

export interface CampaignCardProps {
	campaign: Campaign & { leads: CampaignLeads };
	onAction: (action: "start" | "pause" | "stop", id: string) => void;
	onEdit: () => void;
	onDelete: () => void;
	isLoading: boolean;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	profile: string;
	plan: string;
	companyId?: string;
}

export interface LoginResponse {
	user: User;
	token: string;
	planStatus?: {
		plan: string;
		isTrialExpired: boolean;
		hasActiveSubscription: boolean;
		status: "active" | "expired" | "trial";
	};
}
