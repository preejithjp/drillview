<template>
  <div class="chatnavpanel-container">
    <div class="chatnavpanel-header-wrapper">
      <SvgIcon
        name="import-icon"
        title="Chat Import"
        class="svg-icon size32 border icon-background flex-shrink-0 secondary"
        @click="showImportGroupPopup" />
      <div class="flex-full p-relative">
        <SearchInput v-model="filterInput" placeholder="Search Wellbore" class="search-box flex-full p-relative" />
      </div>
    </div>
    <div class="chatnavpanel-body-wrapper scroll primary scroll-y-auto flex-full text-static-primary">
      <div>
        <div
          v-for="(group, index) in filteredChatGroupList"
          :key="String(group.ParentGroupId)"
          class="chatnavpanel-item-wrapper menuitem-primary d-flex align-center"
          :class="{
            active: selectItemId === group.ParentGroupId,
          }">
          <div class="chatnavpanel-item-main d-flex flex-full align-center gap10 text-ellipsis" @click="selectedGroupItem(group)">
            <span>
              <GroupAvatar
                :name="(group.ParentName as string) + '#$#' + group.GroupName"
                :image="group.GroupIcon"
                :colorIndex="index"
                class="group-avatar"></GroupAvatar>
            </span>
            <div class="d-flex flex-col flex-full text-ellipsis">
              <span
                class="chatnavpanel-item-title text-tertiary text-ellipsis capitalize"
                :class="hasUnreadMessages(group) ? 'fontBold fontSize-15' : 'fontSemibold fontSize-13'">
                {{ group.ParentName }}
              </span>
              <span
                class="chatnavpanel-item-title text-senary text-ellipsis"
                :class="hasUnreadMessages(group) ? 'fontBold fontSize-12' : 'fontMedium fontSize-10'">
                {{ group.GroupName }}
              </span>
            </div>
          </div>
          <div class="chatnavpanel-item-actions flex-col align-items-end justify-content-center">
            <span v-if="group && group.Pin && group.UnreadMessageCount > 0" class="unread-badge fontSize-10 fontBold">
              {{ getUnreadMessageCount(group) }}
            </span>
            <span class="d-flex gap5">
              <SvgIcon
                v-if="group.Pin"
                name="snooze-icon"
                class="svg-icon size14"
                :class="{ 'icon-visible': group.Snooze }"
                @click="onSnoozeNotification(group)" />
              <SvgIcon name="pin-icon" class="svg-icon size14" :class="{ 'icon-visible': group.Pin }" @click="onPinGroup(group)" />
            </span>
          </div>
        </div>
      </div>

      <div v-if="chatGroupList && !chatGroupList.length" class="no-data-found fontSize-14">
        <span>Didn't find any matches.</span>
      </div>
    </div>
    <div class="chatnavpanel-footer-wrapper">
      <div class="d-flex flex-row width-100 fontMedium fontSize-12 gap5 justify-content-start p10 cursor-pointer" @click="onAddGroupBtnClick">
        <SvgIcon name="chat-group-add-icon" class="svg-icon size24 text-quaternary flex-shrink-0" />
        <span class="text-tertiary font-Semibold fontSize-12">Add New Group</span>
      </div>
    </div>
  </div>
  <ImportChatGroup v-if="activePopup === Popup.ImportGroup" @close-popup="activePopup = Popup.Empty" @on-group-updated="onGroupUpdated" />
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IMemberGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import { Api } from '@/services/api.services';
  import { Popup } from '@/pages/ChatPage.vue';
  import { store } from '@/main';
  import { ToastType } from '../ToastMessage.vue';
  import { IChatGroupSettings, IChatMembers } from '../../../server/interfaces/chatmembers.interfaces';
  import { RoleEnum } from '../../../server/interfaces/member.interfaces';
  import ImportChatGroup from './ImportChatGroup.vue';
  import GroupAvatar from './GroupAvatar.vue';
  import { Routes } from '@/router';
  import { GroupMessageNotifications } from '@/interfaces/chat.interfaces';

  export default defineComponent({
    name: 'ChatNavigationPanel',
    components: {
      ImportChatGroup,
      GroupAvatar,
    },
    props: {
      chatGroupList: {
        type: Object as PropType<IMemberGroupData[]>,
        required: true,
      },
      selectedItem: {
        type: Object as PropType<IMemberGroupData>,
        required: true,
      },
    },
    emits: {
      onItemSelect(item: IMemberGroupData) {
        return !!item;
      },
      onChange(chatGroupList: IMemberGroupData[]) {
        return !!chatGroupList;
      },
    },
    data() {
      return {
        Popup: Popup,
        RoleEnum: RoleEnum,
        activePopup: Popup.Empty as string,
        showDeleteConfirmation: false,
        deleteId: '',
        filterInput: '' as string,
        selectItemId: '' as string,
        selectedGroupData: {} as IMemberGroupData | null,
        selectedMembers: [] as IChatMembers[],
        elementRef: null as EventTarget | null,
        messageNotifications: {} as GroupMessageNotifications,
      };
    },
    computed: {
      filteredChatGroupList() {
        if (!this.chatGroupList?.length) return [];
        if (!this.filterInput) return this.chatGroupList;
        const filteredList: IMemberGroupData[] = this.chatGroupList.filter((group) =>
          group.ParentName?.toLowerCase().includes(this.filterInput.toLowerCase())
        );
        return filteredList;
      },
    },
    watch: {
      selectedItem: {
        handler() {
          this.selectItemId = this.selectedItem.ParentGroupId as string;
        },
        deep: true,
      },
    },
    mounted() {
      this.selectItemId = this.selectedItem.ParentGroupId as string;
    },
    methods: {
      onGroupUpdated() {
        this.$emit('onChange', []);
      },
      selectedGroupItem(item: IMemberGroupData) {
        this.selectItemId = item.ParentGroupId as string;
        this.$emit('onItemSelect', item);
        this.$router.push({ name: Routes.Chat });
      },
      showImportGroupPopup() {
        this.activePopup = Popup.ImportGroup;
      },
      onPinGroup(chatgroup: IMemberGroupData) {
        const chatgroupSettings: IChatGroupSettings = {
          Pin: !chatgroup.Pin,
        };
        this.updateChatGroupSettings(chatgroup.ParentGroupId as string, chatgroupSettings);
      },
      onSnoozeNotification(chatgroup: IMemberGroupData) {
        const chatgroupSettings: IChatGroupSettings = {
          Snooze: !chatgroup.Snooze,
        };
        this.updateChatGroupSettings(chatgroup.ParentGroupId as string, chatgroupSettings);
      },
      async updateChatGroupSettings(parentGroupId: string, chatgroupSettings: IChatGroupSettings) {
        const response = await Api.patch(`chatmembers/${parentGroupId}`, chatgroupSettings);
        if (response) {
          const group = this.chatGroupList.find((group) => group.ParentGroupId === parentGroupId);
          if (group) {
            Object.keys(chatgroupSettings).forEach((label) => {
              const key = label as keyof IChatGroupSettings;
              group[key] = chatgroupSettings[key];
            });
            this.$emit('onChange', this.chatGroupList);
          }
        } else {
          store.showToast(ToastType.ERROR, 'Error updating status');
        }
      },
      onAddGroupBtnClick() {
        this.$router.push({ name: Routes.ChatGroup, state: { showCreateGroupPopup: true } });
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
  .chatnavpanel-container {
    background: var(--bg-septenary);
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
  }

  .chatnavpanel-header-wrapper {
    display: flex;
    align-items: center;
    padding: 0 25px;
    gap: 10px;
    height: 50px;
  }

  .chatnavpanel-body-wrapper {
    background: var(--bg-septenary);
  }

  .chatnavpanel-footer-wrapper {
    display: flex;
    align-items: center;
    padding: 0 20px;
  }

  .chatnavpanel-footer-wrapper:hover {
    background-color: var(--hover-secondary);
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
    display: flex;
    gap: 5px;
    flex-shrink: 0;
    flex-grow: 0;
    padding-top: 5px;
    color: transparent;
    stroke: var(--text-quaternary);
  }

  .chatnavpanel-item-actions .svg-icon {
    opacity: 0;
    transition:
      opacity 0.2s ease-in-out,
      color 0.2s ease-in-out;
  }

  .chatnavpanel-item-wrapper:hover .chatnavpanel-item-actions .svg-icon {
    opacity: 1;
  }

  .chatnavpanel-item-actions .icon-visible {
    color: var(--text-quaternary);
    stroke: var(--text-quaternary);
    opacity: 1;
  }

  .no-data-found {
    text-align: center;
    padding: 10px;
    color: var(--text-tertiary);
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
    white-space: nowrap;
  }
</style>
