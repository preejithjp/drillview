import { DashboardSettings } from '../settings.helper';
import { FontSettings } from '../settings.helpers/font.settings.helper';
import { GeneralSettings } from '../settings.helpers/general.settings.helper';
import { MnemonicSettings } from '../settings.helpers/mnemonic.settings.helper';
import { AppearanceSettings } from '../settings.helpers/appearance.settings.helper';
import { RangeSettings, RangeColor } from '../settings.helpers/range.settings.helper';
import { ColourList } from '../theme.colour.config';
import { EAlarmType } from '../settings.helpers/alarm.settings.helper';

export default class GaugeSettings extends DashboardSettings {
  constructor(
    SettingId: string = '',
    General: Partial<GeneralSettings> = new GeneralSettings(),
    Appearance: Partial<AppearanceSettings> = new AppearanceSettings(),
    Font: Partial<FontSettings> = new FontSettings(),
    Mnemonics: MnemonicSettings[] = [],
    Range: Partial<RangeSettings> = new RangeSettings()
  ) {
    super(SettingId, { ...General, Title: 'Gauge Widget' }, Appearance, [], Font, Mnemonics, undefined, Range, undefined);

    this.Alarm = null;
    this.Image = null;
    if (this.General) {
      delete this.General.ShowActiveWell;
      delete this.General.ShowToolTip;
      delete this.General.ShowIndex;
      delete this.General.Decimal;
      delete this.General.IndexType;
      delete this.General.Orientation;
    }

    this.General.ShowUom = true;
    this.General.ShowStatusbar = true;

    if (this.Range?.RangeColors) {
      this.Range.RangeColors.push(new RangeColor(EAlarmType.Alarm_Low, ColourList.C3, 0, 20, false, false));
      this.Range.RangeColors.push(new RangeColor(EAlarmType.Warning_Low, ColourList.C8, 20, 40, false, false));
      this.Range.RangeColors.push(new RangeColor(EAlarmType.Alarm_Normal, ColourList.C9, 0, 60, true, false));
      this.Range.RangeColors.push(new RangeColor(EAlarmType.Warning_High, ColourList.C5, 60, 80, true, false));
      this.Range.RangeColors.push(new RangeColor(EAlarmType.Alarm_High, ColourList.C6, 80, 100, true, false));
    }
    delete this.Font.Label;
  }
}
