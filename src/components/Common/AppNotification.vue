<template>
  <div class="appnotification-wrapper">
    <div v-for="(notification, nindex) in notifications" :key="notification.id" class="notification-container d-flex p-relative flex-col gap5">
      <div class="notification-header d-flex gap10 mb5 text-center align-items-center text-ellipsis">
        <SvgIcon v-if="notification.header.icon" :name="notification.header.icon" class="svg-icon size18" />
        <span class="fontSize-15 fontBold capitalize text-ellipsis">{{ notification.header.title }}</span>
      </div>
      <div class="d-flex gap10 cursor-pointer" @click="handleNotificationClick(notification)">
        <div class="d-flex gap10 mb5">
          <GroupAvatar
            :name="isIconOrName(notification.icon as string, 'text')"
            :image="isIconOrName(notification.icon as string, 'icon')"
            :colorIndex="nindex + 1"
            class="avatar-circle text-static-primary"></GroupAvatar>
        </div>
        <div class="d-flex flex-col gap5 scroll-auto">
          <div class="d-flex text-ellipsis">
            <span class="fontSize-15 fontBold capitalize text-ellipsis">{{ notification.title }}</span>
          </div>
          <div class="fontSize-13 fontMedium line-ellipsis">
            <template v-for="(content, cIndex) in notification.content" :key="'content' + cIndex">
              <br v-if="content.breakLine" />
              <span v-if="content.text" :class="content.cssClass">
                {{ content.text }}
              </span>
              <SvgIcon v-if="content.svg" :name="content.svg" :class="'svg-content-icon svg-icon ' + content.cssClass"></SvgIcon>
            </template>
          </div>
        </div>
      </div>
      <SvgIcon name="close-icon" class="svg-icon size12 close-icon" @click="removeNotification(notification)" />
    </div>
  </div>
</template>

<script lang="ts">
  import { store } from '@/main';
  import { defineComponent, watch } from 'vue';
  import { RouteLocationRaw } from 'vue-router';
  import GroupAvatar from '../Chat/GroupAvatar.vue';
  import NotificationSoundFile from '../../assets/audio/notification.mp3';

  export interface NotificationContent {
    text?: string;
    cssClass?: string;
    breakLine?: boolean;
    svg?: string;
  }

  export interface AppNotification {
    id?: number;
    header: AppNotificationHeader;
    title: string;
    content?: NotificationContent[];
    createdTimestamp?: number;
    redirectTo?: RouteLocationRaw;
    icon?: string;
    options?: AppNotificationOptions;
  }

  export interface AppNotificationHeader {
    title: string;
    icon?: string;
  }

  export interface AppNotificationOptions {
    NotificationSound?: boolean;
  }

  export default defineComponent({
    name: 'AppNotification',
    components: {
      GroupAvatar,
    },
    data() {
      return {
        notifications: [] as AppNotification[],
      };
    },
    created() {
      watch(
        () => store.appNotification,
        (notification) => {
          this.showNotification(notification);
        }
      );
    },
    methods: {
      showNotification(notification: AppNotification) {
        notification.id = Date.now();
        notification.createdTimestamp = Date.now();
        if (this.notifications.length < 3) {
          this.notifications.push(notification);
        } else {
          this.notifications.shift();
          this.notifications.push(notification);
        }
        if (notification.options?.NotificationSound) {
          this.playNotificationSound();
        }
      },
      removeNotification(notification: AppNotification) {
        this.notifications = this.notifications.filter((n) => n.id !== notification.id);
      },
      handleNotificationClick(notification: AppNotification) {
        if (notification.redirectTo) {
          this.$router.push(notification.redirectTo);
        }
        this.removeNotification(notification);
      },
      isIconOrName(icon: string, returnType: string = 'icon') {
        if (icon) {
          if (returnType === 'icon' && icon.includes('data:image/')) {
            return icon;
          } else if (returnType === 'text') {
            return icon;
          }
        }
        return;
      },
      playNotificationSound() {
        const audio = new Audio(NotificationSoundFile);
        audio.play().catch((err) => {
          Logger.Error('Notification Playback failed:', err);
        });
      },
    },
  });
</script>

<style scoped>
  .appnotification-wrapper {
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .notification-container {
    background: var(--bg-quaternary);
    width: 450px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    border: 2px solid var(--high-priority);
    padding: 15px;
  }

  .notification-header {
    padding: 0px 15px 0px 5px;
  }

  .close-icon {
    position: absolute;
    top: 1em;
    right: 1em;
  }

  .svg-content-icon {
    transform: translateY(4px);
    padding-right: 3px;
  }

  .line-ellipsis {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .avatar-circle {
    height: 40px;
    width: 40px;
  }
</style>
