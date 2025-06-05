// services/instanceService.ts
import axios from "axios";

// Criar um cliente axios específico para o backend integrador
const integratorApi = axios.create({
	baseURL:
		process.env.NEXT_PUBLIC_BACKEND_INTEGRATOR_URL || "http://localhost:3001",
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor para incluir o token de autenticação
integratorApi.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("integrator_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

// Tipagem para instância vinculada
export interface LinkedInstance {
	id: string;
	name: string;
	evolutionApiId: string;
	instanceId: string;
	userId: string;
	integration: string;
	status: string;
	connectionStatus?: string;
	apiKey: string;
	profileName?: string;
	profilePictureUrl?: string;
	profilePicUrl?: string;
	ownerJid?: string;
	createdAt: Date;
	updatedAt: Date;
	lastSeen?: Date;
	_count?: {
		Message?: number;
		Contact?: number;
		Chat?: number;
	};
}

// Tipagem para criação de instância
export interface CreateInstanceRequest {
	instanceName: string;
	integration?: string;
	qrcode?: boolean;
	token?: string;
	number?: string;
}

// Tipagem para resposta com QR Code
export interface QRCodeResponse {
	qrcode?: string;
	base64?: string;
	code?: string;
	pairingCode?: string | null;
	instance?: string;
}

// Tipagem para resposta de criação de instância
export interface CreateInstanceResponse extends LinkedInstance {
	qrcode?: string;
	base64?: string;
	evolutionData?: any;
}

// ==== INSTÂNCIAS VINCULADAS AO USUÁRIO ====

// Listar instâncias do usuário logado
export const getUserInstances = async (): Promise<LinkedInstance[]> => {
	const response = await integratorApi.get("/api/evolution/instances");

	return response.data.map((instance: any) => ({
		...instance,
		instanceId: instance.evolutionApiId || instance.instanceId,
		instanceName: instance.name,
		profilePictureUrl: instance.profilePicUrl || instance.profilePictureUrl,
	}));
};

// Criar nova instância vinculada ao usuário
export const createUserInstance = async (
	data: CreateInstanceRequest,
): Promise<CreateInstanceResponse> => {
	const response = await integratorApi.post("/api/evoapi/create", data);

	return {
		...response.data,
		instanceId: response.data.evolutionApiId,
		instanceName: response.data.name,
	};
};

// Deletar instância do usuário
export const deleteUserInstance = async (linkageId: string): Promise<void> => {
	await integratorApi.delete(`/api/evoapi/${linkageId}`);
};

// ==== OPERAÇÕES DE INSTÂNCIA DA EVOLUTION API ====

// Conectar instância (gerar QR code)
export const connectInstance = async (
	instanceName: string,
	number?: string,
): Promise<QRCodeResponse> => {
	const params = number ? { number } : {};
	const response = await integratorApi.get(
		`/api/evolution/connect/${instanceName}`,
		{
			params,
		},
	);
	return response.data;
};

// Reiniciar instância
export const restartInstance = async (instanceName: string) => {
	const response = await integratorApi.post(
		`/api/evolution/restart/${instanceName}`,
	);
	return response.data;
};

// Definir presença
export const setPresence = async (
	instanceName: string,
	presence: "available" | "unavailable",
) => {
	const response = await integratorApi.post(
		`/api/evolution/setPresence/${instanceName}`,
		{
			presence,
		},
	);
	return response.data;
};

// Obter status de conexão
export const getConnectionState = async (instanceName: string) => {
	try {
		console.log(`🔍 Getting connection state for: ${instanceName}`);

		const response = await integratorApi.get(
			`/api/evolution/connectionState/${instanceName}`,
		);

		console.log(`📊 Connection state response:`, response.data);

		// ✅ CORRIGIDO: Processar resposta corretamente
		const data = response.data;

		// Verificar diferentes formatos de resposta
		let state = "unknown";
		if (data?.state) {
			state = data.state;
		} else if (data?.instance?.state) {
			state = data.instance.state;
		} else if (data?.connectionStatus) {
			state = data.connectionStatus;
		} else if (typeof data === "string") {
			state = data;
		}

		return state; // ✅ Retornar apenas o estado
	} catch (error: any) {
		console.error(
			`❌ Error getting connection state for ${instanceName}:`,
			error,
		);
		return "error";
	}
};

// Logout da instância
export const logoutInstance = async (instanceName: string) => {
	const response = await integratorApi.delete(
		`/api/evolution/logout/${instanceName}`,
	);
	return response.data;
};

// Buscar detalhes de uma instância específica
export const fetchInstanceDetails = async (instanceName: string) => {
	const response = await integratorApi.get(
		`/api/evolution/fetch/${instanceName}`,
	);
	return response.data;
};

export const calculateWarmupProgress = (instance: Instancia) => {
  // Se não tiver warmupStats, retorna 0
  if (!instance.warmupStats || instance.warmupStats.length === 0) {
    return 0;
  }

  // Parâmetros de configuração de warmup
  const TOTAL_WARMUP_HOURS = 1728; // 72 dias
  const TOTAL_WARMUP_MILLISECONDS = TOTAL_WARMUP_HOURS * 60 * 60 * 1000;

  // Ordenar os warmupStats por data para garantir o último
  const sortedWarmupStats = [...instance.warmupStats].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const latestWarmupStat = sortedWarmupStats[0];
  const startWarmupTime = new Date(latestWarmupStat.createdAt).getTime();
  const currentTime = Date.now();

  // Calcular tempo decorrido
  const elapsedTime = currentTime - startWarmupTime;

  // Calcular progresso percentual
  const progress = Math.min(
    100,
    Math.max(0, (elapsedTime / TOTAL_WARMUP_MILLISECONDS) * 100)
  );

  console.log(`Warmup Progress for ${instance.instanceName}:`, {
    progress: `${progress.toFixed(2)}%`,
    elapsedTime: `${(elapsedTime / (60 * 60 * 1000)).toFixed(2)} horas`,
  });

  return progress;
};


export default integratorApi;
