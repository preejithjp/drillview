export enum DataCategories {
  Assembly = 'assembly',
  Equipment = 'equipment',
  Product = 'product',
}

export enum StoreDataStructure {
  TREE = 'tree',
  List = 'list',
}

export enum StoreEndPoints {
  Header = `/Search/Header`,
  Details = `/Search`,
}

export interface StoreDataHeader {
  uri: string;
  name: string;
  description: string;
  creationDate: number;
  lastUpdatedDate: number;
  type: AllTypeDatas;
  uniqueIdentifier: string;
  id?: number;
  parent: DataParent;
  groupId?: number;
}

interface StoreData extends StoreDataHeader {
  organisationId: number;
  originalId: string;
  properties: unknown;
  attributes: unknown;
  content: string;
}

export interface DataParent {
  id: string;
  type: string;
  uri: string;
  name: string;
}

export enum AssemblyTypes {
  WITSML_Wellbore = 'WITSML_Wellbore',
  WITSML_TimeLog = 'WITSML_TimeLog',
  WITSML_DepthLog = 'WITSML_DepthLog',
  WITSML_ChannelSet = 'WITSML_ChannelSet',
  WITSML_Trajectory = 'WITSML_Trajectory',
  WITSML_MudLog = 'WITSML_MudLog',
  WITSML_Rig = 'WITSML_Rig',
  PRODUCTION_Wellbore = 'PRODUCTION_Wellbore',
}

export enum EquipmentTypes {
  Sensor = 'Sensor',
  Channel = 'Channel',
}

export enum ProductTypes {
  WITSML_Well = 'WITSML_Well',
  PRODUCTION_Rig = 'PRODUCTION_Rig',
  PLAN_Plan = 'PLAN_Plan',
}

export type AllTypeDatas = ProductTypes | AssemblyTypes | EquipmentTypes;

export interface StoreProduct extends StoreData {
  assemblies: [];
  equipments: [];
  type: ProductTypes;
}

export interface StoreAssembly extends StoreData {
  parent: DataParent;
  subAssemblies: [];
  equipments: [];
  type: AssemblyTypes;
}

export interface StoreEquipment extends StoreData {
  id: number;
  parent: DataParent;
  type: EquipmentTypes;
  unit: string | null;
  unitType: string | null;
}

export type AllStoreData = StoreProduct | StoreAssembly | StoreEquipment;

export interface StoreFilter {
  Uri?: string;
  OriginalId?: string;
  UniqueIdentifier?: string;
  Name?: string;
  Type?: string;
  CreationDate?: string;
  LastUpdatedDate?: string;
  UrlStartsWith?: string;
  ParentUrl?: string;
}
