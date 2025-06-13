import { Routes } from '@/router';
import { EventEmitter } from '@/common/event-emitter';
import { ToastMessage } from '@/components/ToastMessage.vue';
import { JWTUserData, LoginResponse } from '../../server/interfaces/auth.interfaces';
import { AppNotification } from '@/components/Common/AppNotification.vue';
import { IMemberGroupData } from '../../server/interfaces/chatgroup.interfaces';
import { Environments } from 'server/interfaces/server.interfaces';

export enum Themes {
  LIGHT = 'light',
  DARK = 'dark',
  DARKOLD = 'darkold',
  RED = 'red',
}

export interface State {
  runtimeConfig: RunTimeConfig;
  userInfo: JWTUserData;
  authInfo: LoginResponse;
  landingPage: Routes;
  theme: Themes;
  newToastMessage: ToastMessage;
  eventEmitter: EventEmitter;
  dashboardAction: DashBoardAction;
  appNotification: AppNotification;
  chatInfo: IMemberGroupData | null;
  selectedWellbore: string;
  dashboardTitle: string;
}
export enum DashBoardAction {
  NONE = 'none',
  EDIT = 'edit',
  SAVE = 'save',
  CLOSE = 'close',
  CLONE = 'clone',
  SAVEAS = 'saveas',
  EXPORT = 'export',
  FILESELECTION = 'fileselection',
  IMPORT = 'import',
  CREATE = 'create',
  CANCELPOPUP = 'cancelpopup',
  WELLBORE_SELECTION = 'wellboreselection',
}

export interface RunTimeConfig {
  API_BASE_URL: string;
  USER_INACTIVE_DURATION: number;
  DATA_STORE_URL: string;
  MODE: Environments;
}
