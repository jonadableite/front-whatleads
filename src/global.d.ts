// src/global.d.ts
declare module "@/interface" {
	export interface ProgressModalProps {
		isOpen: boolean;
		onClose: () => void;
		campaignId?: string;
		onPause?: () => Promise<void>;
		onResume?: () => Promise<void>;
		onCancel?: () => Promise<void>;
	}

	export interface ImportLeadsModalProps {
		isOpen: boolean;
		onClose: () => void;
		onImport: (campaignId: string, file: File) => Promise<void>;
		campaigns: any[];
		disableImport?: boolean;
		totalLeads?: number;
		maxLeads?: number;
	}
}

// Adicionar declarações para módulos faltantes
declare module "cmdk";

// Declarações de tipo para eventos
interface CustomMouseEvent extends MouseEvent {
	dataTransfer?: DataTransfer;
}
