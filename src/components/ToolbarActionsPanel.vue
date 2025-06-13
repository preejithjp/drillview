<template>
  <div class="toolbar d-flex flex-col height-100 p10">
    <div class="flex-full">
      <div class="p-relative">
        <SearchInput v-model="searchQuery" placeholder="Search Tool" />
      </div>
      <div class="widget-list d-flex flex-col fontSize-12">
        <div
          v-for="(widget, index) in filteredWidgets"
          :key="index"
          class="widget-item p10 d-flex align-items-center"
          @click.stop="handleAddWidget(widget.type)">
          <SvgIcon :name="widget.icon" class="svg-icon size20 mr10 brighter" />
          <span class="ml10">{{ widget.label }}</span>
        </div>
      </div>
    </div>
    <div>
      <CustomButton class="width-100" :size="BtnSizes.LARGE" @click.stop="closeSidebar">Close</CustomButton>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { WidgetDetails, WidgetType } from '../interfaces/dashboard.interfaces';
  import { BtnSizes } from './Globals/CustomButton.vue';

  export default defineComponent({
    name: 'ToolbarActionsPanel',
    emits: ['addWidget', 'closesidebar'],
    data() {
      return {
        BtnSizes: BtnSizes,
        selectedWidget: '' as WidgetType,
        searchQuery: '',
        widgets: WidgetDetails,
      };
    },
    computed: {
      filteredWidgets() {
        return WidgetDetails.filter((widget) => widget.title.toLowerCase().includes(this.searchQuery.toLowerCase())).map((widget) => ({
          ...widget,
          label: widget.title,
        }));
      },
    },
    methods: {
      handleAddWidget(type: WidgetType) {
        this.selectedWidget = type;
        this.$emit('addWidget', type);
      },
      closeSidebar() {
        this.$emit('closesidebar');
      },
    },
  });
</script>

<style scoped>
  .search-bar {
    padding: 8px 35px 8px 10px;
    border-radius: 5px;
    border: 1px solid var(--alarm-border-color);
  }
  .widget-list {
    color: var(--text-tertiary);
  }

  .widget-item:hover {
    background: var(--hover-primary);
    font-weight: bold;
  }
</style>
