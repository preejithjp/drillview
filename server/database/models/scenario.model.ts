// src/server/models/scenario.model.ts

import { Schema } from 'mongoose';
import { IScenario } from '../../interfaces/rigscheduler.interfaces';
import BinaryUtils from '../../utils/binary.utils';

// Define a small sub‐schema for “AssignedWells”:
const AssignedWellSchema = new Schema(
  {
    WellId: { type: String, required: true },
    WellName: { type: String, required: true },
    StartDate: { type: Number, required: true },
    EndDate: { type: Number, required: true },
    properties: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const RigSchema = new Schema(
  {
    RigId: { ...BinaryUtils.uuidModelType, required: true },
    RigName: { type: String, required: true },
    ContractStart: { type: String },
    ContractEnd: { type: String },
    Description: { type: String },
    // ← Add AssignedWells field here:
    AssignedWells: { type: [AssignedWellSchema], default: [] },
  },
  { _id: false }
);

const ScenarioSchema: Schema<IScenario> = new Schema(
  {
    ScenarioId: { ...BinaryUtils.uuidModelType, required: false, unique: true },
    Name: { type: String, required: true },
    Description: { type: String },
    Image: { type: String },
    CreatedDate: { type: Number },
    ModifiedDate: { type: Number },
    CreatedUser: { type: String },
    ModifiedUser: { type: String },
    Pin: { type: Boolean, default: false },
    Rigs: { type: [RigSchema], default: [] },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

ScenarioSchema.pre('save', function (next) {
  if (!this.ScenarioId) {
    this.ScenarioId = BinaryUtils.convertUuidToBinary();
  }
  next();
});

export { ScenarioSchema };
