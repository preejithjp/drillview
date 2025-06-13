import { EventEmitter } from '@/common/event-emitter';
import Logger from '@/common/logger';
import { store } from '@/main';
import { WSCloseEventTransformer } from '@/common/ws-response-interpreter';

export class WebSocketTransport extends EventEmitter {
  private url: string;
  private socket: WebSocket | null = null;
  private reconnectInterval: number;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private messageQueue: string[] = [];

  constructor(url: string, reconnectInterval = 5000, maxReconnectAttempts = 10) {
    super();
    this.url = url;
    this.reconnectInterval = reconnectInterval;
    this.maxReconnectAttempts = maxReconnectAttempts;
    this.initialize();
  }

  // Connect to the WebSocket server
  initialize() {
    if (this.socket) return;
    try {
      this.url = !this.url.includes('token') ? this.url + '?token=' + btoa(store.authInfo.access_token) : this.url;
      this.socket = new WebSocket(this.url, [encodeURIComponent(btoa(store.authInfo.access_token))]);
      Logger.Verbose('WebSocket initialization request received.', 'url: ' + this.url);
      this.registerEvents();
      return this.socket;
    } catch (error) {
      Logger.Error('Error initializing WebSocket: url: ' + this.url, error?.message || error);
      return null;
    }
  }

  registerEvents() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      Logger.Verbose('WebSocket Connection Established with ' + this.url);
      this.emit('connection');
      if (this.messageQueue.length > 0) {
        this.messageQueue.forEach((message) => this.sendMessage(message));
      }
      this.messageQueue = [];
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = async (event) => {
      try {
        let data = event.data;
        if (data instanceof Blob) {
          data = await data.arrayBuffer();
        } else {
          data = JSON.parse(data);
        }
        this.emit('message', data);
      } catch (error) {
        Logger.Error('Error parsing WebSocket message from ' + this.url, error?.message || error);
      }
    };

    this.socket.onerror = (error) => {
      Logger.Error('WebSocket error | Source: ' + this.url, error);
    };

    this.socket.onclose = (event) => {
      const parsedEvent = new WSCloseEventTransformer(event);
      this.socket = null;
      this.emit('close');
      Logger.Warn(
        `Websocket connection towards ${this.url} is closed.`,
        `Message: ${parsedEvent.Message} | Reason: ${parsedEvent.Reason} | Code: ${parsedEvent.Code}`
      );
      if (event.code != 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        Logger.Verbose(`Reconnecting to ${this.url} in ${this.reconnectInterval / 1000} seconds...`);
        setTimeout(() => this.initialize(), this.reconnectInterval);
      }
    };
  }

  // Send a message to the WebSocket server
  sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (ArrayBuffer.isView(message)) {
        this.socket.send(message);
      } else {
        this.socket.send(JSON.stringify(message));
      }
    } else {
      this.messageQueue.push(message);
      this.initialize();
      Logger.Info('SendMessage: WebSocket is not connected. Re Initailizing', 'url: ' + this.url);
    }
  }

  // Close the WebSocket connection
  close(code?: number, reason?: string) {
    if (this.socket) {
      this.socket.close(code, reason);
      this.socket = null;
    }
  }
}
