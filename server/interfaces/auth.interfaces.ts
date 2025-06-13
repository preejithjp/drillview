import { IMember, RoleEnum } from './member.interfaces';
import { JwtPayload } from 'jsonwebtoken';

export enum MemberPrinciples {
  Basic = 'Basic',
  Bearer = 'Bearer',
  Client = 'Client',
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse extends IMember {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}
export interface JWTUserData extends JwtPayload {
  unique_name: string;
  ORGANIZATIONID: string;
  MEMBERID: string;
  user_type: MemberPrinciples;
  email: string;
  ROLE: RoleEnum;
}
