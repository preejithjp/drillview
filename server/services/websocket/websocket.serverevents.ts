import {
  AppNotificationOptions,
  ChatMessageDeliveryStatus,
  ExtendedWebSocket,
  NotificationContent,
  NotificationSource,
  UserStatus,
  WsServerEvents,
  WsServerPayload,
} from '../../interfaces/websocket.interfaces';
import { WsRequestPayload } from '../../handlers/websocket.handler';
import { IChatMessage, IReaction } from '../../interfaces/chatmessage.interfaces';
import { socketHandler } from './websocket.server';

export default class WebSocketServerEvents {
  static pushStatusChange(organisationId: string, memberId: string, status: UserStatus) {
    const payload: WsServerPayload = WsRequestPayload(WsServerEvents.STATUS_CHANGE, {
      memberId: memberId,
      status: status,
    });
    socketHandler.broadcast(organisationId, payload);
  }

  static pushMessageDelivery(ws: ExtendedWebSocket, corelationId: string, status: ChatMessageDeliveryStatus, message?: IChatMessage) {
    const payload: WsServerPayload = WsRequestPayload(WsServerEvents.CHAT_MESSAGE_DELIVERY, {
      status: status,
      messageId: message?.ChatMessageId as string,
      response: message,
      messageDate: message?.CreatedDate,
    });
    socketHandler.sendMessage(ws, payload);
  }

  static pushMessageTransmit(ws: ExtendedWebSocket, memberList: string[], parentGroupId: string, message: IChatMessage) {
    const payload: WsServerPayload = WsRequestPayload(WsServerEvents.CHAT_MESSAGE_TRANSMIT, {
      ParentGroupId: parentGroupId,
      response: message,
    });
    socketHandler.sendGroupMessage(ws.organisationId, memberList, payload);
  }

  static pushMessageUpdate(organisationId: string, memberList: string[], parentGroupId: string, messageId: string, updateData: IReaction) {
    const payload: WsServerPayload = WsRequestPayload(WsServerEvents.CHAT_MESSAGE_UPDATE, {
      ParentGroupId: parentGroupId,
      MessageId: messageId,
      Data: updateData,
    });

    if (memberList.length > 0) {
      socketHandler.sendGroupMessage(organisationId, memberList, payload);
    }
  }

  static pushNotification(
    ws: ExtendedWebSocket,
    memberId: string,
    source: NotificationSource,
    title: string,
    content: NotificationContent[],
    data?: unknown,
    icon?: string,
    options?: AppNotificationOptions
  ) {
    const payload: WsServerPayload = WsRequestPayload(WsServerEvents.APP_NOTIFICATION, {
      source: source,
      title: title,
      content: content,
      data: data,
      icon: icon,
      options: options,
    });
    socketHandler.sendMessageToClient(ws.organisationId, memberId, payload);
  }
}
