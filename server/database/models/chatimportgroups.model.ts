import { Schema } from 'mongoose';
import BinaryUtils from '../../utils/binary.utils';
import { IChatImportGroups } from '../../interfaces/chatimportgroups.interfaces';

const ChatImportGroupsSchema: Schema<IChatImportGroups> = new Schema(
  {
    ParentGroupId: {
      ...BinaryUtils.uuidModelType,
      required: false,
    },
    ChatGroupId: {
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
    Channels: {
      type: Array,
      required: false,
      default: [],
    },
    Activity: {
      type: Object,
      required: false,
      default: [],
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

export { ChatImportGroupsSchema };
