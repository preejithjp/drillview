export class RangeSettings {
  RangeType: ERangeType;
  RangeMin: number;
  RangeMax: number;
  RangeColors: RangeColor[];

  constructor(RangeType: ERangeType = ERangeType.PERCENTAGE, RangeMin: number = 0, RangeMax: number = 100, RangeColors: RangeColor[] = []) {
    this.RangeType = RangeType;
    this.RangeMin = RangeMin;
    this.RangeMax = RangeMax;
    this.RangeColors = RangeColors.map((rc) => new RangeColor(rc.label, rc.color, rc.min, rc.max, rc.enabled, rc.blinking));
  }
}

export class RangeColor {
  label: string;
  color: string;
  min: number;
  max: number;
  enabled: boolean;
  blinking: boolean;

  constructor(label: string = '', color: string = '', min: number = 0, max: number = 100, enabled: boolean = true, blinking: boolean = false) {
    this.label = label;
    this.color = color;
    this.min = min;
    this.max = max;
    this.enabled = enabled;
    this.blinking = blinking;
  }
}

export enum ERangeType {
  PERCENTAGE = 'Percentage',
  VALUE = 'Value',
}
