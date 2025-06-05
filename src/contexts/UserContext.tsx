// src/contexts/UserContext.tsx
import type { User } from "@/interface";
import { authService } from "@/services/auth.service";
import type React from "react";
import { createContext, useContext, useEffect, useState } from 'react';

// Definição do tipo do contexto do usuário
interface UserContextType {
	user: User | null;
	isAuthenticated: boolean;
	clientId: string | null; // Estado para armazenar o client_id
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	loading: boolean;
}

// Criação do contexto. Usamos 'undefined' como valor inicial para detectar se o hook
// 'useUser' está sendo usado fora do Provider.
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provedor do contexto do usuário
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [clientId, setclientId] = useState<string | null>(null); // Estado para armazenar o client_id
	const [loading, setLoading] = useState(true);

	// Verificar autenticação inicial e carregar dados do evoAiUserId/clientId
	useEffect(() => {
		const checkAuthentication = async () => {
			try {
				// authService.isAuthenticated() deve verificar a existência de um token válido (principal)
				const isAuth = authService.isAuthenticated();
				setIsAuthenticated(isAuth);

				if (isAuth) {
					// Buscar dados do usuário autenticado.
					// Assumimos que authService.getUser() já retorna um objeto User
					// que inclui a propriedade `client_id`, possivelmente obtida
					// de um token Evo AI armazenado ou da resposta do login principal.
					const userData = authService.getUser();
					setUser(userData);

					// Extrai o client_id do objeto do usuário retornado por getUser()
					// Usamos `?.` para segurança caso userData seja null ou undefined
					// e `|| null` para garantir que o estado seja null se client_id não existir
					setclientId(userData?.client_Id || null);
				}
			} catch (error) {
				console.error("Erro ao verificar autenticação:", error);
				// Em caso de erro, garantir que o estado de autenticação e dados sejam limpos
				setIsAuthenticated(false);
				setUser(null);
				setclientId(null); // Limpa o client_id também
			} finally {
				setLoading(false);
			}
		};

		checkAuthentication();
	}, []); // Dependências vazias: este efeito roda apenas uma vez na montagem inicial do componente

	// Função de login
	const login = async (email: string, password: string) => {
		try {
			setLoading(true);
			// authService.login deve lidar com a comunicação com o backend principal
			// E, crucialmente, deve também obter e armazenar o token/client_id necessário para o Evo AI.
			await authService.login({ email, password });

			// Após um login bem-sucedido, recarregar os dados do usuário e o client_id
			// Assumimos que agora authService.getUser() retornará os dados completos, incluindo client_id
			const userData = authService.getUser();
			console.log("User data after login:", userData);
			console.log("Client ID after login:", userData?.client_Id);
			setUser(userData);
			setclientId(userData?.client_Id || null); // Extrai e define o client_id
			setIsAuthenticated(true);

		} catch (error) {
			console.error("Erro no login:", error);
			// Em caso de erro no login, limpar os dados e o estado de autenticação
			setUser(null);
			setclientId(null); // Limpa o client_id
			setIsAuthenticated(false);
			// Re-lança o erro para que o componente que chamou login possa tratá-lo (ex: exibir mensagem de erro para o usuário)
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Função de logout
	const logout = () => {
		// authService.logout() deve limpar todos os tokens armazenados (principal e Evo AI)
		authService.logout();
		// Limpar o estado no contexto
		setUser(null);
		setclientId(null); // Limpa o client_id
		setIsAuthenticated(false);
		// Opcional: Redirecionar o usuário para a página de login após o logout
		// navigate('/login'); // Se você tiver acesso ao navigate aqui, ou faça isso no componente que chama logout
	};

	// Valor do contexto que será fornecido aos consumidores
	const contextValue: UserContextType = {
		user,
		isAuthenticated,
		clientId: clientId,
		login,
		logout,
		loading,
	};

	return (
		<UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
	);
};

// Hook personalizado para consumir o contexto do usuário
export const useUser = () => {
	const context = useContext(UserContext);

	// Lança um erro se o hook for usado fora do UserProvider
	if (context === undefined) {
		throw new Error("useUser deve ser usado dentro de um UserProvider");
	}

	return context;
};
