import { DashboardSettings } from '../settings.helper';
import { EFontFamily, EFontSize, EFontWeight, FontSettings } from '../settings.helpers/font.settings.helper';
import { GeneralSettings } from '../settings.helpers/general.settings.helper';
import { MnemonicSettings } from '../settings.helpers/mnemonic.settings.helper';
import { AppearanceSettings } from '../settings.helpers/appearance.settings.helper';
import { ColourList } from '../theme.colour.config';

export default class CommentSettings extends DashboardSettings {
  constructor(
    SettingId: string = '',
    General: Partial<GeneralSettings> = new GeneralSettings(),
    Appearance: Partial<AppearanceSettings> = new AppearanceSettings(),
    Font: Partial<FontSettings> = new FontSettings(),
    Mnemonics: MnemonicSettings[] = []
  ) {
    super(SettingId, { ...General, Title: 'Comment', ShowTitle: true, ShowStatusbar: false }, Appearance, [], Font, Mnemonics, undefined, undefined);

    // Remove unwanted configurations
    this.Alarm = null;
    this.Range = null;

    if (this.Appearance) {
      this.Appearance.LabelFontColor = ColourList.C7;
      delete this.Appearance.MarkerColor;
      delete this.Appearance.ProgressColor;
    }
    if (this.General) {
      this.General.Decimal = 2;
      this.General.ShowUom = true;
      delete this.General.ShowActiveWell;
      delete this.General.ShowToolTip;
      delete this.General.ShowScale;
      delete this.General.ShowValue;
      delete this.General.ShowIndex;
      delete this.General.Orientation;
    }
    this.Font.Title.FontSize = EFontSize.Medium;
    if (this.Font.Value) {
      this.Font.Value.FontSize = EFontSize.Medium;
      this.Font.Value.FontWeight = EFontWeight.Bold;
    }
    if (this.Font.Unit) {
      this.Font.Unit.FontSize = EFontSize.Medium;
      this.Font.Unit.FontWeight = EFontWeight.Semibold;
    }
    if (this.Font.Label) {
      this.Font.Label.FontSize = EFontSize.Medium;
      this.Font.Label.FontFamily = EFontFamily.Arial;
      this.Font.Label.FontWeight = EFontWeight.Light;
    }
  }
}
