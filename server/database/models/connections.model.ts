import { Schema } from 'mongoose';
import { IConnection } from '../../interfaces/connections.interfaces';

const ConnectionsSchema: Schema<IConnection> = new Schema(
  {
    ConnectionId: {
      type: String,
      required: false,
    },
    MemberId: {
      type: String,
      required: false,
    },
    Status: {
      type: String,
      required: false,
    },
    StatusChangeDate: {
      type: Number,
      required: false,
    },
    CreatedDate: {
      type: Number,
      required: true,
    },
    ExpiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

// Create a TTL index on the ExpiryDate field
ConnectionsSchema.index({ ExpiryDate: 1 }, { expireAfterSeconds: 0 });

export { ConnectionsSchema };
