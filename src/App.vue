<template>
  <div
    id="chatApp"
    class="fontNormal"
    @dblclick.ctrl.exact="versionDisplay"
    @mousemove="lastActiveTime = Date.now()"
    @keydown="lastActiveTime = Date.now()">
    <LoginPage v-if="!Object.keys(authInfo || {}).length || $route.name === Routes.Login" />
    <template v-if="Object.keys(authInfo || {}).length && $route.name !== Routes.Login">
      <AppHeader class="common-header" />
      <router-view class="common-content"></router-view>
      <AppNotification />
    </template>
    <ToastMessage />
    <VersionDisplay v-if="showVersionInfo" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, watch } from 'vue';
  import AppHeader from './components/AppHeader.vue';
  import { store } from './main';
  import { name as appName } from '../package.json';
  import { LoginResponse } from '../server/interfaces/auth.interfaces';
  import { parseJwt, readFromWebStorage, removeFromWebStorage, saveToWebStorage, valueIsInEnum } from '@/common/utils';
  import { Themes } from './interfaces/state.interfaces';
  import LoginPage from './pages/LoginPage.vue';
  import ToastMessage from './components/ToastMessage.vue';
  import { Routes } from '@/router/index';
  import VersionDisplay from './components/VersionDisplay.vue';
  import { Api } from '@/services/api.services';
  import { WebStorageKeys } from './interfaces/common.interfaces';
  import AppNotification from './components/Common/AppNotification.vue';

  export default defineComponent({
    name: 'App',
    components: {
      AppHeader,
      LoginPage,
      ToastMessage,
      VersionDisplay,
      AppNotification,
    },
    data() {
      return {
        Routes: Routes,
        showVersionInfo: false,
        lastActiveTime: Date.now() as number,
      };
    },
    computed: {
      authInfo() {
        return store.authInfo;
      },
    },
    created() {
      watch(
        () => store.authInfo,
        () => {
          this.processAuth();
        }
      );
    },
    beforeCreate() {
      if (appName) {
        document.title = appName
          .split(/[-\s]/)
          .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
          .join(' ');
      }
      const lastTheme = readFromWebStorage(WebStorageKeys.THEME);
      if (lastTheme && valueIsInEnum(lastTheme, Themes)) {
        store.setTheme(lastTheme);
      }
    },
    methods: {
      processAuth() {
        if (store.authInfo && Object.keys(store.authInfo).length) {
          const Tokenid = store.authInfo.id_token;
          const decodedToken = parseJwt(Tokenid);
          this.verifyExpiry();
          if (decodedToken) {
            store.userInfo = decodedToken;
            if (this.$route.name === Routes.Login && this.$route.meta?.fromLogin) {
              this.$router.push({ name: store.landingPage });
            }
          } else {
            this.$router.push({ name: Routes.Login });
          }
        } else {
          removeFromWebStorage(WebStorageKeys.AUTH);
        }
      },
      verifyExpiry() {
        const expiryCheckDuration = 60 * 1000; // defaults to 1 min
        const userInactivityDuration = (store.runtimeConfig.USER_INACTIVE_DURATION || 1800) * 1000; // defaults to 30 mins
        const token = store.authInfo.access_token;
        const decodedToken = parseJwt(token);
        if (!decodedToken) return;
        const expiry = new Date((decodedToken.exp || 0) * 1000).getTime();
        if (expiry - Date.now() <= expiryCheckDuration && Date.now() - this.lastActiveTime <= userInactivityDuration && expiry > Date.now()) {
          // About to expire but user is active
          this.refreshToken();
        } else if (expiry - Date.now() <= expiryCheckDuration && Date.now() - this.lastActiveTime > userInactivityDuration) {
          // About to expire and user is Inactive
          this.$router.push({ name: Routes.LogOut });
        } else if (expiry > Date.now()) {
          setTimeout(() => this.verifyExpiry(), expiryCheckDuration);
        }
      },
      async refreshToken() {
        const result = (await Api.submit('auth/refreshtoken', {
          token: store.authInfo.refresh_token,
        })) as LoginResponse;
        if (result && result.access_token) {
          store.authInfo = result;
          saveToWebStorage(WebStorageKeys.AUTH, result);
        }
      },
      versionDisplay(event: Event) {
        const targetElement = event.target as Element;
        if (targetElement.closest('#appLogo')) {
          this.showVersionInfo = !this.showVersionInfo;
          if (this.showVersionInfo) {
            setTimeout(() => {
              this.showVersionInfo = false;
            }, 5000);
          }
        }
      },
    },
  });
</script>

<style scoped>
  #chatApp {
    width: 100vw;
    height: 100vh;
    background: var(--bg-app);
    color: var(--text-tertiary);
    display: flex;
    flex-direction: column;
  }
  #chatApp .common-header {
    height: 35px;
    flex-shrink: 0;
  }
  #chatApp .common-content {
    flex: 1;
    overflow: auto;
  }
</style>
