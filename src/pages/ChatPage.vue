<template>
  <div class="chat-container fontSize-16">
    <div class="flex-shrink-0">
      <ChatQuickAccessPanel
        :menuList="quickAccessMenuList"
        :selectedItem="selectedChatGroup"
        @on-menu-item-select="onItemSelect"></ChatQuickAccessPanel>
    </div>
    <transition name="nav-slider">
      <div v-if="showNavigationPanel" class="sidebar">
        <ChatNavigationPanel
          v-if="chatGroupList"
          :chatGroupList="chatGroupList"
          :selectedItem="selectedChatGroup"
          @on-change="onGroupListChange"
          @on-item-select="onItemSelect" />
      </div>
    </transition>
    <template v-if="showChatArea()">
      <template v-if="!isLoading && chatGroupList.length > 0">
        <div class="flex-full">
          <ChatArea
            v-if="selectedChatGroup.ChatGroupId"
            :chatGroupList="chatGroupList"
            :groupItem="selectedChatGroup"
            :curveInitialData="curveData"
            @on-update-status="onUpdateStatusEmit"
            @on-chat-group-update="onChatGroupUpdate"
            @on-group-message-notification="onGroupMessageNotification" />
        </div>
        <div class="chat-member-panel">
          <ChatMembersPanel
            v-if="selectedChatGroup.ChatGroupId"
            :chatGroup="selectedChatGroup"
            :memberList="memberList"
            @on-chat-group-update="onChatGroupUpdate"></ChatMembersPanel>
        </div>
      </template>
      <template v-else-if="!isLoading && chatGroupList.length === 0">
        <div class="d-flex flex-full flex-col gap20 align-center">
          <span class="d-flex flex-col gap10 align-center">
            <span class="fontSize-16 fontSemibold">No Chat Groups Joined</span>
            <span class="fontSize-13 fontNormalI text-senary">
              You haven't joined any chat groups yet. Import a group to start messaging and collaborating with others!
            </span>
          </span>
        </div>
      </template>
    </template>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import ChatArea from '../components/Chat/ChatArea.vue';
  import ChatNavigationPanel from '../components/Chat/ChatNavigationPanel.vue';
  import ChatQuickAccessPanel from '../components/Chat/ChatQuickAccessPanel.vue';
  import { IMemberGroupData } from '../../server/interfaces/chatgroup.interfaces';
  import { IChatGroupSettings } from '../../server/interfaces/chatmembers.interfaces';
  import { webSocketClient } from '@/services/websocketclient.service';
  import { Api } from '@/services/api.services';
  import ChatMembersPanel from '@/components/Chat/ChatMembersPanel.vue';
  import { IMemberType } from '../../server/interfaces/member.interfaces';
  import { store } from '@/main';
  import { Routes } from '@/router';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { UserStatus, WsServerEvents, WsStatusChangeMessage } from '../../server/interfaces/websocket.interfaces';
  import { DataStoreChannelDataItem } from '@/helpers/datastore/datamodels/datastore.channelitem';
  import Logger from '@/common/logger';
  import { GroupMessageNotifications } from '@/interfaces/chat.interfaces';

  export enum Popup {
    Group = 'GROUP',
    Member = 'MEMBER',
    ImportGroup = 'IMPORTGROUP',
    PropertySelector = 'PROPERTYSELECTOR',
    Empty = '',
  }

  export default defineComponent({
    name: 'ChatPage',
    components: {
      ChatQuickAccessPanel,
      ChatNavigationPanel,
      ChatArea,
      ChatMembersPanel,
    },
    data() {
      return {
        Popup: Popup,
        chatGroupList: [] as IMemberGroupData[],
        selectedChatGroup: {} as IMemberGroupData,
        memberList: [] as IMemberType[],
        curveData: {} as any,
        showNavigationPanel: false as boolean,
        refetchChatGroupsListener: '' as string,
        isLoading: false as boolean,
      };
    },
    computed: {
      quickAccessMenuList() {
        if (!this.chatGroupList) return [];
        return this.chatGroupList
          .map((group) => {
            if (group.Pin) {
              return {
                id: group.ParentGroupId as string,
                label: group.GroupName,
                icon: 'chat-group-icon',
                data: group,
              };
            } else {
              return null;
            }
          })
          .filter((item) => !!item);
      },
    },
    watch: {
      '$route.query': {
        handler(newQuery) {
          if (newQuery.id) {
            this.changeSelectedChatGroup(newQuery.id);
          }
        },
        immediate: true,
        deep: true,
      },
    },
    mounted() {
      this.refetchChatGroupsListener = store.eventEmitter.on('refetchChatGroups', () => {
        this.fetchAllChatGroups();
      });
      store.eventEmitter.on('header-expand-btn-click', () => {
        this.showNavigationPanel = !this.showNavigationPanel;
      });
      this.fetchAllChatGroups();

      webSocketClient.on(WsServerEvents.STATUS_CHANGE, this.onMemberStatusChange);
    },
    beforeUnmount() {
      store.chatInfo = null;
      webSocketClient.off(WsServerEvents.STATUS_CHANGE, this.onMemberStatusChange);
      if (store.eventEmitter.hasEvent('refetchChatGroups')) {
        store.eventEmitter.offById('refetchChatGroups', this.refetchChatGroupsListener);
      }
    },
    methods: {
      async fetchAllChatGroups() {
        this.isLoading = true;
        const response = await Api.fetch('chatgroups');
        if (response && response.length) {
          this.chatGroupList = this.sortChatGroupList(response);
          this.isLoading = false;
          if (this.chatGroupList.length > 0) {
            this.fetchCurveData();
            const queryId = this.$route.query.id as string;
            if (queryId) {
              this.changeSelectedChatGroup(queryId);
              return;
            }
            const hasQuickAccess = this.chatGroupList.findIndex((g) => g.Pin);
            if (hasQuickAccess == -1) {
              // To select initial chat group if no Pinned chat group exists
              this.onItemSelect(this.chatGroupList[0]);
            }
          }
        } else {
          this.chatGroupList = [];
          this.isLoading = false;
        }
      },
      async onItemSelect(item: IMemberGroupData) {
        this.selectedChatGroup = item;
        store.chatInfo = item;
        this.memberList = [];
        if (item.Members && item.Members?.length > 0) {
          const memberIds = item.Members.map((member) => member.MemberId);
          const response = (await Api.submit('members/byId', memberIds)) ?? [];
          this.memberList = (response as IMemberType[]).sort((a, b) => {
            // Compare OnlineStatus first
            const statusComparison = this.getOnlineStatusOrder(a.OnlineStatus) - this.getOnlineStatusOrder(b.OnlineStatus);
            // If OnlineStatus is the same, compare by Name
            if (statusComparison === 0) {
              return (a?.Name ?? '').localeCompare(b?.Name ?? '');
            }
            return statusComparison;
          });
        }
      },
      changeSelectedChatGroup(parentGroupId: string) {
        const chatGroup = this.chatGroupList.find((cg) => cg.ParentGroupId === parentGroupId);
        if (chatGroup) {
          this.onItemSelect(chatGroup);
        }
      },
      onGroupListChange(groupList: IMemberGroupData[]) {
        if (groupList.length > 0) {
          this.chatGroupList = this.sortChatGroupList(groupList);
        } else {
          this.fetchAllChatGroups();
        }
      },
      onUpdateStatusEmit(payload: { label: keyof IChatGroupSettings; data: boolean }) {
        if (this.selectedChatGroup) {
          this.selectedChatGroup[payload.label] = payload.data;
        }
      },
      fetchCurveData() {
        if (this.chatGroupList.length > 0) {
          const channelList = this.chatGroupList
            .flatMap((group) => {
              return group.Channels ? group.Channels.map((channel) => channel.ChannelId) : undefined;
            })
            .filter((c) => c !== undefined);

          ChannelDataService.getLastNRowsData({ ChannelIds: channelList, callback: this.handleCurveData });
        }
      },
      handleCurveData(data: DataStoreChannelDataItem[]) {
        if (data && Array.isArray(data)) {
          data.forEach((curvedata) => {
            this.curveData[curvedata.ChannelId] = curvedata;
          });
        } else {
          Logger.Info(`Chat Curve Initial data received : ${data}`);
        }
      },
      onChatGroupUpdate(memberGroupData: IMemberGroupData) {
        if (memberGroupData.ParentGroupId === this.selectedChatGroup.ParentGroupId) {
          this.selectedChatGroup = memberGroupData;
        }
        const chatgroupIndex = this.chatGroupList.findIndex((group) => group.ParentGroupId === memberGroupData.ParentGroupId);
        if (chatgroupIndex > -1) {
          this.chatGroupList[chatgroupIndex] = memberGroupData;
        }
      },
      onGroupMessageNotification(groupMessageNotifications: GroupMessageNotifications) {
        for (const key in groupMessageNotifications) {
          const chatgroupIndex = this.chatGroupList.findIndex((group) => group.ParentGroupId === key);
          if (chatgroupIndex > -1) {
            this.chatGroupList[chatgroupIndex].UnreadMessageCount = groupMessageNotifications[key].unreadMessageCount;
          }
        }
      },
      showChatArea() {
        return this.$route.name === Routes.Chat;
      },
      sortChatGroupList(chatGroupList: IMemberGroupData[]) {
        return chatGroupList.sort((a: IMemberGroupData, b: IMemberGroupData) => {
          const pinA = a.Pin ? 1 : 0;
          const pinB = b.Pin ? 1 : 0;
          // Sort by Pin first (true first, false second)
          if (pinB - pinA !== 0) {
            return pinB - pinA;
          }
          // Sort by JoinedDate in descending order for both pinned and non-pinned groups
          return (b.JoinedDate || 0) - (a.JoinedDate || 0);
        });
      },
      onMemberStatusChange(data: WsStatusChangeMessage) {
        const memberIndex = this.memberList.findIndex((m) => m.MemberId === data.memberId);
        if (memberIndex > -1) {
          this.memberList[memberIndex].OnlineStatus = data.status;
        }
      },
      getOnlineStatusOrder(status: string): number {
        switch (status) {
          case UserStatus.ONLINE:
            return 1;
          case UserStatus.AWAY:
            return 2;
          case UserStatus.OFFLINE:
            return 3;
          default:
            return 4;
        }
      },
    },
  });
</script>

<style scoped>
  .chat-container {
    display: flex;
    height: 100%;
    border-bottom: 1px solid var(--border-primary);
    overflow: auto;
  }

  .sidebar {
    width: 20%;
    min-width: 200px;
  }

  .chat-member-panel {
    width: 20%;
    min-width: 200px;
    padding: 15px 15px 15px 0px;
  }

  /* Navigation Pannel Transition Animations */
  .nav-slider-enter-active,
  .nav-slider-leave-active {
    transition: all 0.5s ease;
    opacity: 1;
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
