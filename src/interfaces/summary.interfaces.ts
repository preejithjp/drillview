export interface AlarmDetails {
  wellboreEml: string;
  wellId: string;
  wellboreId: string;
  wellName: string;
  rigName: string;
  wellboreName: string;
  isActive: boolean;
  latitude: number;
  longitude: number;
  lastChanged: number;
  timeZone: string;
  alert?: boolean;
  status: keyof typeof StatusColor;
  wellStatus?: string;
  actualDays?: string;
  plannedDays?: string;
}

export interface CardDetails {
  id: number;
  alarmStatus: string;
  wellStatus: keyof typeof StatusColor;
  warning: boolean;
  bdepth: number;
  hdepth: number;
  hookload: number;
  wob: number;
  wellName: string;
  wellDepth: number;
  rigName: string;
  date: string;
}

export enum StatusColor {
  'DRILLING' = 'drilling-',
  'CEMENTING' = 'cementing-',
  'COIL TUBING' = 'coiltubing-',
  'WELL TESTING' = 'welltesting-',
}

export interface DashboardConfig {
  wellStatus: wellStatus;
  wellDepth: wellStatus;
  detailSensors: wellStatus[];
}

export interface wellStatus {
  timeBased: boolean;
  channelName: string;
  logName: string;
  title?: string;
  uuid?: string;
}
