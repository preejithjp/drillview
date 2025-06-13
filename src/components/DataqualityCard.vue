<template>
  <div class="card-cointainer">
    <div v-for="item in cardDetail" :key="item.wellboreId" class="flex-col d-flex card" :class="StatusColor[item.status || 'DRILLING'] + 'color'">
      <div class="flex-row d-flex pb5">
        <SvgIcon
          :name="`${StatusColor[item.status || 'DRILLING']}icon`"
          class="svg-icon size30 mr4"
          :class="StatusColor[item.status || 'DRILLING'] + 'color'" />
        <div class="flex-full flex-col d-flex">
          <span class="fontBold fontSize-12" :class="StatusColor[item.status || 'DRILLING'] + 'color'">
            {{ item.wellboreName || 'No Wellbore Name' }}
            <span class="well-depth fontNormal">(1375.2 ft.)</span>
          </span>
          <div class="well-wellbore-details">
            <span class="details-title fontSize-10 mr4">Well</span>
            <span class="details-title fontSize-10">{{ item.wellName }}</span>
            <span class="details-title fontSize-10 mr4">| Rig</span>
            <span class="details-title fontSize-10">water</span>
          </div>
          <div class="well-wellbore-details">
            <span class="fontSize-12 fontBold status-color mt4">{{ item.status || 'DRILLING' }} |</span>
            <span class="details-title fontSize-10">Tripping In</span>
          </div>
          <div class="well-depth fontNormal fontSize-10 mt5 alert-red">Critical curves not receiving data - 3 No</div>
          <div class="well-depth fontNormal fontSize-10 mt5 alert-yellow">Curves with data frequency low - 10 No</div>
        </div>
        <input type="checkbox" class="card-checkbox" />
      </div>
      <div class="activity-icons">
        <SvgIcon name="trend-up" class="svg-icon size24 animate-icon" />
        <SvgIcon name="outofrange" class="svg-icon size24 active-normal-color alert-red" />
        <SvgIcon name="DataStreamStopped" class="svg-icon size24 active-normal-color" />
        <SvgIcon name="Out-of-range" class="svg-icon size24 active-normal-color" />
        <SvgIcon name="Compliances" class="svg-icon size24 active-normal-color alert-yellow" />
        <SvgIcon name="brain" class="svg-icon size24 active-normal-color" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { AlarmDetails, DashboardConfig, StatusColor } from '@/interfaces/summary.interfaces';
  import dashboardJson from '../assets/sample/dashboard.json';
  import { defineComponent } from 'vue';
  export default defineComponent({
    name: 'DataqualityCard',
    data() {
      return {
        StatusColor: StatusColor,
        dashboardConfig: {} as DashboardConfig,
        cardDetail: [] as AlarmDetails[],
      };
    },
    mounted() {
      this.cardDetail = dashboardJson.alarmCardDetails.splice(0, 5) as AlarmDetails[];
    },
  });
</script>
<style scoped>
  .card-cointainer {
    flex: 0 1 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    grid-gap: 10px;
    padding-right: 10px;
    grid-template-rows: max-content;
    overflow-y: auto;
  }

  .card {
    padding: 8px;
    border-radius: 10px;
    border: 1px solid;
    background: var(--alarm-bg-color);
    box-shadow: 4px 4px 12px 0px rgba(0, 0, 0, 0.1);
  }

  .animate-icon {
    color: var(--activity-normal);
    animation: filter-animation 1s infinite;
  }

  .alert-red {
    color: var(--alert-red) !important;
  }

  .alert-yellow {
    color: var(--alert-yellow) !important;
  }

  .well-depth {
    color: var(--text-tertiary);
  }

  .details-title {
    color: var(--status-color);
    padding-bottom: 3px;
  }

  .status-color {
    color: var(--status-color-type);
  }

  .card-checkbox {
    height: 14px;
    cursor: pointer;
  }

  .activity-icons {
    display: grid;
    margin-top: 10px;
    grid-template-columns: repeat(auto-fit, minmax(16px, 1fr));
    justify-items: center;
  }

  .active-normal-color {
    color: var(--activity-normal);
  }

  .right-arrow {
    color: var(--right-arrow-icon);
  }
</style>
