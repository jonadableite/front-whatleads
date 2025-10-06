import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '@/lib/env';

export interface SocketEventData {
  conversation_update: {
    leadId: string;
    conversationId: string;
    lastMessage: {
      id: string;
      content: string;
      timestamp: string;
      fromMe: boolean;
    };
    leadSegment: string;
    engagementStatus: string;
  };
  message_status_update: {
    messageId: string;
    status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    timestamp: string;
    leadId: string;
  };
  webhook_received: {
    type: string;
    instanceName: string;
    data: any;
    timestamp: string;
  };
}

export type SocketEventName = keyof SocketEventData;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const apiUrl = getApiUrl();
    // O servidor Socket.IO está rodando na mesma porta que a API (9000)
    const socketUrl = apiUrl.replace('/api', '');

    console.log('🔌 Conectando ao Socket.IO:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      autoConnect: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO conectado:', this.socket?.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Autenticar com o backend se necessário
      const token = localStorage.getItem('token');
      if (token) {
        this.socket?.emit('authenticate', { token });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO desconectado:', reason);
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Erro de conexão Socket.IO:', error);
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconectado após', attemptNumber, 'tentativas');
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔥 Erro de reconexão Socket.IO:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);
    
    setTimeout(() => {
      if (!this.socket?.connected) {
        this.socket?.connect();
      }
    }, delay);
  }

  public on<T extends SocketEventName>(
    event: T,
    callback: (data: SocketEventData[T]) => void
  ): void {
    if (!this.socket) {
      console.warn('⚠️ Socket não inicializado para evento:', event);
      return;
    }

    this.socket.on(event, callback);
    console.log('👂 Listener adicionado para evento:', event);
  }

  public off<T extends SocketEventName>(
    event: T,
    callback?: (data: SocketEventData[T]) => void
  ): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
    console.log('🔇 Listener removido para evento:', event);
  }

  public emit<T extends SocketEventName>(
    event: T,
    data: SocketEventData[T]
  ): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket não conectado. Não foi possível emitir evento:', event);
      return;
    }

    this.socket.emit(event, data);
    console.log('📤 Evento emitido:', event, data);
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  public getConnectionId(): string | undefined {
    return this.socket?.id;
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 Desconectando Socket.IO');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public reconnect(): void {
    console.log('🔄 Forçando reconexão Socket.IO');
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 1000);
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;