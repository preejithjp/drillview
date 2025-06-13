import { Binary } from 'bson';

export enum ObjectNames {
  LOGS = 'logs',
  TRAJECTORIES = 'trajectorys',
  MUDLOGS = 'mudlogs',
  RIGS = 'rigs',
  BHARUNS = 'bharun',
  WBGEOMETRY = 'wbgeometry',
  FLUIDREPORTS = 'fluidreports',
  LOGCURVES = 'logcurves',
}

export enum ResponseType {
  Connected = 'Connected.',
}

export enum WITSMLVersion {
  v1 = '1.4.1',
  v2 = '2.0',
  v2_0_1 = '2.0.1',
}

export enum JobStatusType {
  RUNNING = 1,
  STOPPED = 0,
}

interface Credentials {
  UserName: string;
  Password: string;
}

export interface ProxyConfig extends Credentials {
  UseProxy: boolean;
  HostName: string;
  Authentication: boolean;
}

interface BaseConnection extends Credentials {
  Url: string;
  Proxy: ProxyConfig;
}

export interface SourceConfig extends BaseConnection {
  MaxConnections: number;
  Version: WITSMLVersion;
}

export interface TargetConfig extends BaseConnection {
  UserType: string;
}

export interface TargetStructure {
  ProductStore: TargetConfig;
  DataStore: TargetConfig;
}

export interface BaseWellbore {
  UidWell: string;
  UidWellbore: string;
  NameWell: string;
  NameWellbore: string;
}
export type WellboreSource = BaseWellbore;

export type WellboreTarget = BaseWellbore & {
  SameAsSource: boolean;
};

export interface WellboreDetails {
  Source: WellboreSource;
  Target: WellboreTarget;
}

export interface TransferConfig {
  AllTimeLogs: boolean;
  AllDepthLogs: boolean;
  AllTrajectries: boolean;
  AllMudLogs: boolean;
  AllRigs: boolean;
  AllBhaRun: boolean;
  AllCementJob: boolean;
  AllFluidsReport: boolean;
  AllFormationMarker: boolean;
  AllMessage: boolean;
  AllTubular: boolean;
  AllWbGeometry: boolean;
}

export interface CurveMap {
  SourceCurveName: string;
  TargetCurveName: string;
  TargetAlias: string;
  TargetUnit: string;
  TargetUid: string;
  UnitType: string;
  SourceUnit: string;
  Description: string;
  DataType: string;
}

export interface TimebaseLog extends BaseObject {
  TemplateReferenceID: string;
  TemplateReferenceName: string;
  StartIndex?: number;
  CurveMaps: CurveMap[];
}

export interface DepthLog extends BaseObject {
  TemplateReferenceID: string;
  TemplateReferenceName: string;
  StartIndexInft?: number;
  CurveMaps: CurveMap[];
}

export interface BaseObject {
  ObjectUid: string;
  ObjectName: string;
  TargetUID: string;
  TargetName: string;
}

export interface JobSettings {
  StartDateIndexInUtc: number;
  StartIndexInft: number;
  BackFilling: boolean;
  HeaderFrequencyInMinute: number;
  DataFrequencyInSecond: number;
}

export interface JobConfig {
  OrganizationId?: number;
  SourceId?: string | Binary;
  JobUID: string | Binary;
  JobName: string;
  CreationDate: number;
  LastUpdatedDate: number;
  LastUpdatedUser: string;
  JobStatus: number;
  Settings: JobSettings;
  Source: SourceConfig;
  Target: TargetStructure;
  Wellbores: WellboreDetails[];
  Transfer: TransferConfig;
  TimebaseLogs: TimebaseLog[];
  DepthLogs: DepthLog[];
  Trajectories: BaseObject[];
  MudLogs: BaseObject[];
  Rigs: BaseObject[];
  BHARun: BaseObject[];
  FluidReport: BaseObject[];
  WbGeometries: BaseObject[];
}

export type JobConfigHeader = Pick<JobConfig, 'JobUID' | 'JobName' | 'CreationDate' | 'LastUpdatedDate' | 'SourceId' | 'JobStatus' | 'Wellbores'>;
export type JobBySource = Pick<JobConfig, 'JobUID' | 'SourceId' | 'JobName'>;

// For Source
export interface ISourceConfig extends Credentials {
  SourceId?: string | Binary;
  OrganizationId?: number;
  Name: string;
  Url: string;
  Version: WITSMLVersion;
  PasswordKey?: string;
  CreationDate?: number;
  LastUpdatedDate?: number;
  MaxConnections: number;
  IsProxy: boolean;
  ProxyConfig: SourceProxyConfig;
}

export interface SourceProxyConfig extends Credentials {
  HostName: string;
  PasswordKey?: string;
  Authentication: boolean;
}

export interface ISynchronizerPasswordDb {
  PasswordKey?: string;
  Password?: string;
}

// For Permissons
export interface IDataAccessConfig {
  AccessId?: string | Binary;
  MemberId?: string | Binary;
  AccessibleSourceIds: (string | Binary)[];
  CreationDate?: number;
  LastUpdatedDate?: number;
}
