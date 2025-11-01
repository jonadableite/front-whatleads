import path from "path";
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [react()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		define: {
			"import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
			"import.meta.env.VITE_EVOLUTION_API_KEY": JSON.stringify(
				env.VITE_EVOLUTION_API_KEY,
			),
		},
		server: {
			headers: {
				// Allow backend API and dev tooling during development
				"Content-Security-Policy": `font-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://js.stripe.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' ${env.VITE_API_URL || "http://localhost:9000"} https://api.stripe.com ws: wss: ${env.VITE_EVOLUTION_API_URL || "https://evo.whatlead.com.br"};`
			}
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ['react', 'react-dom'],
						stripe: ['@stripe/stripe-js']
					}
				}
			}
		}
	};
});
