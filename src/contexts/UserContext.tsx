import type { User } from "@/interface";
import { getAuthenticatedUser } from "@/services/api";
import { authService } from "@/services/auth.service";
// src/contexts/UserContext.tsx
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// Definição do tipo do contexto do usuário
interface UserContextType {
	user: User | null;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	loading: boolean;
}

// Criação do contexto
const UserContext = createContext<UserContextType>({
	user: null,
	isAuthenticated: false,
	login: async () => {},
	logout: () => {},
	loading: true,
});

// Provedor do contexto do usuário
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	// Verificar autenticação inicial
	useEffect(() => {
		const checkAuthentication = async () => {
			try {
				const isAuth = authService.isAuthenticated();
				setIsAuthenticated(isAuth);

				if (isAuth) {
					// Buscar dados do usuário autenticado
					const userData = await getAuthenticatedUser();
					setUser(userData);
				}
			} catch (error) {
				console.error("Erro ao verificar autenticação:", error);
				setIsAuthenticated(false);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		checkAuthentication();
	}, []);

	// Função de login
	const login = async (email: string, password: string) => {
		try {
			setLoading(true);
			const response = await authService.login({ email, password });

			// Buscar dados do usuário após login
			const userData = await getAuthenticatedUser();
			setUser(userData);
			setIsAuthenticated(true);
		} catch (error) {
			console.error("Erro no login:", error);
			setUser(null);
			setIsAuthenticated(false);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Função de logout
	const logout = () => {
		authService.logout();
		setUser(null);
		setIsAuthenticated(false);
	};

	// Valor do contexto
	const contextValue: UserContextType = {
		user,
		isAuthenticated,
		login,
		logout,
		loading,
	};

	return (
		<UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
	);
};

// Hook personalizado para usar o contexto do usuário
export const useUser = () => {
	const context = useContext(UserContext);

	if (!context) {
		throw new Error("useUser deve ser usado dentro de um UserProvider");
	}

	return context;
};
