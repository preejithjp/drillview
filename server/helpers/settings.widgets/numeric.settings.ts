import { DashboardSettings } from '../settings.helper';
import { EFontSize, EFontWeight, FontSettings } from '../settings.helpers/font.settings.helper';
import { GeneralSettings } from '../settings.helpers/general.settings.helper';
import { MnemonicSettings } from '../settings.helpers/mnemonic.settings.helper';
import { AppearanceSettings } from '../settings.helpers/appearance.settings.helper';
import { AlarmSettings } from '../settings.helpers/alarm.settings.helper';

export default class NumericSettings extends DashboardSettings {
  constructor(
    SettingId: string = '',
    General: Partial<GeneralSettings> = new GeneralSettings(),
    Appearance: Partial<AppearanceSettings> = new AppearanceSettings(),
    Font: Partial<FontSettings> = new FontSettings(),
    Alarm: AlarmSettings[] = [],
    Mnemonics: MnemonicSettings[] = []
  ) {
    super(
      SettingId,
      { ...General, Title: 'Numeric', ShowTitle: true, ShowStatusbar: true },
      Appearance,
      [],
      Font,
      Mnemonics,
      Alarm,
      undefined,
      undefined
    );

    // Remove unwanted configurations
    this.Range = null;
    this.Image = null;
    this.Alarm = AlarmSettings.getDefaultAlarms();

    if (this.Appearance) {
      delete this.Appearance.MarkerColor;
      delete this.Appearance.ProgressColor;
    }
    if (this.General) {
      this.General.Decimal = 2;
      delete this.General.ShowActiveWell;
      delete this.General.ShowToolTip;
      delete this.General.ShowScale;
      delete this.General.ShowValue;
      delete this.General.IndexType;
      delete this.General.Orientation;
    }
    this.Font.Title.FontSize = EFontSize.Medium;
    if (this.Font.Value) {
      this.Font.Value.FontSize = EFontSize.XXXLarge;
      this.Font.Value.FontWeight = EFontWeight.Semibold;
    }
    if (this.Font.Unit) {
      this.Font.Unit.FontSize = EFontSize.XXXLarge;
      this.Font.Unit.FontWeight = EFontWeight.Semibold;
    }
    delete this.Font.Label;
  }
}
