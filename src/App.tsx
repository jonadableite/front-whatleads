// @ts-nocheck

// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserProvider } from "@/contexts/UserContext";
// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes } from "./routes";

// Criar uma instância do QueryClient
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false, // Geralmente bom para evitar refetching inesperado
			retry: false, // Desabilitar retries por padrão
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			{/* <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> */}
			<UserProvider>
				<SidebarProvider>
					<Routes />
					{/* O Toaster deve estar no nível mais alto para exibir notificações */}
					<Toaster />
				</SidebarProvider>
			</UserProvider>
			{/* </ThemeProvider> */}
		</QueryClientProvider>
	);
}

export default App;
