import { authService } from "@/services/auth.service";
import { useEffect, useState } from "react";
// src/components/layout/ProtectedLayout.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function ProtectedLayout() {
	const location = useLocation();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkAuthentication = async () => {
			try {
				// Método de inicialização que você já tem no authService
				const authResult = await authService.initialize();
				setIsAuthenticated(authResult);
			} catch (error) {
				setIsAuthenticated(false);
				console.error("Erro na verificação de autenticação:", error);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuthentication();
	}, []);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
}
