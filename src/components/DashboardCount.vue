<template>
  <div class="border-card">
    <div class="count-cointainer">
      <div class="flex-col d-flex">
        <span class="fontSemibold fontSize-28 col-1">52</span>
        <span class="uppercase uppercase fontSize-8">TOTAL WELLBORES</span>
      </div>
      <div class="flex-col d-flex">
        <span class="fontSemibold fontSize-28 col-2">30</span>
        <span class="uppercase fontSize-8">ACTIVE WELLBORES</span>
      </div>
      <div class="flex-col d-flex">
        <span class="fontSemibold fontSize-28 col-3">40</span>
        <span class="uppercase fontSize-8">TOTAL ALARMS</span>
      </div>
      <div class="flex-col d-flex">
        <span class="fontSemibold fontSize-28 col-4">26</span>
        <span class="uppercase fontSize-8">ACTIVE ALARM WELLBORES</span>
      </div>
    </div>
    <div class="activity-cointainer fontSize-12">
      <div class="flex-row d-flex align-items-center gap5">
        <SvgIcon name="trend" class="svg-icon size20 icon-color" />
        <span class="flex-full d-flex align-items-center icon-active-color">Trend</span>
        <span class="count-number fontSize-12 red">6</span>
      </div>
      <div class="flex-row d-flex align-items-center gap5">
        <SvgIcon name="Data Stream Stopped" class="svg-icon size20 icon-color" />
        <span class="flex-full d-flex align-items-center">Connectivity</span>
        <span class="count-number fontSize-12 gray">0</span>
      </div>
      <div class="flex-row d-flex align-items-center gap5">
        <SvgIcon name="Compliance" class="svg-icon size20 icon-color" />
        <span class="flex-full d-flex align-items-center icon-active-color">Compliance</span>
        <span class="count-number fontSize-12 red">4</span>
      </div>
      <div class="flex-row d-flex align-items-center gap5">
        <SvgIcon name="range" class="svg-icon size20 icon-color" />
        <span class="flex-full d-flex align-items-center icon-active-color">Range</span>
        <span class="count-number fontSize-12 yellow">12</span>
      </div>
      <div class="flex-row d-flex align-items-center gap5">
        <SvgIcon name="engineering" class="svg-icon size20 icon-color" />
        <span class="flex-full d-flex align-items-center">Engineering</span>
        <span class="count-number fontSize-12 red">10</span>
      </div>
      <div class="flex-row d-flex align-items-center gap5">
        <SvgIcon name="ai" class="svg-icon size20 icon-color" />
        <span class="flex-full d-flex align-items-center icon-active-color">AI</span>
        <span class="count-number fontSize-12 red">8</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  export default defineComponent({
    name: 'DashboardCount',
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

  .count-cointainer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    padding-bottom: 10px;
    border-bottom: 1px solid var(--number-color-active-wellbore);
  }

  .col-1 {
    color: var(--number-color-total-wellbore);
  }

  .col-2 {
    color: var(--number-color-active-wellbore);
  }

  .col-3 {
    color: var(--number-color-total-alarms);
  }

  .col-4 {
    color: var(--number-color-active-alarms);
  }

  .activity-cointainer {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    row-gap: 1px;
    overflow: hidden;
  }

  .activity-cointainer div {
    padding: 5px 7px;
    background-color: var(--bg-senary);
    box-shadow: 0px 1px 0 0px var(--summary-border-color);
  }

  .svg-icon.alert-red {
    background: var(--alert-red);
    border-radius: 50px;
  }

  .svg-icon.alert-yellow {
    border-radius: 50px;
    background: var(--alert-yellow);
  }

  .icon-active-color {
    color: var(--text-tertiary);
  }

  .count-number {
    border: 1px solid var(--well-depth);
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    place-content: center;
  }

  .count-number.red {
    border-color: var(--alert-red);
    color: var(--alert-red);
  }

  .count-number.gray {
    border-color: var(--activity-normal);
    color: var(--activity-normal);
  }

  .count-number.yellow {
    border-color: var(--alert-yellow);
    color: var(--alert-yellow);
  }

  .gap5 {
    gap: 5px;
  }

  .icon-color {
    color: var(--summary-menu-color);
  }

  @media only screen and (max-width: 1464px) {
    .count-cointainer {
      grid-template-columns: repeat('auto-fill', minmax(100px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .page-container {
      flex-direction: column;
    }

    .side-cointainer {
      width: 100%;
    }

    .count-cointainer {
      grid-template-columns: repeat('auto-fill', minmax(100px, 1fr));
    }

    .activity-cointainer {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }
  }

  @media (max-width: 510px) {
    .activity-cointainer {
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }
  }
</style>
