<template>
  <div class="border-card menu-sep flex-full alarm-container">
    <div class="flex-row d-flex p10 menu-sep-line align-items-center">
      <SvgIcon name="icon-alarm" class="icon-alarm svg-icon size30 mr8" />
      <span class="flex-full page-title fontSize-16 fontSemibold">Alarms</span>
      <SvgIcon name="three-dot-icon" class="menu-color svg-icon size18" />
    </div>
    <div class="flex-full p-15 alarm-cointainer">
      <div v-for="item in alarmCard" :key="item.id" :class="['alarm-card', { warning: item.warning }]">
        <div>
          <div class="alarm-card-header align-items-center mb5">
            <SvgIcon :name="encodeURI(item.alarmStatus)" class="svg-icon size26 animate-icon" />
            <div class="flex-row d-flex pt5">
              <span class="well-status uppercase fontSize-12 alert-fill flex-full">{{ item.alarmStatus }}</span>
              <span v-dateTimeFormat="'yyyy-mm-dd HH:mi:ss'" class="alarm-details fontSize-12 ack-text">{{ new Date().getTime() }}</span>
            </div>
          </div>
          <div class="flex-full">
            <div class="flex-row d-flex mb5">
              <div class="flex-full pb5 alarm-basic-details">
                <div>
                  <span class="details-value fontSize-12 fontBold">{{ item.wellName }}</span>
                </div>
                <div class="well-wellbore-details">
                  <span class="ack-text fontSize-10 mr4">({{ item.wellDepth.toFixed(2) + ' ft.' }})</span>
                  <span class="details-title fontSize-10 mr4">Well</span>
                  <span class="ack-text fontSize-12">{{ item.wellName }}</span>
                </div>
                <div>
                  <span class="details-title fontSize-10 mr4">| Rig</span>
                  <span class="ack-text fontSize-12">{{ item.rigName }}</span>
                </div>
              </div>
              <div class="d-flex align-items-center gap5">
                <SvgIcon :name="`${StatusColor[item.wellStatus]}icon`" class="svg-icon size26" :class="StatusColor[item.wellStatus] + 'color'" />
                <span class="fontSize-14 alarm-details fontSize-12">{{ item.wellStatus }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="alarm-shade">
          <div class="flex-col d-flex">
            <span class="details-title fontSize-10">BDEPTH</span>
            <span class="details-value fontSize-12 fontBold">
              {{ item.bdepth.toFixed(2) }}
              <span class="details-unit fontSize-10">ft</span>
            </span>
          </div>
          <div class="flex-col d-flex">
            <span class="details-title fontSize-10">HDEPTH</span>
            <span class="details-value fontSize-12 fontBold">
              {{ item.hdepth.toFixed(2) }}
              <span class="details-unit fontSize-10">ft</span>
            </span>
          </div>
          <div class="flex-col d-flex">
            <span class="details-title fontSize-10">HOOKLOAD AVG</span>
            <span class="details-value fontSize-12 fontBold">
              {{ item.hookload.toFixed(2) }}
              <span class="details-unit fontSize-10">ft</span>
            </span>
          </div>
          <div class="flex-col d-flex">
            <span class="details-title fontSize-10">WOB AVG</span>
            <span class="details-value fontSize-12 fontBold">
              {{ item.wob.toFixed(2) }}
              <span class="details-unit fontSize-10">ft</span>
            </span>
          </div>
        </div>
        <p class="ack-text paragraph-content fontSize-12">
          Alarm activated when the flow rate of drilling fluid falls below or exceeds the desired range, indicating a possible loss of circulation...
        </p>
        <div class="d-flex align-items-center">
          <span class="ack-text fontSize-10 flex-full">Not acknowledged</span>
          <SvgIcon name="arrow-right" class="svg-icon size24 right-arrow-icon" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import dashboardJson from '../assets/sample/dashboard.json';
  import { CardDetails, StatusColor } from '@/interfaces/summary.interfaces';
  export default defineComponent({
    name: 'DashboardAlarm',
    data() {
      return {
        StatusColor: StatusColor,
        alarmCard: dashboardJson.cardDetails as CardDetails[],
      };
    },
  });
</script>

<style scoped>
  .border-card {
    border: 1px solid var(--summary-border-color);
    border-radius: 10px;
    padding: 15px;
    background-color: var(--bg-senary);
    box-shadow: 4px 4px 12px 0px rgba(0, 0, 0, 0.1);
  }

  .p-15 {
    padding: 15px;
  }

  .menu-sep {
    padding: 0;
  }

  .menu-sep-line {
    border-bottom: 1px solid var(--border-tertiary);
  }

  .alarm-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .icon-alarm {
    color: var(--alarm-icon-color);
  }

  .page-title {
    color: var(--summary-menu-color);
  }

  .alarm-cointainer {
    display: grid;
    gap: 10px;
    overflow-y: auto;
  }

  .alarm-card {
    border-radius: 4px;
    border: 1px solid var(--border-tertiary);
    padding: 10px;
  }

  .alarm-card-header {
    display: grid;
    grid-template-columns: 26px 1fr;
    gap: 5px;
  }

  .svg-icon.alert-red {
    background: var(--alert-red);
    border-radius: 50px;
  }

  .svg-icon.alert-yellow {
    border-radius: 50px;
    background: var(--alert-yellow);
  }

  .alert-fill {
    color: var(--alert-red) !important;
  }

  .well-status {
    color: var(--status-color);
  }

  .alarm-details {
    color: var(--text-tertiary);
  }

  .alarm-basic-details {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .details-value {
    color: var(--summary-menu-color);
  }

  .alert .details-value {
    color: var(--alert-red);
  }

  .details-unit {
    color: var(--text-tertiary);
    padding-left: 3px;
  }

  .details-title {
    color: var(--text-tertiary);
    padding-bottom: 3px;
  }

  .card-item-value {
    color: var(--activity-normal);
  }

  .alarm-shade {
    border-radius: 6px;
    border: 2px solid var(--summary-border-color);
    background: var(--bg-senary);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
    padding: 10px;
  }

  .ack-text {
    color: var(--text-senary);
  }

  .menu-color {
    color: var(--activity-normal);
  }

  .alarm-card.warning {
    border-color: var(--alert-yellow);
  }

  .alarm-card.error {
    border-color: var(--alert-red);
  }

  .active-normal-color {
    color: var(--activity-normal) !important;
  }

  .paragraph-content {
    margin: 6px 0;
  }

  .gap5 {
    gap: 5px;
  }

  .animate-icon {
    color: var(--activity-normal);
    animation: filter-animation 1s infinite;
  }

  .right-arrow-icon {
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
