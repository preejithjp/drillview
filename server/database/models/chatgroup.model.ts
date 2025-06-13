import { Schema } from 'mongoose';
import { IChatGroup } from '../../interfaces/chatgroup.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const ChatGroupSchema: Schema<IChatGroup> = new Schema(
  {
    ChatGroupId: {
      ...BinaryUtils.uuidModelType,
      required: false,
      unique: true,
    },
    GroupName: {
      type: String,
      required: false,
    },
    Description: {
      type: String,
      required: false,
    },
    Activities: {
      type: Array,
      required: false,
    },
    CreatedMemberId: {
      type: String,
      required: false,
    },
    Members: {
      type: Array,
      required: false,
    },
    CreatedDate: {
      type: Number,
      required: true,
    },
    ModifiedDate: {
      type: Number,
      required: true,
    },
    Status: {
      type: Number,
      required: false,
    },
    GroupIcon: {
      type: String,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

ChatGroupSchema.pre('save', async function (next) {
  const uuidBinary = BinaryUtils.convertUuidToBinary();
  this.ChatGroupId = uuidBinary;
  next();
});

export { ChatGroupSchema };
