export class GeneralSettings {
  Title: string;
  ShowTitle: boolean;
  ShowUom?: boolean;
  ShowStatusbar?: boolean;
  ShowToolTip?: boolean;
  BorderThickness: number;
  ShowActiveWell?: boolean;
  ShowScale?: boolean;
  ShowValue?: boolean;
  ShowIndex?: boolean;
  Decimal?: number;
  Orientation?: OrientationTypes;
  IndexType?: DataIndexTypes;

  constructor(
    Title: string = '',
    ShowTitle: boolean = true,
    ShowUom: boolean = false,
    ShowStatusbar: boolean = false,
    ShowToolTip: boolean = false,
    BorderThickness: number = 0,
    ShowActiveWell: boolean = false,
    ShowScale: boolean = true,
    ShowValue: boolean = true,
    ShowIndex: boolean = false,
    Decimal: number = 2,
    Orientation: OrientationTypes = OrientationTypes.Horizontal,
    IndexType: DataIndexTypes = DataIndexTypes.Time
  ) {
    this.ShowTitle = ShowTitle;
    this.Title = Title;
    this.ShowUom = ShowUom;
    this.ShowStatusbar = ShowStatusbar;
    this.ShowToolTip = ShowToolTip;
    this.BorderThickness = BorderThickness;
    this.ShowActiveWell = ShowActiveWell;
    this.ShowScale = ShowScale;
    this.ShowValue = ShowValue;
    this.ShowIndex = ShowIndex;
    this.Decimal = Decimal;
    this.Orientation = Orientation;
    this.IndexType = IndexType;
  }
}

export enum DataIndexTypes {
  Time,
  X,
  Y,
  Z,
  Depth,
}

export enum OrientationTypes {
  Horizontal,
  Vertical,
}
