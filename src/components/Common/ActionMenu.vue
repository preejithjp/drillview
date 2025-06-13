<template>
  <div ref="actionmenu-button" v-outsideclick="handleOutsideClick" class="d-flex">
    <SvgIcon :name="icon" class="svg-icon size16 teritiary" @click="handleIconClick" />
  </div>
  <div v-if="visible" ref="actionmenu-items" class="actionmenu-item-container d-flex flex-col fontSize-12" :style="position">
    <div
      v-for="(item, index) in menuItems"
      :key="index"
      class="menu-item d-flex align-items-center gap10 cursor-pointer"
      @click="handleMenuItemClick(item)">
      <span v-if="item.icon" class="d-flex">
        <SvgIcon :name="item.icon" class="svg-icon size18" :class="item.cssClass" />
      </span>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';

  export interface ActionMenuItem {
    label: string;
    action?: string;
    icon?: string;
    cssClass?: string;
  }

  export default defineComponent({
    name: 'ActionMenu',
    components: {},
    props: {
      icon: {
        type: String,
        required: true,
      },
      menuItems: {
        type: Array as PropType<ActionMenuItem[]>,
        required: true,
      },
    },
    emits: {
      onMenuItemSelect(item: ActionMenuItem) {
        return !!item;
      },
    },
    data() {
      return {
        visible: false,
        position: { top: '0px', left: '0px' },
      };
    },
    computed: {},
    watch: {},
    mounted() {
      window.addEventListener('resize', this.updatePosition);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.updatePosition);
    },
    methods: {
      handleIconClick() {
        this.visible = true;
        this.updatePosition();
      },
      handleMenuItemClick(item: ActionMenuItem) {
        this.$emit('onMenuItemSelect', item);
      },
      handleOutsideClick() {
        this.visible = false;
      },
      updatePosition() {
        this.$nextTick(() => {
          const sourceElement = this.$refs['actionmenu-button'] as HTMLElement;
          if (sourceElement) {
            const rect = sourceElement.getBoundingClientRect();
            const menuElement = this.$refs['actionmenu-items'] as HTMLElement;

            if (!menuElement) return;

            // Calculate dimensions and viewport
            const menuHeight = menuElement.offsetHeight;
            const menuWidth = menuElement.offsetWidth;
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            let top = rect.bottom + 5;
            let left = rect.left;

            // Adjust for vertical overflow
            if (rect.bottom + menuHeight > viewportHeight) {
              top = rect.top - menuHeight;
            }

            // Adjust for horizontal overflow
            if (rect.left + menuWidth > viewportWidth) {
              left = rect.right - menuWidth;
            }

            // Ensure the menu stays within viewport bounds
            this.position = {
              top: `${Math.max(0, top)}px`,
              left: `${Math.max(0, left)}px`,
            };
            this.visible = true;
          }
        });
      },
    },
  });
</script>

<style scoped>
  .actionmenu-item-container {
    color: var(--text-tertiary);
    position: absolute;
    border: 1px solid var(--bg-secondary);
    background-color: var(--bg-secondary);
    padding: 5px 0px;
    box-shadow: 0 0 6px -1px var(--bg-primary);
    z-index: 1000;
    min-width: 100px;
    user-select: none;
  }

  .menu-item {
    padding: 8px 15px;
    transition: background-color 0.2s;
  }

  .menu-item:hover {
    background-color: var(--hover-primary);
  }
</style>
