<template>
  <div v-if="visible" class="context-menu fontMedium fontSize-14" :style="position">
    <div v-for="(item, index) in menuItems" :key="index" class="menu-item" :class="item?.class" @click="selectedMenu(item)">
      <!-- SVG Icon -->
      <span v-if="item.icon && !isUrl(item.icon)" class="d-inline-flex">
        <SvgIcon :name="item.icon" class="svg-icon size15" :class="item?.class" />
      </span>

      <!-- Profile for image or initials -->
      <ProfileImage v-else :name="item.label" :image="item.icon" :status="additionalData[index]?.status" class="profile-img" />

      <!-- Label -->
      <span class="text">{{ item.label }}</span>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import ProfileImage from './ProfileImage.vue';
  import { UserStatus } from '../../server/interfaces/websocket.interfaces';

  export interface MenuItem {
    label: string;
    icon: string;
    value: string | number | boolean;
    class?: string;
    data?: Record<string, number | string | boolean>;
  }

  export enum PriorityLevel {
    Normal,
    Low,
    Medium,
    High,
  }

  export default defineComponent({
    name: 'ContextMenu',
    components: {
      ProfileImage,
    },
    props: {
      menuItems: {
        type: Array as PropType<MenuItem[]>,
        required: true,
      },
      source: {
        type: Object as () => EventTarget | null,
        required: true,
      },
    },
    emits: {
      selectedMenu(item: MenuItem) {
        return !!item;
      },
    },
    data() {
      return {
        visible: true,
        position: { top: '0px', left: '0px' },
      };
    },
    computed: {
      additionalData() {
        return this.menuItems.map((item) => {
          return {
            status: item.data?.status as UserStatus,
          };
        });
      },
    },
    watch: {
      source: {
        immediate: true,
        handler() {
          this.updatePosition();
        },
      },
    },
    created() {
      document.addEventListener('click', this.closeMenu);
    },
    unmounted() {
      document.removeEventListener('click', this.closeMenu);
    },
    methods: {
      closeMenu() {
        this.visible = false;
      },
      selectedMenu(item: MenuItem) {
        this.$emit('selectedMenu', item);
      },
      isUrl(url: string) {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      updatePosition() {
        this.$nextTick(() => {
          if (this.source) {
            const sourceElement = this.source as HTMLElement;
            const rect = sourceElement.getBoundingClientRect();

            // Use this.$el instead of document.querySelector
            const menuElement = this.$el as HTMLElement;

            if (!menuElement) return;

            // Calculate dimensions and viewport
            const menuHeight = menuElement.offsetHeight;
            const menuWidth = menuElement.offsetWidth;
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            let top = rect.bottom;
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
  .context-menu {
    position: absolute;
    border-radius: 8px;
    padding: 8px 0;
    z-index: 1000;
    background-color: var(--bg-septenary);
    box-shadow: 0 10px 20px var(--context-menu-box-shadow);
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    gap: 10px;
  }

  .menu-item:hover {
    background: var(--hover-secondary);
  }

  .profile-img {
    width: 30px;
    height: 30px;
  }
</style>
