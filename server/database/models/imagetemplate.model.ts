import { Schema } from 'mongoose';
import { IImageTemplate } from '../../interfaces/imagetemplate.interfaces';
import BinaryUtils from '../../utils/binary.utils';

const ImageTemplateSchema: Schema<IImageTemplate> = new Schema(
  {
    TemplateId: { ...BinaryUtils.uuidModelType, required: false, unique: true },
    TemplateName: { type: String, required: true },
    Entries: [
      {
        RangeMin: { type: Number, required: true },
        RangeMax: { type: Number, required: true },
        ImageUrl: { type: String, required: false },
      },
    ],
    CreatedDate: { type: Number },
    ModifiedDate: { type: Number },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);
export { ImageTemplateSchema };
