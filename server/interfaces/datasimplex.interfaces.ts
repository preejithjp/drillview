import { ProxyConfig, WITSMLVersion } from './synchronizer.interfaces';

export enum IndexTypes {
  Depth = 'measured depth',
  Time = 'date time',
}

export enum ObjectTypesToGet {
  Rig = 'Rig',
  FluidReport = 'FluidReport',
  BhaRun = 'BhaRun',
  WbGeometry = 'WbGeometry',
  Log = 'log',
  MudLog = 'MudLog',
  Trejectory = 'Trejectory',
  CementJob = 'CementJob',
  Attachment = 'Attachment',
  ConvCore = 'ConvCore',
  CustomObject = 'CustomObject',
  DrillReport = 'DrillReport',
  FormationMarker = 'FormationMarker',
  Message = 'Message',
  MnemonicSet = 'MnemonicSet',
  ObjectGroup = 'ObjectGroup',
  Operation = 'Operation',
  OpsReport = 'OpsReport',
  PressureTestPlan = 'PressureTestPlan',
  Risk = 'Risk',
  SideWallCore = 'SideWallCore',
  StimJob = 'StimJob',
  SurvayProgram = 'SurvayProgram',
  Target = 'Target',
  ToolErrorModel = 'ToolErrorModel',
  ToolErrorTermSet = 'ToolErrorTermSet',
  Tubular = 'Tubular',
}

export interface SourceConfigService {
  Maxconnections: number;
  Url: string;
  UserName: string;
  Password: string;
  Version: WITSMLVersion;
  Proxy: ProxyConfig;
}
export interface BaseConfig {
  WellId: string;
  WellboreId: string;
  ObjectId?: string;
  SourceId?: string;
  Server: SourceConfigService;
}

export interface BaseWellbores {
  WellUid: string;
  WellboreUid: string;
  WellName: string;
  WellboreName: string;
}

export interface BaseObjects {
  ObjectUid: string;
  ObjectName: string;
  ObjectType: string;
}

export type IWellbores = BaseWellbores & {
  CreationTime: string;
  ModifiedTime: string;
  StatusWellbore: string;
  Operator: string;
};

export type ILogs = Omit<BaseWellbores, 'WellName' | 'WellboreName'> &
  BaseObjects & {
    LogIndexType: string;
  };

export type IMudLogs = Omit<BaseWellbores, 'WellName' | 'WellboreName'> & BaseObjects;

export type ITrajectories = Omit<BaseWellbores, 'WellName' | 'WellboreName'> & BaseObjects;

export type IRigs = BaseWellbores & BaseObjects;

export type IBharuns = BaseWellbores & BaseObjects;

export type IWBgeometrys = BaseWellbores & BaseObjects;

export type IFluidReports = BaseWellbores & BaseObjects;

export interface LogCurveInfo {
  SourceMnemonicName: string | null;
  SourceUom: string | null;
  SourceUuid: string | null;
  Mnemonic: string;
  DataType: string;
  Uom: string;
  MnemAlias: string;
  Uuid: string;
  Description: string;
  AxisDefinitionUid: string | null;
  AxisDefinitionOrder: number;
  AxisDefinitionCount: number;
  AxisDefinitionLabels: number;
  AxisDefinitionUom: number;
  MultiplyBy: number;
  AddBy: number;
  ConversionRequired: boolean;
  MinIndex: number | null;
  MaxIndex: number | null;
}

export interface CommonData {
  DTimCreation: string;
  DTimLastChange: string;
  Comments: string | null;
}

export interface LogEntry {
  Uuid: string;
  SourceUuid: string | null;
  SourceWellUuid: string | null;
  SourceWellboreUuid: string | null;
  WellName: string;
  WellUuid: string;
  ChannelSetUuid: string | null;
  Name: string;
  Direction: string | null;
  WellboreName: string;
  RunNumber: string | null;
  PassNumber: string | null;
  WellboreUuid: string;
  IndexType: IndexTypes;
  IndexCurve: string | null;
  StartIndex: string | null;
  EndIndex: string | null;
  Originator: string;
  serviceCompany: string;
  LogCurveInfos: LogCurveInfo[];
  IsTimeBased: boolean;
  CommonData: CommonData;
}
