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
	};
});
