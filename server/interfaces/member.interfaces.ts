import { UserStatus } from './websocket.interfaces';

export interface IMember extends IMemberBase {
  MemberId?: string;
  CreatedUser?: string;
  CreatedDate: number;
  LastLoggedIn: number;
  LoggedinFailedCount: number;
  MaxLoginFailedCount: number;
  ModifiedDate?: number;
}

export interface IMemberBase {
  OrganisationId: number;
  Email?: string;
  Name?: string;
  Description?: string;
  PasswordKey?: string;
  PasswordValue?: string;
  Enabled: boolean;
  Role?: RoleEnum;
  Image?: string;
}

export interface IMemberType {
  MemberId: string;
  OrganisationId: number;
  OrganisationName?: string;
  Email?: string;
  Name?: string;
  Description?: string;
  CreatedDate: number;
  Role: string;
  OnlineStatus: UserStatus;
  Image?: string;
}

export enum RoleEnum {
  User = 'Normal',
  Admin = 'Admin',
  SuperAdmin = 'Super Admin',
  PowerUser = 'Power User',
}
