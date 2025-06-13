import { Binary } from 'bson';

export interface IChatMembers extends IChatGroupSettings {
  ParentGroupId: string | Binary;
  MemberId: string;
  ChatGroupId: string | Binary;
  ParentId: string;
  ParentName: string;
  ParentUrl: string;
  JoinedDate: number;
  ExitDate: number;
  LastReadMessageAt: number;
  Status: IMemberStatus;
}

export enum IMemberStatus {
  ACTIVE = 200,
  DELETE = 201,
  INACTIVE = 202,
}

export interface IChatGroupSettings {
  Pin?: boolean;
  Snooze?: boolean;
  Mute?: boolean;
  Beep?: boolean;
}

export interface IMemberGroupChannel {
  ChannelId?: number;
  ChannelName: string;
  ChannelUom?: string;
  LogName: string;
}

export interface IMemberGroupActivity {
  ChannelName: string;
  LogName: string;
}
