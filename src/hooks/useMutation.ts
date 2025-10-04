// src/hooks/useMutation.ts
import { useState } from "react";
import { mutate } from "swr";
import { authService } from "@/services/auth.service";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

interface UseMutationResult<T> {
  execute: (payload?: any) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
}

export function useMutation<T = any>(
  url: string,
  method: HttpMethod = "POST"
): UseMutationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (payload?: any): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const token =
        authService?.getTokenInterno?.() || localStorage.getItem("token");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Erro na requisição: ${response.status} - ${errorBody}`
        );
      }

      const result = (await response.json()) as T;

      // 🔄 Atualiza o cache do SWR associado a esta URL
      mutate(url);

      return result;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
