import { store } from '@/main';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketTransport } from '../transports/websocket.transport';
import { WsClientEvents, WsClientPayload, WsServerEvents } from '../../server/interfaces/websocket.interfaces';
import Logger from '@/common/logger';

export let webSocketClient: WebSocketTransport;

export function initializeWebSocketClient() {
  const protocol = window.location.protocol.includes('https') ? 'wss://' : 'ws://';
  const socketUrl = protocol + window.location.host + store.runtimeConfig.API_BASE_URL;
  webSocketClient = new WebSocketTransport(socketUrl);
  webSocketClient.on('message', handleMessage);
}

export function closeWebSocketClient(code: number, reason?: string): void {
  webSocketClient.close(code, reason);
}

const handleMessage = (data: WsClientPayload): void => {
  const command = data.header.command as unknown as WsServerEvents;

  if (webSocketClient.hasEvent(command)) {
    webSocketClient.emit(command, data.body);
  } else {
    Logger.Warn(`Unhandled WebSocket event: ${data.header.command}`);
  }
};

export function sendMessage(messageevent: WsClientEvents, messagebody: WsClientPayload) {
  const newId = uuidv4();
  const message = {
    header: {
      command: messageevent,
      corelationId: newId,
    },
    body: messagebody,
  };

  webSocketClient.sendMessage(message);
}
