import { Binary } from 'bson';
import { DashboardSettings } from '../helpers/settings.helper';

export interface IOffset {
  OffsetId: string;
  SourceId: string;
}
export interface IWidget {
  Name: string;
  i: string;
  Layout: boolean;
  Offsets: string;
  SourceId: string;
  Settings?: string;
  LayoutId?: string;
  PopulateLayout?: ILayout[] | undefined;
  SettingsDetails?: DashboardSettings;
  h: number;
  w: number;
  x: number;
  y: number;
}

export interface ILayout {
  LayoutId: string | Binary;
  Layout: IWidget[];
}

export interface IDashboard {
  DashboardName: string;
  DashboardId: string | Binary;
  SourceId: string;
  Icon: string;
  Offsets: IOffset[];
  Layout?: IWidget[];
  Description: string;
  StatusCode: DashboardStatus;
  SortOrder?: number;
  LayoutData?: ILayout[];
  DeleteId?: string[];
}

export interface IDashboardUser extends IDashboard {
  CreatedDate: number;
  ModifiedDate: number;
  CreatedUser: string;
  ModifiedUser: string;
}

export interface ILayoutUsers extends ILayout {
  CreatedDate?: number;
  ModifiedDate?: number;
  CreatedUser?: string;
  ModifiedUser?: string;
}
export enum DashboardStatus {
  Enabled = 200,
  Disabled = 201,
}

export const AllowIconType = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/bmp', 'image/tiff', 'image/x-icon'];

export interface IResizeData {
  id: string;
  count: number;
}
