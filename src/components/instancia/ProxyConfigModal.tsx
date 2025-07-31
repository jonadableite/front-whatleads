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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  getProxyConfig,
  setProxyConfig,
} from '@/services/evolutionApi.service';
import { Globe, Loader2, Settings, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProxyConfigModalProps {
  instanceName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

interface ProxyConfig {
  enabled: boolean;
  host: string;
  port: string;
  protocol: string;
  username?: string;
  password?: string;
}

const PROTOCOL_OPTIONS = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'socks4', label: 'SOCKS4' },
  { value: 'socks5', label: 'SOCKS5' },
];

export function ProxyConfigModal({
  instanceName,
  isOpen,
  onOpenChange,
  onUpdate,
}: ProxyConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ProxyConfig>({
    enabled: false,
    host: '',
    port: '',
    protocol: 'http',
    username: '',
    password: '',
  });

  // Carregar configuração atual do proxy
  const loadProxyConfig = async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      const response = await getProxyConfig(instanceName);
      console.log('Proxy config loaded:', response);

      // Se a API retornar dados válidos, use-os; caso contrário, mantenha os valores padrão
      if (
        response &&
        typeof response === 'object' &&
        response.enabled !== undefined
      ) {
        setConfig({
          enabled: response.enabled || false,
          host: response.host || '',
          port: response.port || '',
          protocol: response.protocol || 'http',
          username: response.username || '',
          password: response.password || '',
        });
      } else {
        // Se não há configuração ou retornou null, mantenha os valores padrão
        console.log('No existing proxy config found, using defaults');
        setConfig({
          enabled: false,
          host: '',
          port: '',
          protocol: 'http',
          username: '',
          password: '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de proxy:', error);
      // Em caso de erro, ainda mostra o modal com valores padrão
      setConfig({
        enabled: false,
        host: '',
        port: '',
        protocol: 'http',
        username: '',
        password: '',
      });
      toast({
        title: 'Aviso',
        description:
          'Não foi possível carregar a configuração de proxy atual. Você pode configurar uma nova.',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar configuração do proxy
  const handleSave = async () => {
    // Se o proxy está habilitado, valida os campos obrigatórios
    if (config.enabled && (!config.host || !config.port)) {
      toast({
        title: 'Campos obrigatórios',
        description:
          'Host e porta são obrigatórios quando o proxy está habilitado.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await setProxyConfig(instanceName, config);
      toast({
        title: 'Sucesso',
        description: config.enabled
          ? 'Configuração de proxy salva com sucesso!'
          : 'Proxy desabilitado com sucesso!',
      });
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar configuração de proxy:', error);
      toast({
        title: 'Erro',
        description:
          'Não foi possível salvar a configuração de proxy.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Carregar configuração quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadProxyConfig();
    }
  }, [isOpen, instanceName]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-blue-500" />
            Configuração de Proxy
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configure o proxy para a instância{' '}
            <strong className="text-blue-600">{instanceName}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">
                Carregando configuração...
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Habilitar/Desabilitar Proxy */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  Habilitar Proxy
                </Label>
                <p className="text-xs text-gray-500">
                  Ativa ou desativa o uso de proxy
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, enabled: checked })
                }
              />
            </div>

            {/* Configurações do Proxy */}
            <div className="space-y-3">
              {/* Protocolo e Host em linha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="protocol"
                    className="text-sm text-neutral-300"
                  >
                    Protocolo *
                  </Label>
                  <Select
                    value={config.protocol}
                    onValueChange={(value) =>
                      setConfig({ ...config, protocol: value })
                    }
                    disabled={!config.enabled}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Protocolo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROTOCOL_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="port"
                    className="text-sm text-neutral-300"
                  >
                    Porta *
                  </Label>
                  <Input
                    id="port"
                    value={config.port}
                    onChange={(e) =>
                      setConfig({ ...config, port: e.target.value })
                    }
                    placeholder="8080"
                    type="number"
                    disabled={!config.enabled}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Host */}
              <div className="space-y-1">
                <Label
                  htmlFor="host"
                  className="text-sm text-neutral-300"
                >
                  Host *
                </Label>
                <Input
                  id="host"
                  value={config.host}
                  onChange={(e) =>
                    setConfig({ ...config, host: e.target.value })
                  }
                  placeholder="192.168.1.100 ou proxy.exemplo.com"
                  disabled={!config.enabled}
                  className="h-9"
                />
              </div>

              {/* Username e Password em linha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="username"
                    className="text-sm text-neutral-300"
                  >
                    Usuário
                  </Label>
                  <Input
                    id="username"
                    value={config.username || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        username: e.target.value,
                      })
                    }
                    placeholder="Usuário"
                    disabled={!config.enabled}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="password"
                    className="text-sm text-neutral-300"
                  >
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={config.password || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        password: e.target.value,
                      })
                    }
                    placeholder="Senha"
                    disabled={!config.enabled}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Informações sobre o proxy - Compacto */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Tipos de Proxy Suportados
                  </h4>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                    <div>
                      <strong>HTTP/HTTPS:</strong> Proxies web padrão
                    </div>
                    <div>
                      <strong>SOCKS4/SOCKS5:</strong> Proxies SOCKS
                      avançados
                    </div>
                    <div>
                      <strong>Autenticação:</strong> Opcional - deixe
                      em branco se não necessário
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              saving ||
              (config.enabled && (!config.host || !config.port))
            }
            className="flex items-center gap-2"
            size="sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
