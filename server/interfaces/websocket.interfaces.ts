import WebSocket from 'ws';
import { IChatMessage, IFile, IMetaData, IReaction } from './chatmessage.interfaces';

export enum WsResponseCode {
  TERMINATING_CONNECTION = 3000,
}
export interface ExtendedWebSocket extends WebSocket {
  groups: string[];
  organisationId: string;
  memberId: string;
  connectionId: string;
  clientToken: string;
}

export enum WsServerEvents {
  STATUS_CHANGE = 'StatusChange',
  CHAT_MESSAGE_DELIVERY = 'ChatMessageDelivery',
  CHAT_MESSAGE_TRANSMIT = 'ChatMessageTransmit',
  CHAT_MESSAGE_UPDATE = 'ChatMessageUpdate',
  ACKNOWLEDGMENT = 'Acknowledgement',
  APP_NOTIFICATION = 'AppNotification',
}

export enum WsClientEvents {
  CHAT_MESSAGE = 'ChatMessage',
}

export type WsPayloadHeader = {
  command: WsServerEvents;
  corelationId?: string;
};

export type WsServerPayloadBody =
  | WsStatusChangeMessage
  | WsChatMessageDelivery
  | WsChatMessageTransmit
  | WsAcknowledgement
  | WsChatMessageUpdate
  | WsAppNotification;

export type WsClientPayloadBody = WsChatMessage;

export interface WsServerPayload {
  header: WsPayloadHeader;
  body: WsServerPayloadBody;
}

export interface WsClientPayload {
  header: WsPayloadHeader;
  body: WsClientPayloadBody;
}

export interface WsStatusChangeMessage {
  memberId: string;
  status: UserStatus;
}

export interface WsChatMessageDelivery {
  status: ChatMessageDeliveryStatus;
  messageId?: string;
  response?: IChatMessage;
  messageDate?: number;
}

export interface WsAcknowledgement {
  message: string;
}

export interface WsChatMessageUpdate {
  ParentGroupId: string;
  MessageId: string;
  Data: IReaction;
}

export interface WsChatMessageTransmit {
  ParentGroupId: string;
  response?: IChatMessage;
}

export interface NotificationContent {
  text: string;
  cssClass?: string;
  breakLine?: boolean;
}
export interface WsAppNotification {
  source: NotificationSource;
  title: string;
  content: NotificationContent[];
  data?: { referenceId: string } | unknown;
  icon?: string;
  options?: AppNotificationOptions;
}

export interface AppNotificationOptions {
  NotificationSound?: boolean;
}

export enum NotificationSource {
  Chat = 'Chat',
}
export interface WsChatMessage {
  ChatGroupId: string;
  ParentId: string;
  ParentGroupId: string;
  Message: string;
  MetaData: IMetaData[];
  PriorityLevel?: number;
  Files?: IFile[];
}

export enum UserStatus {
  DISCONNECTED = 'disconnected',
  ONLINE = 'online',
  AWAY = 'away',
  OFFLINE = 'offline',
}

export enum ChatMessageDeliveryStatus {
  RECEIVED = 'received',
  NOT_RECEIVED = 'not-received',
}
