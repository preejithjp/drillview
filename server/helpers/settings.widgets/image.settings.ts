import { DashboardSettings } from '../settings.helper';
import { GeneralSettings } from '../settings.helpers/general.settings.helper';
import { AppearanceSettings } from '../settings.helpers/appearance.settings.helper';
import { FontSettings, EFontSize, EFontWeight } from '../settings.helpers/font.settings.helper';
import { IImageTemplate } from '../../interfaces/imagetemplate.interfaces';
import { ImageTemplateSettings } from '../settings.helpers/imagetemplate.settings.helper';
export default class ImageSettings extends DashboardSettings {
  public ImageTemplates: IImageTemplate[] = [];

  constructor(
    SettingId: string = '',
    General: Partial<GeneralSettings> = new GeneralSettings(),
    Appearance: Partial<AppearanceSettings> = new AppearanceSettings(),
    Font: Partial<FontSettings> = new FontSettings(),
    Image: Partial<ImageTemplateSettings> = new ImageTemplateSettings()
  ) {
    super(
      SettingId,
      { ...General, Title: 'Image', ShowTitle: true, ShowStatusbar: true },
      Appearance,
      [],
      Font,
      undefined,
      undefined,
      undefined,
      Image
    );
    if (this.Font) {
      delete this.Font.Unit;
    }
    if (this.Appearance) {
      delete this.Appearance.MarkerColor;
      delete this.Appearance.ProgressColor;
    }

    if (this.General) {
      delete this.General.Decimal;
      delete this.General.ShowActiveWell;
      delete this.General.ShowToolTip;
      delete this.General.ShowScale;
      delete this.General.ShowValue;
      delete this.General.ShowUom;
    }

    // Remove inherited Range
    this.Range = null;

    this.Font.Title.FontSize = EFontSize.Medium;
    this.Font.Title.FontWeight = EFontWeight.Bold;
  }
}
