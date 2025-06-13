import { Binary } from 'bson';

export interface IChatMessage extends IChatMessageBase {
  CreatedDate: number;
  SenderId: string | Binary;
  ChatMessageId: string | Binary;
}

export interface IChatMessageBase {
  Message: string;
  ChatGroupId: string | Binary;
  ParentId?: string;
  ParentGroupId?: string | Binary;
  PriorityLevel?: number;
  MetaData?: IMetaData[];
  Files?: IFile[];
  Reactions?: IReaction[];
}

export interface IMetaData {
  Value: string;
  DisplayName: string;
  Unit?: string;
}

export interface IFile {
  File: string;
  FileName: string;
  FileExtension?: string;
  FileType?: string;
  Size?: number;
}

export interface IReaction {
  MemberId: string;
  EmojiName: string;
  Emoji: string;
  DateTime: number;
}

export interface IChatGroupMessageData {
  [x: string]: IChatMessage[];
}

export enum MessagePriority {
  Normal,
  Low,
  Medium,
  High,
}
