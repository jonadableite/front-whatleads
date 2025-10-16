// src/hooks/useFetch.ts
import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { authService } from "@/services/auth.service";

export function useFetch<T = any>(
  url: string | null,
  options: SWRConfiguration = {}
): SWRResponse<T, Error> {
  const fetcher = async (url: string): Promise<T> => {
    const token =
      authService?.getTokenInterno?.() || localStorage.getItem("token");

    // Construir URL completa com base URL
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:9000";
    const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Erro ao buscar dados: ${response.status} - ${errorBody}`
      );
    }

    return response.json();
  };

  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    errorRetryCount: 3,
    ...options,
  });
}
