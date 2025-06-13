import { ColourList } from '../theme.colour.config';

export class AlarmSettings {
  AlarmType: EAlarmType;
  WarningValue: number;
  Warning: boolean;
  Blinking: boolean;
  MaxValue: number;
  MinValue: number;
  Color: string;

  constructor(AlarmType: EAlarmType, WarningValue: number, Warning: boolean, Blinking: boolean, MaxValue: number, MinValue: number, Color: string) {
    this.AlarmType = AlarmType;
    this.WarningValue = WarningValue;
    this.Warning = Warning;
    this.Blinking = Blinking;
    this.MaxValue = MaxValue;
    this.MinValue = MinValue;
    this.Color = Color;
  }
  static getDefaultAlarms(): AlarmSettings[] {
    return [
      new AlarmSettings(EAlarmType.Alarm_High, 0, true, false, 100, 80, ColourList.C6),
      new AlarmSettings(EAlarmType.Warning_High, 0, true, false, 80, 60, ColourList.C5),
      new AlarmSettings(EAlarmType.Warning_Low, 0, true, false, 60, 40, ColourList.C8),
      new AlarmSettings(EAlarmType.Alarm_Low, 0, true, false, 40, 0, ColourList.C9),
    ];
  }
}

export enum EAlarmType {
  Alarm_High = 'Alarm High',
  Warning_High = 'Warning High',
  Warning_Low = 'Warning Low',
  Alarm_Low = 'Alarm Low',
  Alarm_Normal = 'Normal',
}
