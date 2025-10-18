// src/pages/Aquecimento.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useWarmup } from '@/hooks/useWarmup';
import { cn } from '@/lib/utils';
import type { MediaContent, WarmupConfig } from '@/types/warmup';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Flame,
  Image,
  Loader2,
  MessageCircle,
  Music,
  Play,
  RefreshCw,
  Settings,
  Square,
  Trash2,
  Upload,
  Video,
  Volume2,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const REACTION_EMOJIS = [
  '👍', '❤️', '😂', '🔥', '👏', '🤔', '😍', '🙌', '👌', '🤯',
];

const MEDIA_TYPES = [
  { value: 'image', label: 'Imagens', icon: Image },
  { value: 'video', label: 'Vídeos', icon: Video },
  { value: 'audio', label: 'Áudios', icon: Volume2 },
  { value: 'sticker', label: 'Stickers', icon: Zap },
];

export default function Aquecimento() {
  // Use custom warmup hook
  const {
    instancesData,
    warmupStatus,
    isLoading,
    isWarmingUp,
    startingWarmup,
    stoppingWarmup,
    hasError,
    instancesError,
    handleStartWarmup,
    handleStopWarmup,
    refreshData,
    getMaxMessageLimit,
  } = useWarmup();

  // Estados locais
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());
  const [currentText, setCurrentText] = useState('');
  const [texts, setTexts] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'sticker'>('image');
  const [media, setMedia] = useState<{
    images: MediaContent[];
    videos: MediaContent[];
    audios: MediaContent[];
    stickers: MediaContent[];
  }>({
    images: [],
    videos: [],
    audios: [],
    stickers: [],
  });
  const [messageLimit, setMessageLimit] = useState<number>(20);

  // Atualizar limite baseado no plano
  useEffect(() => {
    if (instancesData?.currentPlan) {
      const maxLimit = getMaxMessageLimit(instancesData.currentPlan);
      setMessageLimit(prev => Math.min(prev, maxLimit));
    }
  }, [instancesData?.currentPlan, getMaxMessageLimit]);

  // Função para toggle de instância
  const toggleInstanceSelection = useCallback((instanceName: string) => {
    setSelectedInstances(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(instanceName)) {
        newSelection.delete(instanceName);
      } else {
        newSelection.add(instanceName);
      }
      return newSelection;
    });
  }, []);

  // Função para adicionar texto
  const addText = useCallback(() => {
    if (currentText.trim()) {
      setTexts(prev => [...prev, currentText.trim()]);
      setCurrentText('');
      toast({
        title: "Texto adicionado",
        description: "Texto adicionado à lista de aquecimento",
      });
    }
  }, [currentText]);

  // Função para remover texto
  const removeText = useCallback((index: number) => {
    setTexts(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Função para processar upload de arquivo
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxTotalSize = 50 * 1024 * 1024; // 50MB

    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    if (totalSize > maxTotalSize) {
      toast({
        title: "Erro",
        description: "O tamanho total dos arquivos excede 50MB",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const file of Array.from(files)) {
        if (file.size > maxFileSize) {
          toast({
            title: "Arquivo muito grande",
            description: `O arquivo ${file.name} excede 10MB`,
            variant: "destructive",
          });
          continue;
        }

        const base64 = await fileToBase64(file);
        const newMedia: MediaContent = {
          type: mediaType,
          base64: base64.split(',')[1],
          fileName: file.name,
          mimetype: file.type,
          preview: base64,
        };

        setMedia(prev => ({
          ...prev,
          [mediaType === 'sticker' ? 'stickers' : `${mediaType}s`]: [
            ...prev[mediaType === 'sticker' ? 'stickers' : `${mediaType}s` as keyof typeof prev],
            newMedia
          ]
        }));
      }

      toast({
        title: "Arquivos processados",
        description: "Arquivos adicionados com sucesso",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivos",
        variant: "destructive",
      });
    }
  }, [mediaType]);

  // Função auxiliar para converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Função para remover mídia
  const removeMedia = useCallback((index: number, type: keyof typeof media) => {
    setMedia(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  }, []);

  // Função para iniciar aquecimento
  const onStartWarmup = useCallback(async () => {
    if (selectedInstances.size < 2) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos duas instâncias",
        variant: "destructive",
      });
      return;
    }

    if (!instancesData?.instances) return;

    const phoneInstances = instancesData.instances
      .filter(instance =>
        selectedInstances.has(instance.instanceName) &&
        instance.ownerJid?.trim()
      )
      .map(instance => ({
        phoneNumber: instance.ownerJid!.trim().replace('@s.whatsapp.net', ''),
        instanceId: instance.instanceName,
        ownerJid: instance.ownerJid!.trim(),
      }));

    const payload: WarmupConfig = {
      phoneInstances,
      contents: {
        texts,
        images: media.images,
        audios: media.audios,
        videos: media.videos,
        stickers: media.stickers,
        emojis: REACTION_EMOJIS,
      },
      config: {
        textChance: 0.3,
        audioChance: 0.3,
        reactionChance: 0.3,
        stickerChance: 0.4,
        imageChance: 0.1,
        videoChance: 0.1,
        minDelay: 3000,
        maxDelay: 90000,
        maxMessagesPerDay: messageLimit,
      },
    };

    try {
      const result = await handleStartWarmup(payload);

      if (result?.success) {
        toast({
          title: "Aquecimento iniciado",
          description: "O processo de aquecimento foi iniciado com sucesso",
        });
        // Force refresh of warmup status to update UI immediately
        await refreshData();
      } else {
        throw new Error(result?.message || "Erro desconhecido");
      }
    } catch (error) {
      console.error('Erro ao iniciar aquecimento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao iniciar aquecimento",
        variant: "destructive",
      });
    }
  }, [selectedInstances, instancesData, texts, media, messageLimit, handleStartWarmup, refreshData]);

  // Função para parar aquecimento
  const onStopWarmup = useCallback(async () => {
    console.log('🛑 onStopWarmup iniciado', { stoppingWarmup, isWarmingUp });
    try {
      const result = await handleStopWarmup();
      console.log('🛑 handleStopWarmup result:', result);

      if (result?.success) {
        toast({
          title: "Aquecimento parado",
          description: "O processo de aquecimento foi parado com sucesso",
        });
        // Force refresh of warmup status to update UI immediately
        await refreshData();
        console.log('🛑 Refresh completo após parar');
      } else {
        throw new Error(result?.message || "Erro desconhecido");
      }
    } catch (error) {
      console.error('❌ Erro ao parar aquecimento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao parar aquecimento",
        variant: "destructive",
      });
    }
  }, [handleStopWarmup, refreshData, stoppingWarmup, isWarmingUp]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
          <p className="text-muted-foreground">
            {instancesError?.message?.includes('404')
              ? 'Endpoint de instâncias não encontrado. Verifique se o backend está rodando.'
              : 'Não foi possível carregar as instâncias'
            }
          </p>
          <Button onClick={refreshData} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!instancesData || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8" data-tour="warmup-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-neon-blue to-neon-green bg-clip-text text-transparent">
            Aquecer WhatsApp
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Aqueça suas instâncias do WhatsApp para melhor deliverabilidade
          </p>
        </div>
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          className="gap-2 bg-deep/50 border-electric/30 hover:bg-deep-purple/60 text-white backdrop-blur-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </motion.div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-deep/50 rounded-xl p-4 sm:p-5 border border-electric/30 backdrop-blur-sm hover:bg-deep-purple/60 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-neon-green to-emerald-500 rounded-lg flex-shrink-0">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                Plano Atual
              </p>
              <p className="text-lg font-bold text-white capitalize truncate">
                {instancesData.currentPlan}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-deep/50 rounded-xl p-4 sm:p-5 border border-electric/30 backdrop-blur-sm hover:bg-deep-purple/60 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-electric to-blue-700 rounded-lg flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                Instâncias
              </p>
              <p className="text-lg font-bold text-white truncate">
                {instancesData.instances.length} / {instancesData.instanceLimit}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-deep/50 rounded-xl p-4 sm:p-5 border border-electric/30 backdrop-blur-sm hover:bg-deep-purple/60 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-neon-blue to-cyan-500 rounded-lg flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                Selecionadas
              </p>
              <p className="text-lg font-bold text-white">
                {selectedInstances.size}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-deep/50 rounded-xl p-4 sm:p-5 border border-electric/30 backdrop-blur-sm hover:bg-deep-purple/60 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg flex-shrink-0",
              isWarmingUp
                ? "bg-gradient-to-r from-neon-green to-emerald-500"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full",
                isWarmingUp ? "bg-white animate-pulse" : "bg-white/60"
              )} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                Status
              </p>
              <p className={cn(
                "text-lg font-bold",
                isWarmingUp ? "text-neon-green" : "text-gray-400"
              )}>
                {isWarmingUp ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Seleção de Instâncias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-deep/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-electric/30 backdrop-blur-sm"
        data-tour="instance-selection"
      >
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-electric to-blue-700 rounded-xl">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            Seleção de Instâncias
          </h2>
          <p className="text-gray-400 text-sm">
            Selecione pelo menos duas instâncias para iniciar o aquecimento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {instancesData.instances.map((instance, index) => (
            <motion.div
              key={instance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className={cn(
                "relative p-4 sm:p-5 rounded-xl cursor-pointer transition-all duration-200",
                "border backdrop-blur-sm",
                selectedInstances.has(instance.instanceName)
                  ? "border-neon-green/40 bg-neon-green/[0.08] shadow-md shadow-neon-green/10"
                  : "border-electric/30 bg-deep-purple/50 hover:border-neon-green/25 hover:bg-deep-purple/60"
              )}
              onClick={() => toggleInstanceSelection(instance.instanceName)}
            >
              {/* Selection Indicator */}
              {selectedInstances.has(instance.instanceName) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-neon-green to-emerald-500 text-white p-1.5 rounded-full shadow-md"
                >
                  <CheckCircle className="w-3 h-3" />
                </motion.div>
              )}

              <div className="flex items-start gap-3 mb-4">
                {/* Profile Picture */}
                <Avatar className="relative w-12 h-12 border-2 border-white/20 shadow-lg flex-shrink-0">
                  <AvatarImage
                    src={instance.profilePicUrl || ''}
                    alt={instance.profileName || instance.instanceName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-electric to-blue-700 text-white text-sm font-bold">
                    {instance.profileName || instance.instanceName ? (
                      (instance.profileName || instance.instanceName)
                        .charAt(0)
                        .toUpperCase()
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-white truncate mb-1">
                        {instance.instanceName}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {instance.profileName || 'Sem nome de perfil'}
                      </p>
                    </div>

                    {/* Status Indicator */}
                    <div className={cn(
                      "relative w-3 h-3 rounded-full shadow-sm flex-shrink-0 ml-2",
                      instance.connectionStatus === 'OPEN'
                        ? "bg-emerald-400"
                        : "bg-red-400"
                    )}>
                      {instance.connectionStatus === 'OPEN' && (
                        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse opacity-50" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {instance.ownerJid && (
                <p className="text-xs text-gray-500 font-mono mb-3 truncate">
                  {instance.ownerJid.split('@')[0]}
                </p>
              )}

              <div className="flex justify-end">
                <span className={cn(
                  "text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur-sm",
                  instance.connectionStatus === 'OPEN'
                    ? "bg-emerald-500/10 border border-emerald-400/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-400/30 text-red-400"
                )}>
                  {instance.connectionStatus === 'OPEN' ? 'Online' : 'Offline'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Configuração de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Textos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-deep/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-electric/30 backdrop-blur-sm"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-neon-green to-emerald-500 rounded-xl">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              Textos de Aquecimento
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="text-input" className="text-gray-300">Adicionar Texto</Label>
              <Textarea
                id="text-input"
                placeholder="Digite seu texto aqui..."
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="min-h-[100px] bg-deep/50 border-electric/30 text-white placeholder:text-gray-500 focus:border-neon-green/50 focus:ring-neon-green/20"
              />
              <Button
                onClick={addText}
                className="w-full bg-gradient-to-r from-neon-green to-emerald-500 hover:from-neon-green/80 hover:to-emerald-500/80 text-white border-0"
              >
                Adicionar Texto
              </Button>
            </div>

            {texts.length > 0 && (
              <div className="space-y-3">
                <Label className="text-gray-300">Textos Adicionados ({texts.length})</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {texts.map((text, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start justify-between p-3 bg-deep/50 rounded-lg border border-electric/30"
                    >
                      <span className="text-sm text-gray-300 flex-1 pr-2">{text}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeText(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upload de Mídia */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-deep/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-electric/30 backdrop-blur-sm"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-electric to-blue-700 rounded-xl">
                <Upload className="w-5 h-5 text-white" />
              </div>
              Upload de Mídia
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-gray-300">Tipo de Mídia</Label>
              <div className="grid grid-cols-2 gap-2">
                {MEDIA_TYPES.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={mediaType === value ? "default" : "outline"}
                    onClick={() => setMediaType(value as typeof mediaType)}
                    className={cn(
                      "justify-start gap-2 transition-all",
                      mediaType === value
                        ? "bg-gradient-to-r from-electric to-neon-blue/20 text-white border-0 hover:from-electric hover:to-neon-green"
                        : "bg-blue-500/10 border-blue-500/20 text-gray-300 hover:bg-blue-600/20 hover:border-neon-blue/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-300">Selecionar Arquivos</Label>
              <div className="relative">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept={
                    mediaType === 'image' ? 'image/*' :
                      mediaType === 'video' ? 'video/*' :
                        mediaType === 'audio' ? 'audio/*' :
                          'image/webp'
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-electric/30 rounded-xl bg-deep/50 hover:bg-deep-purple/60 hover:border-neon-blue/40 transition-all duration-300 cursor-pointer group">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-neon-blue mx-auto mb-2 transition-colors" />
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      Clique ou arraste arquivos aqui
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {mediaType === 'image' ? 'Imagens (JPG, PNG, GIF)' :
                        mediaType === 'video' ? 'Vídeos (MP4, MOV, AVI)' :
                          mediaType === 'audio' ? 'Áudios (MP3, WAV, M4A)' :
                            'Stickers (WebP)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview de Mídia */}
            {media[mediaType === 'sticker' ? 'stickers' : `${mediaType}s` as keyof typeof media].length > 0 && (
              <div className="space-y-3">
                <Label className="text-gray-300">
                  Preview ({media[mediaType === 'sticker' ? 'stickers' : `${mediaType}s` as keyof typeof media].length})
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {media[mediaType === 'sticker' ? 'stickers' : `${mediaType}s` as keyof typeof media].map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-deep/50 rounded-lg border border-electric/30 overflow-hidden aspect-square">
                        {mediaType === 'image' || mediaType === 'sticker' ? (
                          <img
                            src={item.preview}
                            alt={item.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : mediaType === 'video' ? (
                          <video
                            src={item.preview}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                            <Music className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500 text-center px-1 truncate w-full">
                              {item.fileName}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full h-6 w-6"
                        onClick={() => removeMedia(index, mediaType === 'sticker' ? 'stickers' : `${mediaType}s` as keyof typeof media)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Configurações Avançadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-deep/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-electric/30 backdrop-blur-sm"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-neon-purple to-purple-600 rounded-xl">
              <Settings className="w-5 h-5 text-white" />
            </div>
            Configurações de Aquecimento
          </h3>
          <p className="text-gray-400 text-sm">
            Configure o limite de mensagens diárias
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Mensagens por dia: {messageLimit}</Label>
              <span className="text-sm text-gray-400">
                Máximo: {getMaxMessageLimit(instancesData.currentPlan)}
              </span>
            </div>
            <Slider
              value={[messageLimit]}
              onValueChange={(value) => setMessageLimit(value[0])}
              max={getMaxMessageLimit(instancesData.currentPlan)}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Plano {instancesData.currentPlan}: máximo {getMaxMessageLimit(instancesData.currentPlan)} mensagens por dia por instância
            </p>
          </div>
        </div>
      </motion.div>

      {/* Controles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-deep/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-electric/30 backdrop-blur-sm"
      >
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-4">
          {!isWarmingUp || startingWarmup ? (
            <Button
              onClick={onStartWarmup}
              disabled={startingWarmup || stoppingWarmup || selectedInstances.size < 2}
              className="bg-gradient-to-r from-neon-green via-emerald-500 to-neon-blue hover:from-neon-green/90 hover:via-emerald-500/90 hover:to-neon-blue/90 text-white border-0 px-8 py-3 text-base font-semibold shadow-lg shadow-neon-green/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {startingWarmup ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Aquecimento
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={onStopWarmup}
              disabled={stoppingWarmup || startingWarmup}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 px-8 py-3 text-base font-semibold shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {stoppingWarmup ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Parando...
                </>
              ) : (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Parar Aquecimento
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Status do Aquecimento */}
      <AnimatePresence>
        {isWarmingUp && warmupStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/[0.03] rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-neon-green/30 backdrop-blur-sm shadow-lg shadow-neon-green/10"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-neon-green flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-neon-green to-emerald-500 rounded-xl">
                  <Flame className="w-5 h-5 text-white animate-pulse" />
                </div>
                Aquecimento Ativo
              </h3>
            </div>

            <div className="space-y-4">
              {Object.entries(warmupStatus.instances).map(([instanceName, data]) => (
                <motion.div
                  key={instanceName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-white/[0.05] rounded-xl border border-white/[0.1]"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-1">{instanceName}</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">
                        Mensagens enviadas hoje: <span className="text-neon-green font-medium">{data.dailyTotal || 0}</span>
                      </p>
                      {data.lastActive && (
                        <p className="text-xs text-gray-500">
                          Última atividade: {new Date(data.lastActive).toLocaleTimeString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm",
                      data.status === 'active'
                        ? "bg-neon-green/20 border border-neon-green/30 text-neon-green"
                        : data.status === 'paused'
                          ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                          : "bg-red-500/20 border border-red-500/30 text-red-400"
                    )}>
                      {data.status === 'active' ? 'Ativo' : data.status === 'paused' ? 'Pausado' : 'Parado'}
                    </div>
                    {messageLimit && data.dailyTotal !== undefined && (
                      <div className="text-xs text-gray-500">
                        {Math.round((data.dailyTotal / messageLimit) * 100)}% do limite
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
