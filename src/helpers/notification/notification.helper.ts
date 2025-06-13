import { webSocketClient } from '@/services/websocketclient.service';
import { store } from '@/main';
import { NotificationSource, WsAppNotification, WsServerEvents } from '../../../server/interfaces/websocket.interfaces';
import { Routes } from '@/router';
import { AppNotificationHeader, AppNotificationOptions, NotificationContent } from '@/components/Common/AppNotification.vue';
import { RouteLocationRaw } from 'vue-router';

export function initializeNotification() {
  webSocketClient.on('connection', () => {
    webSocketClient.off(WsServerEvents.APP_NOTIFICATION, handleNotifications);
    webSocketClient.on(WsServerEvents.APP_NOTIFICATION, handleNotifications);
  });
}

function handleNotifications(notification: WsAppNotification): void {
  // Handle the notification data here
  let header: AppNotificationHeader = {
    title: notification.source,
  };
  let redirectTo: RouteLocationRaw = {},
    content: NotificationContent[] = [],
    options: AppNotificationOptions = {};
  const { referenceId } = notification.data ? (notification.data as { referenceId: string }) : {};
  switch (notification.source) {
    case NotificationSource.Chat:
      if (store.chatInfo && notification.data && store.chatInfo.ParentGroupId === referenceId) {
        return;
      }
      header = {
        title: 'Chat - New Message',
        icon: 'chat-group-icon',
      };
      redirectTo = {
        name: Routes.Chat,
        query: { id: referenceId },
      };
      content = [{ svg: 'important-circle-icon', cssClass: 'high-priority-color size18' }, ...notification.content];
      options = notification.options || {};
      store.showNotification(header, notification.title, content, redirectTo, notification.icon, options);
      break;
    default:
      store.showNotification(header, notification.title, notification.content, undefined, notification.icon, notification.options);
  }
}
