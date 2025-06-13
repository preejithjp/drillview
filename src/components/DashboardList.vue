<template>
  <CommonPopup :popupTitle="'View Dashboard'" :footer="false" primaryBtnText="Save" secondaryBtnText="Close" @on-cancel="onCancel">
    <div class="dashboard-list d-grid align-items-center width-100 gap5">
      <div v-for="(item, index) in enabledDashboards" :key="index" :title="item.DashboardName" class="icon" @click="navigatetoDashboardPage(item)">
        <img
          v-if="item.Icon && !hasImageFailed(item.DashboardName)"
          :src="item.Icon"
          class="icon size20 brighter"
          @error="() => onImageError(item.DashboardName)" />
        <SvgIcon v-else :name="item.icon || 'default-icon'" class="svg-icon size20 icon-color" />

        <span class="text-ellipsis">{{ item.DashboardName }}</span>
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { IDashboard, DashboardStatus } from '../../server/interfaces/dashboard.interfaces';
  import { Routes } from '@/router';

  export default defineComponent({
    name: 'DashboardList',
    components: { CommonPopup },
    props: {
      dashboardDetails: {
        type: Array as () => IDashboard[],
        required: true,
      },
    },
    emits: ['cancel'],
    data() {
      return {
        DashboardDetails: [] as IDashboard[],
        failedImages: {},
      };
    },
    computed: {
      enabledDashboards() {
        return this.dashboardDetails.filter((dashboard) => dashboard.StatusCode === DashboardStatus.Enabled);
      },
    },
    mounted() {},
    methods: {
      onImageError(name) {
        this.failedImages[name] = true;
      },
      hasImageFailed(name) {
        return this.failedImages[name];
      },
      onCancel() {
        this.$emit('cancel');
      },
      navigatetoDashboardPage(item: IDashboard) {
        this.$router.push({ name: Routes.Dashboard, params: { dashboardid: item.DashboardId as string }, force: true });
        this.onCancel();
      },
    },
  });
</script>

<style scoped>
  .dashboard-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    justify-content: center;
    padding: 10px;
  }

  .icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    color: var(--text-tertiary);
  }

  .icon:hover {
    transform: scale(1.1);
    background: var(--layout-bg);
  }

  .icon.active {
    background: var(--layout-bg);
  }

  .icon span {
    font-size: 12px;
    margin-top: 5px;
    max-width: 100%;
    display: block;
  }
</style>
