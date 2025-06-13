import { GeneralSettings } from './settings.helpers/general.settings.helper';
import { AppearanceSettings } from './settings.helpers/appearance.settings.helper';
import { FontSettings } from './settings.helpers/font.settings.helper';
import { AlarmSettings } from './settings.helpers/alarm.settings.helper';
import { MnemonicSettings } from './settings.helpers/mnemonic.settings.helper';
import { RangeSettings } from './settings.helpers/range.settings.helper';
import { TrackSettings } from './settings.helpers/track.settings.helper';
import { ImageTemplateSettings } from './settings.helpers/imagetemplate.settings.helper';
export class DashboardSettings {
  SettingId?: string;
  General: GeneralSettings;
  Appearance: AppearanceSettings;
  Track: TrackSettings[];
  Font: FontSettings;
  Mnemonics: MnemonicSettings[] | undefined | null;
  Alarm: AlarmSettings[] | undefined | null;
  Range: RangeSettings | undefined | null;
  Image: ImageTemplateSettings | undefined | null;

  constructor(
    SettingId: string = '',
    General: Partial<GeneralSettings> = new GeneralSettings(),
    Appearance: Partial<AppearanceSettings> = new AppearanceSettings(),
    Track: TrackSettings[] = [],
    Font: Partial<FontSettings> = new FontSettings(),
    Mnemonics: MnemonicSettings[] = [],
    Alarm: AlarmSettings[] = [],
    Range: Partial<RangeSettings> = new RangeSettings(),
    Image: Partial<ImageTemplateSettings> = new ImageTemplateSettings()
  ) {
    this.SettingId = SettingId;
    this.General = new GeneralSettings(
      General.Title,
      General.ShowTitle,
      General.ShowUom,
      General.ShowStatusbar,
      General.ShowToolTip,
      General.BorderThickness,
      General.ShowActiveWell,
      General.ShowScale,
      General.ShowValue,
      General.ShowIndex,
      General.Decimal,
      General.Orientation,
      General.IndexType
    );
    this.Appearance = new AppearanceSettings(
      Appearance.BackgroundColour,
      Appearance.BorderColour,
      Appearance.TitleFontColor,
      Appearance.ValueFontColor,
      Appearance.UnitFontColor,
      Appearance.MarkerColor,
      Appearance.ProgressColor,
      Appearance.LabelFontColor
    );
    this.Track = Track?.map(
      (track: TrackSettings) =>
        new TrackSettings(
          track.TrackName,
          track.Background,
          track.BorderColour,
          track.BorderThickness,
          track.GridColor,
          track.GridThickness,
          track.GridVisibility,
          track.TrackType,
          track.Curve
        )
    );
    this.Font = new FontSettings(Font.Title, Font.Value, Font.Unit, Font.Label);
    this.Alarm = Alarm.map(
      (alarm) => new AlarmSettings(alarm.AlarmType, alarm.WarningValue, alarm.Warning, alarm.Blinking, alarm.MaxValue, alarm.MinValue, alarm.Color)
    );
    this.Range = new RangeSettings(Range.RangeType, Range.RangeMin, Range.RangeMax, Range.RangeColors);
    this.Mnemonics = Mnemonics.map(
      (mnemonic) =>
        new MnemonicSettings(mnemonic.MnemonicName, mnemonic.MnemonicId, mnemonic.LogName, mnemonic.Unit, mnemonic.UnitType, mnemonic.Color)
    );
    this.Image = new ImageTemplateSettings(Image.TemplateId, Image.TemplateName, Image.Entries);
  }
}
