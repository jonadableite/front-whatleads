// src/services/auth.service.ts
import { API_URL } from "@/config/api";
import type { LoginCredentials, LoginResponse, User } from "@/interface";
import axios from "axios";

class AuthService {
  private readonly storagePrefix = "@whatlead:";
  private readonly TOKEN_KEY = `${this.storagePrefix}tokenInterno`; // Chave para o token da API interna principal
  private readonly EVO_AI_TOKEN_KEY = `${this.storagePrefix}tokenEvoAi`; // Chave para o token da API do Evo AI
  private readonly USER_KEY = `${this.storagePrefix}user`;
  // private readonly REFRESH_TOKEN_KEY = `${this.storagePrefix}refreshToken`; // Removido ou comente se não estiver usando

  // Login com tipagem forte e melhor tratamento de erro
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log(`Attempting login to: ${API_URL}/api/session`);
      const response = await axios.post(`${API_URL}/api/session`, credentials);
      // ** Destructure os campos corretos da resposta do backend **
      const { tokenInterno, tokenEvoAi, user } = response.data;

      if (tokenInterno) {
        this.setTokenInterno(tokenInterno); // Armazena o token interno
        console.log("Token Interno armazenado após login:", tokenInterno ? "Sim" : "Não");
      } else {
          console.warn("Login response did not contain tokenInterno.");
      }

      if (tokenEvoAi) {
        this.setEvoAiToken(tokenEvoAi); // Armazena o token da Evo AI
        console.log("Token Evo AI armazenado após login:", tokenEvoAi ? "Sim" : "Não");
      } else {
          console.warn("Login response did not contain tokenEvoAi.");
      }

      if (user) {
        this.setUser(user); // Armazena os dados do usuário
        console.log("Dados do usuário armazenados após login:", user.data ? "Sim" : "Não");
      } else {
          console.warn("Login response did not contain user data.");
      }

      // Se você tiver um refresh token na resposta, armazene-o também
      // if (response.data.refreshToken) {
      // this.setRefreshToken(response.data.refreshToken);
      // }

      return response.data; // Retorna os dados completos da resposta se necessário
    } catch (error: any) {
      console.error("Erro durante o login:", error);
      // Limpa tokens e usuário em caso de erro no login
      this.clearSession(); // Importante limpar em caso de falha no login
      throw new Error(
        error.response?.data?.message || "Erro ao realizar login",
      );
    }
  }

  // Verificação de autenticação melhorada (usando o token interno)
  // Esta função deve verificar se o usuário está autenticado no SaaS principal.
  // A validade do token Evo AI será verificada nas chamadas específicas da API externa.
  isAuthenticated(): boolean {
    const token = this.getTokenInterno(); // Verifica o token interno
    if (!token) {
      console.log("Token interno não encontrado.");
      return false;
    }

    try {
      // Decodifica o payload do token para verificar a expiração
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiration = payload.exp * 1000; // JWT exp é em segundos, Date.now() é em ms
      const isValid = expiration > Date.now();

      console.log("Token interno válido:", isValid);
      if (!isValid) {
        console.log("Token interno expirado.");
        // O token interno expirou. O interceptor de response 401 ou initialize
        // cuidará do logout ou renovação (se refresh token for implementado).
      }
      return isValid;
    } catch (error) {
      console.error("Erro ao validar token interno:", error);
      // Token malformado ou erro de parsing -> sessão inválida
      this.clearSession(); // Limpa a sessão se o token interno for inválido
      return false;
    }
  }

  // Método para obter headers de autenticação para a API interna (não mais necessário com o interceptor)
  // getAuthHeadersInterno() {
  // const token = this.getTokenInterno(); // Usa o token interno para headers da API interna
  // console.log("Token interno para headers:", token ? "Presente" : "Ausente");
  // return {
  // Authorization: token ? `Bearer ${token}` : "",
  // };
  // }

  // Logout centralizado
  logout(callback?: () => void): void {
    console.log("Iniciando logout...");
    this.clearSession(); // Limpa todos os dados da sessão

    if (callback) {
      callback();
    } else {
      // Redireciona para login após limpar a sessão
      // Use replace para evitar que o usuário volte para a página anterior após o logout
      window.location.replace("/login");
    }
  }

  // Gerenciamento de token Interno (renomeado para clareza)
  setTokenInterno(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    console.log("Token Interno armazenado.");
  }

  getTokenInterno(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    // console.log("Token Interno recuperado:", token ? "Presente" : "Ausente"); // Evitar logar o token completo
    return token;
  }

  // Gerenciamento de token Evo AI (NOVOS MÉTODOS)
  setEvoAiToken(token: string): void {
    localStorage.setItem(this.EVO_AI_TOKEN_KEY, token);
    console.log("Token Evo AI armazenado.");
  }

  getEvoAiToken(): string | null {
    const token = localStorage.getItem(this.EVO_AI_TOKEN_KEY);
    return token;
  }

  // Gerenciamento de usuário
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    console.log("Dados do usuário armazenados. Usuário:", user ? "Presente" : "Ausente");
  }

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      const user = userStr ? JSON.parse(userStr) : null;
      console.log("Dados do usuário recuperados:", user ? "Presente" : "Ausente");
      return user;
    } catch(error) {
      console.error("Erro ao recuperar dados do usuário do localStorage:", error);
      // Limpa user se houver erro ao parsear (dado corrompido)
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }

  // Gerenciamento de Refresh Token (Removido ou comente se não estiver usando)
  // setRefreshToken(token: string): void {
  // localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  // }

  // getRefreshToken(): string | null {
  // return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  // }

  // Verificação de token expirado (genérico, pode ser usado para qualquer token JWT)
  // Útil para verificar a expiração de qualquer um dos tokens se necessário
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiration = payload.exp * 1000;
      return expiration <= Date.now();
    } catch {
      // Token malformado
      return true;
    }
  }

  // Refresh token com melhor tratamento de erro (Removido ou comente se não estiver usando)
  // async refreshTokenIfNeeded(): Promise<boolean> {
  // const refreshToken = this.getRefreshToken();
  // if (!refreshToken || this.isTokenExpired(refreshToken)) {
  // console.log("Refresh token não encontrado ou expirado.");
  // return false; // Não há refresh token disponível ou está expirado
  // }

  // try {
  // console.log("Tentando renovar token...");
  // const response = await axios.post(`${API_URL}/api/refresh-token`, {
  // token: refreshToken,
  // });
  // const { token: newTokenInterno, tokenEvoAi: newTokenEvoAi } = response.data; // Assumindo que o refresh também retorna ambos

  // if (newTokenInterno) this.setTokenInterno(newTokenInterno);
  // if (newTokenEvoAi) this.setEvoAiToken(newTokenEvoAi);

  // console.log("Token renovado com sucesso.");
  // return true; // Token renovado com sucesso
  // } catch (error) {
  // console.error("Erro ao renovar o token:", error);
  // // Se a renovação falhar, a sessão está inválida
  // this.clearSession();
  // return false; // Falha na renovação do token
  // }
  // }

  // Método para inicializar o serviço de autenticação
  // Verifica se o token interno principal está válido ao carregar a aplicação.
  // Se o refresh token estiver implementado, pode tentar renovar aqui.
  async initialize(): Promise<boolean> {
    console.log("Inicializando serviço de autenticação...");
    const isAuthenticatedInterno = this.isAuthenticated();

    if (!isAuthenticatedInterno) {
        console.log("Token interno inválido ou ausente durante a inicialização.");
        this.clearSession(); // Garante que a sessão é limpa se o token interno for inválido
        return false;
    }

    // Se o refresh token estiver implementado, descomente a linha abaixo:
    // const refreshed = await this.refreshTokenIfNeeded();
    // if (!refreshed && !isAuthenticatedInterno) { // Se não conseguiu renovar E o token interno já estava inválido
    // console.log("Falha na renovação do token durante a inicialização.");
    // this.clearSession();
    // return false;
    // }

    console.log("Autenticação inicial verificada. Usuário autenticado.");
    return true; // Retorna true se o token interno for válido (ou renovado com sucesso)
  }

  // Método para limpar todos os dados da sessão
  clearSession(): void {
    console.log("Limpando sessão...");
    // Limpa apenas as chaves que começam com o prefixo para não afetar outros itens do localStorage
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
        console.log(`Removido do localStorage: ${key}`);
      }
    });
     // Opcional: Limpar chaves legadas que não usam o prefixo, como "access_token"
     localStorage.removeItem("access_token");
     localStorage.removeItem("user"); // O user com prefixo já é limpo, mas este pode ser um legado
     localStorage.removeItem("impersonatedClient");
     localStorage.removeItem("isImpersonating");
     // Limpar cookies legados, se ainda existirem
     document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
     document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
     document.cookie = "impersonatedClient=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
     document.cookie = "isImpersonating=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";


    console.log("Sessão limpa.");
  }
}

export const authService = new AuthService();
