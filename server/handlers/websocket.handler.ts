import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import Trace from '../controllers/trace.controller';
import { v4 as uuidv4 } from 'uuid';
import { ExtendedWebSocket, WsServerPayload, WsResponseCode, WsServerEvents, WsServerPayloadBody } from '../interfaces/websocket.interfaces';
import { AuthUtils } from '../utils/auth.utils';
import { Server } from '../controllers/server.controller';

export class WebSocketHandler extends EventEmitter {
  private wss: WebSocketServer;
  constructor(server: http.Server) {
    super();
    this.wss = this.initWebSocketServer(server);
    this.setupEventHandlers();
  }

  /**
   * Initialize the WebSocket server
   */
  initWebSocketServer(server: http.Server) {
    try {
      const wss = new WebSocketServer({ server });
      Trace.Info(`WebSocket Server initialized at ${Server.SSL ? 'wss' : 'ws'}://${Server.HOST_NAME}:${Server.PORT}`);
      Trace.Verbose(`Websocker Server init Current number of connected clients: ${wss.clients.size}`);
      return wss;
    } catch (error) {
      Trace.Error('Failed to initialize WebSocket server', error.message);
      process.exit(1);
    }
  }

  /**
   * Sets up WebSocket server event handlers
   */
  setupEventHandlers() {
    try {
      // Handle new WebSocket connections
      this.wss.on('connection', async (ws: ExtendedWebSocket) => {
        const authToken = atob(decodeURIComponent(ws.protocol));
        const authResp = await AuthUtils.VerifyToken(authToken);
        if (!authResp || authResp.error || !authResp.data || !Object.keys(authResp.data).length) {
          Trace.Error('WebSocket Connection event: Invalid or missing token');
          // Close the connection with an unauthorized status code
          ws.close(WsResponseCode.TERMINATING_CONNECTION, `Unauthorized: ${authResp.message}`);
          return;
        }
        const tokenData = authResp.data;
        // Assign a unique ID to the WebSocket connection
        ws.connectionId = uuidv4();
        ws.clientToken = authToken;
        ws.organisationId = tokenData.ORGANIZATIONID.toString();
        ws.memberId = tokenData.MEMBERID;
        Trace.Verbose(`New client connected : ${ws.connectionId}`);

        this.emit('connection', ws);

        // Handle incoming messages
        ws.on('message', (rawdata: WebSocket.Data) => {
          try {
            const data = JSON.parse(rawdata.toString());
            this.emit('message', ws, data);
          } catch (error) {
            Trace.Error('WebSocket message event error', error.message);
          }
        });

        // Handle client disconnection
        ws.on('close', (code: number, reason: Buffer) => {
          this.emit('close', ws, code, reason);
        });

        // Handle WebSocket errors
        ws.on('error', (error: WebSocket.ErrorEvent) => {
          Trace.Error('WebSocket error:', JSON.stringify(error));
        });
      });
    } catch (error) {
      Trace.Error('WebSocket EventHandlers error:', error.message);
    }
  }

  /**
   * Send a message to a client.
   * @param message - The message to send
   */
  public sendMessage<T extends WsServerPayload | string>(wsClient: WebSocket, payload: T): void {
    try {
      const messagePayload = typeof payload === 'string' ? payload : JSON.stringify(payload);

      if (wsClient.readyState === WebSocket.OPEN) {
        wsClient.send(messagePayload);
      }
    } catch (error) {
      Trace.Error('WebSocket sendMessage error', (error as Error).message);
    }
  }

  /**
   * Send a message to a client based on organization and member.
   * @param message - The message to send
   */
  public sendMessageToClient<T extends WsServerPayload | string>(organisationId: string, memberId: string, payload: T): void {
    try {
      const messagePayload = typeof payload === 'string' ? payload : JSON.stringify(payload);

      const fullWsClientList = Array.from(this.wss.clients) as ExtendedWebSocket[];
      const wsClientOrganisationList = fullWsClientList.filter((client: ExtendedWebSocket) => client.organisationId === organisationId);

      const wsClientList = wsClientOrganisationList.filter((client: ExtendedWebSocket) => client.memberId === memberId);
      wsClientList.forEach((wsClient) => {
        this.sendMessage(wsClient, messagePayload);
      });
    } catch (error) {
      Trace.Error('WebSocket sendMessage error', (error as Error).message);
    }
  }

  /**
   * Send a message to a group of connected clients.
   * @param message - The message to send
   */
  public sendGroupMessage(organisationId: string, memberList: string[], message: WsServerPayload) {
    try {
      const messagePayload = JSON.stringify(message);
      const wsClientList = Array.from(this.wss.clients) as ExtendedWebSocket[];
      const wsClientOrganisationList = wsClientList.filter((client: ExtendedWebSocket) => client.organisationId === organisationId);

      memberList.forEach((memberId) => {
        const wsClientList = wsClientOrganisationList.filter((client: ExtendedWebSocket) => client.memberId === memberId);
        wsClientList.forEach((wsClient) => {
          this.sendMessage(wsClient, messagePayload);
        });
      });
    } catch (error) {
      Trace.Error('WebSocket sendGroupMessage error', error.message);
    }
  }
  /**
   * Broadcast a message to all connected clients
   * @param message - The message to broadcast
   */
  public broadcast(organisationId: string, message: WsServerPayload): void {
    try {
      const messagePayload = JSON.stringify(message);
      const wsClientList = Array.from(this.wss.clients) as ExtendedWebSocket[];
      const wsClientOrganisationList = wsClientList.filter((client: ExtendedWebSocket) => client.organisationId === organisationId);

      wsClientOrganisationList.forEach((wsClient) => {
        this.sendMessage(wsClient, messagePayload);
      });
    } catch (error) {
      Trace.Error('WebSocket broadcast error', error.message);
    }
  }
}

export function WsRequestPayload<T extends WsServerPayloadBody>(event: WsServerEvents, payloadBody: T) {
  return {
    header: {
      command: event,
    },
    body: payloadBody,
  };
}
