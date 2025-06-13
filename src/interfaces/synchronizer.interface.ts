import { ILogs, IWellbores, IndexTypes, ObjectTypesToGet } from './../../server/interfaces/datasimplex.interfaces';
import { BaseObject, ISourceConfig } from './../../server/interfaces/synchronizer.interfaces';

export enum Tabs {
  Log = 'Log',
  Trajectory = 'Trajectory',
  Mudlog = 'Mudlog',
  OtherObjects = 'Other Objects',
  Settings = 'Settings',
}

export enum PageTypes {
  CREATEJOB = 'createJob',
  WELLBORES = 'wellbores',
}

export const ObjectTypes = {
  Rig: ObjectTypesToGet.Rig,
  FluidReport: ObjectTypesToGet.FluidReport,
  BhaRun: ObjectTypesToGet.BhaRun,
  WbGeometry: ObjectTypesToGet.WbGeometry,
} as const;

export interface WellDetailsFromDashboard {
  sourceId?: string;
  wellbores: IWellbores[];
}
export interface ObjectTypeOther extends BaseObject {
  Type?: string;
}

export interface TargetList {
  UUID: string;
  Name: string;
  useSameAsSource?: boolean;
}

export interface CreateObject {
  Name: string;
  UseUUID: boolean;
  UUID: string;
  ObjectType?: string;
  IndexType?: IndexTypes;
}

export interface SelectedObject {
  [Key: string]: IWellbores;
}

export interface OtherObjects extends ILogs {
  Type: string;
}

export interface WellboreDetials extends IWellbores {
  logDetails: OtherObjects[];
}

export enum ObjectTypesIcons {
  Rig = 'rig-icon',
  FluidReport = 'fluid-report-icon',
  WbGeometry = 'wb-geometry-icon',
  BhaRun = 'bha-run-icon',
}

export interface SourceConfig extends ISourceConfig {
  isTested?: boolean;
  isActive?: boolean;
}
