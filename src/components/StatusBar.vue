<template>
  <div :class="'statusBar'" :style="statusBarStyle"></div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'StatusBar',
    props: {
      color: String,
    },
    computed: {
      statusBarStyle() {
        return {
          backgroundColor: this.color,
        };
      },
    },
  });
</script>

<style scoped>
  .statusBar {
    width: 100%;
    height: 2px;
    flex: none;
    background-color: var(--success-color);
  }
  .alarm {
    background-color: var(--error-color);
  }
  .warning {
    background-color: var(--warning-color);
  }
  .normal {
    background-color: var(--success-color);
  }
  .none {
    border-top: 1px solid var(--grid-item-border);
  }
  .statusBar.none {
    border-top: 0;
    height: 0;
  }
</style>
