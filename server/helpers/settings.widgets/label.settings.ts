import { DashboardSettings } from '../settings.helper';
import { EFontSize, FontSettings } from '../settings.helpers/font.settings.helper';
import { GeneralSettings } from '../settings.helpers/general.settings.helper';
import { AppearanceSettings } from '../settings.helpers/appearance.settings.helper';
import { MnemonicSettings } from '../settings.helpers/mnemonic.settings.helper';
export default class LabelSettings extends DashboardSettings {
  constructor(
    SettingId: string = '',
    General: Partial<GeneralSettings> = new GeneralSettings(),
    Appearance: Partial<AppearanceSettings> = new AppearanceSettings(),
    Font: Partial<FontSettings> = new FontSettings(),
    Mnemonics: MnemonicSettings[] = []
  ) {
    super(SettingId, { ...General, Title: 'Label Widget', ShowTitle: true }, Appearance, [], Font, Mnemonics, undefined, undefined, undefined);
    this.Alarm = null;
    this.Range = null;
    this.Image = null;

    if (this.Font) {
      delete this.Font.Unit;
    }
    if (this.Appearance) {
      delete this.Appearance.MarkerColor;
      delete this.Appearance.ProgressColor;
      delete this.Appearance.UnitFontColor;
    }
    if (this.General) {
      delete this.General.ShowUom;
      delete this.General.ShowToolTip;
      delete this.General.ShowScale;
      delete this.General.ShowStatusbar;
      delete this.General.ShowValue;
      delete this.General.ShowIndex;
      delete this.General.Decimal;
      delete this.General.IndexType;
      delete this.General.Orientation;
    }

    this.Font.Title.FontSize = EFontSize.Medium;
    if (this.Font.Value) {
      this.Font.Value.FontSize = EFontSize.XXLarge;
    }
    delete this.Font.Label;
  }
}
