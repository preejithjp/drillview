import { Schema } from 'mongoose';
import { DashboardStatus, IDashboardUser } from '../../interfaces/dashboard.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const DashboardSchema: Schema<IDashboardUser> = new Schema(
  {
    DashboardName: { type: String, required: true },
    DashboardId: { ...BinaryUtils.uuidModelType, required: true, unique: true },
    SourceId: { type: String, required: true },
    Icon: { type: String, required: false },
    Description: { type: String, required: false },
    CreatedDate: { type: Number, required: false },
    ModifiedDate: { type: Number, required: false },
    CreatedUser: { type: String, required: false },
    ModifiedUser: { type: String, required: false },
    SortOrder: { type: Number, required: false },
    StatusCode: {
      type: Number,
      enum: [DashboardStatus.Enabled, DashboardStatus.Disabled],
      required: true,
      default: DashboardStatus.Enabled,
    },
    Layout: {
      type: [
        {
          i: { type: String, required: false },
          Name: { type: String, required: false },
          Layout: { type: Boolean, required: false },
          Offsets: { type: String, required: false },
          LayoutId: { type: String, required: false },
          Settings: { type: String, required: false },
          h: { type: Number, required: false },
          w: { type: Number, required: false },
          x: { type: Number, required: false },
          y: { type: Number, required: false },
        },
      ],
      required: false,
      default: [],
      _id: false,
      sparse: true,
    },
    Offsets: [
      {
        OffsetId: { type: String, required: true },
        SourceId: { type: String, required: false },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

DashboardSchema.pre('save', async function (next) {
  const uuidDashboard = BinaryUtils.convertUuidToBinary();
  this.DashboardId = uuidDashboard;
  next();
});

export { DashboardSchema };
