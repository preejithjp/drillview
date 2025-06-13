<template>
  <div class="chatquickaccesspanel-container d-flex text-static-primary">
    <div class="quickaccess-body d-flex flex-full">
      <div
        v-for="(item, index) in menuList"
        :key="String(item.id)"
        class="quickaccess-menu-item menuitem-secondary d-flex align-center"
        :class="{ active: selectItemId === item.id }"
        @click="onMenuItemClick(item)">
        <span>
          <GroupAvatar
            :name="(item.data?.ParentName as string) + '#$#' + item.data?.GroupName"
            :image="item.data?.GroupIcon"
            :colorIndex="index"
            :badge="getBadge(item)"
            class="group-avatar"></GroupAvatar>
        </span>
      </div>
    </div>
    <div class="quickaccess-footer d-flex align-center">
      <SvgIcon
        id="quickaccess-expandmenu-btn"
        v-outsideclick="onExpandPanelOutsideClick"
        name="menu-icon-03"
        class="quickaccess-expand-icon svg-icon size24"
        @click="onExpandMenuClick()" />
    </div>
    <transition name="quickaccess-expand-slider">
      <ChatQuickAccessExpandPanel
        v-if="showExpandMenuPanel"
        :menuList="menuList"
        :selectedItem="selectedMenuItem"
        @on-menu-item-select="selectMenuItem"></ChatQuickAccessExpandPanel>
    </transition>
  </div>
</template>

<script lang="ts">
  import { IMemberGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import { defineComponent, PropType } from 'vue';
  import ChatQuickAccessExpandPanel from './ChatQuickAccessExpandPanel.vue';
  import GroupAvatar, { BadgeOptions } from './GroupAvatar.vue';
  import { Routes } from '@/router';

  export interface QuickAccessMenu {
    id: string;
    label: string;
    icon: string;
    data?: IMemberGroupData;
  }

  export default defineComponent({
    name: 'ChatQuickAccessPanel',
    components: {
      ChatQuickAccessExpandPanel,
      GroupAvatar,
    },
    props: {
      menuList: {
        type: Object as PropType<QuickAccessMenu[]>,
        required: true,
      },
      selectedItem: {
        type: Object as PropType<IMemberGroupData>,
        required: true,
      },
    },
    emits: {
      onMenuItemSelect(item: IMemberGroupData) {
        return !!item;
      },
    },
    data() {
      return {
        selectItemId: '' as string,
        selectedMenuItem: {} as IMemberGroupData,
        showExpandMenuPanel: false as boolean,
        isMenuListLoaded: false as boolean,
      };
    },
    computed: {},
    watch: {
      menuList: {
        handler() {
          if (!this.selectedItem.ParentGroupId && this.menuList.length > 0 && !this.isMenuListLoaded) {
            this.isMenuListLoaded = true;
            this.selectMenuItem(this.menuList[0]);
          }
        },
        deep: true,
      },
      selectedItem: {
        handler() {
          this.selectItemId = this.selectedItem.ParentGroupId as string;
          this.selectedMenuItem = this.selectedItem;
        },
        deep: true,
      },
    },
    mounted() {},
    methods: {
      onMenuItemClick(item: QuickAccessMenu) {
        this.selectMenuItem(item);
        this.$router.push({ name: Routes.Chat });
      },
      selectMenuItem(item: QuickAccessMenu) {
        this.selectItemId = item.id;
        this.$emit('onMenuItemSelect', item.data);
      },
      onExpandMenuClick() {
        this.showExpandMenuPanel = !this.showExpandMenuPanel;
      },
      onExpandPanelOutsideClick(hide: boolean) {
        if (hide) {
          this.showExpandMenuPanel = false;
        }
      },
      getBadge(item: QuickAccessMenu) {
        if (!item.data || !item.data.UnreadMessageCount) return;
        if (item.data.UnreadMessageCount >= 100) {
          return { label: '99+' } as BadgeOptions;
        } else {
          return { label: item.data.UnreadMessageCount.toString() } as BadgeOptions;
        }
      },
    },
  });
</script>

<style scoped>
  .chatquickaccesspanel-container {
    width: 45px;
    min-width: 35px;
    background: linear-gradient(to bottom, var(--gradient-primary), var(--gradient-secondary));
    flex-direction: column;
    position: relative;
    height: 100%;
    padding: 0px 0px 12px 0px;
    z-index: 2;
  }

  [data-theme='dark'] .chatquickaccesspanel-container {
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

  .quickaccess-footer {
    padding-top: 12px;
  }

  .quickaccess-expand-icon {
    stroke: var(--text-static-secondary);
    color: var(--text-static-secondary);
  }

  /* Quick Access Expand Transition Animations */
  .quickaccess-expand-slider-enter-active,
  .quickaccess-expand-slider-leave-active {
    transition: all 0.5s ease;
    opacity: 1;
  }

  .quickaccess-expand-slider-enter-from,
  .quickaccess-expand-slider-leave-to {
    opacity: 0;
  }

  .quickaccess-expand-slider-enter-to,
  .quickaccess-expand-slider-leave-from {
    opacity: 1;
  }

  .group-avatar {
    height: 28px;
    width: 28px;
  }
</style>
