<template>
  <div
    v-for="(message, index) in chatMessages"
    :key="message.ChatMessageId?.toString()"
    :class="{
      'msg-unread': isUnreadMessage(message),
    }">
    <div
      class="chat-msg"
      :class="{
        'same-user-msg': chatMessages[index + 1]?.SenderId === message.SenderId,
        'current-user': message.SenderId === currentMemberId,
      }">
      <MessageActionBox :chatgroup="chatgroup" :target="'message' + message.ChatMessageId" :message="message" />
      <div class="msg-wrapper">
        <div
          v-if="message.SenderId !== currentMemberId"
          class="profile-img p-relative"
          :class="{ mt25: chatMessages[index - 1]?.SenderId !== message.SenderId }">
          <template v-if="chatMessages[index - 1]?.SenderId !== message.SenderId">
            <ProfileImage
              :name="memberList[String(message.SenderId)]?.Name"
              :status="memberList[String(message.SenderId)]?.OnlineStatus"
              :image="memberList[String(message.SenderId)]?.Image"
              class="profile-img" />
          </template>
        </div>
        <div class="p-relative fontSize-14">
          <div
            v-if="message.SenderId !== currentMemberId && (shouldShowName(index) || shouldShowTime(index))"
            class="chat-msg-info gap10 fontMedium fontSize-10 capitalize">
            <div class="chat-msg-name">
              <span v-if="shouldShowName(index)" class="">{{ memberList[String(message.SenderId)]?.Name }}</span>
              <span v-if="shouldShowTime(index)">
                {{ displayChatTime(message.CreatedDate) }}
              </span>
            </div>
            <span>{{ memberList[String(message.SenderId)]?.OrganisationName }}</span>
          </div>
          <div v-if="message.SenderId === currentMemberId && shouldShowTime(index)" class="chat-msg-info fontMedium fontSize-10">
            <span>
              {{ displayChatTime(message.CreatedDate) }}
            </span>
          </div>
          <div
            :id="'message' + message.ChatMessageId"
            class="chat-msg-text"
            :class="message.PriorityLevel ? prioritylist[message.PriorityLevel].class + '-msg' : ''">
            <span
              v-if="message.PriorityLevel && message.PriorityLevel > 0"
              class="message-priority"
              :title="prioritylist[message.PriorityLevel].label">
              <SvgIcon name="important-circle-icon" class="svg-icon size20" :class="prioritylist[message.PriorityLevel].class + '-color'" />
            </span>
            <div v-if="message.MetaData && message.MetaData.length > 0" class="chat-msg-text-header fontMedium fontSize-11 text-ellipsis">
              <template v-if="message.MetaData">
                <span v-for="(metaData, ind) in message.MetaData" :key="ind" class="text-ellipsis">
                  {{ metaData.DisplayName }}: {{ metaData.Value }} {{ metaData.Unit }}
                </span>
              </template>
            </div>
            <div class="d-flex flex-col gap5 fontMedium fontSize-12">
              <div v-if="message.Message" class="msg-plain-text" v-html="enhanceChatMessage(message)"></div>
              <div v-if="message.Files?.length" class="file-attachment-list">
                <div v-for="(file, i) in message.Files" :key="i" class="file-attachment d-flex flex-col">
                  <div v-if="file.FileType!.startsWith('image/') || file.FileType!.startsWith('video/')" class="d-block">
                    <img v-if="file.FileType!.startsWith('image/')" :src="getFilePreview(file)" alt="Image preview" class="preview-file" />
                    <video v-else :src="file.File" controls loading="lazy" class="preview-file"></video>
                  </div>
                  <div class="file-info">
                    <SvgIcon
                      v-if="!file.FileType!.startsWith('image/') && !file.FileType!.startsWith('video/')"
                      name="clip-icon"
                      class="svg-icon size20" />
                    <span class="flex-full text-ellipsis" :title="file.FileName">
                      {{ file.FileName }}
                      <span class="fontLight">{{ getFileSize(file.Size) }}</span>
                    </span>
                    <SvgIcon name="import-icon" class="svg-icon size20 text-static-tertiary" @click="downloadImage(file)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <MessageReactions
            :target="'message' + message.ChatMessageId"
            :messageId="message.ChatMessageId as string"
            :reactions="message.Reactions"
            :memberList="memberList" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { IMemberType } from '../../../server/interfaces/member.interfaces';
  import { getInitials } from '@/common/utils';
  import { IChatMessage, IFile } from '../../../server/interfaces/chatmessage.interfaces';
  import ProfileImage from '@/components/ProfileImage.vue';
  import { store } from '@/main';
  import { MenuItem } from '../ContextMenu.vue';
  import { fileSizeUnits } from './ChatArea.vue';
  import MessageActionBox from './MessageActionBox.vue';
  import MessageReactions from './MessageReactions.vue';
  import { DateTimeUtils } from '@/common/datetime-utils';
  import { IMemberGroupData } from '../../../server/interfaces/chatgroup.interfaces';

  export default defineComponent({
    name: 'ChatMessages',
    components: {
      ProfileImage,
      MessageActionBox,
      MessageReactions,
    },
    props: {
      chatgroup: {
        type: Object as PropType<IMemberGroupData>,
        required: true,
      },
      members: {
        type: Object as PropType<IMemberType[]>,
        required: true,
      },
      chatMessages: {
        type: Object as PropType<IChatMessage[]>,
        required: true,
      },
      prioritylist: {
        type: Object as PropType<MenuItem[]>,
        required: true,
      },
    },
    data() {
      return {
        getInitials: getInitials,
        sizes: ['Bytes', 'KB', 'MB'],
      };
    },
    computed: {
      currentMemberId() {
        return store.userInfo.MEMBERID;
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
    },
    mounted() {},
    methods: {
      formatTimeWithoutSeconds(timestamp: number): string {
        const date = new Date(timestamp);
        return date.toTimeString().slice(0, 5);
      },
      // Determines if time should be shown for a specific message
      shouldShowTime(index: number): boolean {
        if (index === 0) return true; // Always show time for the first message

        const currentMessage = this.chatMessages[index];
        const previousMessage = this.chatMessages[index - 1];

        // Compare times
        const currentTime = this.formatTimeWithoutSeconds(currentMessage.CreatedDate);
        const previousTime = this.formatTimeWithoutSeconds(previousMessage.CreatedDate);

        // Show time if the sender is different, or the times are different
        return currentMessage.SenderId !== previousMessage.SenderId || currentTime !== previousTime;
      },
      shouldShowName(index: number): boolean {
        if (index === 0) return true; // Always show name for the first message

        const currentMessage = this.chatMessages[index];
        const previousMessage = this.chatMessages[index - 1];

        // Show name if the sender is different
        return currentMessage.SenderId !== previousMessage.SenderId;
      },
      getFileSize(size?: number) {
        if (!size || size <= 0) return '0 Bytes';
        const i = Math.min(Math.floor(Math.log(size) / Math.log(1024)), fileSizeUnits.length - 1);
        return `${(size / Math.pow(1024, i)).toFixed(2)} ${fileSizeUnits[i]}`;
      },
      async downloadImage(file: IFile) {
        const rawPath = file.File;
        const webCompatiblePath = this.formatPath(rawPath);
        const imagePath = '/' + webCompatiblePath;
        const response = await fetch(imagePath);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.FileName;
        link.click();
        URL.revokeObjectURL(url);
      },
      formatPath(filePath: any) {
        return filePath.replace(/\\/g, '/');
      },
      isImageFile(extension: string) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        return imageExtensions.includes(extension.toLowerCase());
      },
      getFilePreview(file: IFile) {
        const rawPath = file.File;
        const webCompatiblePath = this.formatPath(rawPath);
        const imagePath = '/' + webCompatiblePath;
        return imagePath;
      },
      enhanceChatMessage(message: IChatMessage) {
        let emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}|\uFE0F)/gu;
        // Check if the message contains only emojis
        const onlyEmojis = message.Message.replace(emojiRegex, '').trim() === '';

        // Regular expression to replace emoji characters
        emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
        return message.Message.replace(emojiRegex, (match: string) => {
          return onlyEmojis ? `<span class="fontSize-40">${match}</span>` : `<span class="fontSize-18">${match}</span>`;
        });
      },
      displayChatTime(timestamp: number) {
        const currentTimestamp = Date.now();
        const isSameDay = DateTimeUtils.isSame(currentTimestamp, timestamp, 'date');
        if (isSameDay) {
          return DateTimeUtils.toLocalDatetime(timestamp, 'hh:mi AM');
        } else {
          const isSameYear = DateTimeUtils.isSame(currentTimestamp, timestamp, 'year');
          if (isSameYear) {
            return DateTimeUtils.toLocalDatetime(timestamp, 'dd-mm hh:mi AM');
          } else {
            return DateTimeUtils.toLocalDatetime(timestamp, 'dd-mm-yyyy hh:mi AM');
          }
        }
      },
      isUnreadMessage(message: IChatMessage) {
        return this.chatgroup.Pin && message.CreatedDate > this.chatgroup.LastReadMessageAt && message.SenderId !== this.currentMemberId;
      },
    },
  });
</script>

<style scoped>
  .msg-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    width: fit-content;
    max-width: 85%;
  }

  .current-user .msg-wrapper {
    grid-template-columns: 1fr;
    max-width: 80%;
  }

  .chat-msg.current-user {
    align-items: flex-end;
  }

  .chat-msg.same-user-msg {
    margin-bottom: 10px;
  }

  .chat-msg-info {
    display: flex;
    white-space: nowrap;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
  }

  .current-user .chat-msg-info {
    display: flex;
    justify-content: end;
  }

  .current-user .msg-plain-text,
  .current-user .file-attachment-list {
    align-self: end;
  }

  .chat-msg {
    display: flex;
    flex-direction: column;
    padding-bottom: 3px;
    position: relative;
    margin-bottom: 25px;
    word-break: break-word;
    word-wrap: break-word;
  }

  .chat-msg.disabled-message {
    opacity: 0.5;
  }

  .chat-msg.disabled-message .chat-msg-info {
    justify-content: space-between;
  }

  .chat-msg-text {
    display: flex;
    flex-direction: column;
    padding: 10px 15px;
    background-color: var(--msg-bg-other-user);
    gap: 5px;
    border-radius: 8px;
  }

  .current-user .chat-msg-text {
    background-color: var(--msg-bg-current-user);
  }

  .chat-msg-text img {
    max-width: 300px;
    width: 100%;
    height: 100px;
  }

  .chat-msg-text-header {
    display: flex;
    justify-content: end;
    gap: 10px;
    color: var(--text-static-tertiary);
  }

  .current-user .chat-msg-text-header {
    justify-content: start;
  }

  .profile-img {
    width: 32px;
    height: 32px;
  }

  .file-attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: end;
  }

  .file-attachment {
    align-items: center;
    background: var(--bg-quaternary);
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
    padding: 10px;
    max-width: 250px;
    height: 100%;
    gap: 5px;
  }

  .file-info {
    width: 100%;
    display: flex;
    gap: 5px;
  }

  .preview-file {
    display: block;
    width: 100%;
    max-height: 200px;
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
    object-fit: cover;
  }

  .file-attachment-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: end;
  }

  .file-info {
    width: 100%;
    display: flex;
    gap: 5px;
  }

  .message-priority {
    position: absolute;
    right: -25px;
  }

  .chat-msg-text.high-priority-msg {
    border: 1px solid var(--high-priority);
    background-color: var(--highlight-soft-red);
  }

  [data-theme='dark'] .chat-msg-text.high-priority-msg {
    border: 1px solid var(--high-priority);
    background-color: var(--high-priority);
  }

  .current-user .message-priority {
    left: -25px;
    right: unset;
  }

  .chat-msg-name {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .msg-unread {
    background-color: var(--msg-unread-bg);
    border-radius: 10px;
    border: 1px solid var(--msg-unread-border);
    padding: 5px;
    margin-top: 5px;
  }
</style>
