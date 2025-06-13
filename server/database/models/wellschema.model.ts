import mongoose from 'mongoose';
import { IWellSchema } from '../../interfaces/wellschema.interfaces';

export const WellSchema = new mongoose.Schema<IWellSchema>({
  WellId: { type: String, required: true, unique: true },
  WellName: { type: String, required: true },
  RigId: { type: String, required: true },
  RigName: { type: String, required: true },
  TowerId: { type: String, required: true },
  TowerName: { type: String, required: true },
  CommenceDate: { type: Number, required: true },
  EndDate: { type: Number, required: true },
  SlotNumber: { type: Number },
  TargetReservoirZone: { type: String },
  CompletionType: { type: String },
  WaterDepth: { type: Number },
  TotalDepth: { type: Number },
  PlanDuration: { type: Number },
  SurfaceStatus: { type: String },
  Remarks: { type: String },
  ColorCode: { type: String },
  BodyColor: { type: String },
  ColorGroupId: { type: String },
  CreatedUser: { type: String },
  ModifiedUser: { type: String },
  CreatedDate: { type: Number, default: Date.now },
  ModifiedDate: { type: Number, default: Date.now },
});

export const WellModel = mongoose.model<IWellSchema>('wells', WellSchema);
