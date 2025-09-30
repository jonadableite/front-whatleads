// src/lib/stripe-client.ts
import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
	throw new Error("Stripe publishable key is not defined");
}

// Função para detectar se o Stripe foi bloqueado por adblocker
const detectStripeBlocked = async (): Promise<boolean> => {
	try {
		// Tenta fazer uma requisição simples para o domínio do Stripe
		const response = await fetch('https://js.stripe.com/v3/', { 
			method: 'HEAD',
			mode: 'no-cors'
		});
		return false;
	} catch (error) {
		console.warn('Stripe pode estar sendo bloqueado por adblocker:', error);
		return true;
	}
};

// Função para mostrar aviso sobre adblocker
const showAdblockerWarning = () => {
	const warningMessage = `
		⚠️ Detectamos que um adblocker pode estar interferindo com o processamento de pagamentos.
		
		Para garantir que seu pagamento seja processado corretamente:
		1. Desative temporariamente seu adblocker neste site
		2. Ou adicione este site à lista de exceções do seu adblocker
		3. Recarregue a página após fazer as alterações
		
		Isso é necessário para carregar os componentes seguros de pagamento do Stripe.
	`;
	
	// Cria um toast/notificação personalizada se não houver biblioteca de toast
	if (typeof window !== 'undefined') {
		// Verifica se já existe um aviso
		if (!document.getElementById('adblocker-warning')) {
			const warningDiv = document.createElement('div');
			warningDiv.id = 'adblocker-warning';
			warningDiv.style.cssText = `
				position: fixed;
				top: 20px;
				right: 20px;
				background: #ff6b6b;
				color: white;
				padding: 20px;
				border-radius: 8px;
				box-shadow: 0 4px 12px rgba(0,0,0,0.3);
				z-index: 10000;
				max-width: 400px;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
				font-size: 14px;
				line-height: 1.4;
			`;
			
			const closeButton = document.createElement('button');
			closeButton.innerHTML = '×';
			closeButton.style.cssText = `
				position: absolute;
				top: 5px;
				right: 10px;
				background: none;
				border: none;
				color: white;
				font-size: 20px;
				cursor: pointer;
				padding: 0;
				width: 20px;
				height: 20px;
			`;
			closeButton.onclick = () => warningDiv.remove();
			
			warningDiv.innerHTML = `
				<strong>🚫 Adblocker Detectado</strong><br><br>
				Para processar pagamentos com segurança:<br>
				• Desative o adblocker neste site<br>
				• Ou adicione à lista de exceções<br>
				• Recarregue a página<br><br>
				<small>Necessário para componentes seguros do Stripe</small>
			`;
			warningDiv.appendChild(closeButton);
			
			document.body.appendChild(warningDiv);
			
			// Remove automaticamente após 10 segundos
			setTimeout(() => {
				if (document.getElementById('adblocker-warning')) {
					warningDiv.remove();
				}
			}, 10000);
		}
	}
};

// Carrega o Stripe com detecção de adblocker
export const stripePromise = (async () => {
	try {
		const stripe = await loadStripe(stripePublishableKey, {
			betas: ["elements_enable_deferred_intent_beta_1"],
		});
		
		if (!stripe) {
			// Se o Stripe não carregou, pode ser devido a adblocker
			const isBlocked = await detectStripeBlocked();
			if (isBlocked) {
				showAdblockerWarning();
			}
			throw new Error("Falha ao carregar o Stripe. Verifique se não há adblockers ativos.");
		}
		
		return stripe;
	} catch (error) {
		console.error("Erro ao carregar Stripe:", error);
		
		// Tenta detectar se é problema de adblocker
		const isBlocked = await detectStripeBlocked();
		if (isBlocked) {
			showAdblockerWarning();
		}
		
		throw error;
	}
})();

// Função utilitária para verificar se o Stripe está disponível
export const checkStripeAvailability = async (): Promise<boolean> => {
	try {
		const stripe = await stripePromise;
		return !!stripe;
	} catch (error) {
		console.error("Stripe não está disponível:", error);
		return false;
	}
};
