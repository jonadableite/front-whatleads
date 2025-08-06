// src/pages/Campanhas.tsx

import { CampaignForm } from '@/components/campaign/CampaignForm';
import { DeleteConfirmationDialog } from '@/components/campaign/DeleteConfirmationDialog';
import { ImportLeadsModal } from '@/components/leads/ImportLeadsModal';
import { Button } from '@/components/ui/button';
import { DialogOverlay } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DialogContent } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import type {
  Campaign,
  CampaignCardProps,
  CampaignLeads,
  EmptyStateProps,
  StatsCardProps,
} from '@/interface';
import api from '@/lib/api';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { FaClock } from 'react-icons/fa';
import {
  FiBarChart2,
  FiDownload,
  FiEdit2,
  FiExternalLink,
  FiFileText,
  FiPlay,
  FiPlus,
  FiSquare,
  FiTrash2,
  FiUpload,
  FiUsers,
  FiVideo,
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Constantes para Animações
const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
};

const normalizeCampaignData = (
  campaign: any,
): Campaign & { leads: CampaignLeads } => {
  const stats = campaign.statistics || {
    totalLeads: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    failedCount: 0,
  };

  return {
    ...campaign,
    leads: {
      total: stats.totalLeads,
      sent: stats.sentCount,
      delivered: stats.deliveredCount,
      read: stats.readCount,
      failed: stats.failedCount,
    },
    progress: campaign.progress || 0,
    status: campaign.status || 'draft',
  };
};

const fetchCampaigns = async (): Promise<
  (Campaign & { leads: CampaignLeads })[]
> => {
  try {
    const { data } = await api.get<Campaign[]>('/campaigns');

    // Buscar estatísticas em paralelo para todas as campanhas
    const statsPromises = (Array.isArray(data) ? data : []).map(
      (campaign) =>
        api
          .get(`/campaigns/${campaign.id}/stats`)
          .then((response) => ({
            campaignId: campaign.id,
            statistics: response.data,
          }))
          .catch(() => ({
            campaignId: campaign.id,
            statistics: null,
          })),
    );

    const statsResults = await Promise.all(statsPromises);
    const statsMap = new Map(
      statsResults.map((result) => [
        result.campaignId,
        result.statistics,
      ]),
    );

    return (Array.isArray(data) ? data : []).map((campaign) =>
      normalizeCampaignData({
        ...campaign,
        statistics: statsMap.get(campaign.id),
      }),
    );
  } catch {
    console.error('Erro ao buscar campanhas:', Error);
    return [];
  }
};

// Componente para o Modal do YouTube
const YouTubeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}> = ({ isOpen, onClose, videoId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" />
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl bg-deep border border-electric rounded-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do Modal */}
          <div className="flex justify-between items-center p-4 bg-deep/90 border-b border-electric/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-electric/20 rounded-lg">
                <FiVideo className="w-5 h-5 text-electric" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Tutorial: Como Importar Leads
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm">
                  Aprenda como preparar e importar sua base de leads
                </DialogDescription>
              </div>
            </div>
            <DialogClose
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-electric/20 rounded-lg"
              onClick={onClose}
            >
              <FiX className="w-5 h-5" />
            </DialogClose>
          </div>
          {/* Vídeo */}
          <div className="relative aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Tutorial de Importação de Leads"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {/* Footer do Modal */}
          <div className="p-4 bg-deep/50 border-t border-electric/30">
            <div className="flex justify-between items-center">
              <p className="text-white/60 text-sm">
                Dúvidas? Entre em contato com nosso suporte
              </p>
              <Button
                onClick={onClose}
                className="bg-electric hover:bg-electric/80 text-deep"
              >
                Fechar
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// Componente para a seção de ajuda
const HelpSection: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const YOUTUBE_VIDEO_ID = '_IHj4V594Ho'; // Substitua pelo ID do seu vídeo

  // Função para baixar arquivo Exceal de exemplo
  const downloadExcelTemplate = () => {
    try {
      // Criar dados de exemplo para o Excel (formato correto CSV)
      const exampleData = [
        ['Nome', 'Telefone'],
        ['WhatLead', '5512988444921'],
        ['João Silva', '11999999999'],
        ['Maria Santos', '11888888888'],
        ['Carlos Oliveira', '11777777777'],
      ];

      // Converter para CSV (separado por vírgula)
      const csvContent = exampleData
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_leads_exemplo.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success('Template baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao baixar template');
    }
  };

  // Função para baixar planilha para tratamento
  const downloadProcessingTemplate = async () => {
    try {
      const fileUrl =
        'https://minioapi.whatlead.com.br:443/lucas/1753721776095-tratar_base.xlsx';
      const fileName = 'planilha_tratamento_leads.xlsx';

      // Fazer fetch do arquivo
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error('Arquivo não encontrado');
      }

      // Converter para blob
      const blob = await response.blob();

      // Criar URL do blob
      const url = window.URL.createObjectURL(blob);

      // Criar link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL do blob
      window.URL.revokeObjectURL(url);

      toast.success('Planilha de tratamento baixada!');
    } catch (error) {
      console.error('Erro ao baixar planilha:', error);
      toast.error('Erro ao baixar planilha - verifique sua conexão');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-deep/30 border border-electric/20 rounded-xl p-6 space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-electric/20 rounded-lg">
          <FiFileText className="w-6 h-6 text-electric" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            Centro de Ajuda
          </h3>
          <p className="text-white/60">
            Ferramentas para preparar e importar seus leads
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Botão para baixar template de exemplo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={downloadExcelTemplate}
            className="w-full h-auto p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-white flex flex-col items-center gap-3"
          >
            <FiDownload className="w-8 h-8 text-blue-400" />
            <div className="text-center">
              <p className="font-semibold">Template de Exemplo</p>
              <p className="text-sm text-white/60">
                Baixe um CSV com exemplos de como estruturar seus
                leads
              </p>
            </div>
          </Button>
        </motion.div>

        {/* Botão para baixar planilha de tratamento */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={downloadProcessingTemplate}
            className="w-full h-auto p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-white flex flex-col items-center gap-3"
          >
            <FiFileText className="w-8 h-8 text-green-400" />
            <div className="text-center">
              <p className="font-semibold">Planilha de Tratamento</p>
              <p className="text-sm text-white/60">
                Baixe uma planilha para organizar e tratar sua base
              </p>
            </div>
          </Button>
        </motion.div>

        {/* Botão para abrir vídeo tutorial */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setIsVideoModalOpen(true)}
            className="w-full h-auto p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-white flex flex-col items-center gap-3"
          >
            <FiVideo className="w-8 h-8 text-red-400" />
            <div className="text-center">
              <p className="font-semibold">Tutorial em Vídeo</p>
              <p className="text-sm text-white/60">
                Assista como preparar e importar seus leads
              </p>
            </div>
            <FiExternalLink className="w-4 h-4 text-white/40" />
          </Button>
        </motion.div>
      </div>

      {/* Dicas rápidas */}
      <div className="bg-deep/50 rounded-lg p-4 border border-electric/10">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-electric rounded-full" />
          Dicas Rápidas
        </h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex items-start gap-2">
            <span className="text-electric">•</span>
            Certifique-se de que os telefones estejam no formato (11)
            99999-9999
          </li>
          <li className="flex items-start gap-2">
            <span className="text-electric">•</span>
            Remova caracteres especiais dos nomes e empresas
          </li>
          <li className="flex items-start gap-2">
            <span className="text-electric">•</span>
            Verifique se todos os emails estão válidos
          </li>
        </ul>
      </div>

      {/* Modal do YouTube */}
      <YouTubeModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId={YOUTUBE_VIDEO_ID}
      />
    </motion.div>
  );
};

const Campanhas: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] =
    useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [visibleCampaigns, setVisibleCampaigns] = useState(6);

  const loadMore = () => {
    setVisibleCampaigns((prev) => prev + 6);
  };

  const {
    data: campaigns = [],
    isLoading,
    refetch,
  } = useQuery<
    (Campaign & { leads: CampaignLeads })[], // TData
    Error, // TError
    (Campaign & { leads: CampaignLeads })[], // TQueryFnData
    string[] // TQueryKey
  >({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: (data) => {
      if (Array.isArray(data) && data.length > 0) {
        return data.some((campaign) => campaign.status === 'running')
          ? 5000
          : false;
      }
      return false;
    },
    // @ts-ignore
    onError: (err: Error) => {
      console.error('Erro na query:', err);
      setError(
        'Erro ao carregar campanhas. Por favor, tente novamente.',
      );
    },
  });

  const filteredCampaigns = useMemo(() => {
    if (!Array.isArray(campaigns)) return [];
    return campaigns.filter(
      (campaign) =>
        campaign.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        (statusFilter && statusFilter !== 'all'
          ? campaign.status === statusFilter
          : true),
    );
  }, [campaigns, searchTerm, statusFilter]);

  const startCampaign = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/campaigns/${id}/start`);
      // Forçar refetch imediato após iniciar
      await refetch();
      return response;
    },
  });

  const pauseCampaign = useMutation({
    mutationFn: (id: string) =>
      api.post(`/campaigns/${id}/pause`),
  });

  const stopCampaign = useMutation({
    mutationFn: (id: string) =>
      api.post(`/campaigns/${id}/stop`),
  });

  const deleteCampaign = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
  });

  const createCampaign = useMutation({
    mutationFn: (data: Partial<Campaign>) =>
      api.post('/campaigns', data),
    onSuccess: () => {
      toast.success('Campanha criada com sucesso!');
      refetch();
    },
    onError: () => {
      toast.error('Erro ao criar campanha');
    },
  });

  const updateCampaign = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Campaign>;
    }) => api.put(`/campaigns/${id}`, data),
    onSuccess: () => {
      toast.success('Campanha atualizada com sucesso!');
      refetch();
    },
    onError: () => {
      toast.error('Erro ao atualizar campanha');
    },
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Função para importar leads
  const handleImportLeads = async (
    campaignId: string,
    file: File,
  ) => {
    try {
      // Verificação adicional
      if (!file) {
        toast.error('Nenhum arquivo selecionado');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        `/campaigns/${campaignId}/leads/import`,
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
        await refetch();
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

  const handleAction = async (
    action: 'start' | 'pause' | 'stop',
    id: string,
  ) => {
    try {
      if (action === 'start') {
        await startCampaign.mutateAsync(id);
        // Iniciar polling mais frequente
        const pollInterval = setInterval(() => {
          refetch();
        }, 2000);

        // Limpar polling após 30 segundos
        setTimeout(() => {
          clearInterval(pollInterval);
        }, 30000);
      }
      if (action === 'pause') await pauseCampaign.mutateAsync(id);
      if (action === 'stop') await stopCampaign.mutateAsync(id);

      await refetch();

      toast.success(
        `Campanha ${action === 'start'
          ? 'iniciada'
          : action === 'pause'
            ? 'pausada'
            : 'parada'
        } com sucesso!`,
      );
    } catch {
      toast.error('Erro ao executar ação na campanha');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign.mutateAsync(id);
      await refetch();
      toast.success('Campanha excluída com sucesso!');
    } catch {
      toast.error('Erro ao excluir campanha');
    }
  };

  const handleSubmit = async (data: Partial<Campaign>) => {
    try {
      if (selectedCampaign) {
        await updateCampaign.mutateAsync({
          id: selectedCampaign.id,
          data,
        });
      } else {
        await createCampaign.mutateAsync(data);
      }
      setIsModalOpen(false);
      setSelectedCampaign(null);
    } catch {
      console.error('Erro ao salvar campanha');
    }
  };

  const pageTransition = {
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: '-100%' },
  };

  const averageDeliveryRate = useMemo(() => {
    if (!filteredCampaigns?.length) return 0;

    const totalLeads = filteredCampaigns.reduce(
      (acc, curr) => acc + (curr.statistics?.totalLeads || 0),
      0,
    );

    const totalDelivered = filteredCampaigns.reduce(
      (acc, curr) => acc + (curr.statistics?.deliveredCount || 0),
      0,
    );

    return totalLeads
      ? ((totalDelivered / totalLeads) * 100).toFixed(2)
      : 0;
  }, [filteredCampaigns]);

  useEffect(() => {
    const interval = setInterval(() => {
      const runningCampaigns = filteredCampaigns.some(
        (campaign) => campaign.status === 'running',
      );

      if (runningCampaigns) {
        refetch();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch, filteredCampaigns]);

  // Componentes auxiliares
  const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    trend,
    trendLabel,
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-deep/50 rounded-xl p-6 border border-electric/30"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white/60">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2">
            {value}
          </h3>
        </div>
        <div className="p-3 bg-electric/20 rounded-lg">{icon}</div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
          {trendLabel && (
            <span className="text-white/40 text-sm">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );

  const CampaignCard: React.FC<CampaignCardProps> = ({
    campaign,
    onAction,
    onEdit,
    onDelete,
    isLoading,
  }) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
      useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
      setIsDeleting(true);
      try {
        await onDelete();
      } catch {
        toast.error('Erro ao excluir campanha');
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      }
    };

    if (isLoading) {
      return (
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="bg-deep/50 rounded-xl p-6 border border-electric/30"
        >
          <div className="animate-pulse space-y-4">
            {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
            <div className="h-6 bg-electric/20 rounded w-3/4"></div>
            <div className="h-4 bg-electric/20 rounded w-1/2" />
            <div className="space-y-3">
              <div className="h-2 bg-electric/20 rounded" />
              <div className="h-2 bg-electric/20 rounded w-5/6" />
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        layout
        className="bg-deep/50 rounded-xl p-6 border border-electric/30"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">
            {campaign.name}
          </h3>
          <StatusBadge
            status={campaign.status}
            scheduledDate={campaign.scheduledDate}
          />
        </div>

        <p className="text-white/60 mb-4">
          {campaign.description || 'Sem descrição'}
        </p>

        <div className="space-y-4">
          <ProgressBar progress={campaign.progress} />

          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="Leads"
              value={campaign.statistics?.totalLeads || 0}
            />
            <Stat
              label="Enviados"
              value={campaign.statistics?.sentCount || 0}
            />
            <Stat
              label="Entregues"
              value={campaign.statistics?.deliveredCount || 0}
            />
            <Stat
              label="Lidos"
              value={campaign.statistics?.readCount || 0}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <ActionButtons
            status={campaign.status}
            onStart={() => onAction('start', campaign.id)}
            onPause={() => onAction('pause', campaign.id)}
            onStop={() => onAction('stop', campaign.id)}
            campaignId={campaign.id}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <FiEdit2 />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              <FiTrash2 />
            </Button>
          </div>
        </div>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          campaignName={campaign.name}
        />
      </motion.div>
    );
  };

  const StatusBadge: React.FC<{
    status: string;
    scheduledDate?: string;
  }> = ({ status, scheduledDate }) => {
    const statusConfig = {
      running: {
        class: 'bg-green-500 animate-pulse',
        label: 'Em execução',
      },
      paused: {
        class: 'bg-yellow-500',
        label: 'Pausada',
      },
      completed: {
        class: 'bg-blue-500',
        label: 'Concluída',
      },
      failed: {
        class: 'bg-red-500',
        label: 'Falhou',
      },
      draft: {
        class: 'bg-gray-500',
        label: 'Rascunho',
      },
      scheduled: {
        class: 'bg-purple-500',
        label: 'Agendada',
      },
      pending: {
        class: 'bg-orange-500',
        label: 'Pendente',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.draft;

    return (
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${config.class} text-white`}
        >
          {config.label}
        </span>
        {status === 'scheduled' && scheduledDate && (
          <div className="ml-2 flex items-center gap-2 text-white/80">
            <FaClock className="text-purple-500" />
            <span className="text-xs">
              {new Date(scheduledDate).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  const ProgressBar: React.FC<{ progress: number }> = ({
    progress,
  }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-neon-green h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  const Stat: React.FC<{ label: string; value: number }> = ({
    label,
    value,
  }) => (
    <div>
      <p className="text-white/60">{label}</p>
      <h4 className="text-xl font-bold text-white mt-1">{value}</h4>
    </div>
  );

  const ActionButtons: React.FC<{
    status: string;
    onStart: () => void;
    onPause: () => void;
    onStop: () => void;
    campaignId: string;
  }> = ({ status, onStart, onStop, campaignId }) => {
    const navigate = useNavigate();
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const YOUTUBE_VIDEO_ID = '_IHj4V594Ho'; // Substitua pelo ID do seu vídeo

    const handlePlayClick = () => {
      if (status === 'paused') {
        // Se estiver pausada, permite retomar
        onStart();
      } else {
        // Se não estiver pausada, redireciona para a página de disparos
        navigate(`/disparos?campaignId=${campaignId}`);
      }
    };

    // Função para baixar modelo exemplo
    const downloadExampleTemplate = () => {
      try {
        const exampleData = [
          ['Nome', 'Telefone'],
          ['WhatLead', '5512988444921'],
          ['João Silva', '11999999999'],
          ['Maria Santos', '11888888888'],
          ['Carlos Oliveira', '11777777777'],
        ];

        // Converter para CSV (separado por vírgula)
        const csvContent = exampleData
          .map((row) => row.join(','))
          .join('\n');

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });

        const link = document.createElement('a');

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', 'modelo_exemplo_leads.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        toast.success('Modelo exemplo baixado com sucesso!');
      } catch (error) {
        toast.error('Erro ao baixar modelo exemplo');
      }
    };

    // Função para baixar planilha para tratamento
    const downloadProcessingTemplate = async () => {
      try {
        const fileUrl =
          'https://minioapi.whatlead.com.br:443/lucas/1753721776095-tratar_base.xlsx';
        const fileName = 'planilha_tratamento_leads.xlsx';

        // Fazer fetch do arquivo
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error('Arquivo não encontrado');
        }

        // Converter para blob
        const blob = await response.blob();

        // Criar URL do blob
        const url = window.URL.createObjectURL(blob);

        // Criar link de download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpar URL do blob
        window.URL.revokeObjectURL(url);

        toast.success('Planilha de tratamento baixada!');
      } catch (error) {
        console.error('Erro ao baixar planilha:', error);
        toast.error(
          'Erro ao baixar planilha - verifique sua conexão',
        );
      }
    };

    return (
      <>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handlePlayClick}
            disabled={status === 'running'}
            title={
              status === 'paused'
                ? 'Retomar campanha'
                : 'Criar novo disparo'
            }
          >
            <FiPlay />
          </Button>
          {(status === 'running' || status === 'paused') && (
            <Button size="sm" onClick={onStop}>
              <FiSquare />
            </Button>
          )}

          {/* Botão para baixar modelo exemplo */}
          <Button
            size="sm"
            variant="outline"
            onClick={downloadExampleTemplate}
            className="bg-blue-500/20 border-blue-500 hover:bg-blue-500/30"
            title="Baixar modelo exemplo"
          >
            <FiDownload />
          </Button>

          {/* Botão para baixar planilha de tratamento */}
          <Button
            size="sm"
            variant="outline"
            onClick={downloadProcessingTemplate}
            className="bg-green-500/20 border-green-500 hover:bg-green-500/30"
            title="Baixar planilha para tratamento da base"
          >
            <FiFileText />
          </Button>

          {/* Botão para visualizar vídeo explicativo */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVideoModalOpen(true)}
            className="bg-purple-500/20 border-purple-500 hover:bg-purple-500/30"
            title="Assistir vídeo explicativo"
          >
            <FiVideo />
          </Button>
        </div>

        {/* Modal do YouTube */}
        <YouTubeModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoId={YOUTUBE_VIDEO_ID}
        />
      </>
    );
  };

  const LoadingState: React.FC = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center items-center h-64"
    >
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32" />
    </motion.div>
  );

  const EmptyState: React.FC<EmptyStateProps> = ({
    searchTerm,
    onNewCampaign,
    onImportLeads,
  }) => {
    const handleNewCampaign = () => {
      console.log('Clicou em Nova Campanha no EmptyState');
      onNewCampaign?.();
    };

    const handleImportLeads = () => {
      console.log('Clicou em Importar Leads no EmptyState');
      onImportLeads?.();
    };

    if (searchTerm) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center py-12"
        >
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-electric/60 text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white">
              Nenhuma campanha encontrada
            </h3>
            <p className="text-white/60">
              Não encontramos nenhuma campanha com o termo "
              {searchTerm}"
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center py-12"
      >
        <div className="max-w-md mx-auto space-y-8">
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: 'reverse',
              }}
              className="text-8xl mb-6"
            >
              📢
            </motion.div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Comece sua primeira campanha!
            </h3>
            <p className="text-white/60">
              Crie campanhas personalizadas para alcançar seu
              público-alvo de forma eficiente
            </p>
          </div>
          <div className="space-y-6 bg-deep/30 p-6 rounded-xl border border-electric/20">
            <h4 className="text-lg font-semibold text-white">
              Como começar:
            </h4>
            <ul className="space-y-4 text-left">
              <li className="flex items-start gap-3">
                <div className="bg-electric/20 p-2 rounded-lg">
                  <FiPlus className="w-5 h-5 text-electric" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    Crie uma campanha
                  </p>
                  <p className="text-white/60 text-sm">
                    Clique no botão "Nova Campanha" para começar
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-electric/20 p-2 rounded-lg">
                  <FiUpload className="w-5 h-5 text-electric" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    Importe seus leads
                  </p>
                  <p className="text-white/60 text-sm">
                    Adicione seus contatos através de um arquivo CSV
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-electric/20 p-2 rounded-lg">
                  <FiPlay className="w-5 h-5 text-electric" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    Inicie o envio
                  </p>
                  <p className="text-white/60 text-sm">
                    Configure e comece a enviar suas mensagens
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleNewCampaign}
              className="bg-neon-green text-deep hover:bg-neon-green/80"
              size="lg"
            >
              <FiPlus className="mr-2" />
              Nova Campanha
            </Button>
            <Button
              variant="outline"
              onClick={handleImportLeads}
              className="border-electric hover:bg-electric/20"
              size="lg"
            >
              <FiUpload className="mr-2" />
              Importar Leads
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    console.log('Estado do modal:', {
      isModalOpen,
      hasSelectedCampaign: !!selectedCampaign,
    });
  }, [isModalOpen, selectedCampaign]);

  const CampaignModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    campaign: Campaign | null;
    onSubmit: (data: Partial<Campaign>) => void;
  }> = ({ isOpen, onClose, campaign, onSubmit }) => (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center" />
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="w-full max-w-md bg-deep border border-electric rounded-lg p-6 shadow-2xl transform transition-all duration-300 ease-in-out"
          // Previne que cliques dentro do modal fechem ele
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão de fechar */}
          <DialogClose
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            onClick={onClose}
          >
            <FiX />
          </DialogClose>

          <DialogTitle className="text-xl font-bold text-white mb-4">
            {campaign ? 'Editar Campanha' : 'Nova Campanha'}
          </DialogTitle>

          <DialogDescription className="text-white/70 mb-6">
            {campaign
              ? 'Modifique os detalhes da sua campanha'
              : 'Crie uma nova campanha para iniciar seus disparos'}
          </DialogDescription>

          <CampaignForm
            campaign={campaign}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <motion.div
      initial="out"
      animate="in"
      exit="out"
      variants={pageTransition}
      transition={{ duration: 0.5 }}
      className="p-8 space-y-8"
    >
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-deep/95 backdrop-blur-xl flex items-center justify-center z-50"
        >
          <div className="text-center space-y-6">
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
              className="w-20 h-20 border-4 border-electric border-t-transparent rounded-full mx-auto"
            />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                Carregando Campanhas
              </h2>
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
                className="text-white/60"
              >
                Buscando informações...
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-deep/95 backdrop-blur-xl flex items-center justify-center z-50"
        >
          <div className="text-center space-y-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              className="text-red-500 text-6xl"
            >
              ⚠️
            </motion.div>
            <h2 className="text-2xl font-bold text-white">
              Erro ao Carregar
            </h2>
            <p className="text-white/60">{error}</p>
            <Button
              onClick={() => refetch()}
              className="mt-4 bg-electric hover:bg-electric/80"
            >
              Tentar Novamente
            </Button>
          </div>
        </motion.div>
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          searchTerm={searchTerm}
          onNewCampaign={() => {
            console.log('Nova campanha modal acionada');
            setIsModalOpen(true);
            setSelectedCampaign(null);
          }}
          onImportLeads={() => {
            console.log('Modal de importação acionado');
            setIsImportModalOpen(true);
          }}
        />
      ) : (
        <>
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Campanhas
              </h1>
              <p className="text-white/60 mt-2">
                Gerencie suas campanhas de marketing
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
                className="bg-deep/50 border-electric hover:bg-electric/20"
              >
                <FiUpload className="mr-2" /> Importar Leads
              </Button>

              <ImportLeadsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportLeads}
                campaigns={filteredCampaigns}
                disableImport={false}
                totalLeads={0}
                maxLeads={0}
              />

              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-neon-green text-deep hover:bg-neon-green/80"
              >
                <FiPlus className="mr-2" /> Nova Campanha
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total de Campanhas"
              value={filteredCampaigns.length}
              icon={<FiBarChart2 className="w-6 h-6" />}
              trend={+15}
            />
            <StatsCard
              title="Campanhas Ativas"
              value={
                filteredCampaigns.filter(
                  (c) => c.status === 'running',
                ).length
              }
              icon={<FiPlay className="w-6 h-6" />}
              trend={+5}
              trendLabel="desde ontem"
            />
            <StatsCard
              title="Total de Leads"
              value={filteredCampaigns.reduce(
                (acc, curr) =>
                  acc + (curr.statistics?.totalLeads || 0),
                0,
              )}
              icon={<FiUsers className="w-6 h-6" />}
              trend={+150}
              trendLabel="este mês"
            />
            <StatsCard
              title="Taxa de Entrega"
              value={`${averageDeliveryRate}%`}
              icon={<FiBarChart2 className="w-6 h-6" />}
              trend={+2.5}
              trendLabel="média"
            />
          </div>
          <div className="flex gap-4 items-center">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px] bg-deep/50 border-electric text-white">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="running">Em execução</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="paused">Pausadas</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Buscar campanhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 bg-deep/50 text-white placeholder-white/50 border-electric"
            />
          </div>

          {/* Campaigns Grid */}
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns
                .slice(0, visibleCampaigns)
                .map((campaign, index) => (
                  <CampaignCard
                    key={`campaign-${campaign.id}-${index}`}
                    campaign={campaign}
                    onAction={handleAction}
                    onEdit={() => {
                      setSelectedCampaign(campaign);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDelete(campaign.id)}
                    isLoading={false}
                  />
                ))}
            </div>

            {visibleCampaigns < filteredCampaigns.length && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  className="bg-electric/20 hover:bg-electric/30 text-white"
                >
                  Carregar Mais
                </Button>
              </div>
            )}
          </AnimatePresence>
        </>
      )}

      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Fechando modal de campanha');
          setIsModalOpen(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onSubmit={handleSubmit}
      />

      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => {
          console.log('Fechando modal de importação');
          setIsImportModalOpen(false);
        }}
        campaigns={filteredCampaigns}
        onImport={handleImportLeads}
        disableImport={false}
        totalLeads={0}
        maxLeads={0}
      />
    </motion.div>
  );
};

export default Campanhas;
