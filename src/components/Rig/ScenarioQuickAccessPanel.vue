<template>
  <div class="scenarioquickaccess-container d-flex text-static-primary">
    <div class="quickaccess-body d-flex flex-full">
      <div
        v-for="(scenario, index) in scenarioList"
        :key="String(scenario.ScenarioId)"
        class="quickaccess-menu-item menuitem-secondary d-flex align-center"
        :class="{ active: selectedScenarioId === scenario.ScenarioId }"
        @click="onScenarioClick(scenario)">
        <span>
          <GroupAvatar :name="scenario.Name" :image="scenario.Image" :colorIndex="index" class="group-avatar" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IScenario } from '../../../server/interfaces/rigscheduler.interfaces';
  import GroupAvatar from '../Chat/GroupAvatar.vue';

  export default defineComponent({
    name: 'ScenarioQuickAccessPanel',
    components: {
      GroupAvatar,
    },
    props: {
      scenarioList: {
        type: Array as PropType<IScenario[]>,
        required: true,
      },
      selectedItem: {
        type: Object as PropType<IScenario>,
        required: true,
      },
    },
    emits: ['on-item-select'],
    data() {
      return {
        selectedScenarioId: '',
      };
    },
    computed: {
      scenarioListSorted() {
        return this.scenarioList; // already sorted in parent
      },
    },
    watch: {
      selectedItem: {
        handler(newVal) {
          this.selectedScenarioId = newVal?.ScenarioId?.toString() ?? '';
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      onScenarioClick(scenario: IScenario) {
        this.selectedScenarioId = scenario.ScenarioId?.toString() ?? '';
        this.$emit('on-item-select', scenario);
      },
    },
  });
</script>

<style scoped>
  .scenarioquickaccess-container {
    width: 45px;
    min-width: 35px;
    background: linear-gradient(to bottom, var(--gradient-primary), var(--gradient-secondary));
    flex-direction: column;
    position: relative;
    height: 100%;
    padding: 0px 0px 12px 0px;
    z-index: 2;
  }

  [data-theme='dark'] .scenarioquickaccess-container {
    background: var(--bg-primary);
  }

  .quickaccess-body {
    flex-direction: column;
    overflow: hidden;
  }

  .quickaccess-menu-item {
    cursor: pointer;
    padding: 10px 5px;
    transition: background-color 0.2s ease;
  }

  .group-avatar {
    height: 28px;
    width: 28px;
  }

  .quickaccess-menu-item.active {
    /* background-color: var(--hover-primary); */
  }
</style>
