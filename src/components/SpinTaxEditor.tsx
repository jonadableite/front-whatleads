// src/components/SpinTaxEditor.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  Copy,
  Shuffle
} from 'lucide-react';
import { useSpinTax } from '../hooks/useSpinTax';
import {
  SpinTaxEditorProps,
  SpinTaxValidationError,
  SpinTaxValidationWarning,
  SpinTaxErrorType,
  SpinTaxWarningType
} from '../types/spintax.types';

/**
 * Editor SpinTax com validação e preview em tempo real
 * Implementa UI/UX intuitiva com feedback visual
 */
export const SpinTaxEditor: React.FC<SpinTaxEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite sua mensagem com SpinTax aqui...\n\nExemplo: {Olá|Oi|E aí} {pessoal|galera|amigos}! Como {vocês estão|vai|está tudo}?',
  disabled = false,
  config,
  onValidation,
  showPreview = true,
  previewCount = 5,
  className = ''
}) => {
  const [showPreviewPanel, setShowPreviewPanel] = useState(showPreview);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    validation,
    examples,
    isProcessing,
    error,
    setText,
    generateExamples,
    process
  } = useSpinTax('', config);

  // Sincronizar com prop value
  useEffect(() => {
    setText(value);
  }, [value, setText]);

  // Notificar validação
  useEffect(() => {
    if (validation && onValidation) {
      onValidation(validation);
    }
  }, [validation, onValidation]);

  /**
   * Copia texto para clipboard
   */
  const copyToClipboard = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      // Feedback visual poderia ser adicionado aqui
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  /**
   * Gera nova variação
   */
  const generateNewVariation = async () => {
    const results = await process(1);
    if (results.length > 0) {
      setSelectedExample(results[0]);
    }
  };

  /**
   * Renderiza ícone de status
   */
  const renderStatusIcon = () => {
    if (isProcessing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }

    if (error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }

    if (!validation) {
      return <Info className="w-4 h-4 text-gray-400" />;
    }

    if (validation.errors.length > 0) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }

    if (validation.warnings.length > 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }

    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  /**
   * Renderiza mensagem de erro
   */
  const renderError = (error: SpinTaxValidationError) => {
    const getErrorMessage = (type: SpinTaxErrorType): string => {
      switch (type) {
        case SpinTaxErrorType.UNCLOSED_BRACKET:
          return 'Chave não fechada';
        case SpinTaxErrorType.UNOPENED_BRACKET:
          return 'Chave não aberta';
        case SpinTaxErrorType.EMPTY_GROUP:
          return 'Grupo vazio';
        case SpinTaxErrorType.EMPTY_VARIATION:
          return 'Variação vazia';
        case SpinTaxErrorType.NESTED_GROUPS:
          return 'Grupos aninhados';
        case SpinTaxErrorType.INVALID_WEIGHT:
          return 'Peso inválido';
        case SpinTaxErrorType.TOO_MANY_GROUPS:
          return 'Muitos grupos';
        case SpinTaxErrorType.TOO_MANY_VARIATIONS:
          return 'Muitas variações';
        default:
          return 'Erro de sintaxe';
      }
    };

    return (
      <div key={`error-${error.type}-${error.position}`} className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-medium text-red-700">{getErrorMessage(error.type)}</div>
          <div className="text-red-600">{error.message}</div>
          {error.context && (
            <div className="text-red-500 font-mono text-xs mt-1 bg-red-100 px-2 py-1 rounded">
              {error.context}
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Renderiza mensagem de aviso
   */
  const renderWarning = (warning: SpinTaxValidationWarning) => {
    const getWarningMessage = (type: SpinTaxWarningType): string => {
      switch (type) {
        case SpinTaxWarningType.SINGLE_VARIATION:
          return 'Variação única';
        case SpinTaxWarningType.DUPLICATE_VARIATION:
          return 'Variações duplicadas';
        case SpinTaxWarningType.UNBALANCED_WEIGHTS:
          return 'Pesos desbalanceados';
        case SpinTaxWarningType.VERY_LONG_VARIATION:
          return 'Variação muito longa';
        case SpinTaxWarningType.MANY_VARIATIONS:
          return 'Muitas variações';
        default:
          return 'Aviso';
      }
    };

    return (
      <div key={`warning-${warning.type}-${warning.position}`} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-medium text-yellow-700">{getWarningMessage(warning.type)}</div>
          <div className="text-yellow-600">{warning.message}</div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com status e controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {renderStatusIcon()}
          <span className="text-sm font-medium text-gray-700">
            Editor SpinTax
          </span>
          {validation?.stats && validation.stats.totalGroups > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {validation.stats.totalGroups} grupos, {validation.stats.totalCombinations.toLocaleString()} combinações
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generateExamples(previewCount)}
            disabled={disabled || isProcessing || !value.trim()}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          {showPreview && (
            <button
              onClick={() => setShowPreviewPanel(!showPreviewPanel)}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {showPreviewPanel ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              Preview
            </button>
          )}
        </div>
      </div>

      {/* Editor principal */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setText(e.target.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full min-h-[120px] p-3 border rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validation?.errors.length ? 'border-red-300 bg-red-50' :
              validation?.warnings.length ? 'border-yellow-300 bg-yellow-50' :
                validation?.isValid ? 'border-green-300 bg-green-50' :
                  'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />

        {/* Indicador de processamento */}
        {isProcessing && (
          <div className="absolute top-2 right-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Mensagens de erro */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Erro</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Validação */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map(renderError)}
          {validation.warnings.map(renderWarning)}
        </div>
      )}

      {/* Preview Panel */}
      {showPreviewPanel && validation?.isValid && examples.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">Preview das Variações</h4>
            <button
              onClick={generateNewVariation}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              <Shuffle className="w-3 h-3" />
              Nova
            </button>
          </div>

          <div className="space-y-2">
            {examples.map((example, index) => (
              <div
                key={index}
                className={`p-2 rounded border cursor-pointer transition-colors ${selectedExample === example
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                onClick={() => setSelectedExample(selectedExample === example ? null : example)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-gray-700 flex-1">{example}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(example);
                    }}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                    title="Copiar"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedExample && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Variação Selecionada</span>
                <button
                  onClick={() => copyToClipboard(selectedExample)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
              <p className="text-sm text-blue-600">{selectedExample}</p>
            </div>
          )}
        </div>
      )}

      {/* Estatísticas */}
      {validation?.stats && validation.stats.totalGroups > 0 && (
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <span className="font-medium">Grupos:</span> {validation.stats.totalGroups}
            </div>
            <div>
              <span className="font-medium">Variações:</span> {validation.stats.totalVariations}
            </div>
            <div>
              <span className="font-medium">Combinações:</span> {validation.stats.totalCombinations.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Média:</span> {validation.stats.averageVariationLength} chars
            </div>
          </div>
        </div>
      )}
    </div>
  );
};