<template>
  <div class="homePage page-container fontNormal line-height1">
    <div class="side-cointainer flex-col d-flex">
      <DashboardCount></DashboardCount>
      <DashboardAlarm></DashboardAlarm>
    </div>
    <div class="flex-full flex-col d-flex">
      <DashboardCard></DashboardCard>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import DashboardCount from '../components/DashboardCount.vue';
  import DashboardAlarm from '../components/DashboardAlarm.vue';
  import DashboardCard from '@/components/DashboardCard.vue';

  export default defineComponent({
    name: 'SummaryPage',
    components: {
      DashboardCount,
      DashboardAlarm,
      DashboardCard,
    },
  });
</script>

<style scoped>
  .page-container {
    display: flex;
    min-height: 0;
    width: 100%;
    height: 100%;
    padding: 10px 0 10px 10px;
    background-color: var(--bg-quaternary);
    overflow-y: auto;
    gap: 17px;
  }

  .side-cointainer {
    width: 32%;
    min-width: 340px;
    gap: 10px;
  }

  .line-height1 {
    line-height: 1;
  }

  @media (max-width: 768px) {
    .page-container {
      flex-direction: column;
    }

    .side-cointainer {
      width: 100%;
    }

    .count-cointainer {
      grid-template-columns: repeat(2, minmax(100px, 1fr));
    }

    .activity-cointainer {
      grid-template-columns: repeat(3, minmax(130px, 1fr));
    }
  }
</style>
