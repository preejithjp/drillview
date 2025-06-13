import { Schema } from 'mongoose';
import { IOrganization } from '../../interfaces/organization.interfaces';

const OrganizationSchema: Schema = new Schema<IOrganization>(
  {
    OrganizationName: { type: String, required: true },
    Logo: { type: String, required: false },
    CreatedUser: { type: String, required: false },
    Status: { type: Number, required: true },
    Location: { type: String, required: false },
    ModifiedDate: { type: Number, required: true },
    CreatedDate: { type: Number, required: true },
    OrganizationId: { type: Schema.Types.Mixed, required: true },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

export { OrganizationSchema };
