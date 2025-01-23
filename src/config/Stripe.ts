// src/config/Stripe.ts

export const STRIPE_CONFIG = {
	PRICES: {
		BASIC: {
			MONTHLY: import.meta.env.VITE_STRIPE_PRICE_BASIC || "",
			ANNUAL: import.meta.env.VITE_STRIPE_PRICE_BASIC_ANO || "",
		},
		PRO: {
			MONTHLY: import.meta.env.VITE_STRIPE_PRICE_PRO || "",
			ANNUAL: import.meta.env.VITE_STRIPE_PRICE_PRO_ANO || "",
		},
		ENTERPRISE: {
			MONTHLY: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || "",
			ANNUAL: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_ANO || "",
		},
	},
	PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
	API_URL: import.meta.env.VITE_API_URL || "",
};

// Validação das variáveis de ambiente
Object.entries(STRIPE_CONFIG.PRICES).forEach(([plan, prices]) => {
	Object.entries(prices).forEach(([cycle, price]) => {
		if (!price) {
			console.warn(`Missing Stripe price for ${plan} ${cycle}`);
		}
	});
});

export default STRIPE_CONFIG;
