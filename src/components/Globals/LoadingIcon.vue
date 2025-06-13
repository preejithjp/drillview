<template>
  <!-- Container for the backdrop and spinner -->
  <div class="loading-icon-overlay" :style="{ backgroundColor: backdropColor }">
    <div class="loading-icon-wrap">
      <svg viewBox="0 0 100 100" class="svg-icon size50" stroke="currentColor">
        <circle fill="none" stroke="" stroke-width="8" cx="50" cy="50" r="44" opacity=".4" />
        <circle fill="none" stroke="" stroke-width="8" cx="50" cy="50" r="44" opacity=".97" stroke-dasharray="94.24778 219.91149">
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            begin="0s"
            dur="1s"
            additive="sum"
            repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';

  export default defineComponent({
    name: 'LoadingIcon',
    props: {
      backdropColor: {
        type: String as PropType<string>,
        default: 'rgb(0 0 0 / 28%)', // Default background color
      },
    },
  });
</script>

<style scoped>
  .loading-icon-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: all;
  }

  .loading-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--bg-primary);
  }
</style>
