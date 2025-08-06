import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FaBalanceScale,
  FaCheck,
  FaList,
  FaPause,
  FaPlay,
  FaRandom,
  FaRoute,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { cn } from '../lib/utils';
import type { ApiError } from '../types/error';

interface Instance {
  id: string;
  instanceName: string;
  connectionStatus: string;
  profileName?: string;
  warmupStatus?: {
    progress: number;
    isRecommended: boolean;
    warmupHours: number;
    status: string;
    lastUpdate: string | null;
  };
}

interface CampaignInstance {
  instanceName: string;
  messagesSent: number;
  maxMessages?: number;
  lastUsedAt?: string;
  isActive: boolean;
  connectionStatus: string;
}

interface CampaignStats {
  totalInstances: number;
  activeInstances: number;
  connectedInstances: number;
  totalMessagesSent: number;
  instances: CampaignInstance[];
}

interface InstanceRotationConfigProps {
  campaignId: string;
  onInstanceChange: (instanceId: string) => void;
  onRotationChange?: (useRotation: boolean) => void;
  className?: string;
}

export const InstanceRotationConfig: React.FC<
  InstanceRotationConfigProps
> = ({
  campaignId,
  onInstanceChange,
  onRotationChange,
  className,
}) => {
    const [instances, setInstances] = useState<Instance[]>([]);
    const [selectedInstances, setSelectedInstances] = useState<
      string[]
    >([]);
    const [useRotation, setUseRotation] = useState(false);
    const [rotationStrategy, setRotationStrategy] = useState<
      'RANDOM' | 'SEQUENTIAL' | 'LOAD_BALANCED'
    >('RANDOM');
    const [maxMessagesPerInstance, setMaxMessagesPerInstance] =
      useState<number>(100);
    const [campaignStats, setCampaignStats] =
      useState<CampaignStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);

    // Carregar instâncias disponíveis
    const loadAvailableInstances = useCallback(async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          '/campaigns/instances/available',
        );

        // Processar dados de warmup para cada instância
        const processedInstances = response.data.data.map(
          (instance: {
            id: string;
            instanceName: string;
            connectionStatus: string;
            profileName?: string;
            warmupStats?: {
              warmupTime: number;
              status: string;
              createdAt: string;
            };
          }) => {
            const warmupStats = instance.warmupStats;
            const warmupTime = warmupStats?.warmupTime || 0;
            const warmupHours = warmupTime / 3600;
            const progress = Math.min((warmupHours / 400) * 100, 100);

            return {
              ...instance,
              warmupStatus: {
                progress: Math.round(progress * 100) / 100,
                isRecommended: warmupHours >= 300,
                warmupHours: Math.round(warmupHours * 100) / 100,
                status: warmupStats?.status || 'inactive',
                lastUpdate: warmupStats?.createdAt || null,
              },
            };
          },
        );

        setInstances(processedInstances);
      } catch (error) {
        console.error('Erro ao carregar instâncias:', error);
        toast.error('Erro ao carregar instâncias disponíveis');
      } finally {
        setIsLoading(false);
      }
    }, []);

    // Carregar estatísticas da campanha
    const loadCampaignStats = useCallback(async () => {
      if (!campaignId) return;

      try {
        const response = await api.get(
          `/campaigns/${campaignId}/instances/stats`,
        );
        const stats = response.data.data;
        setCampaignStats(stats);

        if (stats.totalInstances > 0) {
          setUseRotation(true);
          setSelectedInstances(
            stats.instances.map(
              (inst: CampaignInstance) => inst.instanceName,
            ),
          );
          onRotationChange?.(true);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.log('Nenhuma rotação configurada para esta campanha');
        setUseRotation(false);
        setCampaignStats(null);
        onRotationChange?.(false);
      }
    }, [campaignId, onRotationChange]);

    // Efeito para carregar dados iniciais
    useEffect(() => {
      loadAvailableInstances();
    }, [loadAvailableInstances]);

    useEffect(() => {
      if (campaignId) {
        loadCampaignStats();
      }
    }, [campaignId, loadCampaignStats]);

    // Configurar rotação
    const handleConfigureRotation = async () => {
      if (selectedInstances.length === 0) {
        toast.error('Selecione pelo menos uma instância para rotação');
        return;
      }

      try {
        setIsConfiguring(true);

        const instanceIds = instances
          .filter((inst) =>
            selectedInstances.includes(inst.instanceName),
          )
          .map((inst) => inst.id);

        await api.post(`/campaigns/${campaignId}/instances`, {
          instanceIds,
          useRotation: true,
          rotationStrategy,
          maxMessagesPerInstance: maxMessagesPerInstance || undefined,
        });

        toast.success('Rotação de instâncias configurada com sucesso!');
        await loadCampaignStats();

        // Limpar seleção de instância única quando rotação está ativa
        onInstanceChange('');
      } catch (error: unknown) {
        console.error('Erro ao configurar rotação:', error);
        const errorMessage =
          (error as ApiError)?.response?.data?.message ||
          'Erro ao configurar rotação';
        toast.error(errorMessage);
      } finally {
        setIsConfiguring(false);
      }
    };

    // Remover rotação
    const handleRemoveRotation = async () => {
      try {
        setIsConfiguring(true);

        const instanceIds = instances
          .filter((inst) =>
            selectedInstances.includes(inst.instanceName),
          )
          .map((inst) => inst.id);

        await api.delete(`/campaigns/${campaignId}/instances`, {
          data: { instanceIds },
        });

        toast.success('Rotação de instâncias removida');
        setUseRotation(false);
        setSelectedInstances([]);
        setCampaignStats(null);
        onRotationChange?.(false);
      } catch (error: unknown) {
        console.error('Erro ao remover rotação:', error);
        const errorMessage =
          (error as ApiError)?.response?.data?.message ||
          'Erro ao remover rotação';
        toast.error(errorMessage);
      } finally {
        setIsConfiguring(false);
      }
    };

    // Alternar status da instância
    const handleToggleInstance = async (
      instanceName: string,
      isActive: boolean,
    ) => {
      try {
        const instance = instances.find(
          (inst) => inst.instanceName === instanceName,
        );
        if (!instance) return;

        await api.patch(
          `/campaigns/${campaignId}/instances/toggle`,
          {
            instanceId: instance.id,
            isActive,
          },
        );

        toast.success(
          `Instância ${isActive ? 'ativada' : 'desativada'}`,
        );
        await loadCampaignStats();
      } catch (error: unknown) {
        console.error('Erro ao alterar status da instância:', error);
        const errorMessage =
          (error as ApiError)?.response?.data?.message ||
          'Erro ao alterar status da instância';
        toast.error(errorMessage);
      }
    };

    // Resetar contadores
    const handleResetCounters = async () => {
      try {
        await api.post(`/campaigns/${campaignId}/instances/reset`);
        toast.success('Contadores resetados com sucesso');
        await loadCampaignStats();
      } catch (error: unknown) {
        console.error('Erro ao resetar contadores:', error);
        const errorMessage =
          (error as ApiError)?.response?.data?.message ||
          'Erro ao resetar contadores';
        toast.error(errorMessage);
      }
    };

    // Alternar rotação
    const handleToggleRotation = () => {
      const newRotationState = !useRotation;
      setUseRotation(newRotationState);
      onRotationChange?.(newRotationState);

      if (!newRotationState) {
        // Se desativando rotação, limpar dados
        setSelectedInstances([]);
        setCampaignStats(null);
      }
    };

    // Funções auxiliares
    const getStrategyIcon = (strategy: string) => {
      switch (strategy) {
        case 'RANDOM':
          return <FaRandom className="w-4 h-4" />;
        case 'SEQUENTIAL':
          return <FaList className="w-4 h-4" />;
        case 'LOAD_BALANCED':
          return <FaBalanceScale className="w-4 h-4" />;
        default:
          return <FaRandom className="w-4 h-4" />;
      }
    };

    const getStrategyDescription = (strategy: string) => {
      switch (strategy) {
        case 'RANDOM':
          return 'Seleção aleatória de instâncias';
        case 'SEQUENTIAL':
          return 'Rotação sequencial (round-robin)';
        case 'LOAD_BALANCED':
          return 'Distribuição baseada na carga';
        default:
          return '';
      }
    };

    const getConnectionStatusColor = (status: string) => {
      switch (status) {
        case 'CONNECTED':
          return 'text-green-400';
        case 'CONNECTING':
          return 'text-yellow-400';
        case 'DISCONNECTED':
          return 'text-red-400';
        default:
          return 'text-gray-400';
      }
    };

    const getConnectionStatusIcon = (status: string) => {
      switch (status) {
        case 'CONNECTED':
          return '🟢';
        case 'CONNECTING':
          return '🟡';
        case 'DISCONNECTED':
          return '🔴';
        default:
          return '⚪';
      }
    };

    // Filtrar instâncias conectadas
    const connectedInstances = instances.filter(
      (instance) =>
        instance.connectionStatus === 'CONNECTED' ||
        instance.connectionStatus === 'OPEN',
    );

    return (
      <div className={cn('space-y-6', className)}>
        {/* Header da Seção */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-electric/20 rounded-lg">
              <FaRoute className="w-5 h-5 text-electric" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Rotação de Instâncias
              </h3>
              <p className="text-sm text-white/60">
                Distribua mensagens entre múltiplas instâncias para
                evitar banimentos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleRotation}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all duration-200',
              useRotation
                ? 'bg-neon-green text-black'
                : 'bg-electric/10 text-white hover:bg-electric/20',
            )}
          >
            {useRotation ? 'Rotação Ativa' : 'Ativar Rotação'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {useRotation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Configuração de Estratégia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Estratégia de Rotação
                  </label>
                  <div className="space-y-2">
                    {(
                      ['RANDOM', 'SEQUENTIAL', 'LOAD_BALANCED'] as const
                    ).map((strategy) => (
                      <button
                        type="button"
                        key={strategy}
                        onClick={() => setRotationStrategy(strategy)}
                        className={cn(
                          'w-full p-3 rounded-lg border transition-all duration-200 text-left',
                          rotationStrategy === strategy
                            ? 'border-neon-green bg-neon-green/10 text-neon-green'
                            : 'border-electric/30 bg-electric/10 text-white hover:border-electric/50',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {getStrategyIcon(strategy)}
                          <div>
                            <div className="font-medium">
                              {strategy.replace('_', ' ')}
                            </div>
                            <div className="text-xs opacity-70">
                              {getStrategyDescription(strategy)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Limite de Mensagens por Instância
                  </label>
                  <input
                    type="number"
                    value={maxMessagesPerInstance}
                    onChange={(e) =>
                      setMaxMessagesPerInstance(Number(e.target.value))
                    }
                    min="1"
                    max="1000"
                    className="w-full p-3 bg-electric/10 border border-electric/30 rounded-lg text-white focus:ring-2 focus:ring-neon-green focus:border-transparent"
                    placeholder="100"
                  />
                  <p className="text-xs text-white/60 mt-2">
                    Deixe vazio para sem limite
                  </p>
                </div>
              </div>

              {/* Seleção de Instâncias */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Instâncias para Rotação ({connectedInstances.length}{' '}
                  conectadas)
                </label>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-electric border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : connectedInstances.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <p>Nenhuma instância conectada disponível</p>
                    <p className="text-sm">
                      Conecte suas instâncias WhatsApp primeiro
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {connectedInstances.map((instance) => (
                      <button
                        type="button"
                        key={instance.id}
                        onClick={() => {
                          if (
                            selectedInstances.includes(
                              instance.instanceName,
                            )
                          ) {
                            setSelectedInstances((prev) =>
                              prev.filter(
                                (name) =>
                                  name !== instance.instanceName,
                              ),
                            );
                          } else {
                            setSelectedInstances((prev) => [
                              ...prev,
                              instance.instanceName,
                            ]);
                          }
                        }}
                        className={cn(
                          'p-3 rounded-lg border transition-all duration-200 text-left',
                          selectedInstances.includes(
                            instance.instanceName,
                          )
                            ? 'border-neon-green bg-neon-green/10'
                            : 'border-electric/30 bg-electric/10 hover:border-electric/50',
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={getConnectionStatusColor(
                                instance.connectionStatus,
                              )}
                            >
                              {getConnectionStatusIcon(
                                instance.connectionStatus,
                              )}
                            </span>
                            <span className="font-medium text-white">
                              {instance.instanceName}
                            </span>
                          </div>
                          {selectedInstances.includes(
                            instance.instanceName,
                          ) && (
                              <FaCheck className="w-4 h-4 text-neon-green" />
                            )}
                        </div>

                        {instance.profileName && (
                          <div className="text-xs text-white/60 mb-1">
                            {instance.profileName}
                          </div>
                        )}

                        {instance.warmupStatus && (
                          <div className="text-xs text-white/60">
                            Aquecimento:{' '}
                            {instance.warmupStatus.progress.toFixed(1)}%
                            {instance.warmupStatus.isRecommended && (
                              <span className="ml-1 text-yellow-400">
                                ⭐
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Estatísticas da Campanha */}
              {campaignStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-electric/5 border border-electric/20 rounded-lg p-4"
                >
                  <h4 className="text-sm font-medium text-white mb-3">
                    Estatísticas da Rotação
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-green">
                        {campaignStats.totalInstances}
                      </div>
                      <div className="text-xs text-white/60">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {campaignStats.activeInstances}
                      </div>
                      <div className="text-xs text-white/60">
                        Ativas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {campaignStats.connectedInstances}
                      </div>
                      <div className="text-xs text-white/60">
                        Conectadas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {campaignStats.totalMessagesSent}
                      </div>
                      <div className="text-xs text-white/60">
                        Enviadas
                      </div>
                    </div>
                  </div>

                  {/* Lista de Instâncias com Controles */}
                  <div className="space-y-2">
                    {campaignStats.instances.map((instance) => (
                      <div
                        key={instance.instanceName}
                        className="flex items-center justify-between p-3 bg-electric/10 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={getConnectionStatusColor(
                              instance.connectionStatus,
                            )}
                          >
                            {getConnectionStatusIcon(
                              instance.connectionStatus,
                            )}
                          </span>
                          <div>
                            <div className="font-medium text-white">
                              {instance.instanceName}
                            </div>
                            <div className="text-xs text-white/60">
                              {instance.messagesSent} /{' '}
                              {instance.maxMessages || '∞'} mensagens
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleInstance(
                                instance.instanceName,
                                !instance.isActive,
                              )
                            }
                            className={cn(
                              'p-1 rounded transition-colors',
                              instance.isActive
                                ? 'text-green-400 hover:text-green-300'
                                : 'text-red-400 hover:text-red-300',
                            )}
                            title={
                              instance.isActive ? 'Desativar' : 'Ativar'
                            }
                          >
                            {instance.isActive ? (
                              <FaPause className="w-3 h-3" />
                            ) : (
                              <FaPlay className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={handleResetCounters}
                      className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
                    >
                      Resetar Contadores
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleConfigureRotation}
                  disabled={
                    isConfiguring || selectedInstances.length === 0
                  }
                  className="flex-1 px-4 py-3 bg-neon-green text-black rounded-lg font-medium hover:bg-neon-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isConfiguring ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Configurando...
                    </div>
                  ) : (
                    'Configurar Rotação'
                  )}
                </button>

                {campaignStats && (
                  <button
                    type="button"
                    onClick={handleRemoveRotation}
                    disabled={isConfiguring}
                    className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Remover Rotação
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
