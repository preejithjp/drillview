import { Binary } from 'bson';

export interface IRigSchema {
  RigId: string | Binary;
  RigName: string;
  ContractStart?: number | null;
  ContractEnd?: number | null;
  Description?: string;
  CreatedDate?: number;
  ModifiedDate?: number;
  CreatedUser?: string;
  ModifiedUser?: string;
}
