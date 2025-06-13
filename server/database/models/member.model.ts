import { Schema } from 'mongoose';
import { IMember } from '../../interfaces/member.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const MemberSchema: Schema<IMember> = new Schema(
  {
    OrganisationId: {
      type: Number,
      required: true,
    },
    Email: {
      type: String,
      required: false,
      unique: true,
    },
    Name: {
      type: String,
      required: false,
    },
    Description: {
      type: String,
      required: false,
    },
    PasswordKey: {
      type: String,
      required: false,
    },
    PasswordValue: {
      type: String,
      required: false,
    },
    Enabled: {
      type: Boolean,
      required: true,
    },
    Role: {
      type: String,
      required: false,
    },
    Image: {
      type: String,
      required: false,
    },
    MemberId: {
      ...BinaryUtils.uuidModelType,
      required: false,
      unique: true,
      default: BinaryUtils.convertUuidToBinary(),
    },
    CreatedUser: {
      type: String,
      required: false,
    },
    CreatedDate: {
      type: Number,
      required: true,
    },
    ModifiedDate: {
      type: Number,
      required: false,
      default: Date.now(),
    },
    LastLoggedIn: {
      type: Number,
      required: true,
    },
    LoggedinFailedCount: {
      type: Number,
      required: true,
    },
    MaxLoginFailedCount: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

export { MemberSchema };
