import { Schema } from 'mongoose';
import { IConversion, IUnitTypes } from '../../interfaces/uniteditor.interface';
import BinaryUtils from '../../utils/binary.utils';

// Schema for conversions
const ConversionSchema = new Schema<IConversion>(
  {
    ConversionId: { ...BinaryUtils.uuidModelType, required: false, unique: true },
    Unit: { type: String, required: true },
    Alias: { type: [String], required: false },
    Description: { type: String, required: false },
    Formula: {
      Add: { type: Number, required: true },
      Subtract: { type: Number, required: true },
      Multiply: { type: Number, required: true },
      Divide: { type: Number, required: true },
    },
  },
  {
    _id: false,
    versionKey: false,
    timestamps: false,
  }
);

// Main schema for unit type
const UnitTypeSchema: Schema<IUnitTypes> = new Schema(
  {
    UnitTypeId: { ...BinaryUtils.uuidModelType, required: false, unique: true },
    UnitType: { type: String, required: true },
    Alias: { type: [String], required: false },
    Unit: {
      BaseUnit: { type: String, required: false },
      Alias: { type: [String], required: false },
      Description: { type: String, required: false },
      Conversions: { type: [ConversionSchema], required: false },
    },
    Variables: [
      {
        Groups: { type: [String], required: true },
        Variable: { type: String, required: true },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: false,
    toObject: {
      transform: (doc, ret) => {
        ret.UnitTypeId = BinaryUtils.convertBinaryToUuid(ret.UnitTypeId); // Convert UUID to string
        return ret;
      },
    },
  }
);

UnitTypeSchema.pre('save', async function (next) {
  if (!this.UnitTypeId) {
    const uuidBinary = BinaryUtils.convertUuidToBinary();
    this.UnitTypeId = uuidBinary;
  }
  next();
});

export { UnitTypeSchema, ConversionSchema };
