// src/components/layout/ProtectedLayout.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "@/services/auth.service";

export function ProtectedLayout() {
	const location = useLocation();
	const isAuthenticated = authService.isAuthenticated();

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
}
