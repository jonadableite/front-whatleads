// src/lib/stripe-client.ts
import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
	throw new Error("Stripe publishable key is not defined");
}

export const stripePromise = loadStripe(stripePublishableKey, {
	betas: ["elements_enable_deferred_intent_beta_1"],
});
