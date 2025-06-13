<template>
  <div class="card-cointainer">
    <div v-for="item in filteredCard" :key="item.wellboreId" class="flex-col d-flex card" :class="StatusColor[item.status] + 'color'">
      <div class="flex-row d-flex pb5">
        <SvgIcon :name="`${StatusColor[item.status]}icon`" class="svg-icon size30 mr4" :class="StatusColor[item.status] + 'color'" />
        <div class="flex-full flex-col d-flex">
          <span class="fontBold fontSize-12" :class="StatusColor[item.status] + 'color'">
            {{ item.wellboreName || 'No Wellbore Name' }}
            <span class="well-depth fontNormal">(1375.2 ft.)</span>
          </span>
          <div class="well-wellbore-details">
            <span class="details-title fontSize-10 mr4">Well</span>
            <span class="details-title fontSize-10">{{ item.wellName }}</span>
            <span class="details-title fontSize-10 mr4">| Rig</span>
            <span class="details-title fontSize-10">water</span>
          </div>
          <span class="fontSize-12 fontBold status-color mt4">{{ item.status }}</span>
        </div>
        <SvgIcon name="arrow-right" class="svg-icon size16 right-arrow" />
      </div>
      <div>
        <span class="card-item-title pr5 fontSize-10">Well/Rig</span>
        <span class="fontSize-10 fontBold" :class="StatusColor[item.status] + 'color'">{{ item.wellName || 'No Well Name' }}</span>
        <span class="card-item-sep">/</span>
        <span class="fontSize-10 fontBold" :class="StatusColor[item.status] + 'color'">{{ item.rigName || 'No Rig Name' }}</span>
      </div>
      <div>
        <span class="card-item-title pr5 fontSize-10">Actual/Planned Days</span>
        <span class="fontSize-10 fontBold">{{ item.actualDays }}</span>
        <span class="fontSize-10 fontBold" :class="StatusColor[item.status] + 'color'">{{ item.plannedDays || '140/160' }}</span>
      </div>
      <div :class="['well-values fontSize-8', { alert: item.alert }]">
        <div v-for="(sensor, index) in dashboardConfig.detailSensors" :key="index" class="">
          <span class="details-title pr5">{{ sensor.title }}</span>
          <span class="fontSize-10 fontBold" :class="StatusColor[item.status] + 'color'">13.63</span>
          <span class="details-unit fontSize-10">ft.</span>
        </div>
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
  import { defineComponent } from 'vue';
  import dashboardJson from '../assets/sample/dashboard.json';
  import { AlarmDetails, DashboardConfig, StatusColor } from '@/interfaces/summary.interfaces';

  export default defineComponent({
    name: 'DashboardCard',
    data() {
      return {
        StatusColor: StatusColor,
        dashboardConfig: {} as DashboardConfig,
        cardDetail: [] as AlarmDetails[],
        searchValue: '' as string,
      };
    },
    computed: {
      filteredCard(): AlarmDetails[] {
        return this.cardDetail
          .filter((card: AlarmDetails) => {
            let match = true;
            if (this.searchValue) {
              match =
                (card.wellName ? card.wellName.toLowerCase().includes(this.searchValue.toLowerCase()) : false) ||
                (card.wellboreName ? card.wellboreName.toLowerCase().includes(this.searchValue.toLowerCase()) : false) ||
                card.rigName.toLowerCase().includes(this.searchValue.toLowerCase());
            }
            return match;
          })
          .sort((a: AlarmDetails, b: AlarmDetails) => {
            if (a.isActive && !b.isActive) {
              return -1;
            } else if (!a.isActive && b.isActive) {
              return 1;
            }
            if (a.wellboreName && b.wellboreName) {
              return a.wellboreName.localeCompare(b.wellboreName);
            } else {
              return -1;
            }
          });
      },
    },
    mounted() {
      this.dashboardConfig = dashboardJson.dashboardConfig;
      this.cardDetail = dashboardJson.alarmCardDetails as AlarmDetails[];
    },
  });
</script>

<style scoped>
  .card-cointainer {
    flex: 0 1 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
    grid-gap: 10px;
    padding-right: 10px;
    grid-template-rows: max-content;
    overflow-y: auto;
  }

  .card {
    padding: 8px;
    border-radius: 10px;
    border: 1px solid;
    background: var(--bg-senary);
    box-shadow: 4px 4px 12px 0px rgba(0, 0, 0, 0.1);
  }

  .animate-icon {
    color: var(--activity-normal);
    animation: filter-animation 1s infinite;
  }

  .svg-icon.alert-red {
    color: var(--alert-red) !important;
  }

  .svg-icon.alert-yellow {
    color: var(--alert-yellow) !important;
  }

  .well-depth {
    color: var(--text-tertiary);
  }

  .details-title {
    color: var(--text-tertiary);
    padding-bottom: 3px;
  }

  .status-color {
    color: var(--status-color-type);
  }

  .well-values {
    display: grid;
    grid-template-columns: auto auto;
    border: 2px solid var(--summary-border-color);
    padding: 10px;
    margin-top: 5px;
    border-radius: 4px;
    background: var(--bg-senary);
    gap: 5px 0;
  }

  .card-item-title {
    color: var(--text-tertiary);
  }

  .activity-icons {
    display: grid;
    margin-top: 10px;
    grid-template-columns: repeat(auto-fit, minmax(16px, 1fr));
    justify-items: center;
  }

  .details-unit {
    color: var(--text-tertiary);
  }

  .active-normal-color {
    color: var(--activity-normal);
  }

  .right-arrow {
    color: var(--summary-right-arrow-color);
  }

  @keyframes filter-animation {
    50% {
      color: var(--alert-red);
    }

    100% {
      color: var(--activity-normal);
    }
  }
</style>
