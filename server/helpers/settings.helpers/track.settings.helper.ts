import { MnemonicSettings } from './mnemonic.settings.helper';

export class TrackSettings {
  TrackName: string;
  Background: string;
  BorderColour: string;
  BorderThickness: number;
  GridColor: string;
  GridThickness: number;
  GridVisibility: boolean;
  TrackType: string;
  Curve: Curve[];

  constructor(
    TrackName: string = '',
    Background: string = '',
    BorderColour: string = '',
    BorderThickness: number = 1,
    GridColor: string = '',
    GridThickness: number = 1,
    GridVisibility: boolean = true,
    TrackType: string = 'Curve',
    Curve: Curve[] = []
  ) {
    this.TrackName = TrackName;
    this.Background = Background;
    this.BorderColour = BorderColour;
    this.BorderThickness = BorderThickness;
    this.GridColor = GridColor;
    this.GridThickness = GridThickness;
    this.GridVisibility = GridVisibility;
    this.TrackType = TrackType;
    this.Curve = Curve;
  }
}

export class Curve {
  CurveColor: string;
  ChartType: string;
  LineStyle: string;
  LineThickness: number;
  ZeroLine: number;
  Mnemonic: Partial<MnemonicSettings>;
  Marker: boolean;
  MarkerSize: number;
  MarkerType: string;
  DisplayName: string;
  Visible: boolean;
  ShowValue: boolean;
  FillColor: string;
  constructor(
    CurveColor: string = '',
    ChartType: string = 'line',
    LineStyle: string = 'solid',
    LineThickness: number = 1,
    ZeroLine: number = 0,
    Marker: boolean = false,
    MarkerSize: number = 1,
    MarkerType: string = 'ellipse',
    DisplayName: string = '',
    Visible: boolean = true,
    ShowValue: boolean = false,
    FillColor: string = ''
  ) {
    this.CurveColor = CurveColor;
    this.ChartType = ChartType;
    this.LineStyle = LineStyle;
    this.LineThickness = LineThickness;
    this.ZeroLine = ZeroLine;
    this.Mnemonic = new MnemonicSettings('', 0);
    this.Marker = Marker;
    this.MarkerSize = MarkerSize;
    this.MarkerType = MarkerType;
    this.DisplayName = DisplayName;
    this.Visible = Visible;
    this.ShowValue = ShowValue;
    this.FillColor = FillColor;
  }
}
