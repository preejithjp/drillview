export class FontSettings {
  Title: FontStyle;
  Value?: FontStyle;
  Unit?: FontStyle;
  Label?: FontStyle;
  constructor(
    Title: Partial<FontStyle> = { FontSize: EFontSize.Large },
    Value: Partial<FontStyle> = { FontSize: EFontSize.Medium },
    Unit: Partial<FontStyle> = { FontSize: EFontSize.Medium },
    Label: Partial<FontStyle> = { FontSize: EFontSize.Medium }
  ) {
    this.Title = new FontStyle(Title);
    this.Value = new FontStyle(Value);
    this.Unit = new FontStyle(Unit);
    this.Label = new FontStyle(Label);
  }
}

export class FontStyle {
  FontSize?: EFontSize;
  FontFamily?: EFontFamily;
  FontWeight?: EFontWeight;
  FontStyle?: EFontStyle;

  constructor(value: FontStyle) {
    this.FontFamily = value.FontFamily ?? EFontFamily.Segoe_UI;
    this.FontSize = value.FontSize ?? EFontSize.Medium;
    this.FontStyle = value.FontStyle ?? EFontStyle.Normal;
    this.FontWeight = value.FontWeight ?? EFontWeight.Normal;
  }
}

export enum EFontFamily {
  Arial = 'Arial',
  Segoe_UI = 'Segoe UI',
}

export enum EFontSize {
  Small = '10',
  Medium = '12',
  Large = '14',
  Bigger = '16',
  ExtraLarge = '18',
  XXLarge = '20',
  XXXLarge = '22',
}

export enum EFontStyle {
  Normal = 'Normal',
  Italic = 'Italic',
}

export enum EFontWeight {
  Light = '300',
  Normal = '400',
  Medium = '500',
  Semibold = '600',
  Bold = '700',
  ExtraBold = '800',
}
