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
			refetchOnWindowFocus: false,
			retry: false,
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
					<Toaster />
				</SidebarProvider>
			</UserProvider>
			{/* </ThemeProvider> */}
		</QueryClientProvider>
	);
}

export default App;
