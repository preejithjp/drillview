export interface IWellSchema {
  WellId?: string;
  WellName: string;
  RigId: string;
  RigName: string;
  Uri?: string;
  TowerId: string;
  TowerName: string;
  CommenceDate: number;
  EndDate: number;
  SlotNumber?: number;
  TargetReservoirZone?: string;
  CompletionType?: string;
  WaterDepth?: number;
  TotalDepth?: number;
  PlanDuration?: number;
  SurfaceStatus?: string;
  Remarks?: string;
  ColorCode?: string;
  BodyColor?: string;
  ColorGroupId?: string;
  CreatedUser?: string;
  ModifiedUser?: string;
  CreatedDate?: number;
  ModifiedDate?: number;
}

export interface ITower {
  TowerId: string;
  TowerName: string;
}

export interface DisplayWell {
  WellId?: string;
  WellName: string;
  TowerName: string;
  Uri?: string;
  CreatedDate?: number;
}
