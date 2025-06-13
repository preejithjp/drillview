export class MnemonicSettings {
  MnemonicName: string;
  MnemonicId: number;
  LogName: string;
  Unit: string;
  UnitType: string;
  Color: string;
  DisplayName?: string;
  Id?: string;

  constructor(
    MnemonicName: string = '',
    MnemonicId: number = 0,
    LogName?: string,
    Unit?: string,
    UnitType?: string,
    Color?: string,
    DisplayName?: string,
    Id?: string
  ) {
    this.MnemonicName = MnemonicName;
    this.MnemonicId = MnemonicId;
    this.LogName = LogName || '';
    this.Unit = Unit || '';
    this.UnitType = UnitType || '';
    this.Color = Color || '';
    this.DisplayName = DisplayName || '';
    this.Id = Id || '';
  }
}
