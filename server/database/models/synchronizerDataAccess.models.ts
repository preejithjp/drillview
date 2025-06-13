import { Schema } from 'mongoose';
import { IDataAccessConfig } from '../../interfaces/synchronizer.interfaces';
import { Long } from 'bson';
import BinaryUtils from '../../utils/binary.utils';

const DataAccessSchema: Schema<IDataAccessConfig> = new Schema<IDataAccessConfig>(
  {
    MemberId: { ...BinaryUtils.uuidModelType, required: true },
    AccessibleSourceIds: { type: [BinaryUtils.uuidModelType.type], required: true },
    CreationDate: { type: Schema.Types.Mixed, required: false, set: (val: number) => Long.fromString(val.toString()) },
    LastUpdatedDate: { type: Schema.Types.Mixed, required: false, set: (val: number) => Long.fromString(val.toString()) },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

DataAccessSchema.pre('save', async function (next) {
  if (!this.AccessId) {
    this.AccessId = BinaryUtils.convertUuidToBinary();
  }
  next();
});

export { DataAccessSchema };
