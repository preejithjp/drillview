<template>
  <div class="chatarea-container fontSize-16">
    <template v-if="groupItem.Members?.some((data) => data.MemberId === currentMemberId)">
      <div class="chatarea-header gap5">
        <div class="chatarea-header-box tab-box align-center fontMedium fontSize-12 text-static-tertiary">
          <span
            v-for="tab in ChatTabs"
            :key="tab"
            class="tab-item"
            :class="{ 'active fontBold fontSize-13 text-tertiary': tab === activeTab }"
            @click="setActiveTab(tab as ChatTabs)">
            {{ tab }}
          </span>
          <span class="ai-tab-item d-flex align-center" :class="{ 'active fontBold text-tertiary': isAiTabActive }" @click="onAiTabBtnClick">
            <SvgIcon name="ai-icon-03" class="svg-icon size20 mr4" />
            Chat Summary
          </span>
        </div>
        <div class="chatarea-header-box activity-box align-center">
          <!-- TODO: To Show current Activities after the API is ready. -->
          <!-- <span class="fontSize-12 fontSemibold capitalize" v-for="activity in groupItem.Activities" :key="activity">
            {{ activity }}
          </span> -->
          <span class="fontSize-12 fontMedium text-static-tertiary">No Activities</span>
        </div>
        <SearchInput v-model="filterInput" placeholder="Search Chat" class="chatarea-header-box flex-full p-relative" />
      </div>
      <div id="chatContainer" ref="chatContainer" class="chatarea-main scroll primary scroll-y-auto" @scroll="handleChatScroll">
        <template v-if="activeTab === ChatTabs.Chat">
          <ChatMessages :chatgroup="groupItem" :prioritylist="prioritylist" :members="members" :chatMessages="filteredMessageList" />
        </template>
        <template v-if="activeTab === ChatTabs.Files">
          <ChatFiles :chatFiles="chatFiles" />
        </template>
        <template v-if="activeTab === ChatTabs.Videos">
          <ChatFiles :chatFiles="chatVideoFiles" />
        </template>
        <template v-if="activeTab === ChatTabs.Settings">
          <ChatSettings :chatgroup="groupItem" />
        </template>
        <template v-if="isAiTabActive">
          <div class="d-flex flex-col gap10 align-center height-100">
            <SvgIcon name="ai-icon-03" class="svg-icon ai-summary-icon" />
            <span class="fontSize-16 fontSemibold">Summary</span>
            <span class="fontSize-12 fontNormalI text-center">This feature is under development.</span>
          </div>
        </template>
        <div
          v-if="
            activeTab === ChatTabs.Chat &&
            !isMessageLoading &&
            !filterInput &&
            chatMessages[parentGroupId] &&
            chatMessages[parentGroupId].length === 0
          "
          class="d-flex flex-full flex-col gap20 align-center">
          <img src="../../assets/images/chat-empty-conversation.png" alt="Empty Conversation Image" />
          <span class="d-flex flex-col gap10 align-center">
            <span class="fontSize-14 fontSemibold">You're starting a new conversation</span>
            <span class="fontSize-12 fontNormalI text-senary">Type your first message below.</span>
          </span>
        </div>
        <div
          v-else-if="
            activeTab === ChatTabs.Chat &&
            !isMessageLoading &&
            filterInput &&
            chatMessages[parentGroupId] &&
            chatMessages[parentGroupId].length === 0 &&
            filteredMessageList.length === 0
          "
          class="d-flex flex-full flex-col gap20 align-center">
          <span class="d-flex flex-col gap10 align-center">
            <span class="fontSize-14 fontSemibold">We couldn't find any results for '{{ filterInput }}'</span>
            <span class="fontSize-12 fontNormalI text-senary">Check for spelling or try searching for another term</span>
          </span>
        </div>
      </div>
      <div v-if="createdFileList?.length" class="fileupload-display fontSize-12">
        <div v-for="file in createdFileList" :key="file.File" class="sent-file flex-row full-width">
          <div class="align-center file-icon">
            <template v-if="file.FileType!.startsWith('image/') || file.FileType!.startsWith('video/')">
              <img v-if="file.FileType!.startsWith('image/')" :src="file.File" alt="Image preview" class="preview-image" />
              <video v-else-if="file.FileType!.startsWith('video/')" :src="file.File" controls style="max-width: 100px" class="preview-image"></video>
            </template>
            <template v-else>
              <SvgIcon name="clip-icon" class="svg-icon size25" />
            </template>
          </div>
          <div class="d-flex flex-col flex-full">
            <span class="file-name">{{ file.FileName }}</span>
            <div class="file-subcontent padding-top-3">
              <span class="uploadedfiletype">{{ file.FileExtension }}</span>
              <span class="uploadedfilesize">{{ getFileSize(file.Size) }}</span>
            </div>
          </div>
          <div class="right-icons">
            <span class="file-icon">
              <SvgIcon name="close-icon-circle" class="svg-icon size22 cursor-pointer" @click="closefile(file.File)" />
            </span>
          </div>
        </div>
      </div>
      <div v-if="inputMsgValidation" class="inputmessage-prompt d-flex flex-col fontSize-12">
        <div class="d-flex flex-col">
          <span>{{ inputMsgValidation }}</span>
        </div>
      </div>
      <div v-if="activeTab === ChatTabs.Chat" class="chatarea-footer">
        <Field ref="input-message-field" v-slot="{ field }" v-model="message" name="message" :rules="{ hasContent: true }">
          <input
            ref="input-message"
            v-bind="field"
            placeholder="Type a message..."
            type="text"
            class="chatarea-messagebox text-tertiary fontNormal fontSize-14"
            autocomplete="off"
            @keydown.enter="submitMessage" />
        </Field>
        <div class="chatarea-msg-action-group">
          <span id="emoji-picker" class="svg-icon size25" @click="toggleEmojiPicker">
            <SvgIcon id="emoji-picker" title="Emoji" name="smile-icon" class="svg-icon size25" />
          </span>
          <span
            id="priority-btn"
            ref="contextPrioritySource"
            class="svg-icon size25"
            :class="priorityClass"
            @click.stop="showContextMenu(ContextMenuType.Priority)">
            <SvgIcon name="important-icon" title="Priority Message" />
          </span>
          <span class="svg-icon size25" @click="($refs.attachFile as HTMLInputElement).click()">
            <SvgIcon name="clip-icon" title="Attach File" />
          </span>
          <input ref="attachFile" type="file" style="display: none" accept="application/pdf,text/plain,image/*,video/*" @change="uploadFile" />
          <span class="svg-icon size25" @click="onAiAssistantClick">
            <SvgIcon name="ai-icon-02" title="AI Summary" class="svg-icon size25" />
          </span>
        </div>
        <span class="svg-icon size25" @click="submitMessage">
          <SvgIcon name="send-icon-02" title="Send" />
        </span>
      </div>
    </template>
    <div v-else class="d-flex align-items-center height-100">
      <p class="text-center width-100">You don't have the sufficient permission to view or chat in this group.</p>
    </div>
  </div>
  <EmojiPickerElement v-if="showEmojiPicker" class="emoji-picker" @emoji-selected="onEmojiSelected" />
  <ContextMenu v-if="elementRef" :source="elementRef" :menuItems="menuItems" @selected-menu="selectedMenuItem" />
</template>
<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IMemberGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import { IChatMessage, IFile, IChatMessageBase, IChatGroupMessageData } from '../../../server/interfaces/chatmessage.interfaces';
  import { IMemberType } from '../../../server/interfaces/member.interfaces';
  import { getInitials } from '@/common/utils';
  import ChatMessages from './ChatMessages.vue';
  import ChatFiles from '@/components/Chat/ChatFiles.vue';
  import { Api } from '@/services/api.services';
  import { store } from '@/main';
  import { ToastType } from '../ToastMessage.vue';
  import {
    UserStatus,
    WsChatMessageTransmit,
    WsChatMessageUpdate,
    WsClientEvents,
    WsServerEvents,
    WsStatusChangeMessage,
  } from '../../../server/interfaces/websocket.interfaces';
  import Logger from '@/common/logger';
  import ContextMenu, { MenuItem, PriorityLevel } from '../ContextMenu.vue';
  import EmojiPickerElement from './EmojiPickerElement.vue';
  import ChatSettings from './ChatSettings.vue';
  import { IMemberGroupChannel, IChatGroupSettings, IChatMembers } from '../../../server/interfaces/chatmembers.interfaces';
  import { sendMessage, webSocketClient } from '@/services/websocketclient.service';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { DataStoreChannelDataItem } from '@/helpers/datastore/datamodels/datastore.channelitem';
  import { Field } from 'vee-validate';
  import { GroupMessageNotifications } from '@/interfaces/chat.interfaces';

  export enum ChatTabs {
    Chat = 'Chat',
    Files = 'Files',
    Videos = 'Videos',
    Settings = 'Settings',
  }

  export enum ContextMenuType {
    Member = 'Member',
    Priority = 'Priority',
    ChatOptions = 'ChatOptions',
  }

  const allowedFileTypes = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg', 'video/mp4'];

  export const fileSizeUnits = ['Bytes', 'KB', 'MB'];

  export default defineComponent({
    name: 'ChatArea',
    components: {
      Field,
      ChatMessages,
      ContextMenu,
      EmojiPickerElement,
      ChatFiles,
      ChatSettings,
    },
    props: {
      chatGroupList: {
        type: Object as PropType<IMemberGroupData[]>,
        required: true,
      },
      groupItem: {
        type: Object as PropType<IMemberGroupData>,
        required: true,
      },
      curveInitialData: {
        type: Object as PropType<any>,
        required: true,
      },
    },
    emits: {
      onUpdateStatus: (payload: { label: keyof IChatGroupSettings; data: boolean }) =>
        typeof payload.label === 'string' && typeof payload.data === 'boolean',
      onChatGroupUpdate(item: IMemberGroupData) {
        return !!item;
      },
      onGroupMessageNotification(payload: GroupMessageNotifications) {
        return !!payload;
      },
    },
    data() {
      return {
        filterInput: '' as string,
        ContextMenuType: ContextMenuType,
        getInitials: getInitials,
        attachFile: null as FileList | null,
        createdFileList: [] as IFile[],
        chatMessages: {} as IChatGroupMessageData,
        parentGroupId: '' as string,
        ChatTabs: ChatTabs,
        activeTab: (ChatTabs.Chat as string) || null,
        isAiTabActive: false as boolean,
        message: '' as string,
        isWelbore: false as boolean,
        members: [] as IMemberType[],
        memberIds: [] as string[],
        elementRef: null as EventTarget | null,
        priorityLevel: 0 as number,
        priorityClass: '' as string,
        prioritylist: [
          { label: 'Normal', value: PriorityLevel.Normal, class: 'normal-priority', icon: 'important-icon' },
          { label: 'Low', value: PriorityLevel.Low, class: 'low-priority', icon: 'important-icon' },
          { label: 'Medium', value: PriorityLevel.Medium, class: 'medium-priority', icon: 'important-icon' },
          { label: 'High', value: PriorityLevel.High, class: 'high-priority', icon: 'important-icon' },
        ] as MenuItem[],
        chatOptionList: [] as MenuItem[],
        memberMenuList: [] as MenuItem[],
        menuItems: [] as MenuItem[],
        showEmojiPicker: false as boolean,
        contextMenuType: '',
        curveData: {} as any,
        isMessageLoading: true as boolean,
        inputMsgValidation: '' as string,
        validationPromptTimeout: null as NodeJS.Timeout | null,
        lazyloaderTimeout: null as NodeJS.Timeout | null,
        hasFetchedAllMessages: false as boolean,
      };
    },
    computed: {
      currentMemberId() {
        return store.userInfo.MEMBERID;
      },
      chatFiles(): IFile[] {
        return this.chatMessages[this.parentGroupId].filter((message) => Array.isArray(message.Files)).flatMap((message) => message.Files ?? []);
      },
      chatVideoFiles(): IFile[] {
        return this.chatMessages[this.parentGroupId]
          .filter((message) => Array.isArray(message.Files) && message?.Files?.some((file) => file.FileType?.startsWith('video/')))
          .flatMap((message) => message.Files ?? [])
          .filter((file) => file?.FileType?.startsWith('video/'));
      },
      memberList(): { [key: string]: IMemberType } {
        return this.members.reduce(
          (acc, member) => {
            acc[member.MemberId] = member;
            return acc;
          },
          {} as { [key: string]: IMemberType }
        );
      },
      filteredMessageList() {
        if (!this.chatMessages[this.parentGroupId]?.length) return [];
        if (!this.filterInput) {
          return this.chatMessages[this.parentGroupId];
        }
        const filteredList: IChatMessage[] = JSON.parse(JSON.stringify(this.chatMessages[this.parentGroupId]));

        const filterRegex = new RegExp(`(${this.filterInput})`, 'gi');
        return filteredList.map((filteredMessage) => {
          filteredMessage.Message = filteredMessage.Message.replace(filterRegex, '<span class="highlight-text">$1</span>');
          return filteredMessage;
        });
      },
    },
    watch: {
      groupItem() {
        this.isMessageLoading = false;
        this.hasFetchedAllMessages = false;
        this.message = '';
        this.createdFileList = [];
        this.activeTab = ChatTabs.Chat;
        this.isAiTabActive = false;
        this.parentGroupId = String(this.groupItem.ParentGroupId);
        this.resetChatPage();
        this.initCurveStreaming();
        this.fetchInitData();
        this.updateLastMessageRead();
      },
      filterInput() {
        this.onSearchInput();
      },
    },
    mounted() {
      this.parentGroupId = String(this.groupItem.ParentGroupId);
      this.fetchAllChatMessages();
      this.initCurveStreaming();
      this.fetchInitData();
      webSocketClient.on(WsServerEvents.STATUS_CHANGE, this.onMemberStatusChange);
      webSocketClient.on(WsServerEvents.CHAT_MESSAGE_TRANSMIT, this.handleReceivedMsg);
      webSocketClient.on(WsServerEvents.CHAT_MESSAGE_UPDATE, this.handleMessageUpdate);
      document.addEventListener('click', this.handleClickOutside);
      this.updateLastMessageRead();
    },
    beforeUnmount() {
      webSocketClient.off(WsServerEvents.STATUS_CHANGE, this.onMemberStatusChange);
      webSocketClient.off(WsServerEvents.CHAT_MESSAGE_TRANSMIT, this.handleReceivedMsg);
      webSocketClient.off(WsServerEvents.CHAT_MESSAGE_UPDATE, this.handleMessageUpdate);
    },
    methods: {
      handleClickOutside(event: MouseEvent) {
        const dropdown = document.querySelector('.emoji-picker');
        const content = document.querySelector('#emoji-picker');
        if (dropdown && !dropdown.contains(event.target as Node) && !content?.contains(event.target as Node)) {
          this.showEmojiPicker = false;
        }
      },
      onEmojiSelected(emoji: string) {
        const inputMsgRef = this.$refs['input-message'] as HTMLInputElement;
        this.insertTextAtCursor(inputMsgRef, emoji);
        this.showEmojiPicker = false;
      },
      toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
      },
      insertTextAtCursor(element: HTMLInputElement, textToAdd: string) {
        const start_position = element.selectionStart ?? 0;
        const end_position = element.selectionEnd ?? 0;

        this.message = `${this.message.substring(0, start_position)}${textToAdd}${this.message.substring(end_position)}`;

        this.$nextTick(() => {
          const new_position = start_position + textToAdd.length;
          element.setSelectionRange(new_position, new_position);
          element.focus();
        });
      },
      async fetchInitData() {
        if (this.groupItem.Members?.some((data) => data.MemberId === this.currentMemberId)) {
          if (this.groupItem.Members?.length) {
            const memberIds = this.groupItem.Members.map((member) => member.MemberId as string);
            if (memberIds?.length) {
              this.fetchMembers(memberIds);
            }
          }
          this.scrollToBottom();
        }
      },
      findMatchedMembers() {
        if (!this.groupItem || !this.groupItem.Members || this.groupItem.Members.length === 0) {
          return [];
        }
        const filteredArray = this.groupItem.Members.map((groupMember: Partial<IChatMembers>) => {
          const matchedMember = this.memberList[groupMember.MemberId as string];
          if (matchedMember) {
            return {
              label: matchedMember.Name || '',
              value: matchedMember.MemberId as string,
              icon: matchedMember.Image || '',
              data: { status: matchedMember.OnlineStatus as UserStatus },
            };
          }
          return null;
        }).filter((item) => item !== null);
        this.memberMenuList = filteredArray;
      },
      async fetchMembers(memberIds: string[]) {
        try {
          const response = (await Api.submit('members/byId', memberIds)) ?? [];
          response.forEach((m: IMemberType) => {
            const existingMemberIndex = this.members.findIndex((member: IMemberType) => m.MemberId === member.MemberId);
            if (existingMemberIndex > -1) {
              this.members[existingMemberIndex] = m;
            } else {
              this.members.push(m);
            }
          });
          this.members = [...this.members, ...response];
          this.findMatchedMembers();
        } catch {
          store.showToast(ToastType.ERROR, 'Error fetching members');
        }
      },
      showContextMenu(type: ContextMenuType) {
        this.elementRef = null;
        this.$nextTick(() => {
          this.contextMenuType = type;
          if (type === ContextMenuType.Member) {
            this.menuItems = this.memberMenuList;
            this.elementRef = this.$refs['memberContainer'] as HTMLElement;
          } else if (type === ContextMenuType.Priority) {
            this.menuItems = this.prioritylist.map((item) => {
              return {
                label: item.label,
                icon: item.icon,
                value: item.value,
                class: item.class + '-color',
              };
            });
            this.elementRef = this.$refs['contextPrioritySource'] as HTMLElement;
          } else if (type === ContextMenuType.ChatOptions) {
            this.menuItems = this.getChatOptionsMenuItems();
            this.elementRef = this.$refs['chatOptionsContainer'] as HTMLElement;
          }
        });
      },
      getChatOptionsMenuItems(): MenuItem[] {
        return [
          { label: 'Export', icon: 'upload-icon', value: 'export' },
          { label: this.groupItem.Pin ? 'Unpin' : 'Pin', icon: this.groupItem.Pin ? 'unpin-icon' : 'pin-icon', value: 'pin' },
          // TODO: Due to low priority Snooze & Mute disabled for now. Can be enabled later.
          // { label: this.groupItem.Snooze ? 'Unsnooze' : 'Snooze', icon: 'snooze-icon', value: 'snooze' },
          // { label: this.groupItem.Mute ? 'Unmute' : 'Mute', icon: this.groupItem.Mute ? 'unmute-icon' : 'mute-icon', value: 'mute' },
        ] as MenuItem[];
      },
      async selectedMenuItem(payload: MenuItem) {
        if (this.contextMenuType === ContextMenuType.Priority) {
          this.priorityLevel = Number(payload.value);
          this.priorityClass = payload.class || '';
        } else if (this.contextMenuType === ContextMenuType.ChatOptions) {
          switch (payload.value) {
            case 'pin':
              await this.updateStatus('Pin', !this.groupItem.Pin);
              break;
            case 'snooze':
              await this.updateStatus('Snooze', !this.groupItem.Snooze);
              break;
            case 'mute':
              await this.updateStatus('Mute', !this.groupItem.Mute);
              break;
            default:
              break;
          }
        }
      },
      async updateStatus(key: keyof IChatGroupSettings, value: boolean) {
        const data = { [key]: value };
        const response = await Api.patch(`chatmembers/${this.groupItem.ParentGroupId}`, data);
        if (response) {
          this.$emit('onUpdateStatus', { label: key, data: value });
        } else {
          store.showToast(ToastType.ERROR, 'Error updating status');
        }
      },
      setActiveTab(tab: ChatTabs) {
        this.isAiTabActive = false;
        this.activeTab = tab;
        if (tab === ChatTabs.Chat) {
          this.scrollToBottom();
        }
      },
      onAiTabBtnClick() {
        this.isAiTabActive = true;
        this.activeTab = null;
      },
      initCurveStreaming() {
        if (this.groupItem.Channels) {
          //Filter out the channels to stream and remove already streaming channels.
          const channelsToStream = this.groupItem.Channels.filter((c) => c.ChannelId && !this.curveData[c.ChannelId]);
          if (channelsToStream.length > 0) {
            const channelList = channelsToStream.map((channel) => channel.ChannelId).filter((c) => c !== undefined);
            ChannelDataService.startStreaming({ ChannelIds: channelList, callback: this.handleCurveData });
          }
        }
      },
      handleReceivedMsg(res: WsChatMessageTransmit) {
        const data: IChatMessage = res.response!;
        this.chatMessages[res.ParentGroupId].push(data);
        this.scrollToBottom();
        if (res.ParentGroupId === this.parentGroupId) {
          this.updateLastMessageRead(5000);
        } else {
          this.emitMessageNotification(this.chatMessages[res.ParentGroupId], res.ParentGroupId);
        }
      },
      handleMessageUpdate(res: WsChatMessageUpdate) {
        const data = res;
        const msgIndex = this.chatMessages[res.ParentGroupId].findIndex((msg: IChatMessage) => msg.ChatMessageId === data.MessageId);
        if (msgIndex > -1) {
          const message = this.chatMessages[res.ParentGroupId][msgIndex];
          if (!message.Reactions) {
            message.Reactions = [];
          }
          const reactionIndex = message.Reactions?.findIndex((reaction) => reaction.MemberId === data.Data.MemberId) ?? -1;
          if (reactionIndex > -1) {
            if (message.Reactions && message.Reactions?.[reactionIndex]?.EmojiName !== data.Data.EmojiName) {
              if (!message.Reactions) {
                message.Reactions = [];
              }
              message.Reactions[reactionIndex] = data.Data;
            } else {
              message.Reactions?.splice(reactionIndex, 1);
            }
          } else {
            message.Reactions?.push(data.Data);
          }
        }
      },
      handleCurveData(data: DataStoreChannelDataItem[]) {
        if (data && Array.isArray(data)) {
          data.forEach((curvedata: DataStoreChannelDataItem) => {
            this.curveData[curvedata.ChannelId] = curvedata;
          });
        } else {
          Logger.Info(`Chat Curve Streaming data received : ${data}`);
        }
      },
      async submitMessage() {
        const inputMsgFieldRef = this.$refs['input-message-field'] as InstanceType<typeof Field>;
        const validationResult = await inputMsgFieldRef.validate();
        if (!validationResult.valid && this.createdFileList?.length === 0) {
          this.showValidationPrompt('Please type a message to continue.');
          return;
        }

        this.sendMessage();
      },
      async sendMessage() {
        if (this.message || this.createdFileList?.length) {
          const metaData = this.groupItem.Channels?.map((c: IMemberGroupChannel) => {
            const channelId = c.ChannelId ? c.ChannelId : -1;
            if (channelId === -1 || (!this.curveInitialData[channelId] && !this.curveData[channelId])) {
              return null;
            }
            const curve = this.curveData[channelId] ? this.curveData[channelId] : this.curveInitialData[channelId];
            return {
              DisplayName: c.ChannelName,
              Value: curve.Value,
              Unit: c.ChannelUom,
            };
          }).filter((md) => md != null);
          const data: IChatMessageBase = {
            Message: this.message,
            ChatGroupId: this.groupItem.ChatGroupId.toString(),
            ParentId: this.groupItem.ParentId,
            ParentGroupId: this.groupItem.ParentGroupId,
            PriorityLevel: this.priorityLevel,
            MetaData: metaData,
            Files: this.createdFileList,
          };

          sendMessage(WsClientEvents.CHAT_MESSAGE, data);
          this.message = '';
          this.createdFileList = [];
          this.priorityLevel = PriorityLevel.Normal;
          this.priorityClass = '';
          this.updateLastMessageRead(3000);
        }
      },
      async onAiAssistantClick() {
        this.message = 'This feature is under development.';
        await this.sendMessage();
        this.message = '';
      },
      onMemberStatusChange(data: WsStatusChangeMessage) {
        const memberIndex = this.members.findIndex((m) => m.MemberId === data.memberId);
        if (memberIndex > -1) {
          this.members[memberIndex].OnlineStatus = data.status;
          // Trigger update in Context menu list
          this.findMatchedMembers();
          this.elementRef = this.$refs['memberContainer'] as HTMLElement;
        }
      },
      async fetchAllChatMessages() {
        const query = {
          limit: 200,
        };
        const response = await Api.fetch(`chatmessage`, undefined, query);
        if (response) {
          for (const key in response) {
            this.chatMessages[key] = (response[key] as IChatMessage[]).sort((a, b) => a.CreatedDate - b.CreatedDate);
          }
          this.emitMessageNotification();
          this.scrollToBottom();
          this.isMessageLoading = false;
        } else {
          this.isMessageLoading = false;
        }
      },
      async fetchChatMessages(options?: { skip?: number; limit?: number }, callbackFn?: () => void) {
        try {
          const query = {
            skip: options?.skip ? options.skip : this.chatMessages[this.parentGroupId].length,
            limit: options?.limit ? options.limit : 200,
            search: this.filterInput,
          };
          const response = await Api.fetch(`chatmessage/${this.groupItem.ChatGroupId}/${this.groupItem.ParentId}`, undefined, query);
          if (response && response.data && response.data.length > 0) {
            const chatPage = (response.data as IChatMessage[]).sort((a, b) => a.CreatedDate - b.CreatedDate);
            this.chatMessages[this.parentGroupId] = [...chatPage, ...this.chatMessages[this.parentGroupId]];
            this.isMessageLoading = false;
            if (callbackFn) {
              callbackFn();
            }
          } else {
            this.hasFetchedAllMessages = true;
            this.isMessageLoading = false;
          }
        } catch {
          store.showToast(ToastType.ERROR, 'Error fetching messages');
        }
      },
      onSearchInput() {
        this.chatMessages[this.parentGroupId] = [];
        this.hasFetchedAllMessages = false;
        this.isMessageLoading = true;
        if (this.lazyloaderTimeout) {
          clearTimeout(this.lazyloaderTimeout);
        }
        this.lazyloaderTimeout = setTimeout(() => {
          this.fetchChatMessages({ skip: 0, limit: 200 }, this.scrollToBottom);
        }, 500);
      },
      async uploadFile() {
        const uploadfile = this.$refs.attachFile as HTMLInputElement;
        this.attachFile = uploadfile?.files;

        if (this.attachFile && this.attachFile.length) {
          // Restriction: Maximum file size (100MB)
          const maxFileSize = 100 * 1024 * 1024; // 100MB in bytes

          for (const file of this.attachFile) {
            // Validate file type
            if (!allowedFileTypes.some((type) => file.type.match(type))) {
              store.showToast(ToastType.ERROR, `File ${file.name} is not a supported type.`, 5000);
              uploadfile.value = '';
              this.attachFile = null;
              return;
            }
            // Validate file size
            else if (file.size > maxFileSize) {
              store.showToast(ToastType.ERROR, `File : ${file.name} exceeds the size limit of ${maxFileSize / (1024 * 1024)}MB.`, 5000);
              uploadfile.value = '';
              this.attachFile = null;
              return;
            }
          }

          const formdata = new FormData();
          formdata.append('file', this.attachFile[0]);
          formdata.append('type', 'chat-message');

          const path: IFile = await Api.upload('file/' + this.groupItem.ChatGroupId, formdata);
          if (path && this.attachFile && this.attachFile.length) {
            this.createdFileList.push({
              File: path.File.replace('dist', ''),
              FileName: this.attachFile[0].name,
              Size: this.attachFile[0].size,
              FileExtension: path.FileExtension ?? '',
              FileType: path.FileType ?? '',
            });
          }
          // Clear the file input and reset attachFile
          if (uploadfile) {
            uploadfile.value = '';
          }
          this.attachFile = null;
        }
      },
      scrollToBottom() {
        this.$nextTick(() => {
          const chatContainer = this.$refs.chatContainer as HTMLDivElement;
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        });
      },
      getFileSize(size?: number) {
        if (!size || size <= 0) return '0 Bytes';
        const i = Math.min(Math.floor(Math.log(size) / Math.log(1024)), fileSizeUnits.length - 1);
        return `${(size / Math.pow(1024, i)).toFixed(2)} ${fileSizeUnits[i]}`;
      },
      closefile(file: string) {
        const index = this.createdFileList.findIndex((item: any) => item.File === file);
        this.deleteFile(this.createdFileList[index].File);
        this.createdFileList.splice(index, 1);
      },
      async deleteFile(filePath: string) {
        try {
          if (filePath) {
            const encodedPath = encodeURIComponent(filePath);
            await Api.delete('file', encodedPath);
          }
        } catch (error) {
          Logger.Error('Error deleting file', error);
        }
      },
      resetChatPage() {
        this.priorityLevel = PriorityLevel.Normal;
        this.priorityClass = '';
      },
      handleChatScroll(event: Event) {
        const container = event.target as HTMLElement;
        if (container.scrollTop <= 100 && !this.isMessageLoading && !this.hasFetchedAllMessages) {
          // Trigger message loading when scrolled to the top
          if (this.lazyloaderTimeout) {
            clearTimeout(this.lazyloaderTimeout);
          }
          this.lazyloaderTimeout = setTimeout(() => {
            this.isMessageLoading = true;
            this.fetchChatMessages();
          }, 100);
        }
      },
      showValidationPrompt(message: string) {
        this.inputMsgValidation = message;
        if (this.validationPromptTimeout) {
          clearTimeout(this.validationPromptTimeout);
        }
        this.validationPromptTimeout = setTimeout(() => {
          this.inputMsgValidation = '';
        }, 3000);
      },
      updateLastMessageRead(timeoutInterval = 10000) {
        setTimeout(async () => {
          if (this.chatMessages[this.parentGroupId].length > 0) {
            const lastMessageIndex = this.chatMessages[this.parentGroupId].length - 1;
            const lastMessage = this.chatMessages[this.parentGroupId][lastMessageIndex];
            if (lastMessage.CreatedDate > this.groupItem.LastReadMessageAt) {
              const dataUpdate = {
                LastReadMessageAt: lastMessage.CreatedDate,
              };
              const response = await Api.patch(`chatmembers/${this.groupItem.ParentGroupId}`, dataUpdate);
              if (response) {
                const updatedGroup = this.groupItem;
                updatedGroup.LastReadMessageAt = lastMessage.CreatedDate;
                this.$emit('onChatGroupUpdate', updatedGroup);
                this.emitMessageNotification(this.chatMessages[this.parentGroupId], this.parentGroupId);
              }
            }
          }
        }, timeoutInterval);
      },
      calculateUnreadMessageCount(messageList: IChatMessage[], lastReadMessageAt: number) {
        const unreadMessages = messageList.filter((message) => message.CreatedDate > lastReadMessageAt && message.SenderId !== this.currentMemberId);
        return unreadMessages.length;
      },
      emitMessageNotification(messageList?: IChatMessage[], parentGroupId?: string) {
        if (messageList && parentGroupId) {
          const chatgroup = this.chatGroupList.find((g) => g.ParentGroupId === parentGroupId);
          if (chatgroup) {
            const unreadMessageCount = this.calculateUnreadMessageCount(messageList, chatgroup.LastReadMessageAt);
            const groupUnreadCount: GroupMessageNotifications = {
              [parentGroupId]: { unreadMessageCount },
            };
            this.$emit('onGroupMessageNotification', groupUnreadCount);
          }
        } else {
          const groupUnreadCount: GroupMessageNotifications = {};
          for (const parentGroupId in this.chatMessages) {
            const chatgroup = this.chatGroupList.find((g) => g.ParentGroupId === parentGroupId);
            const unreadMessageCount = chatgroup
              ? this.calculateUnreadMessageCount(this.chatMessages[parentGroupId], chatgroup.LastReadMessageAt)
              : 0;
            groupUnreadCount[parentGroupId] = { unreadMessageCount };
          }
          this.$emit('onGroupMessageNotification', groupUnreadCount);
        }
      },
    },
  });
</script>

<style scoped>
  .chatarea-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    background-color: var(--bg-quaternary);
    color: var(--text-tertiary);
    padding: 15px 3rem;
  }

  .chatarea-header {
    display: flex;
    height: 35px;
    margin-bottom: 5px;
  }

  .chatarea-header-box {
    display: flex;
    gap: 5px;
    border: 1px solid var(--border-tertiary);
    background: var(--bg-septenary);
    border-radius: 5px;
  }

  .activity-box,
  .search-box {
    padding: 8px 0;
    flex-basis: 25%;
    overflow: hidden;
  }

  .tab-box {
    padding: 8px 0;
    flex-basis: 50%;
  }

  .chatarea-title {
    color: var(--text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-title-header {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .wellbore-details {
    display: flex;
    gap: 10px;
    align-items: center;
    color: var(--text-secondary);
  }

  .chat-members {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .chatarea-main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 25px 0px;
    margin-right: -3rem;
    padding-right: 3rem;
  }

  .tab-item {
    padding: 8px 0;
    position: relative;
    cursor: pointer;
    flex-basis: 100px;
    flex-grow: 1;
    text-align: center;
  }

  .ai-tab-item {
    padding-right: 10px;
    cursor: pointer;
    position: relative;
    flex-basis: 140px;
    flex-grow: 1;
    flex-shrink: 0;
    text-align: center;
    white-space: nowrap;
  }

  .chatarea-footer {
    display: flex;
    gap: 5px;
    border: 1px solid var(--border-tertiary);
    background: var(--bg-septenary);
    border-radius: 5px;
    align-items: center;
    height: 50px;
    flex-shrink: 0;
    padding: 0px 10px;
    margin: 5px 0px 0px 0px;
  }

  .chatarea-messagebox {
    background-color: transparent;
    border: none;
    padding: 7px 12px;
    width: 100%;
    height: 100%;
    outline: none;
  }

  .chatarea-footer input::placeholder {
    color: var(--placeholder-color);
  }

  .chatarea-msg-action-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 5px;
    padding-left: 5px;
  }

  .fileupload-display {
    background-color: var(--bg-septenary);
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    border: 1px solid var(--border-primary);
    max-height: 150px;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .inputmessage-prompt {
    padding: 5px 10px;
    background-color: var(--bg-septenary);
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
    max-height: 150px;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .file-icon {
    color: var(--bg-tertiary);
  }

  .sent-file {
    display: flex;
    padding: 10px;
    border-bottom: 1px solid var(--border-primary);
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .file-subcontent {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }

  .preview-image {
    max-width: 100px;
    max-height: 100px;
    object-fit: cover;
    border: 1px solid var(--border-primary);
    border-radius: 3px;
  }

  .file-error {
    color: var(--error-color);
    text-align: center;
  }

  .ai-summary-icon {
    height: 200px;
    width: 200px;
  }
</style>
