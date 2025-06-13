<template>
  <div class="rig-manager-container">
    <!-- 1) Quick-Access Panel on the far left -->
    <div class="quick-access flex-shrink-0">
      <ScenarioQuickAccessPanel :scenarioList="scenarioList" :selectedItem="selectedScenario" @on-item-select="onItemSelect" />
    </div>

    <!-- 2) Sidebar Panel (expanded/collapsed) -->
    <transition name="sidebar-slide" mode="out-in">
      <div
        :key="showNavigationPanel ? 'expanded' : 'collapsed'"
        :class="showNavigationPanel ? 'sidebar flex-shrink-0' : 'sidebar-collapsed flex-shrink-0'">
        <RigNavigationPanel
          :scenarioList="scenarioList"
          :selectedItem="selectedScenario"
          :isCollapsed="!showNavigationPanel"
          @on-change="onScenarioListChange"
          @on-item-select="onItemSelect"
          @on-create="openCreateScenarioPopup"
          @on-edit="openEditScenarioPopup"
          @on-delete="confirmDeleteScenario"
          @on-pin="pinScenario" />
      </div>
    </transition>

    <!-- 3) Scenario Details / Scheduler Chart (center) -->
    <transition name="nav-slider">
      <div v-if="selectedScenario" class="scenario-details-wrapper flex-full">
        <ScenarioDetails :scenario="selectedScenario" />
      </div>
    </transition>

    <!-- 4) Well List Panel on the far right -->
    <transition name="sidebar-slide" mode="out-in">
      <!-- when showWellList is true, render the full panel; otherwise render icon-only collapsed -->
      <div
        :key="showWellList ? 'wExpanded' : 'wCollapsed'"
        :class="showWellList ? 'well-list-wrapper flex-shrink-0' : 'well-list-collapsed flex-shrink-0'">
        <!-- Header with title + expand/collapse button -->
        <div class="well-list-header-with-toggle">
          <span v-if="showWellList" class="well-list-title">All Wells</span>
          <!-- Always show this SvgIcon; clicking toggles collapse/expand -->
          <SvgIcon name="menu-icon-04" class="svg-icon size16 tertiary well-toggle-btn" @click="onWellToggleClick" />
        </div>

        <!-- Only render full <WellListPanel> if expanded -->
        <WellListPanel v-if="showWellList" />
      </div>
    </transition>

    <!-- router-view and popups remain unchanged -->
    <router-view />

    <CreateScenario
      v-if="showCreateScenarioPopup"
      :scenario="scenarioToEdit"
      :is-edit-mode="isEditMode"
      @cancel="resetScenarioPopup"
      @on-submit="handleScenarioCreated" />

    <ConfirmationPopup v-if="showDeletePopup" :show="showDeletePopup" @on-cancel="cancelDelete" @on-submit="removeScenario" />
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import RigNavigationPanel from '../components/Rig/RigNavigationPanel.vue';
  import ScenarioDetails from '../components/Rig/ScenarioDetails.vue';
  import CreateScenario from '@/components/Rig/CreateScenario.vue';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import ScenarioQuickAccessPanel from '../components/Rig/ScenarioQuickAccessPanel.vue';
  import WellListPanel from '../components/Rig/WellListPanel.vue';
  import type { IScenario } from '../../server/interfaces/rigscheduler.interfaces';
  import { Api } from '@/services/api.services';
  import { store } from '@/main';

  export default defineComponent({
    name: 'RigManagerPage',
    components: {
      RigNavigationPanel,
      ScenarioDetails,
      CreateScenario,
      ConfirmationPopup,
      ScenarioQuickAccessPanel,
      WellListPanel,
    },
    data() {
      return {
        scenarioList: [] as IScenario[],
        selectedScenario: {} as IScenario,
        showCreateScenarioPopup: false,
        isEditMode: false,
        scenarioToEdit: null as IScenario | null,
        showDeletePopup: false,
        scenarioToDeleteId: '',

        showNavigationPanel: true,
        // ↓↓↓ New: well-list expand/collapse flag ↓↓↓
        showWellList: true,
      };
    },
    mounted() {
      this.fetchAllScenarios();
      store.eventEmitter.on('header-expand-btn-click', () => {
        this.showNavigationPanel = !this.showNavigationPanel;
      });
    },
    methods: {
      /* Fetch & sort all scenarios */
      async fetchAllScenarios() {
        const response = await Api.fetch('scenarios');
        if (response && Array.isArray(response)) {
          this.scenarioList = (response as IScenario[])
            .map((item) => ({
              ...item,
              ScenarioId: typeof item.ScenarioId === 'object' ? item.ScenarioId.toString() : item.ScenarioId,
            }))
            .sort((a, b) => {
              // pinned first, then by name
              const pinA = a.Pin ? 1 : 0;
              const pinB = b.Pin ? 1 : 0;
              if (pinB !== pinA) return pinB - pinA;
              return a.Name?.localeCompare(b.Name || '') || 0;
            });

          if (this.scenarioList.length > 0) {
            this.selectedScenario = this.scenarioList[0];
          }
        }
      },

      /* When user picks a scenario from the Quick-Access or Sidebar */
      async onItemSelect(item: IScenario) {
        const scenarioDetail = await Api.fetch('scenarios', [item.ScenarioId.toString()]);
        if (scenarioDetail) {
          scenarioDetail.ScenarioId = scenarioDetail.ScenarioId.toString();
          this.selectedScenario = scenarioDetail as IScenario;
        }
      },

      onScenarioListChange(updatedList: IScenario[]) {
        this.scenarioList = updatedList;
      },

      openCreateScenarioPopup() {
        this.isEditMode = false;
        this.scenarioToEdit = null;
        this.showCreateScenarioPopup = true;
      },

      openEditScenarioPopup(scenario: IScenario) {
        this.scenarioToEdit = { ...scenario };
        this.isEditMode = true;
        this.showCreateScenarioPopup = true;
      },

      confirmDeleteScenario(scenarioId: string) {
        this.scenarioToDeleteId = scenarioId;
        this.showDeletePopup = true;
      },

      cancelDelete() {
        this.showDeletePopup = false;
        this.scenarioToDeleteId = '';
      },

      async removeScenario() {
        if (!this.scenarioToDeleteId) return;
        await Api.delete('scenarios', this.scenarioToDeleteId);
        this.showDeletePopup = false;
        this.scenarioToDeleteId = '';
        this.fetchAllScenarios();
      },

      handleScenarioCreated() {
        this.showCreateScenarioPopup = false;
        this.fetchAllScenarios();
      },

      resetScenarioPopup() {
        this.scenarioToEdit = null;
        this.isEditMode = false;
        this.showCreateScenarioPopup = false;
      },

      async pinScenario(scenario: IScenario) {
        const updatedPin = !scenario.Pin;
        const response = await Api.patch(`scenarios/pin/${scenario.ScenarioId}`, {
          Pin: updatedPin,
        });
        if (!response?.error) {
          scenario.Pin = updatedPin;
          this.fetchAllScenarios();
        }
      },

      /* ↓↓↓ New: toggle the well‐list panel ↓↓↓ */
      onWellToggleClick() {
        this.showWellList = !this.showWellList;
      },
    },
  });
</script>

<style scoped>
  .rig-manager-container {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  /* QUICK-ACCESS on left: 45px wide when collapsed */
  .quick-access {
    width: 45px;
    min-width: 45px;
  }

  /* SIDEBAR state */
  .sidebar {
    width: 20%;
    min-width: 200px;
  }
  .sidebar-collapsed {
    width: 45px;
    min-width: 45px;
  }

  /* MAIN content area (ScenarioDetails + scheduler) */
  .scenario-details-wrapper {
    flex: 1;
    overflow: hidden;
  }

  /* WELL-LIST PANEL: expanded (200px) vs. collapsed (45px) */
  .well-list-wrapper {
    width: 200px;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #ccc;
  }
  .well-list-collapsed {
    width: 45px;
    min-width: 45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-left: 1px solid #ccc;
  }

  /* The header bar inside the well-list (title + toggle icon) */
  .well-list-header-with-toggle {
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f0f0f0;
    border-bottom: 1px solid #bbb;
    padding: 0 8px;
    box-sizing: border-box;
  }
  /* Only show the title text if expanded */
  .well-list-title {
    font-weight: bold;
    font-size: 14px;
    white-space: nowrap;
  }
  /* Always show the toggle icon */
  .well-toggle-btn {
    cursor: pointer;
    flex-shrink: 0;
  }

  /* TRANSITIONS (reuse same as sidebar) */
  .sidebar-slide-enter-active,
  .sidebar-slide-leave-active {
    transition: all 0.4s ease;
    opacity: 1;
  }
  .sidebar-slide-enter-from,
  .sidebar-slide-leave-to {
    opacity: 0;
    transform: translateX(10px);
  }
  .sidebar-slide-enter-to,
  .sidebar-slide-leave-from {
    opacity: 1;
    transform: translateX(0);
  }

  .nav-slider-enter-active,
  .nav-slider-leave-active {
    transition: all 0.5s ease;
  }
  .nav-slider-enter-from,
  .nav-slider-leave-to {
    opacity: 0;
    transform: translateX(-100%);
  }
  .nav-slider-enter-to,
  .nav-slider-leave-from {
    opacity: 1;
    transform: translateX(0%);
  }
</style>
