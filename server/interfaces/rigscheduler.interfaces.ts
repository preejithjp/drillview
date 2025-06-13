import { Binary } from 'bson';
import { DataParent, StoreAssembly } from './store.connector.interfaces';

export interface IAssignedWell {
  WellId: string;
  WellName: string;
  StartDate: number;
  EndDate: number;
  properties?: Record<string, any>;
}

// --- Extend IRigItem to carry AssignedWells[] ---
export interface IRigItem {
  RigId: string | Binary;
  RigName: string;
  ContractStart?: string;
  ContractEnd?: string;
  Description?: string;
  AssignedWells?: IAssignedWell[];
}

export interface IScenario {
  ScenarioId: string | Binary;
  Name: string;
  Description?: string;
  Image?: string;
  CreatedDate?: number;
  ModifiedDate?: number;
  CreatedUser?: string;
  ModifiedUser?: string;
  Pin?: boolean;
  Rigs?: IRigItem[];
}

export interface ISchedulerProductData {
  uri: string;
  name: string;
  description: string;
  creationDate: number;
  lastUpdatedDate: number;
  type: string; // Replace with enum if needed
  uniqueIdentifier: string;
  organisationId: number;
  originalId: string;
  properties: unknown;
  attributes: unknown;
  assemblies: unknown[];
  equipments: unknown[];
  id?: number;
  parent: DataParent;
  groupId?: number;
  unit?: string;
  unitType?: string;

  rawContent: ISchedulerRigContent;
}

export interface ISchedulerAssemblyData {
  originalId?: string;
  uniqueIdentifier?: string;
  name?: string;
  description?: string;
  type?: string;
  uri?: string;
  creationDate?: number;
  lastUpdatedDate?: number;
  organisationId?: number;
  parent?: DataParent;
  equipments?: unknown[];
  subAssemblies?: unknown[];
  properties?: unknown;
  attributes?: unknown;

  rawContent: ISchedulerWellContent;
}

export interface IActivityAssemblyData extends Omit<StoreAssembly, 'content'> {
  parentData?: ISchedulerProductData;
  rawContent: ISchedulerActivityContent | Partial<ISchedulerActivityContent>;
}

export interface ISchedulerRigContent {
  id?: string;
  name: string;
  url?: string;
  wellbores: string[];
  description: string;
  contractStartDate: number | null;
  contractEndDate: number | null;
  supplierCode: string;
  supplierName: string;
  mainType: string;
  subType: string;
  waterDepthMin: number | null;
  waterDepthMax: number | null;
}

export interface ISchedulerWellContent {
  id: string;
  url: string;
  wellboreId: string;
  wellboreName: string;
  wellId: string;
  wellName: string;
  colorGroupId: string;
  startDate: number;
  endDate: number;
  properties: ISchedulerWellProperties;
  creationDate: number;
}

interface ISchedulerWellProperties {
  wellTypeCode: string;
  company: string;
  operator: string;
  actualDuration: number | null;
  casingType: string;
  completionType: string;
  concession: string;
  equipmentRequirements: string[];
  fieldName: string;
  holeType: string;
  loggingRequirements: string[];
  mainCategory: string;
  mainProject: string;
  planDuration: number | null;
  remarks: string;
  slotNumber: number | null;
  subProject: string;
  targetReservoirZone: string;
  towerId: string;
  waterDepth: number | null;
  totalDepth: null | number;
  surfaceStatus: string;
}

export interface ISchedulerActivityContent {
  id: string;
  url: string;
  activityId: string;
  activityName: string;
  colorGroupId: string;
  startDate: number;
  endDate: number;
  properties: unknown;
  creationDate: number;
}

export interface RigInsertData {
  rigSchedulerId: string;
  rigData: Partial<ISchedulerProductData>;
}

export interface IColorGroup {
  ColorGroupId: string;
  HeaderColor: string;
  BodyColor: string;
}

export interface ITower {
  TowerId: string;
  TowerName: string;
}
