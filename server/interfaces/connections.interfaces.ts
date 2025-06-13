import { UserStatus } from './websocket.interfaces';

export interface IConnection {
  ConnectionId?: string;
  MemberId: string;
  Status: UserStatus;
  StatusChangeDate: number;
  CreatedDate: number;
  ExpiryDate: Date;
}
