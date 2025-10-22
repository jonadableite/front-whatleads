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
import { ImportLeadsModal } from '../components/leads/ImportLeadsModal';
import { ProgressModal } from '../components/ProgressModal';
import { SpinTaxEditor } from '../components/SpinTaxEditor';
import api from '../lib/api';
import { cn, getWarmupProgressColor } from '../lib/utils';
import { authService } from '../services/auth.service';
import { calculateWarmupProgress } from '../services/instance.service';
import type { Instancia, StartCampaignPayload } from '../types';
import { SpinTaxValidationResult } from '../types/spintax.types';

// Funções utilitárias para formatação de data brasileira
const formatDateToBrazilian = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTimeToBrazilian = (date: Date): string => {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const formatDateTimeToBrazilian = (date: Date): string => {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Converte data do formato brasileiro DD/MM/AAAA para formato ISO AAAA-MM-DD
const convertBrazilianDateToISO = (brazilianDate: string): string => {
  const [day, month, year] = brazilianDate.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Converte data do formato ISO AAAA-MM-DD para formato brasileiro DD/MM/AAAA
const convertISODateToBrazilian = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

// Tipos específicos para melhor type safety
type MediaType = 'none' | 'image' | 'audio' | 'video';
type SendType = 'now' | 'scheduled';
type DispatchMode = 'new' | 'existing';
type CampaignStatus = 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
type SegmentType = 'ALTAMENTE_ENGAJADO' | 'MODERADAMENTE_ENGAJADO' | 'LEVEMENTE_ENGAJADO' | 'BAIXO_ENGAJAMENTO';

interface CampaignStatistics {
  totalLeads: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  type: string;
  instance: string;
  connectionStatus: string;
  progress: number;
  statistics: CampaignStatistics | null;
}

interface MediaPayload {
  type: MediaType;
  base64: string;
  fileName: string;
  mimetype: string;
}

interface FormValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export default function Disparos() {
  const navigate = useNavigate();

  // Estados com tipagem específica
  const [instances, setInstances] = useState<Instancia[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('none');
  const [totalNumbers, setTotalNumbers] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [base64Image, setBase64Image] = useState<string>('');
  const [base64Video, setBase64Video] = useState<string>('');
  const [base64Audio, setBase64Audio] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [sendType, setSendType] = useState<SendType>('now');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [minDelay, setMinDelay] = useState<number>(5);
  const [maxDelay, setMaxDelay] = useState<number>(30);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus | null>(null);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isLoadingInstances, setIsLoadingInstances] = useState<boolean>(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>('new');
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [useRotation, setUseRotation] = useState<boolean>(false);
  const [useSegmentation, setUseSegmentation] = useState<boolean>(false);
  const [selectedSegment, setSelectedSegment] = useState<SegmentType | ''>('');
  const [spinTaxValidation, setSpinTaxValidation] = useState<SpinTaxValidationResult | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

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
      }
    } else {
      setLeadCount(null);
    }
  };

  // Função para buscar contagem de leads com tipagem melhorada
  const fetchLeadCount = async (
    campaignId: string,
    segment: SegmentType,
  ): Promise<{ count: number }> => {
    try {
      const response = await api.get<{ count: number }>(
        `/api/campaigns/${campaignId}/leads/count`,
        {
          params: { segment },
        },
      );

      const count = response.data.count;
      setLeadCount(count);

      // Feedback visual melhorado
      if (count === 0) {
        toast.warning(`Nenhum lead encontrado no segmento "${segment}"`);
      } else {
        toast.success(`${count} leads encontrados no segmento selecionado`);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contagem de leads:', error);
      setLeadCount(null);
      throw error;
    }
  };

  // Função para lidar com mudança de arquivo com tipagem melhorada
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setTotalNumbers(0);
      return;
    }

    // Validação de tipo de arquivo
    const allowedTypes = ['.txt', '.csv'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Formato de arquivo não suportado. Use apenas arquivos .txt ou .csv');
      event.target.value = '';
      return;
    }

    // Validação de tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('Arquivo muito grande. O tamanho máximo é 10MB');
      event.target.value = '';
      return;
    }

    setFile(selectedFile);

    // Ler arquivo para contar números
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      if (content) {
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        setTotalNumbers(lines.length);
        toast.success(`${lines.length} contatos carregados com sucesso`);
      }
    };

    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo');
      setFile(null);
      setTotalNumbers(0);
    };

    reader.readAsText(selectedFile);
  };

  // Função para retomar a campanha
  const handleResumeCampaign = async (): Promise<void> => {
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
      if ((error as any).response) {
        console.error(
          'Detalhes da resposta de erro:',
          (error as any).response.data,
        );
      }

      toast.error(`Erro ao retomar campanha: ${(error as Error).message}`);
    }
  };

  // Função para cancelar a campanha
  const handleCancelCampaign = async (): Promise<void> => {
    try {
      await api.post(`/api/campaigns/${selectedCampaign}/stop`);
      toast.success('Campanha cancelada com sucesso!');
      setIsModalOpen(false); // Fecha o modal caso a campanha seja cancelada
    } catch (error) {
      console.error('Erro ao cancelar campanha:', error);
      toast.error('Erro ao cancelar campanha.');
    }
  };

  // Função para importar leads
  const handleImportLeads = async (
    campaignId: string,
    file: File,
  ): Promise<void> => {
    try {
      // Verificação adicional
      if (!file) {
        toast.error('Nenhum arquivo selecionado');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        `/api/campaigns/${campaignId}/leads/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Resposta da importação:', response.data);

      if (response.data.success) {
        toast.success(
          `${response.data.count} leads importados com sucesso!`,
        );
        // Atualizar dados se necessário
        await fetchData();
      } else {
        throw new Error(
          response.data.message || 'Erro ao importar leads',
        );
      }
    } catch (error) {
      console.error('Erro ao importar leads:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao importar leads',
      );
      throw error;
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const initializeData = async (): Promise<void> => {
      const isMounted = true;
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
    };

    initializeData();
  }, [navigate]);

  useEffect(() => {
    // Crie uma função para comparar instâncias de forma mais robusta
    const hasSignificantChange = (
      prevInstances: Instancia[],
      newInstances: Instancia[],
    ): boolean => {
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
  const fetchData = async (): Promise<void> => {
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

  const handleMediaChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação de tamanho do arquivo
    const maxSize = mediaType === 'video' ? 16 * 1024 * 1024 : 10 * 1024 * 1024; // 16MB para vídeo, 10MB para outros
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Tamanho máximo: ${mediaType === 'video' ? '16MB' : '10MB'}`);
      event.target.value = '';
      return;
    }

    // Limpar estados anteriores
    setBase64Image('');
    setBase64Video('');
    setBase64Audio('');

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        // Validar se o resultado é válido
        if (!base64String || !base64String.includes(',')) {
          toast.error('Erro ao processar arquivo. Tente novamente.');
          return;
        }

        const base64Content = base64String.split(',')[1];

        // Validar se o base64 é válido
        if (!base64Content || base64Content.trim().length === 0) {
          toast.error('Erro ao converter arquivo para base64. Tente novamente.');
          return;
        }

        // Validar formato base64
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(base64Content)) {
          toast.error('Arquivo corrompido. Tente novamente.');
          return;
        }

        // Criar preview URL para visualização
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrl(previewUrl);

        // Armazenar o conteúdo base64 apropriado
        switch (mediaType) {
          case 'image':
            setBase64Image(base64Content);
            toast.success('Imagem carregada com sucesso!');
            break;
          case 'video':
            setBase64Video(base64Content);
            toast.success('Vídeo carregado com sucesso!');
            break;
          case 'audio':
            setBase64Audio(base64Content);
            toast.success('Áudio carregado com sucesso!');
            break;
        }

        console.log('Mídia processada:', {
          type: mediaType,
          fileName: file.name,
          fileSize: file.size,
          base64Length: base64Content.length,
          base64Preview: base64Content.substring(0, 50) + "..."
        });
      };

      reader.onerror = () => {
        toast.error('Erro ao ler arquivo. Tente novamente.');
        console.error('FileReader error');
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

  // Função para remover mídia selecionada
  const handleRemoveMedia = () => {
    // Limpar preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    // Limpar estados de mídia
    setBase64Image('');
    setBase64Video('');
    setBase64Audio('');

    // Limpar input file
    const fileInput = document.querySelector('input[type="file"][accept*="image"], input[type="file"][accept*="audio"], input[type="file"][accept*="video"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    toast.success('Mídia removida com sucesso');
  };

  // Função para comprimir imagens
  const compressImage = (
    file: File,
    maxSizeMB = 2,
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        new Compressor(file, {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
          success(result) {
            console.log('Compressão inicial:', {
              originalSize: file.size,
              compressedSize: result.size,
              reduction: ((file.size - result.size) / file.size * 100).toFixed(2) + '%'
            });

            if (result.size > maxSizeMB * 1024 * 1024) {
              console.log('Primeira compressão não foi suficiente, comprimindo novamente...');
              new Compressor(file, {
                quality: 0.6,
                maxWidth: 1280,
                maxHeight: 720,
                success: (finalResult) => {
                  console.log('Compressão final:', {
                    originalSize: file.size,
                    finalSize: finalResult.size,
                    totalReduction: ((file.size - finalResult.size) / file.size * 100).toFixed(2) + '%'
                  });
                  resolve(finalResult);
                },
                error: (err) => {
                  console.error('Erro na segunda compressão:', err);
                  reject(err);
                },
              });
            } else {
              resolve(result);
            }
          },
          error: (err) => {
            console.error('Erro na primeira compressão:', err);
            reject(err);
          },
        });
      } catch (error) {
        console.error('Erro ao inicializar compressão:', error);
        reject(error);
      }
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
    // Validação de instância (apenas se não estiver usando rotação)
    if (!useRotation && !selectedInstance) {
      toast.error('Selecione uma instância para o disparo');
      return false;
    }

    // Validação de campanha
    if (!selectedCampaign) {
      toast.error('Selecione uma campanha para continuar');
      return false;
    }

    // Validação específica para modo "usar base existente"
    if (dispatchMode === 'existing') {
      const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);

      if (!selectedCampaignData) {
        toast.error('Campanha selecionada não encontrada. Por favor, selecione uma campanha válida.');
        return false;
      }

      // Verificar se a campanha tem leads disponíveis
      if (useSegmentation && selectedSegment && leadCount === 0) {
        toast.error('Não há leads disponíveis no segmento selecionado. Escolha outro segmento ou desative a segmentação.');
        return false;
      }

      // Verificar se a campanha não está em execução (opcional - pode ser removido se quiser permitir)
      if (selectedCampaignData.status === 'running') {
        toast.warning('Atenção: Esta campanha já está em execução. Continuar criará um novo disparo.');
      }
    }

    // Validação de mensagem
    if (!message || message.trim().length === 0) {
      toast.error('Digite uma mensagem para o disparo');
      return false;
    }

    // Validação SpinTax
    if (spinTaxValidation && !spinTaxValidation.isValid) {
      toast.error('Corrija os erros de sintaxe SpinTax antes de continuar');
      return false;
    }

    // Validação de arquivo apenas no modo "new"
    if (dispatchMode === 'new' && !file) {
      toast.error('Selecione um arquivo de contatos (.txt ou .csv)');
      return false;
    }

    // Validação de mídia apenas se um tipo de mídia foi selecionado
    if (mediaType === 'image' && !base64Image) {
      toast.error('Selecione uma imagem ou altere o tipo de mídia para "Nenhuma"');
      return false;
    }

    if (mediaType === 'video' && !base64Video) {
      toast.error('Selecione um vídeo ou altere o tipo de mídia para "Nenhuma"');
      return false;
    }

    if (mediaType === 'audio' && !base64Audio) {
      toast.error('Selecione um áudio ou altere o tipo de mídia para "Nenhuma"');
      return false;
    }

    // Validação de agendamento
    if (sendType === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        toast.error('Defina a data e hora para o agendamento');
        return false;
      }

      const scheduledDateTime = new Date(
        `${scheduledDate}T${scheduledTime}`,
      );
      const now = new Date();

      // Permitir agendamentos para hoje, mas com pelo menos 2 minutos no futuro
      const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);
      if (scheduledDateTime < twoMinutesFromNow) {
        toast.error('O agendamento deve ser pelo menos 2 minutos no futuro');
        return false;
      }

      // Verificar se a data não é muito no passado (mais de 1 dia)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      if (scheduledDateTime < oneDayAgo) {
        toast.error('Não é possível agendar para datas antigas');
        return false;
      }
    }

    // Validação de delays
    if (minDelay >= maxDelay) {
      toast.error('O intervalo máximo deve ser maior que o intervalo mínimo');
      return false;
    }

    if (minDelay < 5) {
      toast.error('O intervalo mínimo deve ser de pelo menos 5 segundos');
      return false;
    }

    if (maxDelay > 120) {
      toast.error('O intervalo máximo não pode ser superior a 120 segundos');
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

      // Verificar se existem leads na campanha apenas se for um novo disparo
      if (dispatchMode === 'new') {
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
      }

      // Verificar se a resposta da API indica sucesso
      if (startResponse.data && (startResponse.data.success === true || startResponse.status === 200 || startResponse.status === 201)) {
        startProgressMonitoring(campaignId);
        toast.success('Campanha iniciada com sucesso!');
      } else {
        // Só mostrar erro se realmente houver um erro na resposta
        const errorMessage = startResponse.data?.message || startResponse.data?.error;
        if (errorMessage) {
          throw new Error(errorMessage);
        } else {
          // Se não há mensagem de erro específica, considerar como sucesso
          startProgressMonitoring(campaignId);
          toast.success('Campanha iniciada com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error);

      // Verificar se é realmente um erro ou apenas uma resposta sem o campo success
      if (error.response && error.response.status >= 200 && error.response.status < 300) {
        // Se o status HTTP indica sucesso, tratar como sucesso mesmo sem o campo success
        startProgressMonitoring(campaignId);
        toast.success('Campanha iniciada com sucesso!');
      } else {
        // Só mostrar erro se for realmente um erro
        toast.error(
          error instanceof Error
            ? error.message
            : 'Erro ao iniciar campanha',
        );
        setIsModalOpen(false);
        setCampaignStatus(null);
      }
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
          `/api/scheduler/${selectedCampaign}/schedule`,
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
          data-tour="dispatches-container"
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
                          className="bg-gray-800 text-gray-300"
                        >
                          {isLoadingInstances
                            ? 'Carregando instâncias...'
                            : useRotation
                              ? 'Rotação Ativa - Seleção Automática'
                              : 'Selecione a Instância'}
                        </option>
                        {instances.map((instance) => {
                          const warmupProgress = calculateWarmupProgress(instance);

                          return (
                            <option
                              key={instance.id}
                              value={instance.id}
                              className={cn(
                                'bg-gray-800 text-gray-300',
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
                              {warmupProgress >= 0 && (
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
                                  ({warmupProgress.toFixed(2)}%)
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

                                {selectedInstanceData && (
                                  <div className="text-sm text-white/80 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white/50 rounded-full" />
                                    <span>
                                      Aquecimento:{' '}
                                      <span
                                        className={`${getWarmupProgressColor(
                                          calculateWarmupProgress(selectedInstanceData) || 0,
                                        )}`}
                                      >
                                        {calculateWarmupProgress(selectedInstanceData).toFixed(
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
                          className="bg-gray-800 text-gray-300"
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
                              'bg-gray-800 text-gray-300',
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
                    <SpinTaxEditor
                      value={message}
                      onChange={setMessage}
                      onValidation={setSpinTaxValidation}
                      placeholder="Digite sua mensagem aqui...\n\nExemplo com SpinTax: {Olá|Oi|E aí} {pessoal|galera|amigos}! Como {vocês estão|vai|está tudo}?"
                      showPreview={true}
                      data-tour="message-editor"
                      previewCount={3}
                      className="spintax-editor-dark"
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
                        className="bg-gray-800 text-gray-300"
                      >
                        Nenhuma (Apenas Texto)
                      </option>
                      <option
                        value="image"
                        className="bg-gray-800 text-gray-300"
                      >
                        Imagem
                      </option>
                      <option
                        value="audio"
                        className="bg-gray-800 text-gray-300"
                      >
                        Áudio
                      </option>
                      <option
                        value="video"
                        className="bg-gray-800 text-gray-300"
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
                      <label className="flex items-center justify-center w-full h-[58px] bg-electric/10 border border-electric rounded-xl cursor-pointer hover:bg-electric/20 transition-all duration-300" data-tour="media-upload">
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
                    <div className="mt-4 rounded-xl overflow-hidden bg-electric/10 border border-electric relative group">
                      {/* Botão de remoção */}
                      <button
                        type="button"
                        onClick={handleRemoveMedia}
                        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                        title="Remover mídia"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>

                      {/* Preview da mídia */}
                      {mediaType === 'image' && (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview da imagem"
                            className="w-full h-auto object-cover max-h-64"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-sm font-medium">
                              Imagem selecionada
                            </p>
                          </div>
                        </div>
                      )}
                      {mediaType === 'audio' && (
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793l-4.146-3.317a1 1 0 00-.632-.226H2a1 1 0 01-1-1V7.5a1 1 0 011-1h1.605a1 1 0 00.632-.226l4.146-3.317a1 1 0 011.617.793zM14.657 5.757a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 4.243 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-1.636-.525-3.153-1.414-4.243a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-white font-medium">Áudio selecionado</p>
                          </div>
                          <audio controls className="w-full">
                            <source
                              src={previewUrl}
                              type="audio/mpeg"
                            />
                            Seu navegador não suporta o elemento de áudio.
                          </audio>
                        </div>
                      )}
                      {mediaType === 'video' && (
                        <div className="relative">
                          <video controls className="w-full max-h-64">
                            <source
                              src={previewUrl}
                              type="video/mp4"
                            />
                            Seu navegador não suporta o elemento de vídeo.
                          </video>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-sm font-medium">
                              Vídeo selecionado
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-white mb-2">
                    Modo de Disparo
                  </label>
                  <div className="flex gap-4">
                    <div className="flex gap-2">
                      {/* <button
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
                      </button> */}
                      {dispatchMode === 'new' && (
                        <button
                          type="button"
                          onClick={() => setIsImportModalOpen(true)}
                          className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-neon-green text-black font-bold hover:bg-blue-500/30 transition-all border border-blue-500/30"
                          title="Importar leads para campanha existente"
                        >
                          <FiUpload className="w-4 h-4" />
                          Importar Novos Leads
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDispatchMode('existing')}
                      className={cn(
                        'flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-all border border-blue-500/30',
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
                          <option value="" className="bg-gray-800 text-gray-300">Todos os segmentos</option>
                          <option value="ALTAMENTE_ENGAJADO" className="bg-gray-800 text-gray-300">
                            Altamente Engajado
                          </option>
                          <option value="MODERADAMENTE_ENGAJADO" className="bg-gray-800 text-gray-300">
                            Moderadamente Engajado
                          </option>
                          <option value="LEVEMENTE_ENGAJADO" className="bg-gray-800 text-gray-300">
                            Levemente Engajado
                          </option>
                          <option value="BAIXO_ENGAJAMENTO" className="bg-gray-800 text-gray-300">
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
                          'flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-all border border-blue-500/30',
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
                          'flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-all border border-blue-500/30',
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
                          min={new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
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
                    data-tour="launch-btn"
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

          {/* Modal de Importação de Leads */}
          <ImportLeadsModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportLeads}
            campaigns={campaigns}
            disableImport={false}
            totalLeads={0}
            maxLeads={10000}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
