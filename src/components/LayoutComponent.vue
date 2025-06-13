<template>
  <div :ref="layoutId" class="full-size">
    <GridLayout
      v-if="(layoutDetails as IDashboard)?.DashboardId || (layoutDetails as ILayout)?.LayoutId"
      v-model:layout="layoutDetails.Layout as ILayout['Layout']"
      :col-num="columWidth"
      :row-height="rowHeight"
      :is-draggable="dashboardAction === DashBoardAction.EDIT"
      :is-resizable="dashboardAction === DashBoardAction.EDIT"
      :vertical-compact="false"
      :margin="[0, 0]">
      <GridItem
        v-for="item in layoutDetails.Layout"
        :key="item.i"
        :data-id="item.LayoutId"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :min-w="2"
        :min-h="3"
        :class="[
          'sublayout',
          {
            active: selectedData == item.LayoutId && dashboardAction === DashBoardAction.EDIT,
            'l-item': item.Name == WidgetType.LAYOUT && dashboardAction === DashBoardAction.EDIT,
            'other-widget': item.Name != WidgetType.LAYOUT,
            backgroudGray: item.Name == WidgetType.LAYOUT && dashboardAction === DashBoardAction.EDIT,
          },
        ]"
        @resized="containerResizedEvent()"
        @click.stop="selectedLayout(item.LayoutId!, item.Layout)">
        <SvgIcon
          v-if="dashboardAction === DashBoardAction.EDIT"
          name="close-icon"
          class="svg-icon size10 remove secondary"
          @click.stop="removeData(layoutDetails.Layout!, item.i)" />
        <SvgIcon
          v-else-if="item.Name !== WidgetType.LAYOUT"
          v-outsideclick="onOutsideClick"
          name="settings-icon"
          class="svg-icon size16 settings"
          @click.stop="openWidgetProperties(item)" />
        <div v-if="item.Name != WidgetType.LAYOUT" class="widgets">
          <component
            :is="getComponentName(item.Name as WidgetType)"
            v-if="item.Name != WidgetType.LAYOUT"
            :chartId="item.i"
            :layoutId="item.LayoutId"
            :widgetSettingsDetail="item.SettingsDetails"
            :aciveWellbore="selectedWellbore"
            :resize="resize" />
          <div v-else>{{ item.Name }}</div>
        </div>
        <div v-if="item.Layout" class="widgets">
          <LayoutComponent
            class="layout-bg"
            :layoutData="item.PopulateLayout"
            :selectedData="selectedData"
            :columnNumber="item.w"
            :layoutId="item.LayoutId"
            :rowHeight="rowHeight"
            :addWidgetCall="addWidgetCall"
            :widgetType="widgetType"
            :childResized="layoutResized"
            @component-destroyed="handleComponentDestroyed"
            @select-widget="selectedLayout"
            @open-widget-settings-page="$emit('openWidgetSettingsPage', $event)"
            @close-setting="$emit('closeSetting', $event)"
            @save-dashboard="$emit('saveDashboard', $event)" />
        </div>
      </GridItem>
    </GridLayout>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { GridLayout, GridItem } from 'grid-layout-plus';
  import LogWidget from './Widgets/LogWidget.vue';
  import GaugeWidget from './Widgets/GaugeWidget.vue';
  import ThermometerWidget from './Widgets/ThermometerWidget.vue';
  import { Settings, WidgetType, WidgetDetails } from '../interfaces/dashboard.interfaces';
  import widgetJson from '../assets/dataset/gridwidgetsettings.json';
  import { IDashboard, IWidget, ILayout, IResizeData } from '../../server/interfaces/dashboard.interfaces';
  import { DashboardSettings } from '../../server/helpers/settings.helper';
  import { generateUUID } from '../common/utils';
  import NumericWidget from './Widgets/NumericWidget.vue';
  import LabelWidget from './Widgets/LabelWidget.vue';
  import CommentWidget from './Widgets/CommentWidget.vue';
  import { store } from '@/main';
  import { DashBoardAction } from '@/interfaces/state.interfaces';
  import ImageWidget from './Widgets/ImageWidget.vue';

  export default defineComponent({
    name: 'LayoutComponent',
    components: {
      GridLayout,
      GridItem,
      LogWidget,
      NumericWidget,
      LabelWidget,
      GaugeWidget,
      ThermometerWidget,
      ImageWidget,
      CommentWidget,
    },
    props: {
      layoutData: {
        type: Object as PropType<ILayout[]>,
      },
      dashboardData: {
        type: Object as PropType<IDashboard>,
      },
      selectedData: {
        type: String,
      },
      columnNumber: {
        type: Number,
      },
      rowHeight: {
        type: Number,
      },
      addWidgetCall: {
        type: Boolean,
      },
      widgetType: {
        type: String as PropType<WidgetType | undefined>,
      },
      layoutId: {
        type: String,
      },
      activeWellbore: {
        type: String,
      },
      childResized: {
        type: Number,
        default: 0,
      },
    },
    emits: ['componentDestroyed', 'select-widget', 'openWidgetSettingsPage', 'closeSetting', 'saveDashboard'],
    data() {
      return {
        DashBoardAction,
        layoutDetails: {} as IDashboard | ILayout,
        WidgetType: WidgetType,
        previouseDetails: {} as IDashboard | ILayout,
        widgets: WidgetDetails,
        columWidth: 0 as number,
        selectedWellbore: this.activeWellbore,
        resize: {
          id: '',
          count: 0,
        } as IResizeData,
        layoutResized: 0 as number,
      };
    },
    computed: {
      dashboardAction() {
        return store.dashboardAction;
      },
    },
    watch: {
      activeWellbore: {
        handler(newSettings) {
          this.selectedWellbore = newSettings;
        },
      },
      addWidgetCall() {
        if (this.selectedData == (this.layoutDetails as IDashboard)?.DashboardId || this.selectedData == (this.layoutDetails as ILayout)?.LayoutId) {
          if (this.widgetType) {
            this.addWidget(this.widgetType);
          }
        }
      },
      childResized() {
        // TODO: Logic needed to check ids in the case of nested layouts
        setTimeout(() => {
          this.containerResizedEvent();
        }, 1500);
      },
    },
    beforeUnmount() {
      if (this.layoutId) {
        this.handleComponentDestroyed(this.layoutId);
      }
    },
    mounted() {
      this.$nextTick(() => {
        if (this.dashboardData && this.dashboardData.DashboardId) {
          this.layoutDetails = this.dashboardData;
          this.previouseDetails = JSON.parse(JSON.stringify(this.layoutDetails));
        } else {
          if (this.layoutData && this.layoutData.length) {
            this.layoutDetails = this.layoutData[0];
            this.previouseDetails = JSON.parse(JSON.stringify(this.layoutDetails));
          } else {
            this.layoutDetails = {
              LayoutId: this.layoutId || generateUUID(),
              Layout: [],
            };
            this.previouseDetails = JSON.parse(JSON.stringify(this.layoutDetails));
          }
        }
        this.columWidth = this.columnNumber || 0;
        this.$emit('saveDashboard', {
          i: '',
          data: this.layoutDetails,
        });
      });
    },
    methods: {
      getComponentName(type: WidgetType) {
        const widget = WidgetDetails.find((w) => w.type === type);
        return widget ? widget.component : null;
      },
      handleComponentDestroyed(id: string) {
        this.$emit('componentDestroyed', id);
      },
      openWidgetProperties(item: IWidget) {
        this.$emit('openWidgetSettingsPage', item);
      },
      selectedLayout(layoutId: string, layout: boolean) {
        let id: string = layoutId;
        if (layout == false) {
          const layoutDetails = this.layoutDetails?.Layout?.filter((ele) => layoutId == ele.LayoutId);
          if (layoutDetails && layoutDetails.length > 0) {
            id = (this.layoutDetails as ILayout)?.LayoutId?.toString() || (this.layoutDetails as IDashboard)?.DashboardId?.toString();
          }
        }
        this.$emit('select-widget', id);
      },

      containerResizedEvent(chartid: string = '') {
        this.columWidth = this.columnNumber || 0;
        this.resize.id = chartid;
        this.resize.count++;
        this.layoutResized++;
      },

      // Add Widget Recursively
      async addWidget(type: WidgetType | undefined) {
        const newWidget: IWidget | undefined = this.calculateNewWidget(type);
        const widgetDetails = WidgetDetails.find((w) => w.type === type);
        if (newWidget && newWidget.Layout == false) {
          const originalSettings = widgetDetails?.settingsDetails ?? new DashboardSettings();
          const cleanSettings = JSON.parse(JSON.stringify(originalSettings));
          // Remove nested SettingsDetails to prevent recursive structure
          delete cleanSettings.SettingsDetails;
          newWidget.SettingsDetails = cleanSettings;
          if (newWidget.SettingsDetails) {
            newWidget.SettingsDetails.SettingId = newWidget.Settings!;
          }
        }
        if (newWidget) {
          if (!this.layoutDetails.Layout) {
            this.layoutDetails.Layout = [];
          }
          (this.layoutDetails as ILayout).LayoutId = this.layoutId || '';
          this.layoutDetails.Layout.push(newWidget as IWidget);
        }
        this.$emit('saveDashboard', {
          i: '',
          data: this.layoutDetails,
        });
      },

      // Calculate New Widget Position
      calculateNewWidget(type: WidgetType | undefined): IWidget | undefined {
        if (type && Object.prototype.hasOwnProperty.call(widgetJson, type)) {
          const widgetHeight: number = (widgetJson as Settings)[type].widgetheight;
          const widgetWidth: number = (widgetJson as Settings)[type].widgetwidth;
          let x: number = 0;
          let y: number = 0;

          this.layoutDetails.Layout?.forEach((item: IWidget) => {
            if (item.y >= y) {
              y = item.y;
              x = 0;
            }
            if (item.x + item.w > x) {
              x = item.x + item.w;
            }
            if (this.columnNumber && x + widgetWidth > this.columnNumber) {
              x = 0;
              y += 1;
            }
          });

          const isLayout: boolean = type == WidgetType.LAYOUT;
          return {
            Name: type || '',
            Layout: isLayout,
            SourceId: '',
            LayoutId: generateUUID(),
            Offsets: 'default',
            Settings: isLayout ? '' : generateUUID(),
            x: x,
            y: y,
            w: widgetWidth,
            h: widgetHeight,
            i: generateUUID(),
          };
        }
      },

      calculateRowheight(refElement: string) {
        if (this.rowHeight) return ((this.$refs[refElement] as HTMLElement)?.clientHeight - 4) / this.rowHeight;
      },

      // Recursive Find and Remove
      findAndRemove(data: IWidget[], targetId: string): boolean {
        for (let i = 0; i < data.length; i++) {
          if (data[i].i === targetId) {
            data.splice(i, 1);
            return true;
          }
          if (data[i].Layout) {
            const removed = this.findAndRemove(data[i].Layout as unknown as IWidget[], targetId);
            if (removed) {
              return true;
            }
          }
        }
        return false;
      },
      removeData(data: IWidget[], targetId: string) {
        const removed = this.findAndRemove(data, targetId);
        if (removed) {
          this.$emit('saveDashboard', {
            i: targetId,
            data: this.layoutDetails,
          });
        }
      },
      onOutsideClick(show: boolean) {
        if (!show) {
          this.$emit('closeSetting');
        }
      },
    },
  });
</script>

<style scoped>
  .l-item {
    border: 1px solid var(--border-tertiary);
  }

  .l-item:hover {
    cursor: pointer;
  }

  .remove {
    top: 10px;
    right: 10px;
    position: absolute;
    z-index: 1;
    cursor: pointer;
  }

  .sublayout {
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
    transition: 0.2s all;
  }

  .l-item.active {
    border: 1px solid var(--text-secondary);
  }

  .backgroudGray {
    background-color: var(--dashboard-bg);
  }
  .widgets {
    margin: 3px;
    width: calc(100% - 6px);
    height: calc(100% - 6px);
    border: 1px solid var(--border-tertiary);
    text-align: center;
  }
  .remove,
  .settings {
    position: absolute;
    z-index: 4;
    cursor: pointer;
  }

  .remove {
    top: 10px;
    right: 10px;
  }

  .settings {
    top: 12px;
    right: 12px;
  }
  .sublayout .settings {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .sublayout:hover .settings {
    opacity: 1;
  }

  :deep(.vgl-item__resizer:before) {
    border: 0 solid var(--icon-secondary);
    border-right-width: 2px;
    border-bottom-width: 2px;
  }

  :deep(.vgl-item--placeholder) {
    opacity: 1;
    background-color: var(--bg-secondary);
  }

  .layout-bg {
    background: var(--bg-quaternary);
    border-width: 0px;
    border-style: solid;
  }
</style>
