<template>
  <div class="rig-container fontSize-16">
    <!-- Quick Access Panel-->
    <div class="quick-access flex-shrink-0">
      <div
        class="quickaccess-menu-item menuitem-secondary d-flex align-center justify-center"
        :class="{ active: activePage === Routes.ManageRig }"
        @click="navigateTo(Routes.ManageRig)">
        <SvgIcon name="resource-icon" class="svg-icon size20 teritiary" />
      </div>
      <div
        class="quickaccess-menu-item menuitem-secondary d-flex align-center justify-center"
        :class="{ active: activePage === Routes.ManageWell }"
        @click="navigateTo(Routes.ManageWell)">
        <SvgIcon name="wellbore-icon" class="svg-icon size20 teritiary" />
      </div>
    </div>

    <!-- Sidebar -->
    <transition name="sidebar-slide" mode="out-in">
      <div
        :key="showNavigationPanel ? 'expanded' : 'collapsed'"
        :class="showNavigationPanel ? 'sidebar flex-shrink-0' : 'sidebar-collapsed flex-shrink-0'">
        <div v-if="!showNavigationPanel" class="nav-content d-flex align-center justify-center"></div>
        <div v-else class="nav-content p10">
          <div
            class="nav-item text-tertiary fontSemibold clickable"
            :class="{ active: activePage === Routes.ManageRig }"
            @click="navigateTo(Routes.ManageRig)">
            <SvgIcon name="resource-icon" class="svg-icon size16" />
            <span class="ml10">Manage Rig</span>
          </div>
          <div
            class="nav-item text-tertiary fontSemibold clickable"
            :class="{ active: activePage === Routes.ManageWell }"
            @click="navigateTo(Routes.ManageWell)">
            <SvgIcon name="wellbore-icon" class="svg-icon size16" />
            <span class="ml10">Manage Well</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main Content Area -->
    <div class="flex-full">
      <ManageRig v-if="activePage === Routes.ManageRig" />
      <ManageWell v-else-if="activePage === Routes.ManageWell" />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Routes } from '@/router';
  import SvgIcon from '@/components/Globals/SvgIcon.vue';
  import ManageRig from '@/components/Rig/ManageRig.vue';
  import ManageWell from '@/components/Rig/ManageWell.vue';
  import { store } from '@/main';

  export default defineComponent({
    name: 'RigSettingsPage',
    components: {
      SvgIcon,
      ManageRig,
      ManageWell,
    },
    data() {
      return {
        showNavigationPanel: true,
        Routes,
      };
    },
    computed: {
      activePage(): Routes {
        return this.$route.name as Routes;
      },
    },
    mounted() {
      store.eventEmitter.on('header-expand-btn-click', () => {
        this.showNavigationPanel = !this.showNavigationPanel;
      });
    },
    methods: {
      navigateTo(page: Routes.ManageRig | Routes.ManageWell) {
        this.$router.push({ name: page });
      },
    },
  });
</script>

<style scoped>
  .rig-container {
    display: flex;
    height: 100%;
    border-bottom: 1px solid var(--border-primary);
    overflow: auto;
  }

  .quick-access {
    width: 45px;
    min-width: 35px;
    background: linear-gradient(to bottom, var(--gradient-primary), var(--gradient-secondary));
    flex-direction: column;
    position: relative;
    height: 100%;
    padding: 0px 0px 12px 0px;
    z-index: 2;
  }

  .quickaccess-menu-item {
    cursor: pointer;
    padding: 10px 5px;
    transition: background-color 0.2s ease;
  }

  .sidebar {
    width: 20%;
    min-width: 200px;
    background-color: var(--bg-quaternary);
    transition: all 0.3s ease;
  }

  .sidebar-collapsed {
    width: 0;
    min-width: 0;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .nav-content {
    background-color: var(--bg-septenary);
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: 100%;
  }

  .nav-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 4px;
    font-size: 14px;
    color: var(--text-tertiary);
    transition: background-color 0.2s ease;
  }

  .nav-item:hover {
    background-color: var(--hover-secondary);
  }

  .nav-item.active {
    background-color: var(--hover-secondary);
    font-weight: 600;
  }

  .ml10 {
    margin-left: 10px;
  }

  .clickable {
    cursor: pointer;
  }

  .sidebar-slide-enter-active,
  .sidebar-slide-leave-active {
    transition: all 0.4s ease;
    opacity: 1;
  }

  .sidebar-slide-enter-from,
  .sidebar-slide-leave-to {
    opacity: 0;
    transform: translateX(-10px);
  }

  .sidebar-slide-enter-to,
  .sidebar-slide-leave-from {
    opacity: 1;
    transform: translateX(0);
  }
</style>
