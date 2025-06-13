<template>
  <div class="tool-bar p-fixed d-flex justify-content-space-between align-items-center" @click="$emit('close')">
    <div class="tool-bar-content d-flex align-items-center gap25">
      <template v-for="(widget, index) in widgets.slice(0, 9)" :key="index">
        <div class="widget-icon-container" :title="widget.title">
          <SvgIcon :name="widget.icon" class="svg-icon size24 brighter" @click.stop="handleAddWidget(widget.type)" />
        </div>
      </template>

      <span @click.stop="handleMoreOptions">
        <SvgIcon name="three-dot-icon" class="svg-icon size20" />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { WidgetDetails, WidgetType } from '../interfaces/dashboard.interfaces';
  export default defineComponent({
    name: 'ToolbarWidget',
    emits: ['close', 'addWidget', 'moreOption'],
    data() {
      return {
        widgets: WidgetDetails,
      };
    },
    methods: {
      closeTopBar() {
        this.$emit('close');
      },
      handleAddWidget(type: WidgetType) {
        this.$emit('addWidget', type);
      },
      handleMoreOptions() {
        this.$emit('moreOption');
      },
    },
  });
</script>

<style scoped>
  .tool-bar {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    background: var(--border-primary);
    padding: 0 1px 1px;
    border-radius: 0 0 33px 33px;
    clip-path: polygon(0% 0%, 4% 0%, 96% 0%, 100% 0%, 96% 100%, 4% 100%);
  }

  .tool-bar-content {
    padding: 13px 50px;
    background-color: var(--bg-quaternary);
    clip-path: polygon(0% 0%, 4% 0%, 96% 0%, 100% 0%, 96% 100%, 4% 100%);
    border-radius: 0 0 33px 33px;
  }
</style>
