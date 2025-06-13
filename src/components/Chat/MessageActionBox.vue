<template>
  <transition name="popup-transition-primary">
    <div
      v-show="isVisible || isMouseOverActionBox"
      class="message-actionbox-container"
      :style="elementStyle"
      @mouseenter="onActionBoxEnter"
      @mouseleave="onActionBoxLeave">
      <div class="d-flex">
        <span v-for="(item, index) in emojiList" :key="index" class="emoji-reaction selectable-item" @click="handleEmojiClick(item)">
          {{ item.emoji }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
  import { Api } from '@/services/api.services';
  import { IChatMessage, IReaction } from '../../../server/interfaces/chatmessage.interfaces';
  import { defineComponent, PropType, CSSProperties } from 'vue';
  import { store } from '@/main';
  import { IMemberGroupData } from '../../../server/interfaces/chatgroup.interfaces';

  export interface IEmoji {
    name: string;
    emoji: string;
  }

  export default defineComponent({
    name: 'MessageActionBox',
    props: {
      chatgroup: {
        type: Object as PropType<IMemberGroupData>,
        required: true,
      },
      target: {
        type: String as PropType<string>,
        required: true,
      },
      message: {
        type: Object as PropType<IChatMessage>,
        required: true,
      },
    },
    data() {
      return {
        elementStyle: {} as CSSProperties,
        isVisible: false,
        targetElement: null as HTMLElement | null,
        isMouseOverActionBox: false,
        emojiList: [
          { name: 'thumbsup', emoji: '👍' },
          { name: 'thumbsdown', emoji: '👎' },
          { name: 'heart', emoji: '❤️' },
        ] as IEmoji[],
      };
    },
    watch: {},
    mounted() {
      this.targetElement = document.getElementById(this.target) as HTMLElement;
      if (this.targetElement) {
        this.targetElement.addEventListener('mouseenter', this.showActionBox);
        this.targetElement.addEventListener('mouseleave', this.hideActionBox);
      }
    },
    beforeUnmount() {
      if (this.targetElement) {
        this.targetElement.removeEventListener('mouseenter', this.showActionBox);
        this.targetElement.removeEventListener('mouseleave', this.hideActionBox);
      }
    },
    methods: {
      async handleEmojiClick(emoji: IEmoji) {
        const data: Partial<IReaction> = {
          EmojiName: emoji.name,
          Emoji: emoji.emoji,
        };
        await Api.patch(`chatmessage/${this.chatgroup.ParentGroupId}/${this.message.ChatMessageId}`, data);
      },
      showActionBox() {
        this.isVisible = true;
        this.$nextTick(this.updatePosition);
      },
      hideActionBox() {
        this.isVisible = false;
      },
      onActionBoxEnter() {
        this.isMouseOverActionBox = true;
      },
      onActionBoxLeave() {
        this.isMouseOverActionBox = false;
      },
      updatePosition() {
        this.$nextTick(() => {
          if (!this.targetElement) return;

          const targetRect = this.targetElement.getBoundingClientRect();
          const actionBox = this.$el as HTMLElement;

          if (!actionBox) return;

          const actionBoxWidth = actionBox.offsetWidth;

          // Position the action box above the target element
          const bottom = targetRect.height + 5;
          this.elementStyle.bottom = `${bottom}px`;

          if (store.userInfo.MEMBERID === this.message.SenderId) {
            const right = targetRect.width - actionBoxWidth;
            this.elementStyle.right = `${right}px`;
          } else {
            const left = targetRect.width - actionBoxWidth + 42;
            this.elementStyle.left = `${left}px`;
          }
        });
      },
    },
  });
</script>

<style scoped>
  .message-actionbox-container {
    position: absolute;
    padding: 1px;
    z-index: 1;
    background-color: var(--bg-septenary);
    box-shadow: 0 1px 1px var(--context-menu-box-shadow);
    border-radius: 5px;
  }

  .emoji-reaction {
    padding: 5px 3px;
  }
</style>
