// src/lib/api-utils.ts
import api from './api';
import { fetchAllGroups } from '@/services/evolutionApi.service';

interface CacheItem {
  data: unknown;
  timestamp: number;
  ttl: number;
}

interface RequestOptions {
  timeout?: number;
  retries?: number;
  useCache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

class ApiUtils {
  private cache = new Map<string, CacheItem>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  // Cache TTL em milissegundos
  private readonly CACHE_TTL = {
    INSTANCES: 5 * 60 * 1000, // 5 minutos
    GROUPS: 2 * 60 * 1000, // 2 minutos
    DEFAULT: 1 * 60 * 1000, // 1 minuto
  };

  // Retry configuration
  private readonly RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 segundo
    maxDelay: 5000, // 5 segundos
  };

  /**
   * Função para fazer requisições com retry automático
   */
  async requestWithRetry<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const {
      timeout,
      retries = this.RETRY_CONFIG.maxRetries,
      useCache = false,
      cacheKey = url,
      cacheTTL = this.CACHE_TTL.DEFAULT,
    } = options || {};

    // Verificar cache se habilitado
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached as T;
      }
    }

    // Verificar se já existe uma requisição pendente para esta URL
    const pendingKey = `${method}:${url}`;
    if (this.pendingRequests.has(pendingKey)) {
      return this.pendingRequests.get(pendingKey) as Promise<T>;
    }

    // Criar nova requisição
    const requestPromise = this.executeRequestWithRetry<T>(
      method,
      url,
      data,
      timeout,
      retries
    );

    // Armazenar requisição pendente
    this.pendingRequests.set(pendingKey, requestPromise);

    try {
      const result = await requestPromise;

      // Salvar no cache se habilitado
      if (useCache) {
        this.setCache(cacheKey, result, cacheTTL);
      }

      return result;
    } finally {
      // Remover requisição pendente
      this.pendingRequests.delete(pendingKey);
    }
  }

  /**
   * Executa a requisição com retry
   */
  private async executeRequestWithRetry<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: unknown,
    timeout?: number,
    maxRetries: number = this.RETRY_CONFIG.maxRetries
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const config: Record<string, unknown> = {};
        if (timeout) {
          config.timeout = timeout;
        }

        const response = await api.request({
          method,
          url,
          data,
          ...config,
        });

        return response.data;
      } catch (error: unknown) {
        lastError = error;

        // Se não é o último attempt e o erro é retryável
        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = this.calculateDelay(attempt);
          console.warn(
            `Tentativa ${attempt + 1} falhou para ${url}. Tentando novamente em ${delay}ms...`
          );
          await this.sleep(delay);
          continue;
        }

        // Se chegou aqui, é o último attempt ou erro não retryável
        break;
      }
    }

    throw lastError;
  }

  /**
   * Verifica se o erro é retryável
   */
  private isRetryableError(error: unknown): boolean {
    // Retry em caso de timeout, erro de rede, ou 5xx
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      if (errorCode === 'ECONNABORTED' || errorCode === 'NETWORK_ERROR' || errorCode === 'ERR_NETWORK') {
        return true;
      }
    }

    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response: { status: number } }).response;
      if (response?.status >= 500 && response?.status < 600) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calcula delay exponencial com jitter
   */
  private calculateDelay(attempt: number): number {
    const baseDelay = this.RETRY_CONFIG.baseDelay;
    const maxDelay = this.RETRY_CONFIG.maxDelay;

    // Delay exponencial: baseDelay * 2^attempt
    const exponentialDelay = baseDelay * Math.pow(2, attempt);

    // Adicionar jitter para evitar thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;

    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cache utilities
   */
  private getFromCache(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  private setCache(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Limpar cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Métodos específicos para operações comuns
   */
  async getInstances() {
    return this.requestWithRetry('get', '/api/instances', undefined, {
      useCache: true,
      cacheKey: 'instances',
      cacheTTL: this.CACHE_TTL.INSTANCES,
    });
  }

  async getGroups(instanceName: string) {
    // Use direct Evolution API call instead of backend
    console.log(`[ApiUtils] Fazendo chamada direta para Evolution API para instância: ${instanceName}`);
    
    try {
      const result = await fetchAllGroups(instanceName, true);
      console.log(`[ApiUtils] Resultado da Evolution API:`, result);
      return result;
    } catch (error) {
      console.error(`[ApiUtils] Erro na chamada direta para Evolution API:`, error);
      throw error;
    }
  }

  async createGroup(instanceName: string, data: unknown) {
    const result = await this.requestWithRetry(
      'post',
      `/api/groups/create/${instanceName}`,
      data
    );

    // Limpar cache de grupos após criar novo grupo
    this.clearCache('groups:');

    return result;
  }

  async updateGroupSettings(instanceName: string, groupJid: string, data: unknown) {
    const result = await this.requestWithRetry(
      'post',
      `/group/updateSetting/${instanceName}?groupJid=${groupJid}`,
      data
    );

    // Limpar cache de grupos após atualizar configurações
    this.clearCache('groups:');

    return result;
  }
}

export const apiUtils = new ApiUtils();