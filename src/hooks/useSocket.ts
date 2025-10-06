import { useEffect, useCallback, useRef } from 'react';
import { useSWRConfig } from 'swr';
import socketService, { SocketEventData, SocketEventName } from '@/services/socket.service';

export interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: any) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options;
  const { mutate } = useSWRConfig();
  const listenersRef = useRef<Map<string, Function>>(new Map());

  // Conectar automaticamente se especificado
  useEffect(() => {
    if (autoConnect && !socketService.isConnected()) {
      socketService.reconnect();
    }

    // Cleanup na desmontagem
    return () => {
      // Remove todos os listeners registrados por este hook
      listenersRef.current.forEach((callback, event) => {
        socketService.off(event as SocketEventName, callback as any);
      });
      listenersRef.current.clear();
    };
  }, [autoConnect]);

  // Registrar listener para evento específico
  const on = useCallback(<T extends SocketEventName>(
    event: T,
    callback: (data: SocketEventData[T]) => void,
    swrKey?: string | string[]
  ) => {
    const wrappedCallback = (data: SocketEventData[T]) => {
      // Executar callback original
      callback(data);

      // Invalidar cache SWR se especificado
      if (swrKey) {
        mutate(swrKey);
      }
    };

    socketService.on(event, wrappedCallback);
    listenersRef.current.set(event, wrappedCallback);

    // Retornar função para remover listener
    return () => {
      socketService.off(event, wrappedCallback);
      listenersRef.current.delete(event);
    };
  }, [mutate]);

  // Remover listener
  const off = useCallback(<T extends SocketEventName>(
    event: T,
    callback?: (data: SocketEventData[T]) => void
  ) => {
    socketService.off(event, callback);
    if (!callback) {
      listenersRef.current.delete(event);
    }
  }, []);

  // Emitir evento
  const emit = useCallback(<T extends SocketEventName>(
    event: T,
    data: SocketEventData[T]
  ) => {
    socketService.emit(event, data);
  }, []);

  // Status da conexão
  const isConnected = useCallback(() => {
    return socketService.isConnected();
  }, []);

  // ID da conexão
  const getConnectionId = useCallback(() => {
    return socketService.getConnectionId();
  }, []);

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    socketService.reconnect();
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  return {
    on,
    off,
    emit,
    isConnected,
    getConnectionId,
    reconnect,
    disconnect,
  };
}

// Hook específico para eventos de conversação com SWR
export function useConversationSocket() {
  const socket = useSocket();

  const onConversationUpdate = useCallback((
    callback: (data: SocketEventData['conversation_update']) => void,
    swrKey?: string | string[]
  ) => {
    return socket.on('conversation_update', callback, swrKey || '/api/leads');
  }, [socket]);

  const onMessageStatusUpdate = useCallback((
    callback: (data: SocketEventData['message_status_update']) => void,
    swrKey?: string | string[]
  ) => {
    return socket.on('message_status_update', callback, swrKey || '/api/messages');
  }, [socket]);

  const onWebhookReceived = useCallback((
    callback: (data: SocketEventData['webhook_received']) => void,
    swrKey?: string | string[]
  ) => {
    return socket.on('webhook_received', callback, swrKey);
  }, [socket]);

  return {
    ...socket,
    onConversationUpdate,
    onMessageStatusUpdate,
    onWebhookReceived,
  };
}

// Hook para monitoramento de leads em tempo real
export function useLeadRealtimeUpdates() {
  const { mutate } = useSWRConfig();
  const socket = useSocket();

  useEffect(() => {
    // Listener para atualizações de conversação
    const removeConversationListener = socket.on(
      'conversation_update',
      (data) => {
        console.log('📨 Atualização de conversação recebida:', data);
        
        // Invalidar cache de leads
        mutate('/api/leads');
        mutate(`/api/leads/${data.leadId}`);
        mutate('/api/conversations');
        mutate(`/api/conversations/${data.conversationId}`);
      }
    );

    // Listener para atualizações de status de mensagem
    const removeMessageListener = socket.on(
      'message_status_update',
      (data) => {
        console.log('📬 Atualização de status de mensagem recebida:', data);
        
        // Invalidar cache de mensagens
        mutate('/api/messages');
        mutate(`/api/messages/${data.messageId}`);
        mutate(`/api/leads/${data.leadId}/messages`);
      }
    );

    // Listener para webhooks recebidos
    const removeWebhookListener = socket.on(
      'webhook_received',
      (data) => {
        console.log('🎣 Webhook recebido:', data);
        
        // Invalidar caches relevantes baseado no tipo de webhook
        if (data.type.includes('message')) {
          mutate('/api/messages');
          mutate('/api/leads');
        }
        if (data.type.includes('conversation')) {
          mutate('/api/conversations');
        }
      }
    );

    // Cleanup
    return () => {
      removeConversationListener();
      removeMessageListener();
      removeWebhookListener();
    };
  }, [socket, mutate]);

  return {
    isConnected: socket.isConnected(),
    connectionId: socket.getConnectionId(),
    reconnect: socket.reconnect,
  };
}

export default useSocket;