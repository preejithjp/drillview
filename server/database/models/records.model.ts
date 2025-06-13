import { Schema } from 'mongoose';
import { IRigTemplate } from '../../interfaces/datacollection.interfaces';

const RecordSchema: Schema<IRigTemplate> = new Schema(
  {
    Name: {
      type: String,
      required: true,
    },
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
                UnitType: { type: String, required: false, default: null },
                SourceUnit: { type: String, required: false, default: null },
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
  { versionKey: false }
);

export { RecordSchema };
