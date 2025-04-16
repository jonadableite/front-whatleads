export interface BotData {
	steps: {
		[key: string]: {
			mensagem?: string;
			respostas?: Record<string, any>;
			naoentendi?: string;
			inputLivre?: boolean;
			next?: string;
			mensagemFinal?: {
				[service: string]: {
					mensagem: string;
					setorId: string;
				};
			};
		};
	};
}
