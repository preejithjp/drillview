import { Schema, model } from 'mongoose';
import { IRigSchema } from '../../interfaces/rigschema.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const RigSchema = new Schema<IRigSchema>(
  {
    RigId: { ...BinaryUtils.uuidModelType, required: true, unique: true },
    RigName: { type: String, required: true },
    ContractStart: { type: Number },
    ContractEnd: { type: Number },
    Description: { type: String },
    CreatedDate: { type: Number },
    ModifiedDate: { type: Number },
    CreatedUser: { type: String },
    ModifiedUser: { type: String },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

RigSchema.pre('save', function (next) {
  if (!this.RigId) {
    this.RigId = BinaryUtils.convertUuidToBinary();
  }
  next();
});

const RigModel = model<IRigSchema>('Rig', RigSchema);

export { RigSchema };
export default RigModel;
