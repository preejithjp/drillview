import { Schema } from 'mongoose';
import { ILayoutUsers } from '../../interfaces/dashboard.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const LayoutSchema: Schema<ILayoutUsers> = new Schema(
  {
    LayoutId: { ...BinaryUtils.uuidModelType, required: true, unique: true },
    CreatedDate: { type: Number, required: false },
    ModifiedDate: { type: Number, required: false },
    CreatedUser: { type: String, required: false },
    ModifiedUser: { type: String, required: false },
    Layout: {
      type: [
        {
          Name: { type: String, required: true },
          i: { type: String, required: true, unique: true },
          Layout: { type: Boolean, required: true },
          Offsets: { type: String, required: false },
          LayoutId: { type: String, required: false },
          Settings: { type: String, required: false },
          h: { type: Number, required: true },
          w: { type: Number, required: true },
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
      ],
      required: false,
      default: [],
      _id: false,
      sparse: true,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

LayoutSchema.pre('save', async function (next) {
  const uuidDashboard = BinaryUtils.convertUuidToBinary();
  this.LayoutId = uuidDashboard;
  next();
});

export { LayoutSchema };
