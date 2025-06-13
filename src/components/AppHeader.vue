<template>
  <header class="app-header fontSize-14">
    <SvgIcon v-if="showHeaderExpandBtn()" name="menu-icon-04" class="svg-icon size16 teritiary" @click="onHeaderExpandBtnClick" />
    <svg id="appLogo" class="svg-icon logo appLogoColors" @click="navigateToLandingPage">
      <use href="/src/assets/images/logo-shellsquare.svg#shellsquare"></use>
    </svg>
    <div class="flex-full d-flex routeName align-items-center">
      <span>|</span>
      <span v-if="currentRouteName">{{ currentRouteName }}</span>
      <span v-if="currentRouteSubtitle">|</span>
      <span v-if="currentRouteSubtitle">{{ currentRouteSubtitle }}</span>
      <span v-if="diplayControlButtons" class="">|</span>
      <div v-if="diplayControlButtons" class="widget-header d-flex align-items-center">
        <div class="fontSize-12 fontBold">{{ storeInstance.dashboardTitle }}</div>
        <span class="">|</span>
        <div class="fontSize-10 text-ellipsis">
          Hole Depth: 9045.26ft.
          <span class="">|</span>
          RPM: 1500 rpm
          <span class="">|</span>
          Hook Load: 300 N
        </div>
        <span class="">|</span>
        <span class="fontSize-12 fontBold cursor-pointer" @click="handleClick(DashBoardAction.WELLBORE_SELECTION)">
          {{ storeInstance?.selectedWellbore }}
        </span>
      </div>
    </div>
    <template v-if="diplayControlButtons">
      <SvgIcon
        v-if="isEditEnabled"
        name="close-icon"
        class="svg-icon size14 teritiary"
        title="Close Dashboard"
        @click="handleClick(DashBoardAction.CLOSE)" />
      <SvgIcon
        v-if="isEditEnabled"
        name="save-icon"
        class="svg-icon size18 teritiary"
        title="Save Dashboard"
        @click="handleClick(DashBoardAction.SAVE)" />
      <SvgIcon
        v-if="isEditEnabled"
        name="saveas-icon"
        class="svg-icon size28 teritiary"
        title="Save Dashboard As"
        @click="handleClick(DashBoardAction.SAVEAS)" />
      <ActionMenu
        v-if="!isEditEnabled"
        icon="settings-icon"
        :menuItems="dashboardActionItems"
        @on-menu-item-select="handleActionItemSelect"></ActionMenu>
    </template>
    <ThemeSelector class="theme-selector" />

    <div v-outsideclick="handleOutsideClick" class="dropdown-container fontSize-12">
      <SvgIcon name="menu-icon" class="svg-icon size20 teritiary" @click.stop="toggleDropdown" />
      <div v-if="activePopup === PopupList.NavMenu" class="dropdown-menu">
        <div
          v-for="route in filteredRoutes"
          :key="route.name"
          :class="['dropdown-item', { active: typeof currentRouteName === 'string' && currentRouteName.includes(route.name) }]"
          @click.stop="navigateTo(route.name)">
          <SvgIcon :name="route.meta?.icon ?? ''" class="svg-icon size20" />
          <span class="flex-full">{{ route.name }}</span>
          <SvgIcon v-if="route.SubMenu?.length" name="downArrow-icon" class="svg-icon size12 rotate270" />

          <div v-if="route.SubMenu?.length" class="dropdown-submenu-container">
            <div
              v-for="(submenu, i) in route.SubMenu"
              :key="i"
              class="dropdown-item d-flex align-items-center width-100 gap5"
              @click.stop="subMenuNavigation(route.name, submenu)">
              <!-- Only show image if valid -->
              <img
                v-if="submenu.image && submenu.name !== 'More' && !hasImageFailed(submenu.name)"
                :src="submenu.image"
                class="svg-icon size20 brighter"
                @error="() => onImageError(submenu.name)" />

              <!-- Show icon only if image not shown -->
              <SvgIcon v-else :name="submenu.icon || 'default-icon'" class="svg-icon size20 icon-color" />

              <span class="">{{ submenu.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <span class="align-header-center" @click="navigateToProfile">
      <SvgIcon name="user-icon" class="svg-icon size14 teritiary" />
      <span class="user-name">{{ storeInstance?.userInfo?.name || '' }}</span>
    </span>
    <span class="align-header-center" @click="logout">
      <SvgIcon name="logout-icon" class="svg-icon size20 teritiary" />
      <span>Logout</span>
    </span>
    <DashboardList
      v-if="activePopup === PopupList.ALLDashboard"
      class="p-absolute"
      :dashboardDetails="dashboardDetails"
      @cancel="activePopup = PopupList.None" />
  </header>
</template>

<script lang="ts">
  import { store } from '@/main';
  import { DashBoardAction } from '@/interfaces/state.interfaces';
  import DashboardList from './DashboardList.vue';
  import ThemeSelector from './Common/ThemeSelector.vue';
  import ActionMenu, { ActionMenuItem } from './Common/ActionMenu.vue';
  import { defineComponent } from 'vue';
  import { routeRecordName, Routes, routes } from '@/router/index';
  import { Api } from '@/services/api.services';
  import { IDashboard, DashboardStatus } from '../../server/interfaces/dashboard.interfaces';
  import { closeWebSocketClient, initializeWebSocketClient } from '@/services/websocketclient.service';
  import { initializeNotification } from '@/helpers/notification/notification.helper';
  export enum PopupList {
    None = 'None',
    NavMenu = 'NavMenu',
    ALLDashboard = 'All Dashboards',
    DeleteDashboard = 'Delete Dashboard',
  }
  export interface ISubMenu {
    name: string;
    icon?: string;
    image?: string;
    path?: string;
  }

  export type MenuRoutes = routeRecordName & {
    SubMenu?: ISubMenu[];
  };

  export default defineComponent({
    name: 'AppHeader',
    components: { ThemeSelector, DashboardList, ActionMenu },
    data() {
      return {
        DashBoardAction,
        Routes: Routes,
        PopupList: PopupList,
        isDarkMode: false as boolean,
        activePopup: PopupList.None as PopupList,
        dashboardDetails: [] as IDashboard[],
        failedImages: {},
        dashboardActionItems: [
          { label: 'Create', icon: 'circle-plus-icon', action: DashBoardAction.CREATE },
          { label: 'Edit', icon: 'edit-icon', action: DashBoardAction.EDIT },
          { label: 'Clone', icon: 'clone-icon', action: DashBoardAction.CLONE },
          { label: 'Import', icon: 'import-icon', action: DashBoardAction.FILESELECTION, cssClass: 'size20' },
          { label: 'Export', icon: 'publish-icon', action: DashBoardAction.EXPORT },
        ],
      };
    },
    computed: {
      isEditEnabled() {
        return store.dashboardAction === DashBoardAction.EDIT || store.dashboardAction === DashBoardAction.CANCELPOPUP;
      },
      diplayControlButtons(): boolean {
        return this.$route.name === Routes.Dashboard;
      },
      filteredRoutes(): MenuRoutes[] {
        const filtered = routes.filter((route) => route.meta?.showInNavigation).map((route) => ({ ...route })) as MenuRoutes[]; // <-- force cast with spread

        // Handle Dashboard submenu
        const dashboard = filtered.find((r) => r.name === Routes.Dashboard);
        if (dashboard) {
          dashboard.SubMenu = this.dashboardDetails.slice(0, 3).map((d) => ({
            name: d.DashboardName,
            image: d.Icon,
            path: d.DashboardId as string,
          }));
          dashboard.SubMenu.push({ name: 'More' });
        }

        // Handle RigManager submenu manually using meta.parent
        const rigManager = filtered.find((r) => r.name === Routes.RigManager);
        if (rigManager) {
          const children = routes.filter((r) => r.meta?.parent === Routes.RigManager);
          rigManager.SubMenu = children.map((child) => ({
            name: String(child.name),
            icon: child.meta?.icon || '',
            path: String(child.name),
          }));
        }

        return filtered;
      },

      storeInstance() {
        return store;
      },
      currentRouteName() {
        return this.$route.name ?? '';
      },
      currentRouteSubtitle() {
        return this.$route.params?.subtitle ?? '';
      },
    },
    mounted() {
      initializeWebSocketClient();
      initializeNotification();
    },
    beforeUnmount() {
      closeWebSocketClient(1000, 'User logout.');
    },
    methods: {
      onImageError(name) {
        this.failedImages[name] = true;
      },
      hasImageFailed(name) {
        return this.failedImages[name];
      },
      handleClick(event: DashBoardAction) {
        store.setDashboardAction(event);
      },
      handleActionItemSelect(selectedItem: ActionMenuItem) {
        this.handleClick(selectedItem.action as DashBoardAction);
      },
      navigateToProfile() {
        this.$router.push({ name: Routes.Profile });
      },
      logout() {
        this.$router.push({ name: Routes.LogOut });
      },
      toggleDropdown() {
        this.activePopup = this.activePopup === PopupList.NavMenu ? PopupList.None : PopupList.NavMenu;
        if (this.activePopup === PopupList.NavMenu) {
          this.getAllDashboard();
        }
      },
      closeDropdown() {
        if (this.activePopup === PopupList.NavMenu) {
          this.activePopup = PopupList.None;
        }
      },
      handleOutsideClick(show: boolean) {
        if (show) {
          this.closeDropdown();
        }
      },
      navigateTo(route: Routes) {
        this.$router.push({ name: route });
        this.closeDropdown();
      },
      navigateToLandingPage() {
        this.$router.push({ name: store.landingPage });
      },
      subMenuNavigation(root: Routes, details: ISubMenu) {
        switch (root) {
          case Routes.Dashboard:
            if (details.path) {
              this.$router.push({ name: root, params: { dashboardid: details.path }, force: true });
            } else {
              this.activePopup = PopupList.ALLDashboard;
            }
            break;
          case Routes.RigManager:
            if (details.path) {
              this.$router.push({ name: details.path as Routes });
            }
            break;
        }
        this.closeDropdown();
      },
      async getAllDashboard() {
        const dashboards = (await Api.fetch('Dashboard')) as IDashboard[];
        if (dashboards) {
          this.dashboardDetails = dashboards.filter((dashboard) => dashboard.StatusCode === DashboardStatus.Enabled);
        }
      },
      onHeaderExpandBtnClick() {
        store.eventEmitter.emit('header-expand-btn-click');
      },
      showHeaderExpandBtn() {
        return [Routes.Chat, Routes.ChatGroupMembers, Routes.RigManager, Routes.ManageRig, Routes.ManageWell].includes(this.$route.name as Routes);
      },
    },
  });
</script>

<style scoped>
  .appLogoColors {
    --logo_color_shell: white;
    --logo_color_square: white;
    --logo_color_top_icon: white;
    --logo_color_bottom_icon: white;
    --logo_color_icon_border: white;
  }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-primary);
    padding: 0 1rem;
    color: var(--text-primary);
    width: 100%;
    gap: 20px;
    user-select: none;
  }

  .logo {
    width: 100px;
    height: 25px;
  }

  .theme-selector {
    width: 45px;
    height: 50%;
  }

  .align-header-center {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }

  .dropdown-container {
    position: relative;
    display: inline-block;
    width: 20px;
    height: 20px;
  }

  .dropdown-menu {
    color: var(--text-tertiary);
    position: absolute;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--bg-secondary);
    background-color: var(--bg-secondary);
    padding: 10px 0px;
    box-shadow: 0 0 6px -1px var(--bg-primary);
    z-index: 1000;
    min-width: 100px;
    cursor: pointer;
    user-select: none;
  }

  [data-theme='dark'] .dropdown-menu {
    box-shadow: 0 0 4px 2px var(--bg-primary);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    white-space: nowrap;
    padding: 10px 16px;
    gap: 10px;
    position: relative;
  }

  .dropdown-item:last-child {
    border: none;
  }

  .dropdown-item.active,
  .dropdown-item:hover {
    background-color: var(--hover-primary);
  }

  .dropdown-item:hover .dropdown-submenu-container {
    visibility: visible !important;
  }

  .dropdown-submenu-container {
    visibility: hidden;
    position: absolute;
    right: calc(100% + 1px);
    color: var(--text-tertiary);
    display: flex;
    flex-direction: column;
    border: 1px solid var(--bg-secondary);
    background-color: var(--bg-secondary);
    box-shadow: 0 0 6px -1px var(--bg-primary);
    padding: 10px 0px;
    z-index: 1000;
    min-width: 100px;
    cursor: pointer;
    user-select: none;
    top: 0;
  }

  [data-theme='dark'] .dropdown-submenu-container {
    box-shadow: 0 0 4px 2px var(--bg-primary);
  }

  .icon-color {
    color: var(--text-tertiary);
  }

  .routeName {
    gap: 20px;
  }
</style>
