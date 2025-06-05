// src/lib/env.ts (Correção)

export const getEnv = (key: string, defaultValue?: string): string => {
  try {
    const value = import.meta.env[key];
    return value || defaultValue || '';
  } catch (error) {
    console.error(`Erro ao obter variável de ambiente ${key}:`, error);
    return defaultValue || '';
  }
};

export const getApiUrl = (): string => {
  return getEnv('VITE_API_AI_URL', 'https://api-evoai.evoapicloud.com');
};
