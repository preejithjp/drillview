<template>
  <div class="quickaccessexpandpanel-container d-flex">
    <div class="quickaccessexpand-body d-flex flex-full scroll primary">
      <div
        v-for="(item, index) in menuList"
        :key="String(item.id)"
        class="quickaccessexpand-menu-item menuitem-primary d-flex align-center"
        :class="{ active: selectItemId === item.id }"
        @click="onMenuItemSelect(item)">
        <div class="d-flex flex-full align-center gap10 text-ellipsis">
          <span>
            <GroupAvatar
              :name="(item.data?.ParentName as string) + '#$#' + item.data?.GroupName"
              :image="item.data?.GroupIcon"
              :colorIndex="index"
              class="group-avatar"></GroupAvatar>
          </span>
          <div class="d-flex flex-col flex-full text-ellipsis">
            <span
              class="text-tertiary text-ellipsis capitalize fontSemibold fontSize-13"
              :class="hasUnreadMessages(item.data!) ? 'fontBold fontSize-15' : 'fontSemibold fontSize-13'">
              {{ item.data?.ParentName }}
            </span>
            <span
              class="text-senary text-ellipsis fontMedium fontSize-10"
              :class="hasUnreadMessages(item.data!) ? 'fontBold fontSize-12' : 'fontMedium fontSize-10'">
              {{ item.data?.GroupName }}
            </span>
          </div>
        </div>
        <div class="d-flex flex-shrink-0 flex-col align-items-end justify-content-center">
          <span v-if="item.data && item.data.Pin && item.data.UnreadMessageCount > 0" class="unread-badge fontSize-10 fontBold">
            {{ getUnreadMessageCount(item.data) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { IMemberGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import { defineComponent, PropType } from 'vue';
  import { QuickAccessMenu } from './ChatQuickAccessPanel.vue';
  import GroupAvatar from './GroupAvatar.vue';
  import { Routes } from '@/router';

  export default defineComponent({
    name: 'ChatQuickAccessExpandPanel',
    components: {
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
      };
    },
    computed: {},
    watch: {},
    mounted() {
      this.selectItemId = this.selectedItem.ParentGroupId as string;
    },
    methods: {
      onMenuItemSelect(item: QuickAccessMenu) {
        this.selectItemId = item.id;
        this.$emit('onMenuItemSelect', item);
        this.$router.push({ name: Routes.Chat });
      },
      hasUnreadMessages(group: IMemberGroupData) {
        return group.Pin && group.UnreadMessageCount > 0;
      },
      getUnreadMessageCount(group: IMemberGroupData) {
        if (group.UnreadMessageCount >= 100) {
          return '99+';
        } else if (group.UnreadMessageCount > 0) {
          return group.UnreadMessageCount;
        } else {
          return '';
        }
      },
    },
  });
</script>

<style scoped>
  .quickaccessexpandpanel-container {
    flex-direction: column;
    position: relative;
    max-height: 100%;
    padding: 50px 0px 12px 0px;
    position: absolute;
    padding: 8px 0;
    z-index: 1000;
    background-color: var(--bg-septenary);
    box-shadow: 0 10px 20px var(--context-menu-box-shadow);
    bottom: 0px;
    left: 45px;
    border-radius: 5px;
  }

  .quickaccessexpand-body {
    flex-direction: column;
    overflow-y: auto;
  }

  .quickaccessexpand-menu-item {
    cursor: pointer;
    padding: 10px 25px;
    transition: background-color 0.2s ease;
  }

  .group-avatar {
    height: 28px;
    width: 28px;
  }

  .unread-badge {
    background-color: var(--high-priority);
    color: var(--text-static-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0px 5px;
    border-radius: 999px;
    line-height: 1;
    white-space: nowrap;
  }
</style>
