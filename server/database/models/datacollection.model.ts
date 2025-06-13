import { Schema } from 'mongoose';
import { IRig } from '../../interfaces/datacollection.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const RigSchema: Schema<IRig> = new Schema(
  {
    RigId: {
      ...BinaryUtils.uuidModelType,
      required: false,
      unique: true,
    },
    Name: {
      type: String,
      required: true,
    },
    Status: {
      type: Boolean,
      required: true,
    },
    SyncStatus: {
      type: Boolean,
      required: false,
    },
    SyncTime: {
      type: Number,
      required: false,
    },
    ModifiedDate: {
      type: Number,
      required: false,
    },
    CreatedDate: {
      type: Number,
      required: true,
    },
    Well: {
      Name: { type: String, required: false },
      Uid: { type: String, required: false },
      Operator: { type: String, required: false },
      ServiceCompany: { type: String, required: false },
      TimeZone: { type: String, required: false },
      Field: { type: String, required: false },
      Country: { type: String, required: false },
      Region: { type: String, required: false },
      Block: { type: String, required: false },
    },
    Wellbore: {
      Name: { type: String, required: false },
      Uid: { type: String, required: false },
    },
    Target: {
      Host: {
        type: String,
        required: false,
      },
    },
    JobTypes: {
      type: [
        {
          Name: { type: String, required: false },
          Enabled: { type: Boolean, required: true },
          Description: { type: String, required: true },
          UnitType: { type: String, required: true },
          Records: {
            type: [
              {
                TimeBased: { type: Boolean, required: true },
                RecordId: { type: Number, required: true },
                Name: { type: String, required: true },
                TimeLogUid: { type: String, required: true },
                DepthLogUid: { type: String, required: true },
                DepthBased: { type: Boolean, required: true },
                DepthIncreasing: { type: Boolean, required: true },
                Description: { type: String, required: true },
                TargetName: { type: String, required: true },
                Enabled: { type: Boolean, required: true },
                Items: {
                  type: [
                    {
                      Uuid: { type: String, required: true, default: null },
                      ItemId: { type: Number, required: true },
                      Description: { type: String, required: true },
                      LongMnemonic: { type: String, required: true },
                      ShortMnemonic: { type: String, required: true },
                      TargetName: { type: String, required: true },
                      Type: { type: String, required: true },
                      Length: { type: Number, required: true },
                      Enabled: { type: Boolean, required: true },
                      UnitType: { type: String, required: true, default: null },
                      SourceUnit: { type: String, required: true, default: null },
                    },
                  ],
                  required: false,
                  _id: false,
                },
              },
            ],
            required: false,
            _id: false,
          },
        },
      ],
      required: false,
      _id: false,
    },
    BufferToDisc: { type: Boolean, required: false },
    RunNumber: { type: Number, required: false },
    PassNumber: { type: Number, required: false },
    TransferFrequencyInsec: { type: Number, required: false },
    TimeOffset: { type: String, required: false },
    DateFormat: { type: String, required: false },
    Time: { type: String, required: false },
    MaxMessageQued: { type: Number, required: false },
    LogMessage: { type: Boolean, required: false },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

RigSchema.pre('save', async function (next) {
  const uuidBinary = BinaryUtils.convertUuidToBinary();
  this.RigId = uuidBinary;
  next();
});

export { RigSchema };
