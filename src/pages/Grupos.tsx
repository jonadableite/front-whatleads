// src/pages/Grupos.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authService } from '@/services/auth.service';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaCog,
  FaCopy,
  FaCrown,
  FaInfoCircle,
  FaLink,
  FaRegCircle,
  FaSignOutAlt,
  FaTimesCircle,
  FaUserMinus,
  FaUsers,
  FaUserShield,
} from 'react-icons/fa';
import { FiPlay, FiPlus, FiX } from 'react-icons/fi';
import { IoMdSend } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GetInstancesAction } from '../actions';
import { api } from '../lib/api';
import { evo } from '../lib/evo';
import { cn } from '../lib/utils';

interface Instancia {
  id: string;
  instanceName: string;
  profileName?: string;
  connectionStatus?: 'OPEN' | 'CLOSE';
  warmupStatus?: {
    progress: number;
    isRecommended: boolean;
  };
}

interface Grupo {
  id: string;
  subject: string;
  desc?: string;
  subjectOwner?: string;
  size: number;
  participants?: Participant[];
  pictureUrl?: string;
  creation?: number;
  ephemeralDuration?: number;
  announce?: boolean;
  restrict?: boolean;
  inviteCode?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

interface Participant {
  id: string;
  admin?: 'admin' | 'superadmin' | null;
  name?: string;
  notify?: string;
}

interface GroupSettings {
  announce?: boolean;
  restrict?: boolean;
  ephemeralDuration?: number;
}

// Transição de página para framer-motion
const pageTransition = {
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

// Componente de Modal Genérico (Refatorado para usar Radix UI Dialog e estilo de vidro)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const CustomDialog: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center" />
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className={cn(
            'relative bg-deep border border-electric/30 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg lg:max-w-2xl overflow-hidden',
            className,
          )}
          onClick={(e) => e.stopPropagation()} // Previne que cliques dentro do modal fechem ele
        >
          <DialogClose
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-200"
            onClick={onClose}
          >
            <FiX size={24} />
          </DialogClose>
          <DialogTitle className="text-3xl font-bold text-white mb-6 border-b border-electric/20 pb-4">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {title}
          </DialogDescription>{' '}
          {/* Descrição para leitores de tela */}
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {children}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

// Componente para exibir um card de grupo
interface GroupCardProps {
  group: Grupo;
  onOpenDetails: (group: Grupo) => void;
  onSelect: (groupId: string) => void;
  isSelected: boolean;
  isAdmin: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onOpenDetails,
  onSelect,
  isSelected,
  isAdmin,
}) => {
  const isOwner = group.isAdmin || group.isSuperAdmin;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className={cn(
        'relative bg-deep/50 border border-electric/30 rounded-2xl p-6 shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out',
        isSelected
          ? 'border-neon-green ring-2 ring-neon-green bg-neon-green/15 shadow-lg shadow-neon-green/20'
          : 'hover:border-electric',
      )}
    >
      <div className="flex items-center mb-4">
        {group.pictureUrl ? (
          <img
            src={group.pictureUrl}
            alt={`Foto de perfil do grupo ${group.subject}`}
            className="w-12 h-12 rounded-full object-cover mr-4 border border-electric/50"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-electric-blue/20 flex items-center justify-center mr-4">
            <FaUsers className="text-electric-blue text-2xl" />
          </div>
        )}
        <h3 className="text-xl font-semibold text-white truncate flex-grow">
          {group.subject}
        </h3>
        {isOwner && (
          <FaCrown
            className="text-yellow-400 text-xl ml-2"
            title="Você é administrador"
          />
        )}
      </div>
      <p className="text-white/70 text-sm mb-2">
        Membros: {group.size}
      </p>
      {group.desc && (
        <p className="text-white/70 text-sm mb-4 line-clamp-2">
          {group.desc}
        </p>
      )}

      <div className="flex justify-end gap-3 mt-4">
        {/* Botão para SELECIONAR o grupo */}
        <Button
          onClick={() => onSelect(group.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
            isSelected
              ? 'bg-neon-green text-white hover:bg-neon-green/80'
              : 'bg-neon-blue text-white hover:bg-neon-blue/40',
          )}
        >
          {isSelected ? <FaCheckCircle /> : <FaRegCircle />}
          {isSelected ? 'Selecionado' : 'Selecionar'}
        </Button>

        {/* Botão para abrir os DETALHES do grupo */}
        <Button
          onClick={() => onOpenDetails(group)}
          className="flex items-center gap-2 bg-blue-500 border-blue-400 text-white hover:bg-electric/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          <FaInfoCircle />
          Detalhes
        </Button>
      </div>
    </motion.div>
  );
};

// Componente de estado vazio
interface EmptyStateProps {
  searchTerm: string;
  onNewGroup: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  onNewGroup,
}) => {
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
            Nenhum grupo encontrado
          </h3>
          <p className="text-white/60">
            Não encontramos nenhum grupo com o termo "{searchTerm}"
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
            👥
          </motion.div>
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            Comece criando seu primeiro grupo!
          </h3>
          <p className="text-white/60">
            Crie e gerencie grupos de WhatsApp para suas campanhas e
            comunicações.
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
                  Crie um novo grupo
                </p>
                <p className="text-white/60 text-sm">
                  Clique no botão "Criar Grupo" para adicionar um novo
                  grupo.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-electric/20 p-2 rounded-lg">
                <FiPlay className="w-5 h-5 text-electric" />
              </div>
              <div>
                <p className="text-white font-medium">
                  Envie mensagens
                </p>
                <p className="text-white/60 text-sm">
                  Selecione grupos e envie mensagens em massa.
                </p>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            onClick={onNewGroup}
            className="bg-neon-green text-deep hover:bg-neon-green/80"
            size="lg"
          >
            <FiPlus className="mr-2" />
            Criar Grupo
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Grupos() {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<Instancia[]>([]);
  const [selectedInstanceName, setselectedInstanceName] = useState<
    string | null
  >(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para envio de mensagem
  const [messageType, setMessageType] = useState<
    'text' | 'media' | 'audio'
  >('text'); // 'text', 'media', 'audio'
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaMimeType, setMediaMimeType] = useState(''); // Ex: 'image/png', 'video/mp4', 'application/pdf'
  const [mediaFileName, setMediaFileName] = useState(''); // Opcional
  const [audioUrl, setAudioUrl] = useState('');

  // Para gerenciar a seleção de grupos e o status do disparo
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]); // Armazena os JIDs dos grupos selecionados
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false); // Indica se um disparo está em andamento

  // Modals States
  const [showGroupDetailsModal, setShowGroupDetailsModal] =
    useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(
    null,
  );
  const [showCreateGroupModal, setShowCreateGroupModal] =
    useState(false);

  // States for creating group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupParticipants, setNewGroupParticipants] =
    useState('');

  // States for group settings within details modal
  const [currentGroupSettings, setCurrentGroupSettings] =
    useState<GroupSettings>({
      announce: false,
      restrict: false,
      ephemeralDuration: 0,
    });
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [inviteNumbers, setInviteNumbers] = useState('');
  const [inviteDescription, setInviteDescription] = useState('');
  const [newParticipantNumber, setNewParticipantNumber] =
    useState(''); // Estado para adicionar participante

  // Tab state for Group Details Modal
  const [activeTab, setActiveTab] = useState<
    'info' | 'participants' | 'settings' | 'invite'
  >('info');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const initializeData = async () => {
      setIsInitialLoading(true);
      try {
        await fetchInstances();
      } finally {
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 1500);
      }
    };
    initializeData();
  }, [navigate]);

  const fetchInstances = async () => {
    try {
      setIsLoading(true);
      const response = await GetInstancesAction();
      if (response?.instances) {
        setInstances(response.instances as Instancia[]);
      }
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      toast.error('Erro ao carregar instâncias');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = useCallback(
    async (instanceName: string) => {
      try {
        setIsLoading(true);
        const response = await api.main.get(
          `/groups/fetchAllGroups/${instanceName}?getParticipants=true`,
        );
        if (response.data.success) {
          const fetchedGroups: Grupo[] = response.data.data || [];
          setGrupos(fetchedGroups);
          if (selectedGroup) {
            const updatedSelectedGroup = fetchedGroups.find(
              (g) => g.id === selectedGroup.id,
            );
            setSelectedGroup(updatedSelectedGroup || null);
            if (updatedSelectedGroup) {
              setCurrentGroupSettings({
                announce: updatedSelectedGroup.announce,
                restrict: updatedSelectedGroup.restrict,
                ephemeralDuration:
                  updatedSelectedGroup.ephemeralDuration,
              });
            }
          }
        } else {
          toast.error('Erro ao carregar grupos');
        }
      } catch (error) {
        console.error('Erro ao buscar grupos:', error);
        toast.error('Erro ao carregar grupos');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedGroup],
  );

  const handleInstanceChange = (instanceNameFromSelect: string) => {
    setselectedInstanceName(instanceNameFromSelect);
    setGrupos([]);
    setSelectedGroups([]);
    setSelectedGroup(null);
    setShowGroupDetailsModal(false);
    if (instanceNameFromSelect) {
      fetchGroups(instanceNameFromSelect);
    }
  };

  const handleGroupSelect = useCallback((groupId: string) => {
    setSelectedGroups((prevSelectedGroups) => {
      if (prevSelectedGroups.includes(groupId)) {
        // Se já estiver selecionado, remove
        return prevSelectedGroups.filter((id) => id !== groupId);
      } else {
        // Se não estiver selecionado, adiciona
        return [...prevSelectedGroups, groupId];
      }
    });
  }, []);

  const filteredGroups = grupos.filter((group) =>
    group.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelectAll = () => {
    if (
      selectedGroups.length === filteredGroups.length &&
      filteredGroups.length > 0
    ) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map((group) => group.id));
    }
  };

  // Função auxiliar para determinar o tipo de mídia com base no MIME Type
  const getMediaTypeFromMime = (
    mimetype: string,
  ): 'image' | 'video' | 'document' | undefined => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    // Para documentos, verificamos 'pdf' ou qualquer 'application/'
    if (
      mimetype.includes('pdf') ||
      mimetype.startsWith('application/')
    )
      return 'document';
    return undefined;
  };

  const handleSendMessageToSelectedGroups = useCallback(async () => {
    if (!selectedInstanceName) {
      toast.error('Por favor, selecione uma instância primeiro.');
      return;
    }
    if (selectedGroups.length === 0) {
      toast.error(
        'Por favor, selecione pelo menos um grupo para o disparo.',
      );
      return;
    }

    let payload: any;
    let endpoint: string;

    // Constrói o payload e o endpoint com base no tipo de mensagem selecionado
    switch (messageType) {
      case 'text':
        if (!message.trim()) {
          toast.error('Por favor, digite a mensagem de texto.');
          return;
        }
        endpoint = `/message/sendText/${selectedInstanceName}`;
        payload = { text: message };
        break;
      case 'media': {
        if (!mediaUrl.trim() || !mediaMimeType.trim()) {
          toast.error(
            'Por favor, forneça a URL da mídia e o MIME Type.',
          );
          return;
        }
        const mediaType = getMediaTypeFromMime(mediaMimeType);
        if (!mediaType) {
          toast.error(
            'MIME Type inválido para mídia. Use image/, video/ ou application/.',
          );
          return;
        }
        endpoint = `/message/sendMedia/${selectedInstanceName}`;
        payload = {
          mediatype: mediaType, // 'image', 'video', 'document'
          mimetype: mediaMimeType,
          media: mediaUrl,
          caption: message, // 'message' state é usado para a legenda
          fileName: mediaFileName,
        };
        break;
      }
      case 'audio':
        if (!audioUrl.trim()) {
          toast.error('Por favor, forneça a URL do áudio.');
          return;
        }
        endpoint = `/message/sendWhatsAppAudio/${selectedInstanceName}`;
        payload = { audio: audioUrl };
        break;
      default:
        toast.error('Tipo de mensagem inválido.');
        return;
    }

    setIsSendingBroadcast(true);
    let successfulSends = 0;
    let failedSends = 0;

    // Itera sobre cada grupo selecionado e envia a mensagem
    for (const groupJid of selectedGroups) {
      try {
        // O campo "number" no payload da API deve ser o groupJid
        const currentPayload = { ...payload, number: groupJid };
        await evo.post(endpoint, currentPayload);
        successfulSends++;
      } catch (error) {
        console.error(
          `Falha ao enviar para o grupo ${groupJid}:`,
          error,
        );
        failedSends++;
      }
    }

    setIsSendingBroadcast(false);

    // Exibe toasts de sucesso/falha
    if (successfulSends > 0) {
      toast.success(
        `${successfulSends} mensagem(ns) enviada(s) com sucesso!`,
      );
    }
    if (failedSends > 0) {
      toast.error(
        `${failedSends} mensagem(ns) falhou(ram) ao enviar. Verifique o console para detalhes.`,
      );
    }
    // Opcional: Limpar os inputs após o envio
    setMessage('');
    setMediaUrl('');
    setMediaMimeType('');
    setMediaFileName('');
    setAudioUrl('');
  }, [
    selectedInstanceName,
    selectedGroups,
    messageType,
    message,
    mediaUrl,
    mediaMimeType,
    mediaFileName,
    audioUrl,
  ]);

  const handleCreateGroup = async () => {
    if (
      !selectedInstanceName ||
      !newGroupName.trim() ||
      !newGroupParticipants.trim()
    ) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    const instance = instances.find(
      (i) => i.id === selectedInstanceName,
    );
    if (!instance) {
      toast.error('Instância não encontrada.');
      return;
    }
    try {
      setIsLoading(true);
      const participants = newGroupParticipants
        .split('\n')
        .map((num) => num.trim())
        .filter((num) => num.length > 0);
      const response = await api.main.post(
        `/groups/create/${instance.instanceName}`,
        {
          subject: newGroupName.trim(),
          description: newGroupDescription.trim() || undefined,
          participants,
        },
      );
      if (response.data.success) {
        toast.success('Grupo criado com sucesso!');
        setShowCreateGroupModal(false);
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupParticipants('');
        fetchGroups(instance.instanceName);
      } else {
        toast.error(response.data.message || 'Erro ao criar grupo.');
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast.error('Erro ao criar grupo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenGroupDetails = async (group: Grupo) => {
    setSelectedGroup(group);
    setShowGroupDetailsModal(true);
    setActiveTab('info');
    setCurrentGroupSettings({
      announce: group.announce,
      restrict: group.restrict,
      ephemeralDuration: group.ephemeralDuration,
    });
    setInviteCodeCopied(false);
    if ((!group.inviteCode && group.isAdmin) || group.isSuperAdmin) {
      await fetchGroupInviteCode(group.id);
    }
  };

  const fetchGroupInviteCode = async (groupJid: string) => {
    const instance = instances.find(
      (i) => i.id === selectedInstanceName,
    );
    if (!instance) return;
    try {
      setIsLoading(true);
      const response = await api.main.get(
        `/groups/inviteCode/${instance.instanceName}?groupJid=${groupJid}`,
      );
      if (response.data.success && selectedGroup) {
        setSelectedGroup((prev) =>
          prev
            ? { ...prev, inviteCode: response.data.data.code }
            : null,
        );
        toast.success('Código de convite obtido!');
      } else {
        toast.error('Erro ao obter código de convite.');
      }
    } catch (error) {
      console.error('Erro ao obter código de convite:', error);
      toast.error('Erro ao obter código de convite.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (selectedGroup?.inviteCode) {
      navigator.clipboard.writeText(
        `https://chat.whatsapp.com/${selectedGroup.inviteCode}`,
      );
      setInviteCodeCopied(true);
      toast.success('Link de convite copiado!');
      setTimeout(() => setInviteCodeCopied(false), 2000);
    }
  };

  const handleRevokeInviteCode = async () => {
    if (!selectedGroup || !selectedInstanceName) return;
    const instance = instances.find(
      (i) => i.id === selectedInstanceName,
    );
    if (!instance) {
      toast.error('Instância não encontrada.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.main.post(
        `/groups/revokeInviteCode/${instance.instanceName}?groupJid=${selectedGroup.id}`,
      );
      if (response.data.success) {
        toast.success('Link de convite revogado com sucesso!');
        setSelectedGroup((prev) =>
          prev ? { ...prev, inviteCode: undefined } : null,
        );
      } else {
        toast.error('Erro ao revogar link de convite.');
      }
    } catch (error) {
      console.error('Erro ao revogar link de convite:', error);
      toast.error('Erro ao revogar link de convite.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInviteUrl = async () => {
    if (
      !selectedGroup ||
      !selectedInstanceName ||
      !inviteNumbers.trim()
    ) {
      toast.error(
        'Selecione um grupo, uma instância e insira os números.',
      );
      return;
    }
    const instance = instances.find(
      (i) => i.id === selectedInstanceName,
    );
    if (!instance) {
      toast.error('Instância não encontrada.');
      return;
    }
    try {
      setIsLoading(true);
      const numbersArray = inviteNumbers
        .split('\n')
        .map((num) => num.trim())
        .filter((num) => num.length > 0);
      const payload = {
        groupJid: selectedGroup.id,
        description: inviteDescription.trim() || undefined,
        numbers: numbersArray,
      };
      const response = await api.main.post(
        `/groups/sendInvite/${instance.instanceName}`,
        payload,
      );
      if (response.data.success) {
        toast.success('Convite enviado com sucesso!');
        setInviteNumbers('');
        setInviteDescription('');
      } else {
        toast.error(
          response.data.message || 'Erro ao enviar convite.',
        );
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast.error('Erro ao enviar convite.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateParticipant = async (
    groupJid: string,
    participantId: string,
    action: 'add' | 'remove' | 'promote' | 'demote',
  ) => {
    if (!selectedInstanceName) {
      toast.error('Selecione uma instância.');
      return;
    }
    const instance = instances.find(
      (i) => i.id === selectedInstanceName,
    );
    if (!instance) {
      toast.error('Instância não encontrada.');
      return;
    }
    try {
      setIsLoading(true);
      const participantsArray = [participantId];
      const response = await api.main.post(
        `/groups/updateParticipant/${instance.instanceName}?groupJid=${groupJid}`,
        {
          action,
          participants: participantsArray,
        },
      );
      if (response.data.success) {
        toast.success(
          `Participante ${
            action === 'add'
              ? 'adicionado'
              : action === 'remove'
              ? 'removido'
              : action === 'promote'
              ? 'promovido'
              : 'demovido'
          } com sucesso!`,
        );
        setNewParticipantNumber('');
        fetchGroups(instance.instanceName);
      } else {
        toast.error(
          response.data.message || `Erro ao ${action} participante.`,
        );
      }
    } catch (error) {
      console.error(`Erro ao ${action} participante:`, error);
      toast.error(`Erro ao ${action} participante.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroupSettings = async (groupJid: string) => {
    if (!selectedGroup || !selectedInstanceName) return;
    const instance = instances.find(
      (i) => i.id === selectedInstanceName,
    );
    if (!instance) {
      toast.error('Instância não encontrada.');
      return;
    }
    try {
      setIsLoading(true);
      // Update announcement setting
      await api.main.post(
        `/group/updateSetting/${instance.instanceName}?groupJid=${groupJid}`,
        {
          action: currentGroupSettings.announce
            ? 'announcement'
            : 'not_announcement',
        },
      );

      // Update restrict setting
      await api.main.post(
        `/group/updateSetting/${instance.instanceName}?groupJid=${groupJid}`,
        {
          action: currentGroupSettings.restrict
            ? 'locked'
            : 'unlocked',
        },
      );

      // Update ephemeral duration setting
      await api.main.post(
        `/group/toggleEphemeral/${instance.instanceName}?groupJid=${groupJid}`,
        { expiration: currentGroupSettings.ephemeralDuration },
      );

      toast.success(
        'Configurações do grupo atualizadas com sucesso!',
      );
      fetchGroups(instance.instanceName);
    } catch (error) {
      console.error(
        'Erro ao atualizar configurações do grupo:',
        error,
      );
      toast.error('Erro ao atualizar configurações do grupo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async (groupJid: string) => {
    if (!selectedInstanceName) {
      toast.error('Selecione uma instância.');
      return;
    }
    const instance = instances.find(
      (i) => i.id === selectedInstanceName,
    );
    if (!instance) {
      toast.error('Instância não encontrada.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.main.delete(
        `/group/leaveGroup/${instance.instanceName}?groupJid=${groupJid}`,
      );
      if (response.data.success) {
        toast.success('Você saiu do grupo com sucesso!');
        setShowGroupDetailsModal(false);
        setSelectedGroup(null);
        fetchGroups(instance.instanceName);
      } else {
        toast.error(
          response.data.message || 'Erro ao sair do grupo.',
        );
      }
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      toast.error('Erro ao sair do grupo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Componente do Modal de Detalhes do Grupo
  const GroupDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    group: Grupo | null;
  }> = ({ isOpen, onClose, group }) => {
    if (!group) return null;

    return (
      <CustomDialog
        isOpen={isOpen}
        onClose={onClose}
        title={group.subject}
        className="max-w-3xl"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Navegação por Tabs */}
          <div className="flex flex-col gap-2 p-2 bg-deep/30 rounded-lg border border-electric/20">
            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors duration-200',
                activeTab === 'info'
                  ? 'bg-electric/20 text-blue-600 font-semibold'
                  : 'text-white/70 hover:bg-white/10',
              )}
            >
              <FaInfoCircle className="w-5 h-5" /> Informações
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors duration-200',
                activeTab === 'participants'
                  ? 'bg-electric/20 text-electric font-semibold'
                  : 'text-white/70 hover:bg-white/10',
              )}
            >
              <FaUsers className="w-5 h-5" /> Participantes (
              {group.participants?.length || 0})
            </button>
            {(group.isAdmin || group.isSuperAdmin) && (
              <>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors duration-200',
                    activeTab === 'settings'
                      ? 'bg-electric/20 text-electric font-semibold'
                      : 'text-white/70 hover:bg-white/10',
                  )}
                >
                  <FaCog className="w-5 h-5" /> Configurações
                </button>
                <button
                  onClick={() => setActiveTab('invite')}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors duration-200',
                    activeTab === 'invite'
                      ? 'bg-electric/20 text-electric font-semibold'
                      : 'text-white/70 hover:bg-white/10',
                  )}
                >
                  <FaLink className="w-5 h-5" /> Convite
                </button>
              </>
            )}
          </div>

          {/* Conteúdo das Tabs */}
          <div className="flex-1 p-4 bg-deep/30 rounded-lg border border-electric/20">
            {activeTab === 'info' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Informações do Grupo
                </h3>
                {group.pictureUrl && (
                  <img
                    src={group.pictureUrl}
                    alt="Group Profile"
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-electric/50"
                  />
                )}
                <p className="text-white/70">
                  <span className="font-semibold text-white">
                    Nome:
                  </span>{' '}
                  {group.subject}
                </p>
                <p className="text-white/70">
                  <span className="font-semibold text-white">
                    Descrição:
                  </span>{' '}
                  {group.desc || 'N/A'}
                </p>
                <p className="text-white/70">
                  <span className="font-semibold text-white">
                    ID do Grupo:
                  </span>{' '}
                  <span className="break-all">{group.id}</span>
                </p>
                <p className="text-white/70">
                  <span className="font-semibold text-white">
                    Criado em:
                  </span>{' '}
                  {group.creation
                    ? new Date(
                        group.creation * 1000,
                      ).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p className="text-white/70">
                  <span className="font-semibold text-white">
                    Membros:
                  </span>{' '}
                  {group.size}
                </p>
                <p className="text-white/70">
                  <span className="font-semibold text-white">
                    Modo Anúncio:
                  </span>{' '}
                  {group.announce ? (
                    <FaCheckCircle className="inline-block text-neon-green ml-1" />
                  ) : (
                    <FaTimesCircle className="inline-block text-red-500 ml-1" />
                  )}
                </p>
                <p className="text-white/70">
                  <span className="font-semibold text-white">
                    Restrições de Edição:
                  </span>{' '}
                  {group.restrict ? (
                    <FaCheckCircle className="inline-block text-neon-green ml-1" />
                  ) : (
                    <FaTimesCircle className="inline-block text-red-500 ml-1" />
                  )}
                </p>
                <p className="text-white/70">
                  <span className="font-semibold text-white">
                    Mensagens Temporárias:
                  </span>{' '}
                  {group.ephemeralDuration === 0
                    ? 'Desativado'
                    : `${
                        group.ephemeralDuration / (24 * 60 * 60)
                      } dias`}
                </p>
              </motion.div>
            )}

            {activeTab === 'participants' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Participantes
                </h3>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {group.participants &&
                  group.participants.length > 0 ? (
                    <ul className="space-y-2">
                      {group.participants.map((participant) => (
                        <li
                          key={participant.id}
                          className="flex items-center justify-between bg-deep/50 p-3 rounded-lg border border-electric/20"
                        >
                          <div className="flex items-center gap-3">
                            {participant.admin === 'superadmin' ? (
                              <FaCrown
                                className="text-yellow-400"
                                title="Super Admin"
                              />
                            ) : participant.admin === 'admin' ? (
                              <FaUserShield
                                className="text-blue-400"
                                title="Admin"
                              />
                            ) : (
                              <FaUsers className="text-white/60" />
                            )}
                            <span className="text-white">
                              {participant.name ||
                                participant.notify ||
                                participant.id.split('@')[0]}
                            </span>
                          </div>
                          {(group.isAdmin || group.isSuperAdmin) &&
                            !participant.admin && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateParticipant(
                                      group.id,
                                      participant.id,
                                      'promote',
                                    )
                                  }
                                  className="bg-electric/20 text-electric hover:bg-electric/30"
                                >
                                  Promover
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateParticipant(
                                      group.id,
                                      participant.id,
                                      'remove',
                                    )
                                  }
                                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                >
                                  <FaUserMinus />
                                </Button>
                              </div>
                            )}
                          {(group.isAdmin || group.isSuperAdmin) &&
                            participant.admin &&
                            participant.admin !== 'superadmin' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateParticipant(
                                      group.id,
                                      participant.id,
                                      'demote',
                                    )
                                  }
                                  className="bg-electric/20 text-electric hover:bg-electric/30"
                                >
                                  Demover
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateParticipant(
                                      group.id,
                                      participant.id,
                                      'remove',
                                    )
                                  }
                                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                >
                                  <FaUserMinus />
                                </Button>
                              </div>
                            )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/60">
                      Nenhum participante encontrado.
                    </p>
                  )}
                </div>
                {(group.isAdmin || group.isSuperAdmin) && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Adicionar Participante
                    </h4>
                    <Input
                      type="text"
                      placeholder="Número do participante (ex: 5511987654321)"
                      className="bg-deep/50 text-white placeholder-white/50 border-electric mb-2"
                      value={newParticipantNumber}
                      onChange={(e) =>
                        setNewParticipantNumber(e.target.value)
                      }
                    />
                    <Button
                      onClick={() =>
                        handleUpdateParticipant(
                          group.id,
                          newParticipantNumber,
                          'add',
                        )
                      }
                      className="bg-neon-green text-deep hover:bg-neon-green/80 w-full"
                      disabled={!newParticipantNumber.trim()}
                    >
                      Adicionar
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' &&
              (group.isAdmin || group.isSuperAdmin) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    Configurações do Grupo
                  </h3>
                  <div className="flex items-center justify-between bg-deep/50 p-4 rounded-lg border border-electric/20">
                    <label
                      htmlFor="announce-mode"
                      className="text-white"
                    >
                      Modo Anúncio (Apenas Admins podem enviar
                      mensagens)
                    </label>
                    <input
                      type="checkbox"
                      id="announce-mode"
                      checked={currentGroupSettings.announce || false}
                      onChange={(e) =>
                        setCurrentGroupSettings((prev) => ({
                          ...prev,
                          announce: e.target.checked,
                        }))
                      }
                      className="form-checkbox h-6 w-6 text-neon-green bg-deep border-electric rounded focus:ring-neon-green"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-deep/50 p-4 rounded-lg border border-electric/20">
                    <label
                      htmlFor="restrict-mode"
                      className="text-white"
                    >
                      Modo Restrito (Apenas Admins podem editar
                      configurações)
                    </label>
                    <input
                      type="checkbox"
                      id="restrict-mode"
                      checked={currentGroupSettings.restrict || false}
                      onChange={(e) =>
                        setCurrentGroupSettings((prev) => ({
                          ...prev,
                          restrict: e.target.checked,
                        }))
                      }
                      className="form-checkbox h-6 w-6 text-neon-green bg-deep border-electric rounded focus:ring-neon-green"
                    />
                  </div>
                  <div className="bg-deep/50 p-4 rounded-lg border border-electric/20 space-y-2">
                    <label
                      htmlFor="ephemeral-duration"
                      className="text-white block mb-2"
                    >
                      Mensagens Temporárias
                    </label>
                    <Select
                      value={String(
                        currentGroupSettings.ephemeralDuration,
                      )}
                      onValueChange={(value) =>
                        setCurrentGroupSettings((prev) => ({
                          ...prev,
                          ephemeralDuration: Number(value),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full bg-deep/50 border-electric text-white">
                        <SelectValue placeholder="Selecione a duração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Desativado</SelectItem>
                        <SelectItem value="86400">
                          24 Horas
                        </SelectItem>
                        <SelectItem value="604800">7 Dias</SelectItem>
                        <SelectItem value="7776000">
                          90 Dias
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() =>
                      handleUpdateGroupSettings(group.id)
                    }
                    className="bg-neon-green text-deep hover:bg-neon-green/80 w-full"
                  >
                    Salvar Configurações
                  </Button>
                </motion.div>
              )}

            {activeTab === 'invite' &&
              (group.isAdmin || group.isSuperAdmin) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">
                    Link de Convite
                  </h3>
                  {group.inviteCode ? (
                    <div className="bg-deep/50 p-4 rounded-lg border border-electric/20 space-y-4">
                      <p className="text-white/70 break-all">{`https://chat.whatsapp.com/${group.inviteCode}`}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCopyInviteCode}
                          className="bg-electric/20 text-electric hover:bg-electric/30 flex-1"
                        >
                          {inviteCodeCopied ? (
                            <FaCheckCircle className="mr-2" />
                          ) : (
                            <FaCopy className="mr-2" />
                          )}
                          {inviteCodeCopied
                            ? 'Copiado!'
                            : 'Copiar Link'}
                        </Button>
                        <Button
                          onClick={handleRevokeInviteCode}
                          variant="destructive"
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 flex-1"
                        >
                          Revogar Link
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/60">
                      Nenhum link de convite disponível. Clique em
                      "Obter Link" para gerar um.
                    </p>
                  )}
                  <Button
                    onClick={() => fetchGroupInviteCode(group.id)}
                    className="bg-electric/20 text-electric hover:bg-electric/30 w-full"
                    disabled={!!group.inviteCode}
                  >
                    Obter Link de Convite
                  </Button>

                  <h3 className="text-xl font-bold text-white mb-4 mt-8">
                    Enviar Convite Direto
                  </h3>
                  <div className="bg-deep/50 p-4 rounded-lg border border-electric/20 space-y-4">
                    <textarea
                      placeholder="Números dos destinatários (um por linha)&#10;Ex: 5511987654321"
                      value={inviteNumbers}
                      onChange={(e) =>
                        setInviteNumbers(e.target.value)
                      }
                      className="w-full p-3 rounded-lg bg-deep/70 text-white placeholder-white/60 border border-electric focus:ring-1 focus:ring-electric focus:border-electric transition-colors duration-200 min-h-[80px]"
                    />
                    <Input
                      type="text"
                      placeholder="Descrição do convite (opcional)"
                      value={inviteDescription}
                      onChange={(e) =>
                        setInviteDescription(e.target.value)
                      }
                      className="bg-deep/50 text-white placeholder-white/50 border-electric"
                    />
                    <Button
                      onClick={handleSendInviteUrl}
                      className="bg-neon-green text-deep hover:bg-neon-green/80 w-full"
                      disabled={!inviteNumbers.trim()}
                    >
                      <IoMdSend className="mr-2" /> Enviar Convite
                    </Button>
                  </div>
                </motion.div>
              )}

            {(group.isAdmin || group.isSuperAdmin) && (
              <div className="mt-8 pt-6 border-t border-electric/20">
                <Button
                  onClick={() => handleLeaveGroup(group.id)}
                  variant="destructive"
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 w-full"
                >
                  <FaSignOutAlt className="mr-2" /> Sair do Grupo
                </Button>
              </div>
            )}
          </div>
        </div>
      </CustomDialog>
    );
  };

  // Componente do Modal de Criação de Grupo
  const CreateGroupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: () => void;
    isLoading: boolean;
  }> = ({ isOpen, onClose, onCreate, isLoading }) => (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Novo Grupo"
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="new-group-name"
            className="block text-white text-sm font-medium mb-2"
          >
            Nome do Grupo
          </label>
          <Input
            id="new-group-name"
            type="text"
            placeholder="Nome do seu novo grupo"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="bg-deep/50 text-white placeholder-white/50 border-electric"
          />
        </div>
        <div>
          <label
            htmlFor="new-group-description"
            className="block text-white text-sm font-medium mb-2"
          >
            Descrição (Opcional)
          </label>
          <Input
            id="new-group-description"
            type="text"
            placeholder="Descrição do grupo"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            className="bg-deep/50 text-white placeholder-white/50 border-electric"
          />
        </div>
        <div>
          <label
            htmlFor="new-group-participants"
            className="block text-white text-sm font-medium mb-2"
          >
            Participantes (Um número por linha, com código do país)
          </label>
          <textarea
            id="new-group-participants"
            placeholder="Ex:&#10;5511987654321&#10;5521912345678"
            value={newGroupParticipants}
            onChange={(e) => setNewGroupParticipants(e.target.value)}
            className="w-full p-3 rounded-lg bg-deep/50 text-white placeholder-white/50 border border-electric focus:ring-1 focus:ring-electric focus:border-electric transition-colors duration-200 min-h-[120px]"
          />
        </div>
        <Button
          onClick={onCreate}
          className="bg-neon-green text-deep hover:bg-neon-green/80 w-full"
          disabled={
            isLoading ||
            !newGroupName.trim() ||
            !newGroupParticipants.trim()
          }
        >
          {isLoading ? 'Criando...' : 'Criar Grupo'}
        </Button>
      </div>
    </CustomDialog>
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
      {isInitialLoading ? (
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
                Carregando Grupos
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
      ) : (
        <>
          {/* Seção do Cabeçalho */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Grupos
              </h1>
              <p className="text-white/60 mt-2">
                Gerencie seus grupos de WhatsApp
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowCreateGroupModal(true)}
                className="bg-neon-green text-deep hover:bg-neon-green/80"
              >
                <FiPlus className="mr-2" /> Criar Grupo
              </Button>
            </div>
          </div>

          {/* Seleção de Instância e Busca */}
          <div className="flex gap-4 items-center flex-wrap">
            <Select
              value={selectedInstanceName}
              onValueChange={handleInstanceChange}
            >
              <SelectTrigger className="w-[200px] bg-deep/50 border-electric text-white">
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                {instances.length > 0 ? (
                  instances.map((instance) => (
                    <SelectItem
                      key={instance.id}
                      value={instance.instanceName}
                    >
                      {instance.profileName || instance.instanceName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Nenhuma instância disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] bg-deep/50 text-white placeholder-white/50 border-electric"
            />
          </div>

          {/* Ações de Grupo e Lista */}
          {filteredGroups.length === 0 &&
          !isLoading &&
          searchTerm === '' ? (
            <EmptyState
              onNewGroup={() => setShowCreateGroupModal(true)}
              searchTerm={searchTerm}
            />
          ) : filteredGroups.length === 0 && searchTerm !== '' ? (
            <EmptyState
              onNewGroup={() => setShowCreateGroupModal(true)}
              searchTerm={searchTerm}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  className="bg-deep/50 border-electric text-white hover:bg-electric/20"
                >
                  {selectedGroups.length === filteredGroups.length &&
                  filteredGroups.length > 0
                    ? 'Desmarcar Todos'
                    : 'Selecionar Todos'}
                </Button>
                <Button
                  onClick={handleSendMessageToSelectedGroups}
                  className="bg-neon-green text-deep hover:bg-neon-green/80"
                  disabled={
                    selectedGroups.length === 0 ||
                    isLoading || // Desabilita o botão enquanto estiver carregando
                    (messageType === 'text' && !message.trim()) ||
                    (messageType === 'media' &&
                      (!mediaUrl.trim() || !mediaMimeType.trim())) ||
                    (messageType === 'audio' && !audioUrl.trim())
                  }
                >
                  <IoMdSend className="mr-2" /> Enviar Mensagem (
                  {selectedGroups.length})
                </Button>
              </div>

              {selectedInstanceName && (
                <motion.div
                  initial="out"
                  animate="in"
                  exit="out"
                  variants={pageTransition}
                  className="bg-deep/90 border border-electric/20 rounded-xl p-6 mb-8 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Configurações de Disparo
                  </h2>
                  <div className="mb-4">
                    <label
                      htmlFor="message-type-select"
                      className="block text-white text-sm font-medium mb-2"
                    >
                      Tipo de Mensagem:
                    </label>
                    <Select
                      value={messageType}
                      onValueChange={(
                        value: 'text' | 'media' | 'audio',
                      ) => setMessageType(value)}
                    >
                      <SelectTrigger
                        id="message-type-select"
                        className="w-full"
                      >
                        <SelectValue placeholder="Selecione o tipo de mensagem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="media">
                          Mídia (Imagem/Vídeo/Documento)
                        </SelectItem>
                        <SelectItem value="audio">
                          Áudio Narrado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campos de input de mensagem com base no messageType */}
                  {messageType === 'text' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label
                        htmlFor="text-message-input"
                        className="block text-white text-sm font-medium mb-2"
                      >
                        Mensagem de Texto:
                      </label>
                      <textarea
                        id="text-message-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite sua mensagem de texto..."
                        className="w-full p-3 rounded-lg bg-deep/70 text-white placeholder-white/60 border border-electric focus:ring-1 focus:ring-electric focus:border-electric transition-colors duration-200 min-h-[100px]"
                      />
                    </motion.div>
                  )}

                  {messageType === 'media' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label
                        htmlFor="media-url-input"
                        className="block text-white text-sm font-medium mb-2"
                      >
                        URL da Mídia:
                      </label>
                      <Input
                        id="media-url-input"
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="Ex: https://example.com/image.png"
                        className="w-full p-3 rounded-lg bg-deep/70 text-white placeholder-white/60 border border-electric focus:ring-1 focus:ring-electric focus:border-electric transition-colors duration-200"
                      />
                      <label
                        htmlFor="media-mimetype-input"
                        className="block text-white text-sm font-medium mb-2 mt-4"
                      >
                        MIME Type (Ex: image/png, video/mp4,
                        application/pdf):
                      </label>
                      <Input
                        id="media-mimetype-input"
                        type="text"
                        value={mediaMimeType}
                        onChange={(e) =>
                          setMediaMimeType(e.target.value)
                        }
                        placeholder="Ex: image/png"
                        className="w-full p-3 rounded-lg bg-deep/70 text-white placeholder-white/60 border border-electric focus:ring-1 focus:ring-electric focus:border-electric transition-colors duration-200"
                      />
                      <label
                        htmlFor="media-filename-input"
                        className="block text-white text-sm font-medium mb-2 mt-4"
                      >
                        Nome do Arquivo (Opcional):
                      </label>
                      <Input
                        id="media-filename-input"
                        type="text"
                        value={mediaFileName}
                        onChange={(e) =>
                          setMediaFileName(e.target.value)
                        }
                        placeholder="Ex: MinhaImagem.png"
                        className="w-full p-3 rounded-lg bg-deep/70 text-white placeholder-white/60 border border-electric focus:ring-1 focus:ring-electric focus:border-electric transition-colors duration-200"
                      />
                      <label
                        htmlFor="media-caption-input"
                        className="block text-white text-sm font-medium mb-2 mt-4"
                      >
                        Legenda (Opcional):
                      </label>
                      <textarea
                        id="media-caption-input"
                        value={message} // Reutilizando o estado 'message' para a legenda
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite uma legenda para a mídia..."
                        className="w-full p-3 rounded-lg bg-deep/70 text-white placeholder-white/60 border border-electric focus:ring-1 focus:ring-electric focus:border-electric transition-colors duration-200 min-h-[60px]"
                      />
                    </motion.div>
                  )}

                  {messageType === 'audio' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label
                        htmlFor="audio-url-input"
                        className="block text-white text-sm font-medium mb-2"
                      >
                        URL do Áudio Narrado (MP3):
                      </label>
                      <Input
                        id="audio-url-input"
                        type="url"
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        placeholder="Ex: https://example.com/audio.mp3"
                        className="w-full p-3 rounded-lg bg-deep/70 text-white placeholder-white/60 border border-electric focus:ring-1 focus:ring-electric focus:border-electric transition-colors duration-200"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onOpenDetails={handleOpenGroupDetails}
                      onSelect={handleGroupSelect}
                      isSelected={selectedGroups.includes(group.id)}
                      isAdmin={
                        group.isAdmin || group.isSuperAdmin || false
                      }
                    />
                  ))}
                </div>
              </AnimatePresence>
            </>
          )}
        </>
      )}

      {/* Modais */}
      <GroupDetailsModal
        isOpen={showGroupDetailsModal}
        onClose={() => setShowGroupDetailsModal(false)}
        group={selectedGroup}
      />

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreate={handleCreateGroup}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
