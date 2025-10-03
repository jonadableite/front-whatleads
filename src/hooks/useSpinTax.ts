// src/hooks/useSpinTax.ts

import { useCallback, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import type {
  UseSpinTaxState,
  UseSpinTaxReturn,
  SpinTaxValidationResult,
  ProcessSpinTaxRequest,
  ProcessSpinTaxResponse,
  ValidateSpinTaxRequest,
  ValidateSpinTaxResponse,
  PreviewSpinTaxRequest,
  PreviewSpinTaxResponse
} from '../types/spintax.types';

/**
 * Hook personalizado para gerenciar funcionalidades SpinTax
 * Implementa padrão de hooks com estado reativo
 */
export const useSpinTax = (initialText: string = '', config?: SpinTaxConfig): UseSpinTaxReturn => {
  const [state, setState] = useState<UseSpinTaxState>({
    text: initialText,
    validation: null,
    examples: [],
    isProcessing: false,
    error: null
  });

  /**
   * Atualiza o texto e limpa validação anterior
   */
  const setText = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      text,
      validation: null,
      examples: [],
      error: null
    }));
  }, []);

  /**
   * Faz requisição para API
   */
  const apiRequest = useCallback(async <T>(
    endpoint: string,
    data: any
  ): Promise<T> => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";
    const token = authService.getTokenInterno();
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    
    const response = await fetch(`${API_URL}/api/spintax/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP ${response.status}`);
    }

    return response.json();
  }, []);

  /**
   * Gera exemplos de variações
   */
  const generateExamples = useCallback(async (count: number = 5): Promise<void> => {
    if (!state.text.trim()) {
      setState(prev => ({ ...prev, examples: [], error: null }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const request: PreviewSpinTaxRequest = {
        text: state.text,
        count: Math.min(Math.max(count, 1), 20),
        config
      };

      // Debug: Log do que está sendo enviado
      console.log('🔍 SpinTax Debug - Enviando para API:', {
        text: request.text,
        count: request.count,
        textLength: request.text.length,
        hasMultipleGroups: (request.text.match(/\{[^}]+\}/g) || []).length > 1
      });

      const response = await apiRequest<PreviewSpinTaxResponse>('preview', request);

      // Debug: Log da resposta
      console.log('🔍 SpinTax Debug - Resposta da API:', {
        examplesCount: response.examples.length,
        examples: response.examples,
        totalGroups: response.validation?.stats?.totalGroups,
        totalCombinations: response.validation?.stats?.totalCombinations
      });

      setState(prev => ({
        ...prev,
        examples: response.examples,
        validation: response.validation,
        isProcessing: false
      }));
    } catch (error) {
      console.error('🔍 SpinTax Debug - Erro na API:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isProcessing: false,
        examples: []
      }));
    }
  }, [state.text, config, apiRequest]);

  /**
   * Valida o texto SpinTax
   */
  const validate = useCallback(async (): Promise<void> => {
    if (!state.text.trim()) {
      setState(prev => ({ ...prev, validation: null, error: null }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const request: ValidateSpinTaxRequest = {
        text: state.text,
        config
      };

      const response = await apiRequest<ValidateSpinTaxResponse>('validate', request);

      setState(prev => ({
        ...prev,
        validation: {
          isValid: response.isValid,
          errors: response.errors,
          warnings: response.warnings,
          stats: response.stats
        },
        isProcessing: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isProcessing: false,
        validation: null
      }));
    }
  }, [state.text, config, apiRequest]);

  /**
   * Processa o texto e retorna variações
   */
  const process = useCallback(async (count: number = 1): Promise<string[]> => {
    if (!state.text.trim()) {
      return [];
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const request: ProcessSpinTaxRequest = {
        text: state.text,
        count: Math.min(Math.max(count, 1), 100),
        config
      };

      const response = await apiRequest<ProcessSpinTaxResponse>('process', request);

      setState(prev => ({ ...prev, isProcessing: false }));

      return response.results;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isProcessing: false
      }));
      return [];
    }
  }, [state.text, config, apiRequest]);

  /**
   * Limpa todo o estado
   */
  const clear = useCallback(() => {
    setState({
      text: '',
      validation: null,
      examples: [],
      isProcessing: false,
      error: null
    });
  }, []);

  /**
   * Validação automática quando o texto muda (debounced)
   */
  useEffect(() => {
    if (!state.text.trim()) return;

    const timeoutId = setTimeout(() => {
      validate();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [state.text, validate]);

  /**
   * Geração automática de exemplos quando validação é bem-sucedida
   */
  useEffect(() => {
    if (state.validation?.isValid && state.validation.stats.totalGroups > 0) {
      generateExamples(5);
    }
  }, [state.validation?.isValid, state.validation?.stats.totalGroups, generateExamples]);

  return {
    ...state,
    setText,
    generateExamples,
    validate,
    process,
    clear
  };
};