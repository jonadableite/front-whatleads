import axios from "axios";
import { authService } from "@/services/auth.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export const fetcher = async (url: string) => {
  const token = authService.getTokenInterno();
  if (!token) {
    throw new Error("Token de autenticação interno não encontrado.");
  }

  const response = await axios.get(`${API_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
