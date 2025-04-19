import { authService } from "@/services/auth.service";
// src/hooks/useProtectedRoute.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useProtectedRoute = () => {
	const navigate = useNavigate();
	const isAuthenticated = authService.isAuthenticated();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
		}
	}, [isAuthenticated, navigate]);

	return isAuthenticated;
};
