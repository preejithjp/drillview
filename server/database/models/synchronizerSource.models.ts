import { Schema } from 'mongoose';
import { ISourceConfig, SourceProxyConfig } from '../../interfaces/synchronizer.interfaces';
import { Long } from 'bson';
import BinaryUtils from '../../utils/binary.utils';

const SourceProxyConfigSchema: Schema<SourceProxyConfig> = new Schema(
  {
    HostName: { type: String, required: false },
    UserName: { type: String, required: false },
    Password: { type: String, required: false },
    PasswordKey: { type: String, required: false },
    Authentication: { type: Boolean, required: false },
  },
  { _id: false }
);

const SourceSchema: Schema<ISourceConfig> = new Schema(
  {
    SourceId: { ...BinaryUtils.uuidModelType, required: true, unique: true },
    OrganizationId: { type: Schema.Types.Mixed, required: true, set: (val: number) => Long.fromString(val.toString()) },
    Name: { type: String, required: true },
    Url: { type: String, required: true },
    Version: { type: String, required: true },
    UserName: { type: String, required: true },
    Password: { type: String, required: true },
    PasswordKey: { type: String, required: false },
    MaxConnections: { type: Number, required: false },
    CreationDate: { type: Schema.Types.Mixed, required: false, set: (val: number) => Long.fromString(val.toString()) },
    LastUpdatedDate: { type: Schema.Types.Mixed, required: false, set: (val: number) => Long.fromString(val.toString()) },
    IsProxy: { type: Boolean, required: false },
    ProxyConfig: { type: SourceProxyConfigSchema, required: false },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

SourceSchema.pre('save', async function (next) {
  if (!this.SourceId) {
    this.SourceId = BinaryUtils.convertUuidToBinary();
  }
  next();
});

export { SourceSchema };
