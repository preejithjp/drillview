<template>
  <div class="full-size p10 fontNormal">
    <LoadingIcon v-if="loading" />
    <div class="p10 managedashboard full-size">
      <div class="heading-row d-flex justify-space-between align-center p10 fontSize-20">
        <div class="d-flex gap10 align-center">
          <SvgIcon name="circle-plus-icon" class="svg-icon size30 settings" />
          <span class="heading fontBold">Manage Dashboard</span>
        </div>
        <CustomButton class="fontBold" :size="BtnSizes.SMALL" @click="createNewDashboard">New</CustomButton>
      </div>
      <div class="scroll-y-auto scroll primary scrolltable flex-full managetable">
        <table class="common-table primary">
          <thead class="fontBold fontSize-14">
            <tr>
              <th class="text-center">Icon</th>
              <th>Dashboard Name</th>
              <th>Created By</th>
              <th>Created On</th>
              <th>Last Edited By</th>
              <th>Last Edited On</th>
              <th class="text-center">Status</th>
              <th class="text-center">Edit</th>
              <th class="text-center">Clone</th>
              <th class="text-center">Delete</th>
            </tr>
          </thead>
          <VueDraggable v-model="dashboardDetails" tag="tbody" class="draggable fontSize-13 fontNormal" :animation="150" @end="onDragEnd">
            <tr
              v-for="item in dashboardDetails"
              :key="item.DashboardId.toString()"
              :class="{ 'disabled-row': item.StatusCode !== DashboardStatus.Enabled }">
              <td class="text-center">
                <img
                  v-if="item.Icon && !hasImageFailed(item.DashboardName)"
                  :src="item.Icon"
                  class="svg-icon size20"
                  @error="() => onImageError(item.DashboardName)" />
                <SvgIcon v-else :name="'default-icon'" class="svg-icon size20 icon-color" />
              </td>
              <td>{{ item.DashboardName }}</td>
              <td>{{ item.CreatedUser }}</td>
              <td v-dateTimeFormat="'mm/dd/yyyy hh:mi am'">{{ item.CreatedDate }}</td>
              <td>{{ item.ModifiedUser }}</td>
              <td v-dateTimeFormat="'mm/dd/yyyy hh:mi am'">{{ item.ModifiedDate }}</td>
              <td>
                <ToggleSwitch
                  v-model="item.StatusCode"
                  class="toggle-width"
                  :true-value="DashboardStatus.Enabled"
                  :false-value="DashboardStatus.Disabled"
                  @change="updateDashboardStatus(item)" />
              </td>
              <td>
                <SvgIcon name="edit-icon" class="dbmanage-icon svg-icon size20" @click="editDashboard(item)" />
              </td>
              <td>
                <SvgIcon name="clone-icon" class="dbmanage-icon svg-icon size20" @click="cloneDashboard(item)" />
              </td>
              <td>
                <SvgIcon name="delete-icon" class="dbmanage-icon svg-icon size20" @click="confirmDelete(item.DashboardId.toString())" />
              </td>
            </tr>
          </VueDraggable>
        </table>
      </div>
    </div>
    <ConfirmationPopup
      v-if="activePopup === PopupList.DeleteDashboard"
      :show="activePopup === PopupList.DeleteDashboard"
      @on-cancel="activePopup = PopupList.None"
      @on-submit="removeDashBoard" />
    <CreateDashboard
      v-if="dashBoardClick === DashBoardAction.CREATE || dashBoardClick === DashBoardAction.EDIT || dashBoardClick === DashBoardAction.CLONE"
      class="p-absolute"
      :dashboardData="selectedDashboard"
      :allDashboards="dashboardDetails"
      @cancel="closeEdit"
      @on-submit="closeEdit" />
  </div>
</template>

<script lang="ts">
  import { Api } from '@/services/api.services';
  import { IDashboard, IDashboardUser, DashboardStatus } from '../../server/interfaces/dashboard.interfaces';
  import { Component, defineComponent } from 'vue';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import { PopupList } from './AppHeader.vue';
  import CreateDashboard from '@/components/CreateDashboard.vue';
  import { VueDraggable } from 'vue-draggable-plus';
  import { store } from '@/main';
  import { DashBoardAction } from '@/interfaces/state.interfaces';
  import { BtnSizes } from './Globals/CustomButton.vue';
  export default defineComponent({
    name: 'ManageDashbaord',
    components: {
      ConfirmationPopup,
      CreateDashboard,
      VueDraggable: VueDraggable as Component,
    },
    data() {
      return {
        BtnSizes,
        DashBoardAction,
        DashboardStatus,
        PopupList,
        dashboardDetails: [] as IDashboardUser[],
        dashbordId: '' as string,
        loading: false,
        activePopup: PopupList.None as PopupList,
        selectedDashboard: {} as IDashboard,
        failedImages: {},
      };
    },
    computed: {
      dashBoardClick() {
        return store.dashboardAction;
      },
    },
    mounted() {
      this.getAllDashboard();
    },
    methods: {
      onImageError(name) {
        this.failedImages[name] = true;
      },
      hasImageFailed(name) {
        return this.failedImages[name];
      },
      createNewDashboard() {
        store.setDashboardAction(DashBoardAction.CREATE);
      },
      closeEdit() {
        store.setDashboardAction(DashBoardAction.NONE);
        this.getAllDashboard();
        this.selectedDashboard = {} as IDashboard;
      },
      async onDragEnd() {
        this.dashboardDetails.forEach((item, index) => {
          item.SortOrder = index;
        });
        const updates = this.dashboardDetails.map((item) => ({
          id: item.DashboardId,
          sortOrder: item.SortOrder,
          name: item.DashboardName,
        }));
        await Api.patch(`dashboard/sortedOrder`, { updates });
      },
      async editDashboard(item: IDashboardUser) {
        const layoutDetails: IDashboard[] = await Api.fetch('Dashboard/' + item.DashboardId);
        this.selectedDashboard = layoutDetails[0];
        store.setDashboardAction(DashBoardAction.EDIT);
      },
      async cloneDashboard(item: IDashboardUser) {
        const layoutDetails: IDashboard[] = await Api.fetch('Dashboard/' + item.DashboardId);
        this.selectedDashboard = layoutDetails[0];
        this.selectedDashboard.DashboardName = '';
        store.setDashboardAction(DashBoardAction.CLONE);
      },
      async updateDashboardStatus(item: IDashboardUser) {
        const newStatusCode = item.StatusCode === DashboardStatus.Enabled ? DashboardStatus.Enabled : DashboardStatus.Disabled;
        item.StatusCode = newStatusCode;
        await Api.patch(`dashboard/${item.DashboardId.toString()}`, { StatusCode: newStatusCode });
      },
      async getAllDashboard() {
        this.loading = true;
        this.dashboardDetails = (await Api.fetch('Dashboard')).sort(
          (a: { SortOrder: number }, b: { SortOrder: number }) => a.SortOrder - b.SortOrder
        );
        this.loading = false;
      },
      confirmDelete(dashboardId: string) {
        this.activePopup = PopupList.DeleteDashboard;
        this.dashbordId = dashboardId;
      },
      async removeDashBoard() {
        const response = await Api.delete('dashboard', this.dashbordId);
        const itemIndex = this.dashboardDetails.findIndex((el) => el.DashboardId === this.dashbordId);
        if (!response?.error && itemIndex !== -1) {
          this.dashboardDetails.splice(itemIndex, 1);
        }
        this.activePopup = PopupList.None;
      },
    },
  });
</script>

<style scoped>
  .managedashboard {
    border-radius: 8px 8px 8px 8px;
    background: var(--bg-quaternary);
    border: 1px solid var(--border-tertiary);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .heading-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-radius: 5px;
    color: var(--text-tertiary);
  }

  .disabled-row td {
    color: var(--status-inactive-color);
  }

  .disabled-row .dbmanage-icon {
    color: var(--icon-secondary);
  }

  .draggable tr:hover {
    background-color: var(--bg-secondary);
    transition: background-color 0.3s ease;
  }

  .draggable tr {
    transition: box-shadow 0.3s ease;
    cursor: grab;
  }

  .draggable tr:active {
    cursor: grabbing;
  }

  .draggable tr:hover {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }

  .managetable {
    color: var(--text-tertiary);
  }

  .dbmanage-icon {
    color: var(--icon-secondary);
    text-align: center;
    justify-content: center;
    border-radius: 2px;
  }

  th {
    padding: 10px;
    text-align: left;
    white-space: nowrap;
  }

  td {
    padding: 8px;
    text-align: left;
    border: 1px solid var(--border-tertiary);
    white-space: nowrap;
    overflow: auto;
  }

  td:nth-last-child(-n + 4) {
    text-align: center;
  }

  .toggle-width {
    width: 50px;
    height: 20px;
  }
</style>
