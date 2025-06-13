import { Binary } from 'bson';
import { IChatMembers, IMemberGroupActivity, IMemberGroupChannel } from './chatmembers.interfaces';
import { IChatImportGroups } from './chatimportgroups.interfaces';

export interface IChatGroup {
  ChatGroupId: string | Binary;
  GroupName: string;
  Activities?: string[];
  Description: string;
  Members?: Partial<IChatMembers>[];
  CreatedDate: number;
  ModifiedDate: number;
  CreatedMemberId?: string;
  Status: IGroupStatus;
  GroupIcon?: string;
}

export enum IGroupStatus {
  ACTIVE = 200,
  DELETE = 201,
  INACTIVE = 202,
}

export interface IMemberGroupData extends Omit<IChatGroup, 'Status'>, Omit<IChatMembers, 'ChatGroupId'>, IChatImportGroups {
  UnreadMessageCount: number;
}

export interface IJoinGroupRequestData {
  GroupId: string;
  ParentId: string;
  ParentName?: string;
  ParentUrl: string;
  Channels: IMemberGroupChannel[];
  Activity: IMemberGroupActivity;
}

export interface IGroupData {
  GroupId: string;
  GroupName: string;
  Description: string;
  ParentMapping?: string[];
  Activities?: string[];
  Members?: string[];
  CreatedDate: number;
  GroupIcon?: string;
}

export interface GroupMnemonics {
  LogName: string;
  LogType?: string;
  PropertyId: string;
  PropertyName: string;
}
