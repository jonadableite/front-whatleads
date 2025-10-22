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
			"import.meta.env.VITE_PUBLIC_API_KEY": JSON.stringify(
				env.VITE_PUBLIC_API_KEY,
			),
		},
		server: {
			headers: {
				"Content-Security-Policy": "font-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://js.stripe.com; script-src 'self' 'unsafe-inline' https://js.stripe.com; connect-src 'self' https://api.stripe.com;"
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
