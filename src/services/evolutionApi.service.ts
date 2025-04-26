// src/services/evolutionApi.service.ts:
import axios from "axios";
import { authService } from "./auth.service";

const EVOLUTION_API_URL =
  import.meta.env.VITE_EVOLUTION_API_URL || "https://evo.whatlead.com.br";
const API_KEY =
  import.meta.env.VITE_PUBLIC_API_KEY || "429683C4C977415CAAFCCE10F7D57E11";

export const evolutionApi = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    "Content-Type": "application/json",
    apikey: API_KEY,
  },
});

// Interceptor para adicionar token dinamicamente
evolutionApi.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
