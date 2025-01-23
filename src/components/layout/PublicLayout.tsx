import { authService } from "@/services/auth.service";
// src/components/layout/PublicLayout.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function PublicLayout() {
	const location = useLocation();
	const isAuthenticated = authService.isAuthenticated();

	if (isAuthenticated) {
		return <Navigate to="/" state={{ from: location }} replace />;
	}

	return <Outlet />;
}
