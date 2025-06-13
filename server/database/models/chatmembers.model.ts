import { Schema } from 'mongoose';
import { IChatMembers } from '../../interfaces/chatmembers.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const ChatMemberSchema: Schema<IChatMembers> = new Schema(
  {
    ParentGroupId: {
      ...BinaryUtils.uuidModelType,
      required: false,
    },
    ChatGroupId: {
      type: String,
      required: true,
    },
    MemberId: {
      type: String,
      required: true,
    },
    ParentId: {
      type: String,
      required: true,
    },
    ParentName: {
      type: String,
      required: false,
    },
    ParentUrl: {
      type: String,
      required: false,
    },
    JoinedDate: {
      type: Number,
      required: false,
    },
    ExitDate: {
      type: Number,
      required: false,
    },
    LastReadMessageAt: {
      type: Number,
      required: false,
    },
    Status: {
      type: Number,
      required: false,
    },
    Pin: {
      type: Boolean,
      required: false,
      default: false,
    },
    Snooze: {
      type: Boolean,
      required: false,
      default: false,
    },
    Beep: {
      type: Boolean,
      required: false,
      default: false,
    },
    Mute: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

export { ChatMemberSchema };
