import { authService } from "@/services/auth.service";
// src/components/layout/PublicLayout.tsx
import { Navigate, Outlet } from "react-router-dom";

export function PublicLayout() {
	const isAuthenticated = authService.isAuthenticated();

	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}
