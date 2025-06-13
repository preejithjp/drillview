export interface IImageTemplate {
  TemplateId?: string;
  TemplateName: string;
  Entries: IImageTemplateEntry[];
  CreatedDate?: number;
  ModifiedDate?: number;
}

export interface IImageTemplateEntry {
  RangeMin: number;
  RangeMax: number;
  ImageUrl?: string;
}
