import http from 'http';
import Trace from '../../controllers/trace.controller';
import { ExtendedWebSocket, UserStatus, WsClientPayload, WsClientEvents } from '../../interfaces/websocket.interfaces';
import { checkMemberStatus, deleteClientConnection, updateClientConnection } from '../websocket.dbservice';
import { WebSocketHandler } from '../../handlers/websocket.handler';
import WebSocketServerEvents from './websocket.serverevents';
import WebSocketClientEvents from './websocket.clientevents';

export let socketHandler: WebSocketHandler;

export function initializeWebSocketServer(server: http.Server) {
  socketHandler = new WebSocketHandler(server);
  socketHandler.on('connection', onClientConnect);
  socketHandler.on('message', onMessageReceived);
  socketHandler.on('close', onClientDisconnect);
}

export function onClientConnect(ws: ExtendedWebSocket) {
  try {
    updateClientConnection(ws.connectionId, ws.memberId, UserStatus.ONLINE);
    WebSocketServerEvents.pushStatusChange(ws.organisationId, ws.memberId, UserStatus.ONLINE);
  } catch (error) {
    Trace.Error('WebSocketServer onClientConnect error', error.message);
  }
}

export function onMessageReceived(ws: ExtendedWebSocket, message: WsClientPayload) {
  try {
    switch (message.header.command) {
      case WsClientEvents.CHAT_MESSAGE as string:
        WebSocketClientEvents.handleChatMessageEvent(ws, message);
        break;
      default:
        Trace.Warn(`Unknown event received: ${message.header.command}`);
    }
  } catch (error) {
    Trace.Error('WebSocketServer onMessageReceived error', error.message);
  }
}

export async function onClientDisconnect(ws: ExtendedWebSocket, code: number, reason: Buffer) {
  try {
    Trace.Warn(`WebSocket disconnected - code: ${code}, reason: ${reason}`);
    await deleteClientConnection(ws.connectionId, ws.memberId);
    const memberStatus = await checkMemberStatus(ws.memberId);
    if (memberStatus) {
      WebSocketServerEvents.pushStatusChange(ws.organisationId, ws.memberId, memberStatus);
    }
  } catch (error) {
    Trace.Error('WebSocketServer onClientDisconnect error', error.message);
  }
}
