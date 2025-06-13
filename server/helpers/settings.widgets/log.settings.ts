import { DashboardSettings } from '../settings.helper';
import { FontSettings } from '../settings.helpers/font.settings.helper';
import { GeneralSettings } from '../settings.helpers/general.settings.helper';
import { MnemonicSettings } from '../settings.helpers/mnemonic.settings.helper';
import { AppearanceSettings } from '../settings.helpers/appearance.settings.helper';
import { AlarmSettings } from '../settings.helpers/alarm.settings.helper';
import { TrackSettings } from '../settings.helpers/track.settings.helper';

export default class LogSettings extends DashboardSettings {
  constructor(
    SettingId: string = '',
    General: Partial<GeneralSettings> = new GeneralSettings(),
    Appearance: Partial<AppearanceSettings> = new AppearanceSettings(),
    Track: TrackSettings[] = [],
    Font: Partial<FontSettings> = new FontSettings(),
    Mnemonics: MnemonicSettings[] = [],
    Alarm: AlarmSettings[] = []
  ) {
    super(SettingId, { ...General, Title: 'Log Widget', ShowTitle: false }, Appearance, Track, Font, Mnemonics, Alarm, undefined, undefined);
    delete this.Range;
    this.Image = null;
    if (this.General) {
      delete this.General.ShowActiveWell;
      delete this.General.ShowIndex;
      delete this.General.ShowValue;
      delete this.General.ShowStatusbar;
      delete this.General.Decimal;
    }
    if (this.Appearance) {
      delete this.Appearance.MarkerColor;
      delete this.Appearance.ProgressColor;
      delete this.Appearance.UnitFontColor;
      delete this.Appearance.ValueFontColor;
    }
    if (!this.Track.length) {
      this.Track.push(new TrackSettings());
      this.Track[0].TrackType = 'Index';
      this.Track.push(new TrackSettings());
      this.Track[1].TrackName = 'Curve Track 1';
      this.Track[1].GridVisibility = true;
      this.Track[1].GridThickness = 1;
      this.Track[1].BorderThickness = 1;
      this.Track[1].BorderColour = '';
      this.Track[1].GridColor = '';
      this.Track[1].Background = 'transparent';
    }

    if (this.Font) {
      delete this.Font.Value;
      delete this.Font.Unit;
      delete this.Font.Label;
    }
  }
}
