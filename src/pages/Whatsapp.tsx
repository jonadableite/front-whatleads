// src/ pages/Whatsapp.tsx
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { EvoAI } from '@/services/evoaiService';
import {
  connectInstance,
  createInstance,
  deleteInstance,
  fetchBots,
  getConnectionState,
  logoutInstance,
  restartInstance,
} from '@/services/evolutionApi.service';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Bot,
  CheckCircle,
  Clock,
  Globe,
  Loader2,
  Lock,
  LogOut,
  MessageCircle,
  Plus,
  QrCode,
  RefreshCw,
  Settings,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AIAgentDialog } from '../components/instancia/AIAgentDialog';
import { InstanceSettingsDialog } from '../components/instancia/InstanceSettingsDialog';
import { ProxyConfigModal } from '../components/instancia/ProxyConfigModal';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

// Status icons mapping
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'OPEN':
    case 'online':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'connecting':
    case 'qrcode':
      return (
        <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      );
    case 'close':
    case 'offline':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

// Status text mapping
const getStatusText = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'Conectado';
    case 'connecting':
      return 'Conectando';
    case 'qrcode':
      return 'Aguardando QR';
    case 'close':
      return 'Desconectado';
    default:
      return 'Desconhecido';
  }
};

export default function WhatsappPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [instanceAgents, setInstanceAgents] = useState<
    Record<string, number>
  >({});
  const [instanceAgentStatus, setInstanceAgentStatus] = useState<
    Record<string, 'active' | 'inactive'>
  >({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [qrCodeDialog, setQrCodeDialog] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);

  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [
    selectedInstanceForSettings,
    setSelectedInstanceForSettings,
  ] = useState<string | null>(null);

  // State for controlling the "Nova Instância" modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedInstanceForAgent, setSelectedInstanceForAgent] =
    useState<string | null>(null);
  const [agentDialogOPEN, setAgentDialogOPEN] = useState(false);

  // Estados para o modal de proxy
  const [selectedInstanceForProxy, setSelectedInstanceForProxy] =
    useState<string | null>(null);
  const [proxyDialogOPEN, setProxyDialogOPEN] = useState(false);

  const monitoringInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState<{
    id?: string;
    instanceName: string;
    integration: 'WHATSAPP-BAILEYS';
    qrcode: boolean;
  }>({
    instanceName: '',
    integration: 'WHATSAPP-BAILEYS',
    qrcode: true,
  });

  // SWR hooks para buscar dados
  const { data: planData } = useSWR(
    '/api/users/plan-status',
    fetcher
  );

  const { data: instancesData, mutate: mutateInstances } = useSWR(
    '/api/instances',
    fetcher
  );

  // Processamento dos dados do plano
  const currentPlan = planData?.plan?.name || 'N/A';
  const instanceLimit = planData?.limits?.maxInstances || 0;
  const planDetails = planData || {};

  // Processamento dos dados das instâncias
  const instances = instancesData?.instances || [];

  const loadInstancesAgents = useCallback(
    async (instanceNames?: string[] | string) => {
      try {
        let namesToProcess: string[] = [];

        if (Array.isArray(instanceNames)) {
          namesToProcess = instanceNames;
        } else if (typeof instanceNames === 'string') {
          namesToProcess = [instanceNames];
        } else {
          namesToProcess = instances.map((i) => i.instanceName);
        }

        if (namesToProcess.length === 0) {
          console.log('📋 No instances to load agents for');
          // Opcional: Limpar status de agentes para instâncias que não existem mais
          // setInstanceAgents({});
          // setInstanceAgentStatus({});
          return;
        }

        // console.log(
        //   '🔄 Loading agents for instances:',
        //   namesToProcess,
        // );
        const agentCounts: Record<string, number> = {};
        // Objeto para armazenar o status ativo/inativo
        const agentStatuses: Record<string, 'active' | 'inactive'> =
          {};

        for (const instanceName of namesToProcess) {
          try {
            // Assume que fetchBots retorna um array de EvoAI, que inclui 'enabled'
            const agents: EvoAI[] = await fetchBots(instanceName);

            agentCounts[instanceName] = Array.isArray(agents)
              ? agents.length
              : 0;

            //  Verifica se existe PELO MENOS UM agente com enabled: true
            const hasEnabledAgent =
              Array.isArray(agents) &&
              agents.some((agent) => agent.enabled === true);

            agentStatuses[instanceName] = hasEnabledAgent
              ? 'active'
              : 'inactive';

            // console.log(
            //   `📊 Instance ${instanceName} has ${agentCounts[instanceName]} agents. Agent Status: ${agentStatuses[instanceName]}`,
            // );
          } catch (error) {
            console.error(
              `❌ Error loading agents for ${instanceName}:`,
              error,
            );
            agentCounts[instanceName] = 0;
            agentStatuses[instanceName] = 'inactive'; // Define como inativo em caso de erro
          }
        }

        setInstanceAgents(agentCounts); // Mantém a contagem para exibição
        setInstanceAgentStatus(agentStatuses);
      } catch (error) {
        console.error('❌ Error loading instance agents:', error);
        // Lidar com erro geral no carregamento de agentes
      }
    },
    [instances], // Depende de 'instances' para garantir que carrega agentes para as instâncias atuais
  );

  const reloadAgents = useCallback(async () => {
    // Recarrega agentes para todas as instâncias atualmente exibidas
    await loadInstancesAgents(instances.map((i) => i.instanceName));
  }, [loadInstancesAgents, instances]); // Adicionar 'instances' como dependência

  // UseEffect para carregar instâncias na montagem e recarregar agentes quando 'instances' muda
  useEffect(() => {
    let mounted = true;
    const initializeApp = async () => {
      try {
        setMounted(true);
        console.log('🚀 Initializing app...');
        const userData = await authService.getUser();
        if (!userData) {
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        if (mounted) {
          navigate('/login');
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // ✅ NOVO useEffect: Para carregar os agentes sempre que a lista de instâncias mudar
  useEffect(() => {
    if (instances.length > 0) {
      // console.log('Instances state updated, loading agents...');
      loadInstancesAgents(); // Chama loadInstancesAgents quando 'instances' muda
    } else {
      // Limpa o estado de agentes se não houver instâncias
      setInstanceAgents({});
      setInstanceAgentStatus({});
    }
  }, [instances]); // Removendo loadInstancesAgents das dependências para evitar loop infinito

  // Função para lidar com erros de conexão (mantida)
  const handleConnectionError = useCallback((error: unknown) => {
    let errorMessage = 'Erro desconhecido';

    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if ('toString' in error) {
        errorMessage = String(error);
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    toast({
      title: 'Erro de Conexão',
      description: errorMessage,
      variant: 'destructive',
    });
  }, []);

  const handleConnect = async (instanceName: string) => {
    try {
      setLoading(true);
      const response = await connectInstance(instanceName);

      // console.log('🔍 Connect response:', response); // Para debug

      // Verificar pelo campo correto 'base64' ou 'qrcode'
      if (response && typeof response === 'object') {
        const qrCode = response.base64 || response.code;
        if (typeof qrCode === 'string' && qrCode) {
          // Verifica se qrCode não é vazio
          setQrCodeData(qrCode);
          setQrCodeDialog(true);
          startConnectionMonitoring(instanceName);
        } else {
          console.error(
            '❌ QR code not found or empty in response:',
            response,
          );
          toast({
            title: 'Erro',
            description:
              'QR code não encontrado na resposta ou inválido.',
            variant: 'destructive',
          });
        }
      } else {
        console.error(
          '❌ Invalid response structure for connect:',
          response,
        );
        toast({
          title: 'Erro',
          description: 'Resposta inválida ao tentar conectar.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      handleConnectionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async (instanceName: string) => {
    try {
      setLoading(true);
      await restartInstance(instanceName);
      toast({
        title: 'Instância Reiniciada',
        description: `${instanceName} foi reiniciado com sucesso`,
      });
      mutateInstances(); // Recarrega instâncias para atualizar status
    } catch (error) {
      handleConnectionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (instanceName: string) => {
    try {
      setLoading(true);
      await logoutInstance(instanceName);
      toast({
        title: 'Logout Realizado',
        description: `${instanceName} foi desconectado`,
      });
      mutateInstances(); // Recarrega instâncias para atualizar status
    } catch (error) {
      handleConnectionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    instanceId: string,
    instanceName: string,
  ) => {
    try {
      setLoading(true);
      await deleteInstance(instanceId);

      // Limpar cache do frontend se existir
      if (typeof window !== 'undefined') {
        // Limpar qualquer cache relacionado a instâncias
        const cacheKeys = Object.keys(localStorage);
        cacheKeys.forEach(key => {
          if (key.includes('instances') || key.includes('instance')) {
            localStorage.removeItem(key);
          }
        });
      }

      toast({
        title: 'Instância Deletada',
        description: `${instanceName} foi deletada com sucesso`,
      });
      mutateInstances(); // Recarrega instâncias para remover a deletada
    } catch (error) {
      handleConnectionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstance = async () => {
    try {
      setLoading(true);
      const response = await createInstance(form);

      // console.log('🔍 Create instance response:', response); // Para debug

      toast({
        title: 'Instância Criada',
        description: 'Nova instância criada com sucesso',
      });

      // Fechar o modal de criação
      setIsModalOpen(false);

      // Se a resposta contém QR code, abrir o modal e monitorar
      if (response && (response.base64 || response.qrcode)) {
        const qrCode = response.base64 || response.qrcode;
        if (typeof qrCode === 'string' && qrCode) {
          // Verifica se qrCode não é vazio
          setQrCodeData(qrCode);
          setQrCodeDialog(true);
          startConnectionMonitoring(form.instanceName);
        } else {
          console.warn(
            '⚠️ QR code não encontrado ou vazio na resposta de criação, mas instância criada.',
          );
        }
      }

      setForm({
        instanceName: '',
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true,
      });

      mutateInstances(); // Recarrega instâncias para incluir a nova
    } catch (error) {
      handleConnectionError(error);
    } finally {
      setLoading(false);
    }
  };

  const startConnectionMonitoring = useCallback(
    (instanceName: string) => {
      setIsMonitoring(true);
      setConnectionProgress(0);

      // Limpa qualquer intervalo anterior antes de iniciar um novo
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }

      const interval = setInterval(async () => {
        try {
          // Acessa a propriedade 'state' dentro do objeto 'instance'
          const response = await getConnectionState(instanceName);
          const connectionState = response?.instance?.state; // Use optional chaining para segurança
          console.log(
            `📊 Connection state for ${instanceName}:`,
            connectionState,
          );

          // Agora compare a string do estado
          if (
            connectionState === 'OPEN' ||
            connectionState === 'connected'
          ) {
            console.log(
              `✅ Connection OPEN or connected for ${instanceName}`,
            );
            setConnectionProgress(100);
            
            // Primeiro atualiza as instâncias para garantir que o status seja refletido imediatamente
            await mutateInstances();
            
            // Depois fecha o modal e mostra o toast
            setTimeout(() => {
              setQrCodeDialog(false);
              setIsMonitoring(false);
              setConnectionProgress(0);
              toast({
                title: '🎉 Conectado com Sucesso!',
                description: `A instância ${instanceName} foi conectada e está pronta para uso`,
              });
            }, 800); // Delay reduzido para melhor UX
            
            clearInterval(interval);
            monitoringInterval.current = null;
          } else if (
            connectionState === 'error' ||
            connectionState === 'close' ||
            connectionState === 'disconnected'
          ) {
            console.log(
              `❌ Connection failed or closed for ${instanceName}`,
            );
            clearInterval(interval);
            monitoringInterval.current = null;
            setIsMonitoring(false);
            setConnectionProgress(0);
            
            // Mostra toast de erro quando a conexão falha
            toast({
              title: 'Erro na Conexão',
              description: `Falha ao conectar ${instanceName}. Tente novamente.`,
              variant: 'destructive',
            });
            
            mutateInstances(); // Recarrega instâncias para atualizar o status na lista
          } else {
            // Tratar outros estados como 'connecting', 'qrcode', etc.
            setConnectionProgress((prev) => Math.min(prev + 15, 90)); // Incrementa mais rapidamente
          }
        } catch (error) {
          console.error('Error monitoring connection:', error);
          clearInterval(interval);
          monitoringInterval.current = null;
          setIsMonitoring(false);
          setConnectionProgress(0);
          
          toast({
            title: 'Erro de Monitoramento',
            description: `Erro ao monitorar conexão de ${instanceName}`,
            variant: 'destructive',
          });
          
          mutateInstances(); // Recarrega instâncias para tentar obter o status atual
        }
      }, 2000); // Intervalo reduzido para 2 segundos para melhor responsividade

      monitoringInterval.current = interval;
    },
    [mutateInstances], // Remove dependência de loadInstances
  );

  const stopConnectionMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
    setIsMonitoring(false);
    setConnectionProgress(0);
    setQrCodeDialog(false);
  }, []);

  const refreshInstances = useCallback(async () => {
    setRefreshing(true);
    mutateInstances(); // Usa mutateInstances do SWR
    setRefreshing(false);
  }, [mutateInstances]);

  // Removendo filteredInstances pois search foi removido - usando instances diretamente

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep/40 via-indigo-700/10 to-electric p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-electric to-blue-700 bg-clip-text text-transparent mb-2">
            WhatsApp Manager
          </h1>

          <p className="text-gray-400 text-lg">
            Gerencie suas instâncias do WhatsApp
          </p>
        </div>

        {/* Bloco de Métricas - Refatorado */}
        <div className="flex items-center gap-4 bg-deep/60 backdrop-blur-xl px-6 py-3 rounded-xl border border-electric/40 shadow-lg flex-wrap">
          {' '}
          {/* flex-wrap para quebrar em telas menores */}
          {/* Métrica: Plano */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300">
              Plano:
            </span>
            <span className="text-base font-semibold text-blue-500">
              {currentPlan}
            </span>
          </div>
          {/* Métrica: Instâncias */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300">
              Instâncias:
            </span>
            <span className="text-base font-semibold text-neon-green">
              {/* Usar dados de usage e limits do planDetails */}
              {planDetails.usage?.currentInstances ?? '-'} /{' '}
              {planDetails.limits?.maxInstances ?? '-'}
            </span>
            {/* Opcional: Porcentagem de instâncias, se relevante */}
            {planDetails.usage?.instancesPercentage !== undefined && (
              <span
                className={`font-semibold text-sm ${planDetails.usage.instancesPercentage > 80
                  ? 'text-red-500'
                  : ''
                  }`}
              >
                ({planDetails.usage.instancesPercentage.toFixed(0)}%)
              </span>
            )}
          </div>
          {/* Métrica: Trial End Date (Condicional) */}
          {planDetails.plan?.isInTrial &&
            planDetails.plan?.trialEndDate && (
              <div className="flex items-center space-x-2 text-sm text-yellow-500">
                <AlertCircle className="w-4 h-4" />
                {/* Formatar a data corretamente */}
                <span>
                  Teste até:{' '}
                  {new Date(
                    planDetails.plan.trialEndDate,
                  ).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={refreshInstances}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={cn('w-4 h-4', refreshing && 'animate-spin')}
            />
            Atualizar
          </Button>

          <Button
            onClick={() => {
              if (instances.length >= instanceLimit) {
                toast({
                  title: 'Limite atingido',
                  description: `Você atingiu o limite de ${instanceLimit} instância(s) para o seu plano.`,
                  variant: 'destructive',
                });
              } else {
                setIsModalOpen(true); // Assumindo que você abre um modal para pegar o nome antes de criar
              }
            }}
            disabled={instances.length >= instanceLimit || loading} // Já está usando 'loading' aqui, o que está correto
            className={`
              font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg
              transition-opacity duration-300
              flex items-center justify-center
              ${instances.length >= instanceLimit
                ? 'bg-electric cursor-not-allowed opacity-90'
                : loading
                  ? 'bg-yellow-600 cursor-wait opacity-70'
                  : 'bg-gradient-to-r from-electric to-blue-600 hover:opacity-90'
              }
            `}
          >
            {/* Conteúdo do botão dinâmico */}
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Criando...
              </>
            ) : instances.length >= instanceLimit ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Limite Atingido ({instanceLimit})
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Nova Instância
              </>
            )}
          </Button>
        </div>
      </div>
      {/* Search Bar */}
      {/* <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

        <Input
          placeholder="Buscar instâncias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-lg border-2 border-gray-700 focus:border-blue-700"
        />
      </div> */}
      {/* Instances Grid */}
      {loading && instances.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-electric border-r-blue-700" />

            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-b-electric border-l-blue-700 animate-reverse" />
          </div>
        </div>
      ) : instances.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-electric/20 to-blue-700/20 rounded-full blur-xl" />

            <MessageCircle className="relative mx-auto w-20 h-20 text-gray-600" />
          </div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
            Nenhuma instância criada
          </h3>

          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Crie sua primeira instância para começar sua jornada
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
            {instances.map((instance, index) => (
              <motion.div
                key={instance.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  type: 'spring',
                  stiffness: 280,
                  damping: 25,
                }}
                className="group relative w-full"
              >
                <div className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-r from-electric/10 via-purple-500/10 to-blue-700/10 blur-xl" />

                <div
                  className={cn(
                    'relative w-full bg-gradient-to-br from-[#16151D]/95 via-[#1a1825]/95 to-[#222030]/95',
                    'backdrop-blur-xl rounded-3xl border border-white/[0.08]',
                    'overflow-hidden transition-all duration-500 group-hover:border-white/15',
                    'shadow-2xl shadow-black/25',
                  )}
                >
                  <div className="absolute inset-0 opacity-[0.06]">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-elecfrom-electric/20 to-blue-700/20" />

                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-white/30 to-transparent rounded-full blur-3xl" />

                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-electric/30 to-transparent rounded-full blur-2xl" />
                  </div>

                  <div
                    className={cn(
                      'absolute top-0 left-0 right-0 h-0.5 transition-all duration-700',
                      instance.connectionStatus === 'OPEN'
                        ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400'
                        : instance.connectionStatus ===
                          'connecting' ||
                          instance.connectionStatus === 'qrcode'
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400'
                          : 'bg-gradient-to-r from-red-400 via-red-500 to-red-400',
                    )}
                  />

                  <div className="relative p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Profile Avatar */}
                        <div className="relative flex-shrink-0">
                          <div
                            className={cn(
                              'absolute -inset-1 rounded-full transition-all duration-500',
                              'bg-gradient-to-r from-electric via-purple-500 to-blue-700',
                              instance.connectionStatus === 'OPEN'
                                ? 'opacity-100'
                                : 'opacity-50',
                            )}
                          />

                          <Avatar className="relative w-14 h-14 sm:w-16 sm:h-16 border-2 border-white/20 shadow-lg">
                            <AvatarImage
                              src={
                                instance.profilePicUrl ||
                                instance.profilePicUrl
                              }
                              alt={
                                instance.profileName ||
                                instance.instanceName
                              }
                              className="object-cover"
                            />

                            <AvatarFallback className="bg-gradient-to-br from-electric to-blue-700 text-white text-lg font-bold">
                              {instance.profileName ||
                                instance.instanceName ? (
                                (
                                  instance.profileName ||
                                  instance.instanceName
                                )
                                  .charAt(0)
                                  .toUpperCase()
                              ) : (
                                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online Status Dot */}
                          <div
                            className={cn(
                              'absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 sm:border-3 border-[#16151D] shadow-lg',
                              'flex items-center justify-center transition-all duration-300',
                              instance.connectionStatus === 'OPEN'
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                : instance.connectionStatus ===
                                  'connecting' ||
                                  instance.connectionStatus ===
                                  'qrcode'
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                                  : 'bg-gradient-to-r from-red-400 to-red-500',
                            )}
                          >
                            {instance.connectionStatus === 'OPEN' && (
                              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                            )}

                            <div
                              className={cn(
                                'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full relative z-10',
                                instance.connectionStatus === 'OPEN'
                                  ? 'bg-white animate-pulse'
                                  : 'bg-white/90',
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg sm:text-xl text-white truncate mb-1">
                            {instance.profileName ||
                              instance.instanceName}
                          </h3>

                          <p className="text-sm text-gray-400 truncate font-medium">
                            {instance.instanceName}
                          </p>

                          {instance.ownerJid && (
                            <p className="text-xs text-gray-500 truncate mt-1 font-mono">
                              {instance.ownerJid.replace(
                                '@s.whatsapp.net',
                                '',
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0 self-start">
                        <div
                          className={cn(
                            'px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border backdrop-blur-sm transition-all duration-300',
                            'flex items-center gap-2 text-xs sm:text-sm font-semibold',
                            instance.connectionStatus === 'OPEN'
                              ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400 shadow-lg shadow-emerald-500/20'
                              : instance.connectionStatus ===
                                'connecting' ||
                                instance.connectionStatus === 'qrcode'
                                ? 'bg-amber-500/10 border-amber-400/30 text-amber-400 shadow-lg shadow-amber-500/20'
                                : 'bg-red-500/10 border-red-400/30 text-red-400 shadow-lg shadow-red-500/20',
                          )}
                        >
                          <StatusIcon
                            status={instance.connectionStatus}
                          />

                          <span className="hidden sm:inline">
                            {getStatusText(instance.connectionStatus)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                      {/* Card de Contagem de Agentes */}
                      <div className="bg-white/[0.03] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/[0.06] backdrop-blur-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-electric to-blue-700 rounded-lg sm:rounded-xl flex-shrink-0">
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide">
                              Agentes IA
                            </p>
                            <p className="text-sm sm:text-lg font-bold text-white">
                              {instanceAgents[
                                instance.instanceName
                              ] || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Card de Status do Agente */}
                      <div className="bg-white/[0.03] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/[0.06] backdrop-blur-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* ✅ LÓGICA CORRIGIDA: Cor do ícone baseada no status do agente */}

                          <div
                            className={cn(
                              'p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0',
                              instanceAgentStatus[
                                instance.instanceName
                              ] === 'active'
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500' // Ativo
                                : 'bg-gradient-to-r from-gray-400 to-gray-500', // Inativo
                            )}
                          >
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide">
                              Agente Status
                            </p>
                            <p className="text-sm sm:text-lg font-bold text-white">
                              {instanceAgentStatus[
                                instance.instanceName
                              ] === 'active'
                                ? 'Ativo'
                                : 'Inativo'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Action Buttons Section - Enhanced */}
                  <div className="relative px-6 pb-6 sm:px-8 sm:pb-8">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {/* Connect Button */}
                      {instance.connectionStatus !== 'OPEN' && (
                        <Button
                          onClick={() =>
                            handleConnect(instance.instanceName)
                          }
                          disabled={loading}
                          size="sm"
                          className="group relative flex items-center gap-2 bg-gradient-to-r from-electric via-neon-purple to-blue-700 hover:from-electric hover:via-deep-purple hover:to-shock text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-500 hover:scale-[1.02] text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:rounded-2xl overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:rotate-3 transition-transform duration-300" />

                          <span className="relative z-10">
                            Conectar
                          </span>

                          {loading && (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          )}
                        </Button>
                      )}
                      {/* Restart Button */}
                      <Button
                        onClick={() =>
                          handleRestart(instance.instanceName)
                        }
                        disabled={loading}
                        size="sm"
                        className="group relative flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-200 border border-slate-600/80 shadow-md hover:shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:rounded-2xl"
                      >
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Reiniciar</span>
                        {loading && (
                          <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-600 rounded-full animate-spin" />
                        )}
                      </Button>
                      {/* Logout Button */}
                      <Button
                        onClick={() =>
                          handleLogout(instance.instanceName)
                        }
                        disabled={loading}
                        size="sm"
                        className="group relative flex items-center gap-2 bg-gradient-to-r from-amber-900/30 to-amber-500/40 hover:from-amber-500/40 hover:to-amber-700/50 text-amber-300 hover:text-amber-200 border border-amber-600/40 shadow-md hover:shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:rounded-2xl"
                      >
                        <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-12 transition-transform duration-300" />
                        <span>Logout</span>
                        {loading && (
                          <div className="w-3 h-3 border-2 border-amber-500/30 border-t-amber-600 rounded-full animate-spin" />
                        )}
                      </Button>
                      {/* AI Agents Button - Enhanced */}
                      <Button
                        onClick={() => {
                          setSelectedInstanceForAgent(
                            instance.instanceName,
                          );
                          setAgentDialogOPEN(true);
                        }}
                        size="sm"
                        className="group relative flex items-center gap-2 bg-gradient-to-r from-indigo-600/90 via-indigo-700/90 to-indigo-700/90 hover:from-indigo-600 hover:via-indigo-700 hover:to-indigo-700 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:rounded-2xl overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />

                        <span className="relative z-10">
                          Agentes IA
                        </span>

                        {(instanceAgents[instance.instanceName] ||
                          0) > 0 && (
                            <div className="relative z-10 flex items-center">
                              <span className="ml-1 px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg shadow-purple-500/30 font-bold min-w-[20px] text-center animate-pulse">
                                {instanceAgents[instance.instanceName]}
                              </span>
                            </div>
                          )}
                      </Button>
                      {/* Botão de Proxy */}
                      <Button
                        onClick={() => {
                          setSelectedInstanceForProxy(
                            instance.instanceName,
                          );
                          setProxyDialogOPEN(true);
                        }}
                        disabled={loading}
                        size="sm"
                        className="group relative flex items-center gap-2 bg-gradient-to-r from-cyan-600/90 via-cyan-700/90 to-cyan-700/90 hover:from-cyan-600 hover:via-cyan-700 hover:to-cyan-700 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:rounded-2xl overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />

                        <span className="relative z-10">Proxy</span>

                        {loading && (
                          <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-600 rounded-full animate-spin" />
                        )}
                      </Button>
                      {/* Botão de Configurações */}
                      <Button
                        onClick={() => {
                          setSelectedInstanceForSettings(
                            instance.instanceName,
                          );
                          setShowSettingsDialog(true);
                        }}
                        disabled={loading}
                        size="sm"
                        className="group relative flex items-center gap-2 bg-gradient-to-r from-gray-700/30 to-gray-600/40 hover:from-gray-600/40 hover:to-gray-500/50 text-gray-300 hover:text-gray-200 border border-gray-600/40 shadow-md hover:shadow-lg hover:shadow-gray-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:rounded-2xl"
                      >
                        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300" />

                        <span className="hidden sm:inline">
                          Configurações
                        </span>
                        <span className="sm:hidden">Conf</span>

                        {loading && (
                          <div className="w-3 h-3 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
                        )}
                      </Button>
                      {/* Delete Button */}
                      <Button
                        onClick={() =>
                          handleDelete(
                            instance.id,
                            instance.instanceName,
                          )
                        }
                        disabled={loading}
                        size="sm"
                        className="group relative flex items-center gap-2 bg-gradient-to-r from-red-900/30 to-red-800/40 hover:from-red-800/40 hover:to-red-700/50 text-red-400 hover:text-red-300 border border-red-600/40 shadow-md hover:shadow-lg hover:shadow-red-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:rounded-2xl"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />

                        <span className="hidden sm:inline">
                          Deletar
                        </span>
                        <span className="sm:hidden">Del</span>
                        {loading && (
                          <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-600 rounded-full animate-spin" />
                        )}
                      </Button>
                    </div>
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-50" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
      {/* AI Agent Dialog */}
      {selectedInstanceForAgent && (
        <AIAgentDialog
          instanceName={selectedInstanceForAgent}
          isOpen={agentDialogOPEN}
          onOpenChange={(OPEN) => {
            setAgentDialogOPEN(OPEN);
            if (!OPEN) {
              setSelectedInstanceForAgent(null);
              reloadAgents(); // Recarrega agentes ao fechar o diálogo para atualizar o status
            }
          }}
          onUpdate={reloadAgents} // Garante que a lista e o status são atualizados ao salvar
        />
      )}
      {/* Instance Settings Dialog */}
      {selectedInstanceForSettings && ( // Renderiza apenas se uma instância estiver selecionada
        <InstanceSettingsDialog
          instanceName={selectedInstanceForSettings}
          isOpen={showSettingsDialog}
          onOpenChange={(OPEN) => {
            setShowSettingsDialog(OPEN);
            if (!OPEN) {
              // Resetar a instância selecionada ao fechar o dialog
              setSelectedInstanceForSettings(null);
            }
          }}
          onUpdate={mutateInstances} // Recarrega as instâncias (e agentes via useEffect) ao salvar as configurações
        />
      )}

      {/* NOVO: Dialog para Criar Nova Instância */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Instância</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para criar uma nova instância do
              WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="instanceName"
                className="text-gray-500 font-medium"
              >
                Nome da Instância
              </Label>
              <Input
                id="instanceName"
                value={form.instanceName}
                onChange={(e) =>
                  setForm({ ...form, instanceName: e.target.value })
                }
                placeholder="Ex: MinhaInstanciaWhatsApp"
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-pink-500/15 border-electric-dark hover:bg-red-500/35 hover:text-white hover:border-red-300"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateInstance}
              disabled={
                loading || !form.instanceName.trim()
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialog} onOpenChange={setQrCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-6">
            {qrCodeData && (
              <div className="p-4 bg-white rounded-lg shadow-inner">
                <img
                  src={qrCodeData}
                  alt="QR Code"
                  width={256}
                  height={256}
                  className="rounded-lg"
                />
              </div>
            )}

            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                Escaneie o QR Code
              </h3>

              <p className="text-sm text-gray-400 mb-4">
                Abra o WhatsApp no seu celular e escaneie este código
              </p>

              {isMonitoring && (
                <div className="w-full">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Aguardando conexão...</span>
                    <span>{connectionProgress}%</span>
                  </div>

                  <Progress
                    value={connectionProgress}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={stopConnectionMonitoring}
              variant="outline"
              className="flex items-center gap-2"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proxy Config Dialog */}
      {selectedInstanceForProxy && (
        <ProxyConfigModal
          instanceName={selectedInstanceForProxy}
          isOpen={proxyDialogOPEN}
          onOpenChange={(OPEN) => {
            setProxyDialogOPEN(OPEN);
            if (!OPEN) {
              setSelectedInstanceForProxy(null);
            }
          }}
          onUpdate={mutateInstances} // Recarrega as instâncias ao salvar configurações
        />
      )}
    </div>
  );
}
