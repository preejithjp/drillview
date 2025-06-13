import { Binary } from 'bson';
import { IMemberGroupActivity, IMemberGroupChannel } from './chatmembers.interfaces';

export interface IChatImportGroups {
  ParentGroupId: string | Binary;
  ChatGroupId: string | Binary;
  ParentId: string;
  ParentName: string;
  ParentUrl: string;
  Channels?: IMemberGroupChannel[];
  Activity?: IMemberGroupActivity;
  GroupIcon?: string;
}
