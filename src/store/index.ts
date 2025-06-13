import { defineStore } from 'pinia';
import { Routes } from '@/router';
import { RunTimeConfig, State, Themes, DashBoardAction } from '@/interfaces/state.interfaces';
import { JWTUserData, LoginResponse } from '../../server/interfaces/auth.interfaces';
import { ToastMessage, ToastType } from '@/components/ToastMessage.vue';
import { EventEmitter } from '@/common/event-emitter';
import { saveToWebStorage } from '@/common/utils';
import { WebStorageKeys } from '@/interfaces/common.interfaces';
import { AppNotification, AppNotificationHeader, AppNotificationOptions, NotificationContent } from '@/components/Common/AppNotification.vue';
import { IMemberGroupData } from '../../server/interfaces/chatgroup.interfaces';
import { RouteLocationRaw } from 'vue-router';

export default defineStore('app', {
  state: (): State => ({
    authInfo: {} as LoginResponse,
    userInfo: {} as JWTUserData,
    landingPage: Routes.Summary as Routes,
    theme: Themes.LIGHT,
    newToastMessage: {} as ToastMessage,
    eventEmitter: new EventEmitter(),
    runtimeConfig: {} as RunTimeConfig,
    dashboardAction: DashBoardAction.NONE,
    selectedWellbore: 'Select Wellbore',
    appNotification: {} as AppNotification,
    chatInfo: {} as IMemberGroupData,
    dashboardTitle: '',
  }),
  actions: {
    setTheme(theme: Themes) {
      this.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      saveToWebStorage(WebStorageKeys.THEME, theme);
    },
    showToast(toastType: ToastType, message: string, duration?: number) {
      this.newToastMessage = { message, toastType, duration };
    },
    setDashboardAction(event: DashBoardAction) {
      this.dashboardAction = event;
    },
    setSelectedWellbore(wellbore: string) {
      this.selectedWellbore = wellbore;
    },
    setDashboardTitle(title: string) {
      this.dashboardTitle = title;
    },
    showNotification(
      header: AppNotificationHeader,
      title: string,
      content: NotificationContent[],
      redirectTo?: RouteLocationRaw,
      icon?: string,
      options?: AppNotificationOptions
    ) {
      this.appNotification = { header, title, content, redirectTo, icon, options };
    },
  },
  getters: {},
});
