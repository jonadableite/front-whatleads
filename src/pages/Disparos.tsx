// src/pages/Disparos.tsx
import { ApiError } from '@/types/error';
import Compressor from 'compressorjs';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { FaClock, FaRocket, FaWhatsapp } from 'react-icons/fa';
import { FiDatabase, FiUpload } from 'react-icons/fi';
import {
  IoMdImage,
  IoMdMusicalNote,
  IoMdVideocam,
} from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GetInstancesAction } from '../actions';
import { InstanceRotationConfig } from '../components/InstanceRotationConfig';
import { ProgressModal } from '../components/ProgressModal';
import api from '../lib/api';
import { cn, getWarmupProgressColor } from '../lib/utils';
import { authService } from '../services/auth.service';
import { calculateWarmupProgress } from '../services/instance.service';
import type { Instancia, StartCampaignPayload } from '../types';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  instance: string;
  connectionStatus: string;
  progress: number;
  statistics: {
    totalLeads: number;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    failedCount: number;
  } | null;
}

export default function Disparos() {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<Instancia[]>([]);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState('none');
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [base64Image, setBase64Image] = useState('');
  const [base64Video, setBase64Video] = useState('');
  const [base64Audio, setBase64Audio] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [sendType, setSendType] = useState<'now' | 'scheduled'>(
    'now',
  );
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [minDelay, setMinDelay] = useState(5);
  const [maxDelay, setMaxDelay] = useState(30);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<string | null>(
    null,
  );
  const [isStarting, setIsStarting] = useState(false);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [dispatchMode, setDispatchMode] = useState<
    'new' | 'existing'
  >('new');
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [useRotation, setUseRotation] = useState(false);
  const [useSegmentation, setUseSegmentation] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('');

  // Função para lidar com a mudança de segmento
  const handleSegmentChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const segment = e.target.value;
    setSelectedSegment(segment);

    console.log('Selected Campaign:', selectedCampaign);
    console.log('Selected Segment:', segment);

    if (segment && selectedCampaign) {
      try {
        const response = await fetchLeadCount(
          selectedCampaign,
          segment,
        );
        console.log('Lead Count Response:', response); // Adicione este log
      } catch (error) {
        console.error('Erro ao obter contagem de leads:', error);
        toast.error(
          'Não foi possível obter a contagem de leads para este segmento.',
        );
        setLeadCount(null);
      }
    } else {
      setLeadCount(null);
    }
  };

  // Função para contagem de leads seguimentados
  const fetchLeadCount = useCallback(
    async (campaignId: string, segment: string) => {
      try {
        const response = await api.get(
          `/api/campaigns/${campaignId}/lead-count`,
          {
            params: { segmentation: segment },
          },
        );

        console.log('Lead Count Response:', response.data);
        setLeadCount(response.data.data.count);
        return response.data.data.count;
      } catch (error) {
        console.error('Erro ao buscar contagem de leads:', error);
        setLeadCount(null);
        throw error;
      }
    },
    [],
  );

  // Função para pausar a campanha
  // const handlePauseCampaign = async () => {
  // 	console.log(
  // 		"Chamando handlePauseCampaign() - Enviando requisição para pausar campanha",
  // 	);
  // 	try {
  // 		await api.post(`/campaigns/${selectedCampaign}/pause`);
  // 		toast.success("Campanha pausada com sucesso!");
  // 	} catch (error) {
  // 		console.error("Erro ao pausar campanha:", error);
  // 		toast.error("Erro ao pausar campanha.");
  // 	}
  // };

  // Função para retomar a campanha
  const handleResumeCampaign = async () => {
    try {
      const selectedInstanceData = instances.find(
        (instance) => instance.id === selectedInstance,
      );

      console.log('Instâncias disponíveis:', instances);
      console.log('Instância selecionada:', selectedInstance);
      console.log(
        'Dados da instância selecionada:',
        selectedInstanceData,
      );

      if (!selectedInstanceData) {
        throw new Error('Instância não encontrada.');
      }

      console.log('Tentando retomar campanha com:', {
        campaignId: selectedCampaign,
        instanceName: selectedInstanceData.instanceName,
      });

      await api.post(`/api/campaigns/${selectedCampaign}/resume`, {
        instanceName: selectedInstanceData.instanceName,
      });
      toast.success('Campanha retomada com sucesso!');
    } catch (error) {
      console.error('Erro ao retomar campanha:', error);

      // Log mais detalhado do erro
      if (error.response) {
        console.error(
          'Detalhes da resposta de erro:',
          error.response.data,
        );
      }

      toast.error(`Erro ao retomar campanha: ${error.message}`);
    }
  };

  // Função para cancelar a campanha
  const handleCancelCampaign = async () => {
    try {
      await api.post(`/api/campaigns/${selectedCampaign}/stop`);
      toast.success('Campanha cancelada com sucesso!');
      setIsModalOpen(false); // Fecha o modal caso a campanha seja cancelada
    } catch (error) {
      console.error('Erro ao cancelar campanha:', error);
      toast.error('Erro ao cancelar campanha.');
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const initializeData = async () => {
      let isMounted = true;
      setIsInitialLoading(true);
      try {
        await fetchData();
      } finally {
        if (isMounted) {
          setTimeout(() => {
            setIsInitialLoading(false);
          }, 2000);
        }
      }
      return () => {
        isMounted = false;
      };
    };

    initializeData();
  }, [navigate]);

  useEffect(() => {
    // Crie uma função para comparar instâncias de forma mais robusta
    const hasSignificantChange = (
      prevInstances: Instancia[],
      newInstances: Instancia[],
    ) => {
      if (prevInstances.length !== newInstances.length) return true;

      return newInstances.some((newInstance, index) => {
        const prevInstance = prevInstances[index];
        return (
          prevInstance.warmupStatus?.progress !==
          newInstance.warmupStatus?.progress ||
          prevInstance.connectionStatus !==
          newInstance.connectionStatus
        );
      });
    };

    const updatedInstances = instances.map((instanceItem) => {
      const warmupProgress = calculateWarmupProgress(instanceItem);

      // Verifica se o progresso mudou significativamente (margem de 0.1%)
      const progressChanged =
        Math.abs(
          (instanceItem.warmupStatus?.progress || 0) - warmupProgress,
        ) > 0.1;

      if (progressChanged) {
        return {
          ...instanceItem,
          warmupStatus: {
            ...instanceItem.warmupStatus,
            progress: warmupProgress,
          },
        };
      }

      return instanceItem;
    });

    // Só atualiza se realmente houver mudança significativa
    if (hasSignificantChange(instances, updatedInstances)) {
      setInstances(updatedInstances);
    }
  }, [instances]); // Mantenha a dependência, mas adicione a lógica de comparação

  // No fetchData ou na função que atualiza as instâncias
  const fetchData = async () => {
    try {
      setIsLoadingInstances(true);
      setIsLoadingCampaigns(true);
      const [instancesResponse, campaignsResponse] =
        await Promise.all([
          GetInstancesAction(),
          api.get<Campaign[]>('/api/campaigns'),
        ]);

      if (
        instancesResponse?.instances &&
        JSON.stringify(instancesResponse.instances) !==
        JSON.stringify(instances)
      ) {
        setInstances(instancesResponse.instances);
      }

      if (campaignsResponse.data) {
        setCampaigns(campaignsResponse.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error(
        'Erro ao carregar dados. Por favor, tente novamente.',
      );
    } finally {
      setIsLoadingInstances(false);
      setIsLoadingCampaigns(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content
          .split('\n')
          .filter((line) => line.trim() !== '');
        setTotalNumbers(lines.length);
      };
      reader.readAsText(file);
    }
  };

  const handleMediaChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limpar estados anteriores
    setBase64Image('');
    setBase64Video('');
    setBase64Audio('');

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];

        // Criar preview URL para visualização
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrl(previewUrl);

        // Armazenar o conteúdo base64 apropriado
        switch (mediaType) {
          case 'image':
            setBase64Image(base64Content);
            break;
          case 'video':
            setBase64Video(base64Content);
            break;
          case 'audio':
            setBase64Audio(base64Content);
            break;
        }
      };

      // Se for imagem, comprimir antes
      if (mediaType === 'image') {
        const compressedFile = await compressImage(file);
        reader.readAsDataURL(compressedFile);
      } else {
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro ao processar mídia:', error);
      toast.error('Erro ao processar mídia');
    }
  };

  // Função para comprimir imagens
  const compressImage = (
    file: File,
    maxSizeMB = 2,
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        success(result) {
          if (result.size > maxSizeMB * 1024 * 1024) {
            new Compressor(file, {
              quality: 0.6,
              maxWidth: 1280,
              maxHeight: 720,
              success: resolve,
              error: reject,
            });
          } else {
            resolve(result);
          }
        },
        error: reject,
      });
    });
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateForm = () => {
    if (!selectedInstance) {
      toast.error('Selecione uma instância');
      return false;
    }

    if (!selectedCampaign) {
      toast.error('Selecione uma campanha');
      return false;
    }

    if (!message) {
      toast.error('Digite uma mensagem');
      return false;
    }

    // Validar arquivo apenas no modo "new"
    if (dispatchMode === 'new' && !file) {
      toast.error('Selecione um arquivo de contatos');
      return false;
    }

    // Validar mídia apenas se um tipo de mídia foi selecionado
    if (mediaType === 'image' && !base64Image) {
      toast.error('Selecione uma imagem');
      return false;
    }

    if (mediaType === 'video' && !base64Video) {
      toast.error('Selecione um vídeo');
      return false;
    }

    if (mediaType === 'audio' && !base64Audio) {
      toast.error('Selecione um áudio');
      return false;
    }

    if (sendType === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        toast.error('Defina a data e hora do agendamento');
        return false;
      }

      const scheduledDateTime = new Date(
        `${scheduledDate}T${scheduledTime}`,
      );
      if (scheduledDateTime <= new Date()) {
        toast.error('A data de agendamento deve ser futura');
        return false;
      }
    }

    if (minDelay >= maxDelay) {
      toast.error('O delay máximo deve ser maior que o delay mínimo');
      return false;
    }

    return true;
  };

  const refetchCampaign = async () => {
    try {
      const response = await api.get<Campaign>(
        `/api/campaigns/${selectedCampaign}`,
      );
      const updatedCampaign = response.data;

      setCampaigns((prev) =>
        prev.map((camp) =>
          camp.id === selectedCampaign ? updatedCampaign : camp,
        ),
      );

      return updatedCampaign;
    } catch (error) {
      console.error('Erro ao atualizar dados da campanha:', error);
      throw error;
    }
  };

  const startCampaign = async (campaignId: string) => {
    try {
      setIsStarting(true);
      setIsModalOpen(true);
      setCampaignStatus('running');

      const selectedInstanceData = instances.find(
        (i) => i.id === selectedInstance,
      );

      if (!selectedInstanceData) {
        throw new Error('Instância não encontrada');
      }

      // Preparar payload da mídia
      let mediaPayload = null;
      if (mediaType === 'image' && base64Image) {
        mediaPayload = {
          type: 'image',
          base64: base64Image,
          fileName: 'image.jpg',
          mimetype: 'image/jpeg',
        };
      } else if (mediaType === 'video' && base64Video) {
        mediaPayload = {
          type: 'video',
          base64: base64Video,
          fileName: 'video.mp4',
          mimetype: 'video/mp4',
        };
      } else if (mediaType === 'audio' && base64Audio) {
        mediaPayload = {
          type: 'audio',
          base64: base64Audio,
          fileName: 'audio.mp3',
          mimetype: 'audio/mpeg',
        };
      }
      // Se mediaType for 'none', mediaPayload permanece null

      console.log('Media Payload preparado:', {
        mediaType,
        hasBase64Image: !!base64Image,
        hasBase64Video: !!base64Video,
        hasBase64Audio: !!base64Audio,
        mediaPayload: mediaPayload
          ? { ...mediaPayload, media: '[BASE64_DATA]' }
          : null,
      });

      const payload: StartCampaignPayload = {
        instanceName: selectedInstanceData.instanceName,
        message: message.trim(),
        media: mediaPayload,
        minDelay,
        maxDelay,
      };

      if (useSegmentation && selectedSegment) {
        payload.segmentation = { segment: selectedSegment }; // Correcting the segmentation assignment
      }

      const startResponse = await api.post(
        `/api/campaigns/${campaignId}/start`,
        payload,
      );

      if (dispatchMode === 'new' && file) {
        console.log('Importando novos leads...');
        const formData = new FormData();
        formData.append('file', file);

        const importResponse = await api.post(
          `/api/campaigns/${campaignId}/leads/import`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (!importResponse.data.success) {
          throw new Error(
            importResponse.data.message || 'Falha ao importar leads',
          );
        }
        console.log(
          'Leads importados com sucesso:',
          importResponse.data,
        );
      }

      // Adicione um delay pequeno para garantir que os leads foram processados
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verificar se existem leads na campanha
      console.log('Verificando leads existentes...');
      const campaignStats = await api.get(
        `/api/campaigns/${campaignId}/stats`,
      );
      if (!campaignStats.data.totalLeads) {
        throw new Error(
          'Não há leads disponíveis para disparo nesta campanha',
        );
      }
      console.log(
        'Total de leads na campanha:',
        campaignStats.data.totalLeads,
      );

      if (startResponse.data.success) {
        startProgressMonitoring(campaignId);
        toast.success('Campanha iniciada com sucesso!');
      } else {
        throw new Error(
          startResponse.data.message || 'Erro ao iniciar campanha',
        );
      }
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao iniciar campanha',
      );
      setIsModalOpen(false);
      setCampaignStatus(null);
    } finally {
      setIsStarting(false);
    }
  };

  const startProgressMonitoring = useCallback(
    (campaignId: string) => {
      const interval = setInterval(async () => {
        try {
          const response = await api.get(
            `/api/campaigns/${campaignId}/progress`,
          );
          const { status, statistics } = response.data.data;

          if (status === 'preparing') {
            // Progress handled by ProgressModal component
          } else {
            // Progress handled by ProgressModal component
          }

          setCampaignStatus(status);
          setTotalNumbers(statistics.totalLeads);

          if (status !== 'preparing' && status !== 'running') {
            clearInterval(interval);
            await refetchCampaign();
          }
        } catch (error) {
          console.error('Erro ao monitorar progresso:', error);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    },
    [],
  );

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (campaignStatus === 'running') {
      cleanup = startProgressMonitoring(selectedCampaign);
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [campaignStatus, selectedCampaign, startProgressMonitoring]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setIsStarting(true);

      if (dispatchMode === 'new') {
        toast.info('Importando leads...');
      }

      if (sendType === 'scheduled') {
        const scheduledDateTime = new Date(
          `${scheduledDate}T${scheduledTime}`,
        );
        const selectedInstanceData = instances.find(
          (i) => i.id === selectedInstance,
        );

        if (!selectedInstanceData) {
          toast.error('Instância não encontrada');
          return;
        }

        // Preparar payload da mídia agendamento
        let mediaPayload = null;
        if (mediaType === 'image' && base64Image) {
          mediaPayload = {
            type: 'image',
            base64: base64Image,
            fileName: 'image.jpg',
            mimetype: 'image/jpeg',
          };
        } else if (mediaType === 'video' && base64Video) {
          mediaPayload = {
            type: 'video',
            base64: base64Video,
            fileName: 'video.mp4',
            mimetype: 'video/mp4',
          };
        } else if (mediaType === 'audio' && base64Audio) {
          mediaPayload = {
            type: 'audio',
            base64: base64Audio,
            fileName: 'audio.mp3',
            mimetype: 'audio/mpeg',
          };
        }
        // Se mediaType for 'none', mediaPayload permanece null para agendamento

        console.log('Enviando requisição de agendamento:', {
          campaignId: selectedCampaign,
          scheduledDate: scheduledDateTime,
          instanceName: selectedInstanceData.instanceName,
          mediaPayload, // Incluindo mídia no payload
        });

        const response = await api.post(
          `/scheduler/${selectedCampaign}/schedule`,
          {
            scheduledDate: scheduledDateTime.toISOString(),
            instanceName: selectedInstanceData.instanceName,
            message,
            mediaPayload, // Incluindo mídia no payload
            minDelay,
            maxDelay,
          },
        );

        console.log('Resposta do agendamento:', response.data);

        if (response.data.success) {
          toast.success('Campanha agendada com sucesso!');
          navigate('/disparos/agendados');
        } else {
          throw new Error(
            response.data.message || 'Erro ao agendar campanha',
          );
        }
      } else {
        await startCampaign(selectedCampaign);
      }
    } catch (error: unknown) {
      console.error('Erro detalhado:', error);

      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        (error as ApiError)?.response?.data?.error ||
        (error as Error)?.message ||
        'Erro ao processar a solicitação';

      toast.error(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isInitialLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-deep/95 backdrop-blur-xl flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
              className="w-16 h-16 border-4 border-electric border-t-transparent rounded-full mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">
              Carregando
            </h2>
            <p className="text-white/60">Preparando o ambiente...</p>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full min-h-screen bg-gradient-to-br from-deep to-electric-dark p-4 md:p-8"
        >
          <div className="max-w-7xl mx-auto bg-deep/30 backdrop-blur-xl rounded-3xl border border-electric/30 overflow-hidden">
            <div className="p-6 lg:p-10">
              <h1 className="text-4xl lg:text-5xl font-bold mb-8 text-white text-center">
                Lançamento de Campanha
              </h1>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-medium text-white mb-2">
                        Instância WhatsApp
                      </label>
                      <select
                        disabled={isLoadingInstances || useRotation}
                        value={selectedInstance}
                        onChange={(e) => {
                          const selectedInstanceId = e.target.value;
                          setSelectedInstance(selectedInstanceId);

                          const selectedInstanceData = instances.find(
                            (instance) =>
                              instance.id === selectedInstanceId,
                          );

                          if (selectedInstanceData) {
                            console.log(
                              'Instância selecionada:',
                              selectedInstanceData,
                            );
                            if (selectedInstanceData.warmupStatus) {
                              console.log(
                                'Progresso de Warmup:',
                                selectedInstanceData.warmupStatus
                                  .progress,
                              );
                            }
                          }
                        }}
                        className={cn(
                          'w-full p-4 bg-electric/10 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green transition-all',
                          isLoadingInstances && 'animate-pulse',
                          useRotation &&
                          'opacity-50 cursor-not-allowed',
                          'appearance-none',
                        )}
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage:
                            'url(\'data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\')',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 10px top 50%',
                          backgroundSize: '24px auto',
                          paddingRight: '40px',
                        }}
                      >
                        <option
                          value=""
                          className="bg-deep text-white"
                        >
                          {isLoadingInstances
                            ? 'Carregando instâncias...'
                            : useRotation
                              ? 'Rotação Ativa - Seleção Automática'
                              : 'Selecione a Instância'}
                        </option>
                        {instances.map((instance) => {
                          const warmupProgress =
                            instance.warmupStatus?.progress ?? 0;

                          return (
                            <option
                              key={instance.id}
                              value={instance.id}
                              className={cn(
                                'bg-deep text-white',
                                instance.warmupStatus
                                  ?.isRecommended &&
                                'text-neon-green',
                                instance.connectionStatus ===
                                'OPEN' && 'font-medium',
                              )}
                            >
                              {instance.instanceName}
                              {instance.warmupStatus?.isRecommended &&
                                ' ⭐'}
                              {warmupProgress > 0 && (
                                <span
                                  className={cn(
                                    'ml-2 font-bold',
                                    warmupProgress >= 100
                                      ? 'text-green-500'
                                      : instance.connectionStatus !==
                                        'OPEN'
                                        ? 'text-yellow-500'
                                        : 'text-blue-500',
                                  )}
                                >
                                  ({warmupProgress.toFixed(1)}%)
                                </span>
                              )}
                            </option>
                          );
                        })}
                      </select>

                      {selectedInstance && !useRotation && (
                        <div className="mt-2 space-y-2">
                          {(() => {
                            const selectedInstanceData =
                              instances.find(
                                (instance) =>
                                  instance.id === selectedInstance,
                              );

                            return (
                              <>
                                {selectedInstanceData?.profileName && (
                                  <div className="text-sm text-white/80 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white/50 rounded-full" />
                                    <span>
                                      Nome do Perfil:{' '}
                                      {
                                        selectedInstanceData.profileName
                                      }
                                    </span>
                                  </div>
                                )}

                                {selectedInstanceData?.warmupStatus
                                  ?.progress !== undefined && (
                                    <div className="text-sm text-white/80 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-white/50 rounded-full" />
                                      <span>
                                        Aquecimento:{' '}
                                        <span
                                          className={`${getWarmupProgressColor(
                                            selectedInstanceData
                                              .warmupStatus?.progress ||
                                            0,
                                          )}`}
                                        >
                                          {selectedInstanceData.warmupStatus?.progress.toFixed(
                                            2,
                                          )}
                                          %
                                        </span>
                                      </span>
                                    </div>
                                  )}

                                {selectedInstanceData?.warmupStatus
                                  ?.isRecommended && (
                                    <div className="text-sm text-green-400 flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                      <span>
                                        Esta instância já possui mais de
                                        300 horas de aquecimento
                                      </span>
                                    </div>
                                  )}

                                <div
                                  className={cn(
                                    'text-sm flex items-center gap-2',
                                    selectedInstanceData?.connectionStatus ===
                                      'OPEN'
                                      ? 'text-green-400'
                                      : 'text-yellow-400',
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-2 h-2 rounded-full',
                                      selectedInstanceData?.connectionStatus ===
                                        'OPEN'
                                        ? 'bg-green-400'
                                        : 'bg-yellow-400',
                                    )}
                                  />
                                  <span>
                                    Status:{' '}
                                    {selectedInstanceData?.connectionStatus ===
                                      'OPEN'
                                      ? 'Conectado'
                                      : 'Desconectado'}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {useRotation && (
                        <div className="mt-2 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                          <div className="text-sm text-neon-green flex items-center gap-2">
                            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                            <span>
                              Rotacao de instâncias ativa - Seleção
                              automática
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="campaign-select"
                        className="block text-lg font-medium text-white mb-2"
                      >
                        Campanha
                      </label>
                      <select
                        id="campaign-select"
                        disabled={isLoadingCampaigns}
                        value={selectedCampaign}
                        onChange={(e) =>
                          setSelectedCampaign(e.target.value)
                        }
                        className={cn(
                          'w-full p-4 bg-electric/10 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green transition-all',
                          isLoadingCampaigns && 'animate-pulse',
                          'appearance-none', // Adicione esta classe
                        )}
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage:
                            'url(\'data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\')',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 10px top 50%',
                          backgroundSize: '24px auto',
                          paddingRight: '40px',
                        }}
                      >
                        <option
                          value=""
                          className="bg-deep text-white"
                        >
                          {isLoadingCampaigns
                            ? 'Carregando campanhas...'
                            : 'Selecione a Campanha'}
                        </option>
                        {campaigns.map((campaign) => (
                          <option
                            key={campaign.id}
                            value={campaign.id}
                            className={cn(
                              'bg-deep text-white',
                              campaign.status === 'running' &&
                              'text-neon-green',
                            )}
                          >
                            {campaign.name}
                            {campaign.status === 'running' &&
                              ' (Em execução)'}
                          </option>
                        ))}
                      </select>
                      {selectedCampaign && (
                        <div className="mt-2 space-y-2">
                          <div className="text-sm text-white/80">
                            <span>
                              Status:{' '}
                              {
                                campaigns.find(
                                  (c) => c.id === selectedCampaign,
                                )?.status
                              }
                            </span>
                          </div>
                          {campaigns.find(
                            (c) => c.id === selectedCampaign,
                          )?.statistics && (
                              <div className="text-sm text-white/80">
                                <span>
                                  Envios:{' '}
                                  {campaigns.find(
                                    (c) => c.id === selectedCampaign,
                                  )?.statistics?.totalLeads || 0}
                                </span>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-2">
                      Mensagem
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="w-full p-4 bg-electric/10 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green resize-none transition-all"
                      placeholder="Digite sua mensagem aqui..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-white mb-2">
                      Tipo de Mídia
                    </label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full p-4 bg-electric/10 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green transition-all appearance-none"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage:
                          'url(\'data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\')',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px top 50%',
                        backgroundSize: '24px auto',
                        paddingRight: '40px',
                      }}
                    >
                      <option
                        value="none"
                        className="bg-deep text-white"
                      >
                        Nenhuma (Apenas Texto)
                      </option>
                      <option
                        value="image"
                        className="bg-deep text-white"
                      >
                        Imagem
                      </option>
                      <option
                        value="audio"
                        className="bg-deep text-white"
                      >
                        Áudio
                      </option>
                      <option
                        value="video"
                        className="bg-deep text-white"
                      >
                        Vídeo
                      </option>
                    </select>
                  </div>

                  {/* Upload de mídia - só mostra se não for 'none' */}
                  {mediaType !== 'none' && (
                    <div>
                      <label className="block text-lg font-medium text-white mb-2">
                        Upload de Mídia
                      </label>
                      <label className="flex items-center justify-center w-full h-[58px] bg-electric/10 border border-electric rounded-xl cursor-pointer hover:bg-electric/20 transition-all duration-300">
                        <input
                          type="file"
                          onChange={handleMediaChange}
                          accept={
                            mediaType === 'image'
                              ? 'image/*'
                              : mediaType === 'audio'
                                ? 'audio/*'
                                : 'video/*'
                          }
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 text-white">
                          {mediaType === 'image' ? (
                            <IoMdImage size={24} />
                          ) : mediaType === 'audio' ? (
                            <IoMdMusicalNote size={24} />
                          ) : (
                            <IoMdVideocam size={24} />
                          )}
                          <span>
                            Upload{' '}
                            {mediaType === 'image'
                              ? 'Imagem'
                              : mediaType === 'audio'
                                ? 'Áudio'
                                : 'Vídeo'}
                          </span>
                        </div>
                      </label>
                    </div>
                  )}

                    {previewUrl && mediaType !== 'none' && (
                      <div className="mt-4 rounded-xl overflow-hidden bg-electric/10 border border-electric">
                        {mediaType === 'image' && (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-auto object-cover"
                          />
                        )}
                        {mediaType === 'audio' && (
                          <audio controls className="w-full">
                            <source
                              src={previewUrl}
                              type="audio/mpeg"
                            />
                            Seu navegador não suporta o elemento de
                            áudio.
                          </audio>
                        )}
                        {mediaType === 'video' && (
                          <video controls className="w-full">
                            <source
                              src={previewUrl}
                              type="video/mp4"
                            />
                            Seu navegador não suporta o elemento de
                            vídeo.
                          </video>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-2">
                      Modo de Disparo
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setDispatchMode('new')}
                        className={cn(
                          'flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all',
                          dispatchMode === 'new'
                            ? 'bg-neon-green text-black font-bold'
                            : 'bg-electric/10 text-white hover:bg-electric/20',
                        )}
                      >
                        <FiUpload className="mr-2" />
                        Importar Novos Leads
                      </button>
                      <button
                        type="button"
                        onClick={() => setDispatchMode('existing')}
                        className={cn(
                          'flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all',
                          dispatchMode === 'existing'
                            ? 'bg-neon-green text-black font-bold'
                            : 'bg-electric/10 text-white hover:bg-electric/20',
                        )}
                      >
                        <FiDatabase className="mr-2" />
                        Usar Base Existente
                      </button>
                    </div>
                  </div>

                {/* Configuração de Rotação de Instâncias */}
                {selectedCampaign && (
                  <InstanceRotationConfig
                    campaignId={selectedCampaign}
                    onInstanceChange={setSelectedInstance}
                    onRotationChange={setUseRotation}
                    className="border-t border-electric/30 pt-6"
                  />
                )}

                {dispatchMode === 'existing' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-lg font-medium text-white">
                        Segmentação de Leads
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setUseSegmentation(!useSegmentation)
                        }
                        className={cn(
                          'py-2 px-4 rounded-xl flex items-center gap-2 transition-all',
                          useSegmentation
                            ? 'bg-neon-green text-black font-bold'
                            : 'bg-electric/10 text-white hover:bg-electric/20',
                        )}
                      >
                        {useSegmentation
                          ? 'Segmentação Ativa'
                          : 'Sem Segmentação'}
                      </button>
                    </div>

                    {useSegmentation && (
                      <div className="bg-electric/10 p-4 rounded-xl space-y-4">
                        <select
                          value={selectedSegment}
                          onChange={handleSegmentChange}
                          className="w-full p-4 bg-deep/50 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green transition-all"
                        >
                          <option value="">Todos os segmentos</option>
                          <option value="ALTAMENTE_ENGAJADO">
                            Altamente Engajado
                          </option>
                          <option value="MODERADAMENTE_ENGAJADO">
                            Moderadamente Engajado
                          </option>
                          <option value="LEVEMENTE_ENGAJADO">
                            Levemente Engajado
                          </option>
                          <option value="BAIXO_ENGAJAMENTO">
                            Baixo Engajamento
                          </option>
                        </select>
                        {leadCount !== null && (
                          <p className="text-sm text-white/80">
                            Leads nesta segmentação: {leadCount}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {dispatchMode === 'new' && (
                  <div>
                    <label className="block text-lg font-medium text-white mb-2">
                      Lista de Contatos
                    </label>
                    <label className="flex items-center justify-center w-full h-[58px] bg-electric/10 border border-electric rounded-xl cursor-pointer hover:bg-electric/20 transition-all duration-300">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".txt,.csv"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-white">
                        <FaWhatsapp size={24} />
                        <span>Upload Lista de Contatos</span>
                      </div>
                    </label>
                    {totalNumbers > 0 && (
                      <p className="mt-2 text-white/80">
                        Total de contatos: {totalNumbers}
                      </p>
                    )}
                  </div>
                )}

                {/* Tipo de Envio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-medium text-white mb-2">
                      Modo de Lançamento
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setSendType('now')}
                        className={cn(
                          'flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all',
                          sendType === 'now'
                            ? 'bg-neon-green text-black font-bold'
                            : 'bg-electric/10 text-white hover:bg-electric/20',
                        )}
                      >
                        <FaRocket />
                        Imediato
                      </button>
                      <button
                        type="button"
                        onClick={() => setSendType('scheduled')}
                        className={cn(
                          'flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all',
                          sendType === 'scheduled'
                            ? 'bg-neon-green text-black font-bold'
                            : 'bg-electric/10 text-white hover:bg-electric/20',
                        )}
                      >
                        <FaClock />
                        Agendado
                      </button>
                    </div>
                  </div>

                  {sendType === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-lg font-medium text-white mb-2">
                          Data
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) =>
                            setScheduledDate(e.target.value)
                          }
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-4 bg-electric/10 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-medium text-white mb-2">
                          Hora
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) =>
                            setScheduledTime(e.target.value)
                          }
                          className="w-full p-4 bg-electric/10 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-white mb-2">
                      Intervalo Mínimo (segundos)
                    </label>
                    <input
                      type="number"
                      value={minDelay}
                      onChange={(e) =>
                        setMinDelay(Number(e.target.value))
                      }
                      min="5"
                      max="60"
                      className="w-full p-4 bg-electric/10 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-white mb-2">
                      Intervalo Máximo (segundos)
                    </label>
                    <input
                      type="number"
                      value={maxDelay}
                      onChange={(e) =>
                        setMaxDelay(Number(e.target.value))
                      }
                      min={minDelay}
                      max="120"
                      className="w-full p-4 bg-electric/10 border border-electric rounded-xl text-white focus:ring-2 focus:ring-neon-green transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      isInitialLoading ||
                      isStarting ||
                      isLoadingInstances ||
                      isLoadingCampaigns
                    }
                    className="px-8 py-4 bg-neon-green text-black rounded-xl font-bold text-lg hover:bg-electric hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStarting ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Iniciando...
                      </motion.div>
                    ) : isInitialLoading ||
                      isLoadingInstances ||
                      isLoadingCampaigns ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Carregando...
                      </motion.div>
                    ) : sendType === 'scheduled' ? (
                      'Agendar Campanha'
                    ) : (
                      'Lançar Campanha'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {isModalOpen && (
            <ProgressModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              campaignId={selectedCampaign}
              // onPause={handlePauseCampaign}
              onResume={handleResumeCampaign}
              onCancel={handleCancelCampaign}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
