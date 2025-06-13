import { Schema } from 'mongoose';
import { ITrace } from '../../interfaces/trace.interfaces';

const TraceSchema: Schema = new Schema<ITrace>(
  {
    TraceId: {
      type: String,
      required: false,
      unique: true,
    },
    ApplicationName: {
      type: String,
      required: true,
    },
    Level: {
      type: Number,
      required: true,
    },
    Title: {
      type: String,
      required: true,
    },
    Details: {
      type: String,
      required: false,
    },
    TraceTime: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

TraceSchema.pre('save', async function (next) {
  this.TraceId = this._id;
  next();
});

export { TraceSchema };
