import { Schema } from 'mongoose';
import { IChatMessage } from '../../interfaces/chatmessage.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    ChatMessageId: { ...BinaryUtils.uuidModelType, required: false, unique: true },
    ParentId: { type: String, required: false },
    Message: { type: String, required: false },
    ChatGroupId: { ...BinaryUtils.uuidModelType, required: true },
    ParentGroupId: { ...BinaryUtils.uuidModelType, required: true },
    SenderId: { ...BinaryUtils.uuidModelType, required: true },
    PriorityLevel: { type: Number, required: false, default: 0 },
    MetaData: { type: Array, required: false },
    Files: { type: Array, required: false },
    CreatedDate: { type: Number, required: false },
    Reactions: { type: Array, required: false },
  },
  {
    versionKey: false,
    timestamps: false,
    toObject: {
      transform: (doc, ret) => {
        ret.ChatMessageId = BinaryUtils.convertBinaryToUuid(ret.ChatMessageId);
        ret.ChatGroupId = BinaryUtils.convertBinaryToUuid(ret.ChatGroupId);
        ret.SenderId = BinaryUtils.convertBinaryToUuid(ret.SenderId);
        return ret;
      },
    },
  }
);

ChatMessageSchema.pre('save', async function (next) {
  const uuidBinary = BinaryUtils.convertUuidToBinary();
  this.ChatMessageId = uuidBinary;
  next();
});

export { ChatMessageSchema };
