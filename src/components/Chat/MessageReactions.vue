<template>
  <div
    v-show="reactions && reactions.length > 0"
    class="message-reactions-container"
    :class="{ 'highlight-reaction-box': isMouseOverReactionBox }"
    :style="elementStyle"
    @mouseenter="onRectionBoxEnter"
    @mouseleave="onReactionBoxLeave">
    <div class="d-flex">
      <div v-for="(reaction, index) in reactionSummaryList" :key="index" class="emoji-reaction d-flex align-center">
        <span>
          {{ reaction.emoji }}
        </span>
        <span v-if="reaction.count > 1" class="fontSize-12">
          {{ reaction.count }}
        </span>
      </div>
    </div>
    <transition name="popup-transition-primary">
      <div
        v-show="isMouseOverReactionBox"
        ref="reactionsView"
        class="message-reactions-view scroll-y-auto scroll primary"
        :style="reactionsViewStyle">
        <div class="d-flex flex-col gap5">
          <div v-for="(r, rIndex) in reactions" :key="rIndex" class="d-flex gap10 align-items-center justify-content-space-between">
            <div class="d-flex gap5 align-items-center text-ellipsis">
              <ProfileImage :name="memberList[r.MemberId]?.Name" :image="memberList[r.MemberId]?.Image" class="member-avatar" />
              <span class="fontSize-12 text-ellipsis">{{ memberList[r.MemberId]?.Name }}</span>
            </div>
            <span>{{ r.Emoji }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
  import { CSSProperties, defineComponent, PropType } from 'vue';
  import ProfileImage from '../../components/ProfileImage.vue';
  import { IReaction } from '../../../server/interfaces/chatmessage.interfaces';
  import { IMemberType } from '../../../server/interfaces/member.interfaces';

  export interface IReactionSummary {
    name: string;
    emoji: string;
    count: number;
  }

  export default defineComponent({
    name: 'MessageReactions',
    components: {
      ProfileImage,
    },
    props: {
      target: {
        type: String as PropType<string>,
        required: true,
      },
      reactions: {
        type: Array as PropType<IReaction[]>,
        required: false,
      },
      memberList: {
        type: Object as () => { [key: string]: IMemberType },
        required: true,
      },
    },
    data() {
      return {
        elementStyle: { bottom: '0px', right: '0px' } as CSSProperties,
        reactionsViewStyle: {} as CSSProperties,
        isVisible: true as boolean,
        targetElement: null as HTMLElement | null,
        isMouseOverReactionBox: false as boolean,
        reactionSummaryList: [] as IReactionSummary[],
        resizeObserver: null as ResizeObserver | null,
      };
    },
    watch: {
      reactions: {
        handler() {
          this.processReactionsData();
          this.updatePosition();
        },
        immediate: true,
        deep: true,
      },
    },
    mounted() {
      this.targetElement = document.getElementById(this.target) as HTMLElement;
      this.updatePosition();
      this.setupResizeObserver();
      this.processReactionsData();
    },
    beforeUnmount() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    },
    methods: {
      processReactionsData() {
        if (this.reactions) {
          this.reactionSummaryList = this.reactions.reduce((acc, reaction) => {
            const index = acc.findIndex((r) => r.name === reaction.EmojiName);
            if (index === -1) {
              acc.push({ name: reaction.EmojiName, emoji: reaction.Emoji, count: 1 });
            } else {
              acc[index].count++;
            }
            return acc;
          }, [] as IReactionSummary[]);
        }
      },
      onRectionBoxEnter() {
        this.isMouseOverReactionBox = true;
        this.updateReactionViewPosition();
      },
      onReactionBoxLeave() {
        setTimeout(() => {
          this.isMouseOverReactionBox = false;
        }, 100);
      },
      updatePosition() {
        this.$nextTick(() => {
          const reactionBox = this.$el as HTMLElement;

          if (!reactionBox) return;

          const reactionBoxHeight = reactionBox.offsetHeight;

          const bottom = reactionBoxHeight / 4 - reactionBoxHeight;
          this.elementStyle.bottom = `${bottom}px`;
        });
      },
      updateReactionViewPosition() {
        this.$nextTick(() => {
          if (!this.targetElement) return;

          const targetRect = this.targetElement.getBoundingClientRect();

          const reactionsView = this.$refs.reactionsView as HTMLElement;
          const reactionViewWidth = reactionsView.offsetWidth;

          const chatContainer = document.getElementById('chatContainer') as HTMLDivElement;
          const chatContainerRect = chatContainer.getBoundingClientRect();

          if (targetRect.right - chatContainerRect.left < reactionViewWidth) {
            const right = targetRect.width - reactionViewWidth;
            this.reactionsViewStyle.right = `${right}px`;
          }
        });
      },
      setupResizeObserver() {
        if (!this.targetElement) return;

        const resizeObserver = new ResizeObserver(() => {
          this.updatePosition();
        });
        resizeObserver.observe(this.targetElement);
        this.resizeObserver = resizeObserver;
      },
    },
  });
</script>

<style scoped>
  .message-reactions-container {
    position: absolute;
    padding: 1px 3px;
    z-index: 1;
    background-color: var(--bg-septenary);
    border: 1px solid var(--border-tertiary);
    border-radius: 15px;
    cursor: pointer;
  }

  .emoji-reaction {
    padding: 2px 3px;
  }

  .message-reactions-view {
    position: absolute;
    right: 0px;
    padding: 10px;
    z-index: 1;
    background-color: var(--bg-septenary);
    border: 1px solid var(--border-tertiary);
    border-radius: 5px;
    width: 190px;
    max-height: 200px;
  }

  .member-avatar {
    width: 20px;
    height: 20px;
  }

  .highlight-reaction-box {
    z-index: 5;
  }
</style>
