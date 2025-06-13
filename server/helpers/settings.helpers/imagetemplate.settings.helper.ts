export class ImageTemplateValues {
  RangeMin: number = 0;
  RangeMax: number = 0;
  ImageUrl?: string = '';
}
export class ImageTemplateSettings {
  TemplateId: string;
  TemplateName: string;
  Entries: ImageTemplateValues[];

  constructor(TemplateId: string = '', name: string = '', entries: ImageTemplateValues[] = []) {
    this.TemplateId = TemplateId;
    this.TemplateName = name;
    this.Entries = entries.map((entry) => ({
      ...entry,
      RangeMin: entry.RangeMin,
      RangeMax: entry.RangeMax,
      ImageUrl: entry.ImageUrl,
    }));
  }
}
