<template>
  <div class="rignavpanel-container">
    <template v-if="!isCollapsed">
      <div class="rignavpanel-header-wrapper">
        <SvgIcon name="circle-plus-icon" title="Add Scenario" class="svg-icon size30 settings" @click="onAddScenarioBtnClick" />
        <div class="flex-full p-relative">
          <SearchInput v-model="filterInput" placeholder="Search Scenario" class="search-box flex-full p-relative" />
        </div>
      </div>

      <div class="rignavpanel-body-wrapper scroll primary scroll-y-auto flex-full text-static-primary">
        <div
          v-for="(scenario, index) in filteredScenarioList"
          :key="scenario.ScenarioId?.toString()"
          class="chatnavpanel-item-wrapper menuitem-primary d-flex align-center"
          :class="{ active: selectedScenarioId === scenario.ScenarioId?.toString() }">
          <div class="chatnavpanel-item-main d-flex flex-full align-center gap10 text-ellipsis" @click="selectScenarioItem(scenario)">
            <span class="group-avatar-wrapper">
              <GroupAvatar :name="scenario.Name" :image="scenario.Image" :colorIndex="index" class="group-avatar" />
            </span>
            <div class="d-flex flex-col flex-full text-ellipsis">
              <span class="chatnavpanel-item-title text-tertiary text-ellipsis capitalize fontSemibold fontSize-13">
                {{ scenario.Name }}
              </span>
              <span class="chatnavpanel-item-title text-senary text-ellipsis fontMedium fontSize-10">
                {{ scenario.Description }}
              </span>
            </div>
          </div>

          <div class="chatnavpanel-item-actions d-flex gap10 align-items-center justify-content-end">
            <SvgIcon name="edit-icon" class="dbmanage-icon svg-icon size14" @click.stop="editScenario(scenario)" />
            <SvgIcon name="delete-icon" class="dbmanage-icon svg-icon size14" @click.stop="confirmDelete(scenario.ScenarioId.toString())" />
            <SvgIcon
              name="pin-icon"
              class="svg-icon size14 pin-icon"
              :class="{ pinned: scenario.Pin, 'show-icon': scenario.Pin }"
              @click.stop="onPinScenario(scenario)" />
          </div>
        </div>

        <div v-if="!filteredScenarioList.length" class="no-data-found fontSize-14">
          <span>No Scenarios Found</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IScenario } from '../../../server/interfaces/rigscheduler.interfaces';
  import GroupAvatar from '../Chat/GroupAvatar.vue';

  export default defineComponent({
    name: 'RigNavigationPanel',
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
      isCollapsed: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['on-item-select', 'on-create', 'on-pin', 'on-edit', 'on-delete'],
    data() {
      return {
        filterInput: '',
        selectedScenarioId: '',
      };
    },
    computed: {
      filteredScenarioList() {
        if (!this.filterInput || this.isCollapsed) return this.scenarioList;
        return this.scenarioList.filter((s) => s.Name?.toLowerCase().includes(this.filterInput.toLowerCase()));
      },
    },
    watch: {
      filteredScenarioList: {
        handler(newList) {
          if (newList.length && !this.selectedScenarioId) {
            const firstScenario = newList[0];
            this.selectedScenarioId = firstScenario.ScenarioId?.toString();
            this.$emit('on-item-select', firstScenario);
          }
        },
        immediate: true,
      },
      selectedItem: {
        handler(newVal) {
          if (newVal) {
            this.selectedScenarioId = newVal.ScenarioId;
          }
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      selectScenarioItem(item: IScenario) {
        this.selectedScenarioId = item.ScenarioId?.toString();
        this.$emit('on-item-select', item);
      },
      onAddScenarioBtnClick() {
        this.$emit('on-create');
      },
      onPinScenario(item: IScenario) {
        this.$emit('on-pin', item);
      },
      editScenario(item: IScenario) {
        this.$emit('on-edit', item);
      },
      confirmDelete(scenarioId: string) {
        this.$emit('on-delete', scenarioId);
      },
    },
  });
</script>

<style scoped>
  .rignavpanel-container {
    background: var(--bg-septenary);
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .rignavpanel-header-wrapper {
    display: flex;
    align-items: center;
    padding: 0 25px;
    gap: 10px;
    height: 50px;
  }

  .rignavpanel-body-wrapper {
    background: var(--bg-septenary);
    flex-grow: 1;
  }

  .chatnavpanel-item-wrapper {
    margin: 0px 2px 0px 0px;
    padding: 0 10px 0 15px;
    cursor: pointer;
    gap: 5px;
  }

  .chatnavpanel-item-main {
    padding: 10px 0;
  }

  .chatnavpanel-item-actions {
    flex-shrink: 0;
    flex-grow: 0;
    padding-top: 5px;
  }

  .chatnavpanel-item-actions .svg-icon {
    opacity: 0;
    transition:
      opacity 0.2s ease-in-out,
      color 0s ease-in-out,
      stroke 0.2s ease-in-out;
    color: inherit;
    stroke: inherit;
  }

  .chatnavpanel-item-wrapper:hover .chatnavpanel-item-actions .svg-icon {
    opacity: 1;
  }

  .chatnavpanel-item-actions .pin-icon.pinned {
    opacity: 1;
  }

  .group-avatar-wrapper {
    height: 28px;
    width: 28px;
    border-radius: 4px;
    overflow: hidden;
  }

  .no-data-found {
    text-align: center;
    padding: 10px;
    color: var(--text-tertiary);
  }
</style>
