<template>
  <emoji-picker class="emoji-picker" tabindex="0" :style="elementStyle" @emoji-click="handleEmojiClick"></emoji-picker>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import 'emoji-picker-element';

  export default defineComponent({
    name: 'EmojiPickerElement',
    emits: ['emojiSelected'],
    data() {
      return {
        elementStyle: { top: '0px', left: '0px' },
      };
    },
    mounted() {
      this.updatePosition();
    },
    methods: {
      handleEmojiClick(event: Event) {
        const emoji = (event as CustomEvent).detail.unicode;
        this.$emit('emojiSelected', emoji);
      },
      updatePosition() {
        this.$nextTick(() => {
          const sourceElement = document.getElementById('emoji-picker') as HTMLElement;
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
          this.elementStyle = {
            top: `${Math.max(0, top)}px`,
            left: `${Math.max(0, left)}px`,
          };
        });
      },
    },
  });
</script>

<style scoped>
  .emoji-picker {
    position: absolute;
    bottom: 60px;
    right: 0;
    z-index: 1;
  }
</style>
