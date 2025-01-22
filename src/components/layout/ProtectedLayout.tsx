import { authService } from "@/services/auth.service";
// src/components/layout/ProtectedLayout.tsx
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedLayout() {
	const isAuthenticated = authService.isAuthenticated();

	// Se o usuário não está autenticado, redireciona para o login
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// Renderiza as rotas protegidas
	return <Outlet />;
}
