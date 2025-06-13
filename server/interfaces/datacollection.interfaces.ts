import { Binary } from 'bson';

export interface IUnitType {
  UnitTypeId?: string | Binary;
  UnitType: string;
  Alias: string[];
  BaseUnit: string;
  BaseUnitAlias: string[];
  Description: string;
}

export interface IRigTemplate {
  Name: string;
  Records: IRecord[];
}
export interface TimeZone {
  value: string;
  abbr: string;
  offset: number;
  isdst: boolean;
  text: string;
  utc: string[];
}
export interface IWell {
  Name: string;
  Uid: string;
  Operator: string;
  ServiceCompany: string;
  TimeZone: string;
  Field: string;
  Country: string;
  Region: string;
  Block: string;
}

export interface IWellbore {
  Name: string;
  Uid: string;
}

export interface ITargets {
  Host: string;
}

export interface IRecordItem {
  RecordId?: number;
  RecordName?: string;
  Uuid: string | null;
  ItemId: number;
  Description: string;
  LongMnemonic: string;
  ShortMnemonic: string;
  TargetName: string;
  Type: string;
  Length: number;
  Enabled: boolean;
  UnitType: string | null;
  SourceUnit: string | null;
}

export interface IRecord {
  TimeBased: boolean;
  RecordId: number;
  Name: string;
  TimeLogUid: string;
  DepthLogUid: string;
  DepthBased: boolean;
  DepthIncreasing: boolean;
  Description: string;
  TargetName: string;
  Enabled: boolean;
  Items: IRecordItem[];
}

export interface IJobType {
  Name: string;
  Enabled: boolean;
  Description: string;
  UnitType: string;
  Records: IRecord[];
  RecordId?: number;
}

export interface IRigHeader {
  RigId?: string | Binary;
  Name: string;
  Status: boolean;
  Well: IWell;
  Target: ITargets;
  SyncTime: number;
  JobTypes: IJobType[];
}
export interface IRig extends IRigHeader {
  SyncStatus: boolean;
  Wellbore: IWellbore;
  ModifiedDate: number;
  CreatedDate: number;
  BufferToDisc: boolean;
  RunNumber: number;
  PassNumber: number;
  TransferFrequencyInsec: number;
  TimeOffset: string;
  DateFormat: string;
  Time: string;
  MaxMessageQued: number;
  LogMessage: boolean;
}
