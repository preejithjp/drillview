import { ColourList } from '../theme.colour.config';

export class AppearanceSettings {
  BackgroundColour?: ColourList | string;
  BorderColour?: ColourList | string;
  TitleFontColor?: ColourList | string;
  ValueFontColor?: ColourList | string;
  UnitFontColor?: ColourList | string;
  MarkerColor?: ColourList | string;
  ProgressColor?: ColourList | string;
  LabelFontColor?: ColourList | string;

  constructor(
    BackgroundColour: ColourList | string = ColourList.C14,
    BorderColour: ColourList | string = ColourList.C2,
    TitleFontColor: ColourList | string = ColourList.C7,
    ValueFontColor: ColourList | string = ColourList.C7,
    UnitFontColor: ColourList | string = ColourList.C7,
    MarkerColor: ColourList | string = ColourList.C7,
    ProgressColor: ColourList | string = ColourList.C11,
    LabelFontColor: ColourList | string = ColourList.C4
  ) {
    this.BackgroundColour = BackgroundColour ?? ColourList.C1;
    this.BorderColour = BorderColour ?? ColourList.C2;
    this.TitleFontColor = TitleFontColor ?? ColourList.C7;
    this.ValueFontColor = ValueFontColor ?? ColourList.C4;
    this.UnitFontColor = UnitFontColor ?? ColourList.C5;
    this.MarkerColor = MarkerColor ?? ColourList.C6;
    this.ProgressColor = ProgressColor ?? ColourList.C7;
    this.LabelFontColor = LabelFontColor ?? ColourList.C4;
  }
}
