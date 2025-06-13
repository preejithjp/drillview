import mongoose from 'mongoose';
import BaseDB from './db.connector.base';
import Trace from '../../controllers/trace.controller';

import { IChatGroup } from '../../interfaces/chatgroup.interfaces';
import { IChatMembers } from '../../interfaces/chatmembers.interfaces';
import { IChatMessage } from '../../interfaces/chatmessage.interfaces';
import { ChatGroupSchema } from '../models/chatgroup.model';
import { ChatMemberSchema } from '../models/chatmembers.model';
import { ChatMessageSchema } from '../models/chatMessage.model';
import { ConnectionsSchema } from '../models/connections.model';
import { IConnection } from '../../interfaces/connections.interfaces';
import { IChatImportGroups } from '../../interfaces/chatimportgroups.interfaces';
import { ChatImportGroupsSchema } from '../models/chatimportgroups.model';

export enum ChatDBSchemas {
  CHAT_MEMBER = 'chatmembers',
  CHAT_GROUP = 'chatgroups',
  CHAT_IMPORT_GROUPS = 'chatimportgroups',
  CHAT_MESSAGE = 'chatmessages',
  CONNECTIONS = 'connections',
}

export class ChatDB extends BaseDB {
  private static instance: ChatDB;

  public static ChatGroup: mongoose.Model<IChatGroup>;
  public static ChatMember: mongoose.Model<IChatMembers>;
  public static ChatImportGroups: mongoose.Model<IChatImportGroups>;
  public static ChatMessage: mongoose.Model<IChatMessage>;
  public static Connections: mongoose.Model<IConnection>;

  protected DB_ENDPOINT = process.env.CHAT_DB_ENDPOINT || '';
  protected DB_NAME = process.env.CHAT_DB_NAME || '';
  protected DB_USERNAME = process.env.CHAT_DB_USERNAME || '';
  protected DB_PASSWORD = process.env.CHAT_DB_PASSWORD || '';
  protected DB_SEEDING_FOLDER: string | undefined = undefined;

  public static async initialize(): Promise<void> {
    if (!this.instance) {
      this.instance = new ChatDB();
    }
    await this.instance.initialize();
  }

  public static getStatus() {
    if (!this.instance) {
      this.instance = new ChatDB();
    }
    return this.instance.getStatus();
  }

  public static async checkConnectionStatus() {
    if (!this.instance) {
      this.instance = new ChatDB();
    }
    return this.instance.checkConnectionStatus();
  }

  protected initializeModels(): void {
    if (!this.isConnected()) {
      Trace.Warn(`${this.DB_NAME}: Cannot initialize models without a valid connection.`);
      return;
    }

    ChatDB.ChatGroup = this.connection.model<IChatGroup>(ChatDBSchemas.CHAT_GROUP, ChatGroupSchema, ChatDBSchemas.CHAT_GROUP);
    ChatDB.ChatMember = this.connection.model<IChatMembers>(ChatDBSchemas.CHAT_MEMBER, ChatMemberSchema, ChatDBSchemas.CHAT_MEMBER);
    ChatDB.ChatImportGroups = this.connection.model<IChatImportGroups>(
      ChatDBSchemas.CHAT_MEMBER,
      ChatImportGroupsSchema,
      ChatDBSchemas.CHAT_IMPORT_GROUPS
    );
    ChatDB.ChatMessage = this.connection.model<IChatMessage>(ChatDBSchemas.CHAT_MESSAGE, ChatMessageSchema, ChatDBSchemas.CHAT_MESSAGE);
    ChatDB.Connections = this.connection.model<IConnection>(ChatDBSchemas.CONNECTIONS, ConnectionsSchema, ChatDBSchemas.CONNECTIONS);
  }
}
