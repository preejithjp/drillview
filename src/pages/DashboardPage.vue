<template>
  <div class="card-layout d-flex flex-col p-relative">
    <input ref="attachFile" type="file" class="d-hidden" accept=".json" @change="importDashboard" />
    <div class="widget-conatiner d-flex flex-full gap10 p-relative">
      <div v-if="showSidemenu">
        <ToolbarActionsPanel :visible="isTopbarVisible" @add-widget="handleAddWidget" @closesidebar="closesidebar" />
      </div>
      <div ref="widgets" class="widgets flex-full scroll primary scroll-auto" @click="selectedWidget = layoutData.DashboardId as string">
        <LayoutComponent
          v-if="layoutData?.DashboardId"
          :dashboardData="layoutData"
          :selectedData="selectedWidget"
          :columnNumber="columnNumber"
          :addWidgetCall="addWidgetCall"
          :rowHeight="rowHeight"
          :layoutId="layoutData.DashboardId.toString()"
          :widgetType="widgetType"
          :activeWellbore="selectedWellbore"
          @select-widget="slectedWidgetHandler"
          @component-destroyed="handleComponentDestroyed"
          @open-widget-settings-page="openWidgetPropertyPage"
          @close-setting="isSettingClick = false"
          @save-dashboard="saveDashboard" />
      </div>
      <WidgetProperties
        v-if="showSettings"
        :widgetType="widgetType"
        :widgetSettingsDetail="widgetSettingsDetails"
        class="p-absolute widget-properties"
        :selectedWellboreUri="selectedWellboreUri"
        @close="closeWidgetSettings"
        @update-settings-change="updatesWidgetSettings" />
    </div>
    <ToolBar v-if="isEditing && !showSidemenu" :visible="isTopbarVisible" @add-widget="handleAddWidget" @more-option="openSideMenu"></ToolBar>

    <ConfirmationPopup
      v-if="showDeleteConfirmation"
      :show="showDeleteConfirmation"
      message="Are you sure you want to proceed without saving your changes?"
      secondaryBtnText="Cancel"
      primaryBtnText="Ok"
      @on-cancel="cancelEditDashboard"
      @on-submit="okEditClose"></ConfirmationPopup>

    <CreateDashboard
      v-if="
        dashBoardClick === DashBoardAction.CREATE ||
        dashBoardClick === DashBoardAction.SAVEAS ||
        dashBoardClick === DashBoardAction.CLONE ||
        dashBoardClick === DashBoardAction.IMPORT
      "
      class="p-absolute"
      :dashboardData="layoutData"
      @cancel="closeCloneDashboard"
      @on-submit="submitDashboard" />
    <LoadingIcon v-if="loading" />
    <SelectWellbore
      v-if="activePopup === true"
      :selectedWellboreUri="selectedWellboreUri"
      @close-popup="
        activePopup = false;
        storeInstance.setDashboardAction(DashBoardAction.NONE);
      "
      @wellbore-selection="handleSelectWellbore" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Routes } from '@/router';
  import LayoutComponent from '@/components/LayoutComponent.vue';
  import { WidgetType } from '../interfaces/dashboard.interfaces';
  import { IDashboard, ILayout, IWidget } from '../../server/interfaces/dashboard.interfaces';
  import { Api } from '@/services/api.services';
  import { ToastType } from '@/components/ToastMessage.vue';
  import { store } from '@/main';
  import ToolBar from '@/components/ToolbarWidget.vue';
  import ToolbarActionsPanel from '@/components/ToolbarActionsPanel.vue';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import { DashBoardAction } from '@/interfaces/state.interfaces';
  import SelectWellbore from '../components/SelectWellbore.vue';
  import { WellboreObject } from '../interfaces/dashboard.interfaces';
  import WidgetProperties from '@/components/WidgetProperties.vue';
  import { DashboardSettings } from 'server/helpers/settings.helper';
  import CreateDashboard from '@/components/CreateDashboard.vue';

  export interface SaveDashboard {
    i: string;
    data: IDashboard | ILayout;
  }

  export default defineComponent({
    name: 'DashboardPage',
    components: {
      LayoutComponent,
      ToolBar,
      ToolbarActionsPanel,
      ConfirmationPopup,
      SelectWellbore,
      WidgetProperties,
      CreateDashboard,
    },
    data() {
      return {
        selectedWidget: '' as string,
        layoutData: {} as IDashboard,
        widgetType: undefined as WidgetType | undefined,
        columnNumber: 24 as number,
        rowHeight: 28 as number,
        addWidgetCall: false as boolean,
        WidgetType: WidgetType,
        deletedIds: [] as string[],
        isTopbarVisible: false as boolean,
        showSidemenu: false as boolean,
        showDeleteConfirmation: false as boolean,
        previouseDetails: {} as IDashboard,
        loading: false,
        activePopup: false as boolean,
        selectedWellboreUri: '' as string,
        selectedWellbore: '' as string,
        showSettings: false as boolean,
        widgetSettingsDetails: undefined as DashboardSettings | undefined,
        DashBoardAction,
        selectedSettingId: '' as string,
        isSettingClick: true as boolean,
        dashboardData: {} as IDashboard,
      };
    },
    computed: {
      dashBoardClick() {
        return store.dashboardAction;
      },
      isEditing(): boolean {
        return this.dashBoardClick === DashBoardAction.EDIT;
      },
      storeInstance() {
        return store;
      },
    },
    watch: {
      dashBoardClick(newEvent) {
        switch (newEvent) {
          case DashBoardAction.EDIT:
            this.saveOrEdit();
            this.saveDashboardData();
            break;

          case DashBoardAction.SAVE:
            this.saveOrEdit();
            this.saveDashboardData();
            this.showSidemenu = false;
            break;

          case DashBoardAction.CLOSE:
            this.showSidemenu = false;
            if (JSON.stringify(this.previouseDetails) !== JSON.stringify(this.layoutData).replace(/,"moved":false/g, '')) {
              this.showDeleteConfirmation = true;
            } else {
              store.setDashboardAction(DashBoardAction.NONE);
            }
            break;
          case DashBoardAction.CLONE:
            this.layoutData = { ...this.layoutData, DashboardName: '' };
            this.showSidemenu = false;
            break;
          case DashBoardAction.SAVEAS:
            this.layoutData = { ...this.layoutData, DashboardName: '' };
            this.showSidemenu = false;
            break;
          case DashBoardAction.CREATE:
            this.layoutData = {} as IDashboard;
            break;
          case DashBoardAction.EXPORT:
            this.exportDashboard();
            break;
          case DashBoardAction.FILESELECTION:
            if (this.layoutData) {
              const fileInput = this.$refs.attachFile as HTMLInputElement;
              if (fileInput) fileInput.click();
            }
            break;
          case DashBoardAction.IMPORT:
            break;
          case DashBoardAction.WELLBORE_SELECTION:
            this.showWellborePopup();
            break;
          case DashBoardAction.NONE:
            break;
          default:
            console.warn('Unhandled dashboard action:', newEvent);
            break;
        }
      },
      async $route() {
        this.layoutData['DashboardId'] = '';
        await this.getDashboard();
        this.calculateRowHeight();
        this.getWellboreDetails();
        window.addEventListener('resize', this.calculateRowHeight);
      },
    },
    async mounted() {
      await this.getDashboard();
      this.calculateRowHeight();
      this.getWellboreDetails();
      window.addEventListener('resize', this.calculateRowHeight);
    },
    methods: {
      async saveDashboardData() {
        this.dashboardData.DeleteId = this.deletedIds || [];
        await Api.patch('dashboard/' + (this.dashboardData as IDashboard).DashboardId, this.dashboardData);
      },
      saveDashboard(obj: SaveDashboard): void {
        // Handle as IDashboard
        if ('DashboardId' in obj.data && obj.data.DashboardId) {
          this.dashboardData = obj.data;
          return;
        }
        // Handle as ILayout
        const layout = obj.data as ILayout;
        if (!layout?.LayoutId) return;

        if (!this.dashboardData.LayoutData) {
          this.dashboardData.LayoutData = [];
        }
        const idx = this.dashboardData.LayoutData.findIndex((e) => e.LayoutId === layout.LayoutId);

        if (idx === -1) {
          this.dashboardData.LayoutData.push(layout);
        } else {
          this.dashboardData.LayoutData[idx] = {
            ...this.dashboardData.LayoutData[idx],
            Layout: layout.Layout,
          };
        }
      },
      async importDashboard(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) return;
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string) as IDashboard;
            this.layoutData = jsonData;
            store.setDashboardAction(DashBoardAction.IMPORT);
          } catch (error) {
            store.showToast(ToastType.ERROR, 'Invalid JSON file.');
            console.error('Import Error:', error);
          } finally {
            target.value = '';
          }
        };
        reader.readAsText(file);
      },
      exportDashboard() {
        const exportData = JSON.parse(JSON.stringify(this.layoutData));
        // remove all layout/setting IDs
        if (Array.isArray(exportData.Layout)) {
          exportData.Layout.forEach((widget: IWidget) => {
            delete widget.LayoutId;
            delete widget.Settings;
            if (widget.SettingsDetails) {
              delete widget.SettingsDetails.SettingId;
            }
          });
        }
        // Remove  unwante fields
        delete exportData.DashboardId;
        delete exportData.CreatedDate;
        delete exportData.CreatedUser;
        delete exportData.ModifiedDate;
        delete exportData.ModifiedUser;
        delete exportData.SourceId;
        delete exportData.StatusCode;
        delete exportData.Icon;
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportData.DashboardName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        store.showToast(ToastType.SUCCESS, 'Dashboard exported successfully!');
      },
      closeCloneDashboard() {
        store.setDashboardAction(DashBoardAction.NONE);
        this.getDashboard();
        this.calculateRowHeight();
      },
      submitDashboard(dashboardID: string) {
        this.$router.push({ name: Routes.Dashboard, params: { dashboardid: dashboardID }, force: true });
        store.setDashboardAction(DashBoardAction.NONE);
      },
      updatesWidgetSettings(data: DashboardSettings) {
        if (!this.layoutData?.Layout) return;
        const widget = this.layoutData.Layout.find((w) => w.SettingsDetails?.SettingId === data.SettingId);
        if (widget) {
          widget.SettingsDetails = data;
        }
      },
      closeWidgetSettings() {
        this.isSettingClick = true;
        this.showSettings = false;
      },
      cancelEditDashboard() {
        this.isTopbarVisible = false;
        this.showDeleteConfirmation = false;
        store.setDashboardAction(DashBoardAction.EDIT);
      },
      okEditClose() {
        this.showDeleteConfirmation = false;
        this.layoutData['DashboardId'] = '';
        this.getDashboard();
        this.calculateRowHeight();
      },
      openSideMenu() {
        this.showSidemenu = true;
        this.isTopbarVisible = !this.isTopbarVisible;
      },
      closesidebar() {
        this.showSidemenu = false;
      },
      slectedWidgetHandler(item: string) {
        this.selectedWidget = item;
      },
      handleComponentDestroyed(id: string) {
        this.deletedIds.push(id);
      },
      saveOrEdit() {
        if (!this.isEditing) {
          this.widgetType = undefined;
          this.addWidgetCall = !this.addWidgetCall;
        }
      },
      handleAddWidget(type: WidgetType) {
        this.widgetType = type;
        this.addWidgetCall = !this.addWidgetCall;
      },
      openWidgetPropertyPage(item: IWidget) {
        if (this.showSettings) {
          this.selectedSettingId = '';
          return;
        }
        if (!this.isSettingClick) {
          this.selectedSettingId = '';
          this.showSettings = false;
        }
        if (this.selectedSettingId === item.SettingsDetails?.SettingId) {
          this.showSettings = false;
          this.selectedSettingId = '';
        } else {
          this.showSettings = true;
          this.selectedSettingId = item.SettingsDetails?.SettingId || '';
          this.widgetType = item.Name as WidgetType;
          this.widgetSettingsDetails = item.SettingsDetails;
        }
      },
      addWidget(type: WidgetType) {
        this.widgetType = type;
        this.addWidgetCall = !this.addWidgetCall;
      },
      async getDashboard() {
        const id = this.$route?.params?.dashboardid || '';
        this.loading = true;
        const layoutDetails: IDashboard[] = await Api.fetch('Dashboard/' + id);
        this.loading = false;
        if (!id && layoutDetails && layoutDetails.length) {
          this.$router.push({ name: Routes.Dashboard, params: { dashboardid: layoutDetails[0].DashboardId as string }, force: true });
          return;
        }
        if (layoutDetails && layoutDetails.length) {
          this.layoutData = layoutDetails[0];
          this.previouseDetails = JSON.parse(JSON.stringify(this.layoutData));
          this.selectedWidget = this.layoutData.DashboardId as string;
        } else {
          store.showToast(ToastType.ERROR, `No Dashboard Found`);
        }
        store.setDashboardTitle(this.layoutData?.DashboardName || '');
      },
      calculateRowHeight() {
        const container: HTMLElement | unknown = this.$refs.widgets;
        if (container instanceof HTMLElement) {
          const totalHeight = container.clientHeight;
          this.rowHeight = totalHeight / 28;
        }
      },
      showWellborePopup() {
        this.activePopup = true;
      },
      async handleSelectWellbore(wellbore: WellboreObject) {
        this.selectedWellboreUri = wellbore.wellboreuri;
        this.layoutData.SourceId = this.selectedWellboreUri;
        await Api.patch('dashboard/' + (this.layoutData as IDashboard).DashboardId, this.layoutData);
        store.setSelectedWellbore(`${wellbore.wellname} / ${wellbore.wellborename}`);
        this.selectedWellbore = wellbore.wellborename;
        store.setDashboardAction(DashBoardAction.NONE);
      },
      async getWellboreDetails() {
        this.selectedWellboreUri = '';
        store.setSelectedWellbore('Select Wellbore');
        this.selectedWellbore = '';
        if (this.layoutData?.SourceId) {
          this.selectedWellboreUri = this.layoutData.SourceId;
          const response = await Api.fetch(`wellbores/${encodeURIComponent(this.selectedWellboreUri)}`);
          if (response && response.name && response.parent?.name) {
            store.setSelectedWellbore(`${response.parent?.name} / ${response.name}`);
            this.selectedWellbore = response.name;
          }
        }
      },
    },
  });
</script>
<style scoped>
  .widget-properties {
    top: 10px;
    bottom: 10px;
    right: 10px;
  }

  .widget-conatiner {
    overflow: auto;
  }

  .card-layout {
    overflow-x: scroll;
    padding: 10px;
    gap: 10px;
    background-color: var(--bg-quaternary);
  }

  .toolbar {
    width: 250px;
    background-color: var(--bg-secondary);
    height: 100%;
    flex-shrink: 0;
    border: 1px solid var(--border-primary);
    border-radius: 8px;
  }

  .widgets {
    background-color: var(--dashboard-bg);
    box-shadow: 4px 4px 12px 0px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .add-edit-button-container {
    gap: 5px;
    justify-content: end;
  }

  .add-edit-button-container button {
    background-color: var(--text-secondary);
    color: var(--text-primary);
  }

  .gap5 {
    gap: 5px;
  }
</style>
