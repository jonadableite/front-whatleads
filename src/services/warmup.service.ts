// src/services/warmup.service.ts
import { authService } from './auth.service';
import type { WarmupConfig, WarmupResponse, WarmupStatus } from '@/types/warmup';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

class WarmupService {
  private getHeaders() {
    const token = authService?.getTokenInterno?.() || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async startWarmup(config: WarmupConfig): Promise<WarmupResponse> {
    const response = await fetch(`${API_BASE_URL}/api/warmup/config`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro ao iniciar aquecimento: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }

  async stopWarmup(): Promise<WarmupResponse> {
    const response = await fetch(`${API_BASE_URL}/api/warmup/stop-all`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro ao parar aquecimento: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }

  async getWarmupStatus(): Promise<WarmupStatus> {
    const response = await fetch(`${API_BASE_URL}/api/warmup/status`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro ao buscar status: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }

  async pauseWarmup(instanceId: string): Promise<WarmupResponse> {
    const response = await fetch(`${API_BASE_URL}/api/warmup/pause/${instanceId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro ao pausar aquecimento: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }

  async resumeWarmup(instanceId: string): Promise<WarmupResponse> {
    const response = await fetch(`${API_BASE_URL}/api/warmup/resume/${instanceId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro ao retomar aquecimento: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }
}

export const warmupService = new WarmupService();
