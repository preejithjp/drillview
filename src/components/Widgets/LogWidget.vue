<template>
  <div class="full-size d-flex flex-col" :style="widgetStyles">
    <div class="pan-button invisible">
      <div title="Reset" class="chart-control ml10" @click="resetChart()">
        <SvgIcon name="reload-singe-icon" class="svg-icon size20 icon-color" />
      </div>
      <div title="Zoom" class="chart-control" @mouseover="handleZoom()" @mouseleave="zoomList = false">
        <SvgIcon name="time-log-icon" class="svg-icon size20 icon-color" />
        <div v-show="zoomList" :id="'zoom_list_time_' + chartId" class="zoom-items" @mouseleave="zoomList = false">
          <div
            v-for="(item, i) in zoomOptions[widgetSettingsDetail?.General.IndexType == DataIndexTypes.Time ? 'dateTime' : 'depth']"
            :key="i"
            class="option-div"
            @click.stop="updateLogChartViewPort(item.value)">
            {{ item.label }}
          </div>
        </div>
      </div>
      <div title="Auto Scroll/Zoom Pan" class="chart-control" @click="zoomRealData()">
        <SvgIcon name="trejectory-icon" class="svg-icon size20 icon-color" />
      </div>
    </div>
    <div v-if="widgetSettingsDetail?.General.ShowTitle && widgetSettingsDetail?.General.Title">
      <span class="labelSpan text-ellipsis" :style="widgetTitleStyles">{{ widgetSettingsDetail?.General.Title }}</span>
    </div>
    <div
      class="d-flex flex-full"
      :class="{
        'flex-row': widgetSettingsDetail?.General.Orientation === OrientationTypes.Vertical,
        'flex-col': widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal,
      }">
      <div
        v-if="widgetSettingsDetail?.General.ShowScale"
        :class="{
          'vertical-header': widgetSettingsDetail?.General.Orientation === OrientationTypes.Vertical,
          'horizontal-header': widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal,
        }">
        <div
          v-for="(item, i) in widgetSettingsDetail?.Track"
          v-show="item.TrackType != 'Index'"
          :key="i"
          :style="(widgetSettingsDetail?.General.Orientation !== OrientationTypes.Horizontal ? 'height:' : 'width:') + calculateWidth(0, i)">
          <TrackScale
            :curveData="item.Curve"
            :alignment="widgetSettingsDetail?.General.Orientation ?? OrientationTypes.Horizontal"
            :trackScaleValues="trackScaleValues[i]"
            :indexType="widgetSettingsDetail?.General.IndexType ?? DataIndexTypes.Time"
            :showUOM="widgetSettingsDetail?.General.ShowUom"
            :withIndex="widgetSettingsDetail?.Track[i - 1] && widgetSettingsDetail?.Track[i - 1].TrackType == 'Index'"></TrackScale>
        </div>
      </div>
      <div
        v-if="removeitem"
        ref="parentChart"
        class="flex-full chart-wrap"
        :class="{
          'verticle-chart': widgetSettingsDetail?.General.Orientation === OrientationTypes.Vertical,
          'horizontal-chart': widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal,
        }">
        <div
          v-for="(item, i) in widgetSettingsDetail?.Track"
          v-show="item.TrackType != 'Index'"
          :key="i"
          :class="{
            'chart-min no-text-selection': true,
            'p-b-15 index-scale': widgetSettingsDetail?.Track[i - 1] && widgetSettingsDetail?.Track[i - 1].TrackType == 'Index',
            'no-pointer': !dataload,
            'padding-right-5': widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal,
          }"
          :style="
            'position: relative; flex: none;' +
            (widgetSettingsDetail?.General.Orientation !== OrientationTypes.Horizontal ? 'height:' : 'width:') +
            calculateWidth(0, i)
          "
          @drag.prevent>
          <div
            :class="{
              'border-dummy border-dummy-nonindex-verticle':
                widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal &&
                widgetSettingsDetail?.Track[i - 1] &&
                widgetSettingsDetail?.Track[i - 1].TrackType != 'Index',
              'border-dummy border-dummy-index-verticle':
                widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal &&
                widgetSettingsDetail?.Track[i - 1] &&
                widgetSettingsDetail?.Track[i - 1].TrackType == 'Index',
              'border-dummy border-dummy-nonindex-horizontal':
                widgetSettingsDetail?.General.Orientation === OrientationTypes.Vertical &&
                widgetSettingsDetail?.Track[i - 1] &&
                widgetSettingsDetail?.Track[i - 1].TrackType != 'Index',
              'border-dummy border-dummy-index-horizontal':
                widgetSettingsDetail?.General.Orientation === OrientationTypes.Vertical &&
                widgetSettingsDetail?.Track[i - 1] &&
                widgetSettingsDetail?.Track[i - 1].TrackType == 'Index',
            }"
            :style="'border-color:' + convertColor(item.BorderColour || '#dfe0e3') + '; border-width: ' + (item.BorderThickness || 1) + 'px;'"></div>
          <div
            :id="'scichart-root-' + chartId + '-' + i"
            :class="{
              'full-size canvas-drawing dummy-border-common': true,
              'scichart-area-nonindex-verticle':
                widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal &&
                widgetSettingsDetail?.Track[i - 1] &&
                widgetSettingsDetail?.Track[i - 1].TrackType != 'Index',
              'scichart-area-index-verticle':
                widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal &&
                widgetSettingsDetail?.Track[i - 1] &&
                widgetSettingsDetail?.Track[i - 1].TrackType == 'Index',
              'scichart-area-nonindex-horizontal':
                widgetSettingsDetail?.General.Orientation === OrientationTypes.Vertical &&
                widgetSettingsDetail?.Track[i - 1] &&
                widgetSettingsDetail?.Track[i - 1].TrackType != 'Index',
              'scichart-area-index-horizontal':
                widgetSettingsDetail?.General.Orientation === OrientationTypes.Vertical &&
                widgetSettingsDetail?.Track[i - 1] &&
                widgetSettingsDetail?.Track[i - 1].TrackType == 'Index',
            }"
            @mousedown="mouseDown = true"
            @mouseup="mouseDown = false"
            @mousemove="mousemove"
            @wheel="zoomEnable = true"></div>
          <span
            v-if="
              widgetSettingsDetail?.General.IndexType !== DataIndexTypes.Depth &&
              widgetSettingsDetail?.Track[i - 1] &&
              widgetSettingsDetail?.Track[i - 1].TrackType == 'Index'
            "
            :class="currentTheme === Themes.DARK ? 'left-date dark' : 'left-date'">
            {{ getFormatDate(scale.min) }}
          </span>
          <span
            v-if="
              widgetSettingsDetail?.General.IndexType !== DataIndexTypes.Depth &&
              widgetSettingsDetail?.Track[i - 1] &&
              widgetSettingsDetail?.Track[i - 1].TrackType == 'Index'
            "
            :class="currentTheme === Themes.DARK ? 'right-date dark' : 'right-date'">
            {{ getFormatDate(scale.max) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, markRaw } from 'vue';
  import { Themes } from '@/interfaces/state.interfaces';
  import {
    CrossPointMarker,
    CursorModifier,
    CursorTooltipSvgAnnotation,
    DpiHelper,
    EAutoRange,
    EAxisAlignment,
    EClipMode,
    EDataLabelSkipMode,
    EDragMode,
    EllipsePointMarker,
    EXyDirection,
    FastLineRenderableSeries,
    FastMountainRenderableSeries,
    MouseWheelZoomModifier,
    NumberRange,
    NumericAxis,
    RolloverModifier,
    RubberBandXyZoomModifier,
    SciChartSurface,
    SeriesInfo,
    SquarePointMarker,
    Thickness,
    TrianglePointMarker,
    TWebAssemblyChart,
    XAxisDragModifier,
    XyDataSeries,
  } from 'scichart';
  import { DashboardSettings } from 'server/helpers/settings.helper';
  import { store } from '@/main';
  import { DataStoreChannelDataItem } from '@/helpers/datastore/datamodels/datastore.channelitem';
  import { Curve, TrackSettings } from 'server/helpers/settings.helpers/track.settings.helper';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { toRaw } from 'vue';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';
  import { DataStoreInterpolationMode } from '@/helpers/datastore/datamodels/datastore.interpolationmode';
  import TrackScale from './TrackScale.vue';
  import { DataIndexTypes, OrientationTypes } from '../../../server/helpers/settings.helpers/general.settings.helper';
  import { DataStoreChannelState } from '@/helpers/datastore/datamodels/datastore.channelstate';

  export default defineComponent({
    name: 'LogWidget',
    components: {
      TrackScale,
    },
    props: {
      chartId: String,
      widgetSettingsDetail: Object as PropType<DashboardSettings>,
    },
    data() {
      return {
        Themes,
        OrientationTypes: OrientationTypes,
        DataIndexTypes: DataIndexTypes,
        counter: 0 as number,
        timeoutVisible: 0 as any,
        minScale: undefined as any,
        sciInstance: [] as TWebAssemblyChart[],
        cursorModifier: [] as CursorModifier[],
        rubberBandXyZoomModifier: [] as RubberBandXyZoomModifier[],
        rolloverModifier: [] as RolloverModifier[],
        fastLineSeries: [] as any,
        fastmountainSeries: [] as any,
        scale: {
          min: 1 as number,
          max: 10 as number,
        },
        mouseDown: false,
        dataSeries: {} as any,
        xAxis: [] as NumericAxis[],
        yAxis: [[] as NumericAxis[]] as any[],
        zoomEnable: false,
        zoomList: false as boolean,
        startDate: 0 as number,
        endDate: 0 as number,
        historyTimeout: 0 as any,
        startedCurve: [] as any,
        uniqueData: {} as any,
        unitData: {} as any,
        customCurveName: {} as any,
        dataload: false,
        dataReload: [] as number[],
        viewPort: 1800,
        removeitem: true,
        temphistoryData: {} as any,
        propertiesChangeTimeout: 0 as any,
        trackScaleValues: {} as { [key: string]: any[] },
        updateTimeout: 0 as any,
        lineDash: {
          solid: [10, 0],
          shortDash: [10, 5],
          shortDot: [5, 5],
          shortDashDot: [10, 5, 5, 5],
          shortDashDotDot: [10, 5, 5, 5, 5, 5],
          dot: [5, 10],
          dash: [20, 5],
          dashDot: [20, 5, 5, 5],
          longDash: [40, 5],
          longDashDot: [40, 5, 5, 5],
          longDashDotDot: [30, 5, 5, 5, 5, 5],
        } as { [key: string]: number[] },
        curvesStartIndex: {} as { [key: string]: number },
        checkRequestRange: 0 as any,
        endIndex: 0 as number,
        addedCurve: {} as any,
        zoomOptions: {
          dateTime: [
            { label: '10 Second', value: 10 },
            { label: '1 Minute', value: 60 },
            { label: '10 Minute', value: 600 },
            { label: '30 Minute', value: 1800 },
            { label: '1 Hour', value: 3600 },
            { label: '2 Hour', value: 7200 },
            { label: '1 Day', value: 86400 },
            { label: '2 Day', value: 172800 },
          ],
          depth: [
            { label: '5mt', value: 5 },
            { label: '10mt', value: 10 },
            { label: '100mt', value: 100 },
            { label: '500mt', value: 500 },
            { label: '1km', value: 1000 },
          ],
        },
        indexDivider: {
          0: Math.pow(10, 3),
          1: Math.pow(10, 15),
        },
      };
    },
    computed: {
      storeInstance() {
        return store;
      },
      currentTheme() {
        return store.theme;
      },
      widgetTitleStyles() {
        return {
          color: this.convertColor(this.widgetSettingsDetail?.Appearance.TitleFontColor),
          fontSize: this.widgetSettingsDetail?.Font.Title.FontSize + 'px',
          fontFamily: this.widgetSettingsDetail?.Font.Title.FontFamily,
          fontWeight: this.widgetSettingsDetail?.Font.Title.FontWeight,
          fontStyle: this.widgetSettingsDetail?.Font.Title.FontStyle,
        };
      },
      widgetStyles() {
        return {
          background: this.convertColor(this.widgetSettingsDetail?.Appearance.BackgroundColour),
          borderColor: this.convertColor(this.widgetSettingsDetail?.Appearance.BorderColour),
          borderWidth: this.widgetSettingsDetail?.General.BorderThickness + 'px',
          borderStyle: 'solid',
        };
      },
    },
    watch: {
      widgetSettingsDetail: {
        handler() {
          this.$nextTick(() => {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
              this.updateApperance();
            }, 800);
          });
        },
        deep: true,
        immediate: true,
      },
      'widgetSettingsDetail.General.IndexType': {
        handler() {
          if (this.widgetSettingsDetail?.General.IndexType === DataIndexTypes.Time) {
            this.viewPort = 1800;
          } else {
            this.viewPort = 100;
          }
          if (this.startedCurve.length) {
            this.sciInstance.forEach((element: any) => {
              const sciChartSurface = toRaw(element?.sciChartSurface);
              sciChartSurface?.delete();
            });
            this.sciInstance = [];
            ChannelDataService.stopStreaming(this.startedCurve, (data) => {
              console.log('---stop stream', data);
            });
            this.dataload = false;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    created() {
      // const a = JSON.parse(store.runtimeConfig.LOG_DIVISION);
      // console.log('----------------------', a.TIME);
      // console.log('----------------------', a.DEPTH);
      // SciChartSurface.setRuntimeLicenseKey(
      //   'cKz0uFIojHTqs87GrkdwMRpJJTYK9CTiEdJzBFtEiKVFYX6l6e7kBhFt8AhIMksfBz1Bzqaw7gHBjCMQ7d7Ta1O4ojP7pVEF5ijHNBXT2vypOmFvWvk8UFtinxTg2pIF+p7CQ6l86hZ+57gxoguhYf1Ed+SnDjIp4MEltCEjCfYxgv9Nq1Y2IJsGargcSbueT2XLWtvknEEFKIC5ReasUSfW6eD0C7CrZ1JVzYz/3eG3lSk5YQgcZPe0oXL+AAEUK/IXY6Hj4CCw9DwDwrFp3a8nYJYyyvW0l1OK3TLmXS0e/Xh7q33L+8M7rFVZF7fVJYLQlhfR6jxv2Kmc4epw8aWaVrSIFGEvf603oTf7INrmkTccKjqLDFSSQ+xYXMoEuZR8LvB4P9fE0DHCc3dfBQHLvfJUdplxAyInrbzjhroRqy8sR6kCs1zZOQC+B/5FuIP2UeMvnzDB9bk+kZ/sCC0wQhO7dLfQ3z+phjwUFgCIYrALxSybs/RKTdejFvh/Uy2CNDgkhPYUOY4k0pXQ2DWGoI35D8LsFCMUPdQa7Kbb6vTKXUjV/QQ0ZzCm9L4sJJ6Z9H8poFtuHsaj4e3BnwHePEg045bRDYbwYdorXdvXCvf4kY5T9Pqi4h7gn3adGRij0p2kHqZR2Hm2Qpy+fyzWa3HaTsRDXxYwkC0cTXh4IaKhfr4YQlWABPsenaQmdbY99kcf2xR9YjIVKBBoy8jz30qsLF+c4idMl1ghMtJZGiWYUrYssy92C4/xtlMcK2rQ01HVv798uHENsRq6EQKgGSUC9ys8f45rWuHZGKz23ZNcl+uUJjk4tSw='
      // );

      setTimeout(() => {
        this.dataload = !this.dataload;
        this.dataload = !this.dataload;
      }, 500);
    },
    beforeUnmount() {
      this.sciInstance.forEach((element: any) => {
        const sciChartSurface = toRaw(element?.sciChartSurface);
        sciChartSurface?.delete();
      });
      this.sciInstance = [];
      ChannelDataService.stopStreaming(this.startedCurve, (data) => {
        console.log('---stop stream', data);
      });
    },
    methods: {
      convertColor(color: string = 'transparent') {
        if (color) {
          return themeColors[this.currentTheme][color as keyof ColorSet] || color || 'transparent';
        }
        return 'transparent';
      },
      scaleUpdate(args: any, curveIndex: number, trackIndex: number) {
        const currentItem = this.widgetSettingsDetail?.Track[trackIndex]?.Curve[curveIndex] || undefined;
        if (currentItem) {
          if (!this.trackScaleValues[trackIndex]) {
            this.trackScaleValues[trackIndex] = [];
          }
          this.trackScaleValues[trackIndex][curveIndex] = args.visibleRange;
          this.trackScaleValues = JSON.parse(JSON.stringify(this.trackScaleValues));
        }
      },
      resetChart() {
        this.zoomEnable = false;
        this.viewPort = this.widgetSettingsDetail?.General.IndexType === DataIndexTypes.Depth ? 100 : 1800;
        this.xAxis.forEach((element) => {
          element.visibleRange = new NumberRange(this.endDate - this.viewPort, this.endDate + (this.viewPort / 90) * 10);
        });
      },
      calculateWidth(width: number, index: number): string {
        const parent: any = this.$refs.parentChart;
        let innerWidth;
        let trackScale = 0;
        if (parent) {
          this.widgetSettingsDetail?.Track.forEach((element: TrackSettings, indexTrack: number) => {
            if (
              element.TrackType != 'Index' &&
              this.widgetSettingsDetail?.Track[indexTrack - 1] &&
              this.widgetSettingsDetail?.Track[indexTrack - 1].TrackType == 'Index'
            ) {
              trackScale++;
            }
          });
          if (width) {
            if (trackScale) {
              if (this.widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal) {
                innerWidth = parent.offsetWidth - 1;
                if (this.widgetSettingsDetail?.Track[index - 1] && this.widgetSettingsDetail?.Track[index - 1].TrackType == 'Index') {
                  return ((innerWidth - trackScale * 50 - 1) * width) / 100 + 50 + 'px';
                } else {
                  return ((innerWidth - trackScale * 50 - 1) * width) / 100 + 'px';
                }
              } else {
                innerWidth = parent.offsetHeight - 2;
                if (this.widgetSettingsDetail?.Track[index - 1] && this.widgetSettingsDetail?.Track[index - 1].TrackType == 'Index') {
                  return ((innerWidth - trackScale * 30 - 5) * width) / 100 + 30 + 'px';
                } else {
                  return ((innerWidth - trackScale * 30 - 5) * width) / 100 + 'px';
                }
              }
            } else {
              return width + '%;';
            }
          } else {
            const length = this.widgetSettingsDetail?.Track.filter((el: TrackSettings) => el.TrackType != 'Index').length || 0;
            if (this.widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal) {
              innerWidth = parent.offsetWidth - 2;
              if (this.widgetSettingsDetail?.Track[index - 1] && this.widgetSettingsDetail?.Track[index - 1].TrackType == 'Index') {
                return ((innerWidth - trackScale * 50 - 2) * (100 / length)) / 100 + 50 + 'px';
              } else {
                return ((innerWidth - trackScale * 50 - 1) * (100 / length)) / 100 + 'px';
              }
            } else {
              innerWidth = parent.offsetHeight - 4;
              if (this.widgetSettingsDetail?.Track[index - 1] && this.widgetSettingsDetail?.Track[index - 1].TrackType == 'Index') {
                return ((innerWidth - trackScale * 30 - 5) * (100 / length)) / 100 + 30 + 'px';
              } else {
                return ((innerWidth - trackScale * 30 - 5) * (100 / length)) / 100 + 'px';
              }
            }
          }
        }
        return '100%;';
      },
      mousemove() {
        if (this.mouseDown) {
          this.zoomEnable = true;
          this.mouseDown = false;
        }
      },
      handleZoom(): void {
        this.zoomList = true;
      },
      updateLogChartViewPort(time: number) {
        this.zoomList = false;
        this.viewPort = time;
        if (this.startDate > this.endDate - this.viewPort) {
          this.scale.min = this.endDate - this.viewPort;
          this.scale.max = this.endDate + (this.viewPort / 90) * 10;
          this.getHistoricalData(this.startDate - (this.endDate - this.viewPort));
        }
        this.widgetSettingsDetail?.Track.forEach((element: TrackSettings, indexTrack: number) => {
          if (element.TrackType != 'Index') {
            if (this.endDate) {
              this.xAxis[indexTrack].visibleRange = new NumberRange(this.endDate - this.viewPort, this.endDate + (this.viewPort / 90) * 10);
            }
          }
        });
      },
      clearData(item: any) {
        if (this.uniqueData[item] && this.uniqueData[item].xValues.length) {
          if (this.dataSeries[item]) {
            this.dataSeries[item].clear();
          }
          this.uniqueData[item] = {
            xValues: [this.uniqueData[item].xValues[this.uniqueData[item].xValues.length - 1]],
            yValues: [this.uniqueData[item].yValues[this.uniqueData[item].yValues.length - 1]],
            textValues: this.uniqueData[item].textValues.length
              ? [this.uniqueData[item].textValues[this.uniqueData[item].textValues.length - 1]]
              : [],
          };
          this.dataSeries[item].appendRange(this.uniqueData[item].xValues, this.uniqueData[item].yValues);
        }
      },
      setClearSeries() {
        Object.keys(this.dataSeries).forEach((item) => {
          if (this.dataSeries[item]) {
            this.dataSeries[item].clearDataSeries = true;
          }
        });
      },
      getHistoricalData(difference: any) {
        const range: any = {
          startIndex: Math.floor(this.startDate - difference),
          endIndex: Math.ceil(this.startDate),
        };
        this.requestHistoricalData(range);
        this.startDate = range.startIndex;
      },
      requestHistoricalData(range: any) {
        this.widgetSettingsDetail?.Track.forEach((element: TrackSettings) => {
          if (element.Curve && element.Curve.length) {
            element.Curve.forEach((ele: Curve) => {
              if (ele.Mnemonic && ele.Mnemonic.MnemonicId && this.curvesStartIndex[ele.Mnemonic.MnemonicId]) {
                let endIndex = range.endIndex;
                if (this.startDate == endIndex && this.curvesStartIndex[ele.Mnemonic.MnemonicId]) {
                  endIndex = this.curvesStartIndex[ele.Mnemonic.MnemonicId];
                }
                if (range.startIndex < endIndex) {
                  console.log('Historic Call', new Date(range.startIndex * this.getDivider()), new Date(endIndex * this.getDivider()));
                  ChannelDataService.getRangeData({
                    ChannelIds: [Number(ele.Mnemonic.MnemonicId)],
                    callback: this.onHistoricalRecive,
                    StartIndex: range.startIndex * this.getDivider(),
                    EndIndex: endIndex * this.getDivider(),
                    InterpolationMode: DataStoreInterpolationMode.None,
                  });
                  this.curvesStartIndex[ele.Mnemonic.MnemonicId] = range.startIndex;
                }
              }
            });
          }
        });
      },
      onHistoricalRecive(curveData: DataStoreChannelDataItem[]) {
        curveData.sort((a: DataStoreChannelDataItem, b: DataStoreChannelDataItem) =>
          a.KeyIndex > b.KeyIndex ? 1 : b.KeyIndex > a.KeyIndex ? -1 : 0
        );
        const groupedData = curveData.reduce((acc: { [key: string]: DataStoreChannelDataItem[] }, item) => {
          if (!acc[item.ChannelId.toString()]) {
            acc[item.ChannelId] = [];
          }
          acc[item.ChannelId].push(item);
          return acc;
        }, {});

        Object.values(groupedData).forEach((uniqueResponse: DataStoreChannelDataItem[]) => {
          const xValues: number[] = [];
          const yValues: number[] = [];
          const metaData: any[] = [];
          let uniqueID = 0;
          uniqueResponse.forEach((data: DataStoreChannelDataItem) => {
            if (data && data.ChannelId && data.KeyIndex / this.getDivider() < this.uniqueData[data.ChannelId]?.xValues?.[0]) {
              uniqueID = data.ChannelId;
              if (!this.minScale || this.minScale * this.getDivider() > data.KeyIndex) {
                this.minScale = data.KeyIndex / this.getDivider();
                this.setZoomLimit();
              }
              if (!this.uniqueData[uniqueID]) {
                this.uniqueData[uniqueID] = toRaw({
                  xValues: [],
                  yValues: [],
                  textValues: [],
                });
              }
              xValues.push(Number(data.KeyIndex) / this.getDivider());
              yValues.push(Number(data.Value));
            }
          });
          if (xValues.length) {
            this.uniqueData[uniqueID].xValues = xValues.concat(this.uniqueData[uniqueID].xValues);
            this.uniqueData[uniqueID].yValues = yValues.concat(this.uniqueData[uniqueID].yValues);
            this.uniqueData[uniqueID].textValues = metaData.concat(this.uniqueData[uniqueID].textValues);
            this.dataSeries[uniqueID].clear();

            this.dataSeries[uniqueID].appendRange(
              this.uniqueData[uniqueID].xValues,
              this.uniqueData[uniqueID].yValues,
              this.uniqueData[uniqueID].yValues
            );
          }
        });
      },
      panChart(args: any) {
        if (args) {
          this.scale.min = args.visibleRange.min;
          this.scale.max = args.visibleRange.max;
          this.viewPort = ((this.scale.max - this.scale.min) / 100) * 90;
          if (this.startDate > this.scale.min) {
            if (this.historyTimeout) {
              clearTimeout(this.historyTimeout);
            }
            const range: any = {
              startIndex: Math.floor(this.scale.min - this.viewPort),
              endIndex: Math.ceil(this.startDate),
            };
            this.startDate = range.startIndex;
            Object.keys(this.curvesStartIndex).forEach((item: any) => {
              this.curvesStartIndex[item] = range.startIndex;
            });
            this.requestHistoricalData(range);
          }
          this.setZoomLimit();
        }
      },

      getFormatDate(date: any) {
        const day = new Date(date * 1000).getDate();
        const month = new Date(date * 1000).getMonth() + 1;
        const year = new Date(date * 1000).getFullYear();
        return (day < 10 ? '0' + day : day) + '/' + (month < 10 ? '0' + month : month) + '/' + year;
      },
      markerSize(size: any, enable: boolean) {
        if (!enable || Number(size) < 0) {
          return 0;
        } else if (Number(size) >= 0 && Number(size) <= 50) {
          return Number(size);
        } else {
          return 0;
        }
      },
      updateCommonApperance(index: number, element: TrackSettings) {
        if (
          this.widgetSettingsDetail?.Track &&
          this.widgetSettingsDetail?.Track[index - 1] &&
          this.widgetSettingsDetail?.Track[index - 1].TrackType == 'Index'
        ) {
          this.xAxis[index].drawLabels = true;
          this.xAxis[index].backgroundColor = this.convertColor(this.widgetSettingsDetail?.Track[index - 1].Background);
          this.xAxis[index].labelStyle.color = this.currentTheme == Themes.DARK ? '#ffffff' : '#000000';
        } else {
          this.xAxis[index].drawLabels = false;
        }
        if (element.Background && element.Background != 'transparent') {
          this.xAxis[index].axisBandsFill = this.convertColor(element.Background);
          this.sciInstance[index].sciChartSurface.background = this.convertColor(element.Background);
        } else {
          this.xAxis[index].axisBandsFill = 'transparent';
          this.sciInstance[index].sciChartSurface.background = 'transparent';
        }
        this.xAxis[index].majorGridLineStyle.strokeThickness =
          JSON.parse(element.GridVisibility.toString()) && element.GridThickness > 0 ? element.GridThickness : 0;
        this.xAxis[index].majorGridLineStyle.color = this.convertColor(element.GridColor || '#302F31');
        this.xAxis[index].minorGridLineStyle.strokeThickness = JSON.parse(element.GridVisibility.toString()) ? 1 : 0;
        this.xAxis[index].minorGridLineStyle.color = this.convertColor(element.GridColor || '#302F31');
        this.yAxis[index].forEach((item: any) => {
          if (element.Background && element.Background != 'transparent') {
            item.axisBandsFill = this.convertColor(element.Background);
          } else {
            item.axisBandsFill = 'transparent';
          }
          item.majorGridLineStyle.strokeThickness =
            JSON.parse(element.GridVisibility.toString()) && element.GridThickness > 0 ? element.GridThickness : 0;
          item.majorGridLineStyle.color = this.convertColor(element.GridColor || '#302F31');
          item.minorGridLineStyle.strokeThickness = JSON.parse(element.GridVisibility.toString()) ? 1 : 0;
          item.minorGridLineStyle.color = this.convertColor(element.GridColor || '#302F31');
        });
      },
      removeAllCurveandCreate(index: number, element: TrackSettings) {
        toRaw(this.sciInstance[index].sciChartSurface.renderableSeries.clear());
        this.sciInstance[index].sciChartSurface.yAxes.clear();
        this.sciInstance[index].sciChartSurface.xAxes.clear();
        this.sciInstance[index].sciChartSurface.chartModifiers.clear();
        delete this.xAxis[index];
        this.yAxis[index] = [];
        let showScale = false;
        let backgroundScale = '';
        if (
          this.widgetSettingsDetail?.Track &&
          this.widgetSettingsDetail?.Track[index - 1] &&
          this.widgetSettingsDetail?.Track[index - 1].TrackType == 'Index'
        ) {
          showScale = true;
          backgroundScale = this.convertColor(this.widgetSettingsDetail?.Track[index - 1].Background);
        }
        this.addCompleteTrack(element, index, showScale, backgroundScale);
        this.$nextTick(() => {
          this.xAxis[index].visibleRange = new NumberRange(this.scale.min, this.scale.max);
        });
      },
      updateApperance() {
        if (!this.removeitem) {
          return;
        }
        if (this.widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal) {
          (this.xAxis as NumericAxis[]).forEach((element: NumericAxis) => {
            element.axisAlignment = EAxisAlignment.Left;
            element.flippedCoordinates = false;
          });
          this.yAxis.forEach((element: any) => {
            element.forEach((item: NumericAxis) => {
              item.axisAlignment = EAxisAlignment.Top;
              item.flippedCoordinates = true;
            });
          });
        } else {
          (this.xAxis as NumericAxis[]).forEach((element: NumericAxis) => {
            element.axisAlignment = EAxisAlignment.Bottom;
            element.flippedCoordinates = false;
          });
          this.yAxis.forEach((element: any) => {
            element.forEach((item: NumericAxis) => {
              item.axisAlignment = EAxisAlignment.Right;
              item.flippedCoordinates = false;
            });
          });
        }
        (this.cursorModifier as CursorModifier[]).forEach((item: CursorModifier) => {
          item.showTooltip = this.widgetSettingsDetail?.General?.ShowToolTip || false;
        });

        (this.rubberBandXyZoomModifier as RubberBandXyZoomModifier[]).forEach((item: RubberBandXyZoomModifier) => {
          item.xyDirection =
            this.widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal ? EXyDirection.YDirection : EXyDirection.XDirection;
        });
        this.widgetSettingsDetail?.Track.forEach((element: TrackSettings, index: number) => {
          if (element.TrackType != 'Index') {
            if (!this.sciInstance[index]) {
              let showScale = false;
              let scaleBackground = '';
              if (
                this.widgetSettingsDetail?.Track &&
                this.widgetSettingsDetail?.Track[index - 1] &&
                this.widgetSettingsDetail?.Track[index - 1].TrackType == 'Index'
              ) {
                showScale = true;
                scaleBackground = this.convertColor(this.widgetSettingsDetail?.Track[index - 1].Background);
              }
              this.initTrack('scichart-root-' + this.chartId + '-' + index, index, element, showScale, scaleBackground);
            } else if (element.Curve.length != this.yAxis[index].length || this.yAxis[index].length == 1) {
              this.updateCommonApperance(index, element);
              this.removeAllCurveandCreate(index, element);
            } else {
              this.updateCommonApperance(index, element);
              const missmatch = element.Curve.some((curve: Curve, i: number) => {
                if (
                  this.fastmountainSeries[index] &&
                  this.fastmountainSeries[index][i] &&
                  this.fastmountainSeries[index][i].dataSeriesProperty &&
                  curve.Mnemonic &&
                  curve.Mnemonic.MnemonicId == this.fastmountainSeries[index][i].dataSeriesProperty.dataSeriesNameProperty
                ) {
                  return false;
                } else {
                  return true;
                }
              });
              if (missmatch) {
                this.removeAllCurveandCreate(index, element);
              } else {
                element.Curve.forEach((curve: Curve, i: number) => {
                  this.fastmountainSeries[index][i].isDigitalLine = curve.ChartType == 'stepArea';
                  this.fastmountainSeries[index][i].fill =
                    curve.ChartType == 'area' || curve.ChartType == 'stepArea' ? this.convertColor(curve.FillColor) || '#000000' : '';
                  this.fastmountainSeries[index][i].stroke = this.convertColor(curve.CurveColor);
                  this.fastmountainSeries[index][i].strokeThickness =
                    curve.ChartType == 'area' || curve.ChartType == 'stepArea' ? curve.LineThickness : 0;
                  this.fastmountainSeries[index][i].zeroLineY = curve.ZeroLine || 0;
                  this.fastmountainSeries[index][i].isVisible = curve.Visible && curve.ChartType !== 'text';
                  this.fastmountainSeries[index][i].strokeDashArray = this.lineDash[curve.LineStyle] || [10, 0];

                  this.fastLineSeries[index][i].stroke = this.convertColor(curve.CurveColor);
                  this.fastLineSeries[index][i].isVisible = curve.Visible && curve.ChartType !== 'text';
                  this.fastLineSeries[index][i].dataLabelProvider.color =
                    curve.CurveColor == 'transparent' ? '#555' : this.convertColor(curve.CurveColor);
                  this.fastLineSeries[index][i].dataLabelProvider.isEnabled = curve.ShowValue || false;
                  this.fastLineSeries[index][i].rolloverModifierProps.markerColor = this.convertColor(curve.CurveColor);
                  this.fastLineSeries[index][i].strokeThickness =
                    curve.ChartType == 'line' || curve.ChartType == 'stepLine' ? curve.LineThickness : 0;
                  this.fastLineSeries[index][i].isDigitalLine = curve.ChartType == 'stepLine';
                  this.fastLineSeries[index][i].strokeDashArray = this.lineDash[curve.LineStyle] || [10, 0];

                  const pointer = {
                    width: this.markerSize(curve.MarkerSize, curve.Marker) || 5,
                    height: this.markerSize(curve.MarkerSize, curve.Marker) || 5,
                    fill: this.convertColor(curve.CurveColor),
                    stroke: this.convertColor(curve.CurveColor),
                    strokeThickness: 1,
                  };
                  if (!curve.Marker && curve.ChartType !== 'text' && curve.ChartType !== 'scatter') {
                    if (this.fastLineSeries[index][i].pointMarker) {
                      this.fastLineSeries[index][i].pointMarker = undefined;
                    }
                  } else if (!curve.Marker && curve.ChartType === 'scatter') {
                    this.fastLineSeries[index][i].pointMarker = new EllipsePointMarker(this.sciInstance[index].wasmContext, pointer);
                  } else if (curve.MarkerType == 'square') {
                    this.fastLineSeries[index][i].pointMarker = new SquarePointMarker(this.sciInstance[index].wasmContext, pointer);
                  } else if (curve.MarkerType == 'triangle') {
                    this.fastLineSeries[index][i].pointMarker = new TrianglePointMarker(this.sciInstance[index].wasmContext, pointer);
                  } else if (curve.MarkerType == 'cross') {
                    this.fastLineSeries[index][i].pointMarker = new CrossPointMarker(this.sciInstance[index].wasmContext, pointer);
                  } else {
                    this.fastLineSeries[index][i].pointMarker = new EllipsePointMarker(this.sciInstance[index].wasmContext, pointer);
                  }
                  this.yAxis[index][i].autoRange = EAutoRange.Always;
                  this.customCurveName[curve.Mnemonic.MnemonicId || 0] = curve.Mnemonic.MnemonicName;
                });
              }
            }
          }
        });
        this.startStreaming();
        this.counter++;
      },
      createXAxis(index: number, showScale: boolean, track: TrackSettings, scaleBackground: string) {
        const axisOptions: any = {
          autoRange: EAutoRange.Never,
          autoTicks: true,
          drawLabels: showScale,
          drawMajorTicks: false,
          drawMinorTicks: false,
          labelStyle: {
            fontSize: 11,
            color: this.currentTheme == Themes.DARK ? '#ffffff' : '#000000',
          },
          majorGridLineStyle: {
            strokeThickness: JSON.parse(track.GridVisibility.toString()) && track.GridThickness > 0 ? track.GridThickness : 0,
            color: this.convertColor(track.GridColor || '#302F31'),
          },
          minorGridLineStyle: {
            strokeThickness: JSON.parse(track.GridVisibility.toString()) ? 1 : 0,
            color: this.convertColor(track.GridColor || '#302F31'),
          },
          minorTickLineStyle: {
            strokeThickness: 0,
            color: '#dfe0e3',
            tickSize: 0,
          },
          majorTickLineStyle: {
            strokeThickness: 0,
            color: '#dfe0e3',
            tickSize: 0,
          },
          visibleRange: new NumberRange(this.scale.min, this.scale.max),
        };
        if (track.Background && track.Background != 'transparent') {
          axisOptions.axisBandsFill = this.convertColor(track.Background);
        } else {
          axisOptions.axisBandsFill = 'transparent';
        }
        if (scaleBackground && scaleBackground != 'transparent') {
          axisOptions.backgroundColor = scaleBackground;
        }
        this.xAxis[index] = markRaw(new NumericAxis(this.sciInstance[index].wasmContext, axisOptions));
        if (this.minScale && this.endDate) {
          this.xAxis[index].visibleRangeLimit = new NumberRange(this.minScale - (this.viewPort / 90) * 10, this.endDate + (this.viewPort / 90) * 10);
        }
        this.xAxis[index].labelStyle.padding = new Thickness(0, 0, 0, 0);
        if (this.widgetSettingsDetail?.General.IndexType === DataIndexTypes.Time) {
          this.xAxis[index].labelProvider.formatLabel = (unixTimestamp: any) => {
            return this.formatTime(unixTimestamp);
          };
        } else {
          this.xAxis[index].labelProvider.formatLabel = (value: any) => {
            const valtemp = Math.round(value);
            switch (valtemp.toString().length) {
              case 1:
                return ('           ' + valtemp).toString();
              case 2:
                return ('         ' + valtemp).toString();
              case 3:
                return ('       ' + valtemp).toString();
              case 4:
                return ('     ' + valtemp).toString();
              case 5:
                return ('   ' + valtemp).toString();
              case 6:
                return (' ' + valtemp).toString();
              default:
                return valtemp.toString().substring(0, 6) + '..';
            }
          };
        }
        this.sciInstance[index].sciChartSurface.xAxes.add(this.xAxis[index] as NumericAxis);
        if (this.widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal) {
          this.xAxis[index].axisAlignment = EAxisAlignment.Left;
          this.xAxis[index].flippedCoordinates = false;
        } else {
          this.xAxis[index].axisAlignment = EAxisAlignment.Bottom;
        }
        this.xAxis[index].visibleRangeChanged.subscribe((args: any) => {
          // SYNCHRONIZE VISIBLE RANGES
          for (let i = 0; i < this.xAxis.length; i++) {
            if (args && i != index && this.xAxis[i]) {
              this.xAxis[i].visibleRange = args.visibleRange;
            }
          }
          //Request Range Data
          if (this.endDate) {
            this.panChart(args);
          }
        });
      },
      generateYAxisOptions(track: TrackSettings) {
        const axisOptions: any = {
          drawLabels: false,
          drawMajorTicks: false,
          drawMinorTicks: false,
          majorGridLineStyle: {
            strokeThickness: JSON.parse(track.GridVisibility.toString()) && track.GridThickness > 0 ? track.GridThickness : 0,
            color: this.convertColor(track.GridColor || '#302F31'),
          },
          minorGridLineStyle: {
            strokeThickness: JSON.parse(track.GridVisibility.toString()) ? track.GridThickness : 0,
            color: this.convertColor(track.GridColor || '#302F31'),
          },
          minorTickLineStyle: {
            strokeThickness: 0,
            color: this.convertColor(track.GridColor || '#302F31'),
            tickSize: 0,
          },
          majorTickLineStyle: {
            strokeThickness: 1,
            color: this.convertColor(track.GridColor || '#302F31'),
            tickSize: 0,
          },
          growBy: new NumberRange(0.1, 0.1),
        };
        if (track.Background && track.Background != 'transparent') {
          axisOptions.axisBandsFill = this.convertColor(track.Background);
        } else {
          axisOptions.axisBandsFill = 'transparent';
        }
        return axisOptions;
      },
      createYAxis(index: number, i: number, track: TrackSettings, firstTrack: boolean) {
        if (!this.yAxis[index]) {
          this.yAxis[index] = [];
        }
        this.yAxis[index][i] = markRaw(new NumericAxis(this.sciInstance[index].wasmContext, this.generateYAxisOptions(track)));
        if (!firstTrack) {
          this.yAxis[index][i].id = 'Y-' + index + '_' + i;
        }
        this.yAxis[index][i].autoRange = EAutoRange.Always;
        this.sciInstance[index].sciChartSurface.yAxes.add(this.yAxis[index][i]);
        if (this.widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal) {
          this.yAxis[index][i].axisAlignment = EAxisAlignment.Top;
          this.yAxis[index][i].flippedCoordinates = true;
        }
        this.yAxis[index][i].visibleRangeChanged.subscribe((args: any) => {
          this.scaleUpdate(args, Number(i), index);
        });
      },
      createMountainObject(curve: Curve, firstTrack: boolean, index: number, i: number, channelName: string) {
        const mountainObject: any = {
          isDigitalLine: curve.ChartType == 'stepArea',
          fill: curve.ChartType == 'area' || curve.ChartType == 'stepArea' ? this.convertColor(curve.FillColor) || '#000000' : '',
          stroke: this.convertColor(curve.CurveColor),
          strokeThickness: curve.ChartType == 'area' || curve.ChartType == 'stepArea' ? curve.LineThickness : 0,
          opacity: 1,
          dataSeries: this.findDataSeries(curve, channelName),
          zeroLineY: curve.ZeroLine || 0,
          isVisible: curve.Visible && curve.ChartType != 'text',
          // fillLinearGradient: {
          //   startPoint: new Point(0, 0),
          //   endPoint: new Point(0, 1),
          //   gradientStops: [
          //     {
          //       offset: 1,
          //       color: curve.ChartType == 'area' || curve.ChartType == 'stepArea' ? this.convertColor(curve.FillColor) || '#000000' : 'Transparent',
          //     },
          //     { offset: 0, color: 'Transparent' },
          //   ],
          // },
        };
        if (!firstTrack) {
          mountainObject.yAxisId = 'Y-' + index + '_' + i;
        }
        this.fastmountainSeries[index][i] = markRaw(new FastMountainRenderableSeries(this.sciInstance[index].wasmContext, mountainObject));
        this.sciInstance[index].sciChartSurface.renderableSeries.add(this.fastmountainSeries[index][i]);
        this.fastmountainSeries[index][i].strokeDashArray = this.lineDash[curve.LineStyle] || [10, 0];
      },
      createRollModifier(index: number) {
        this.rolloverModifier[index] = markRaw(
          new RolloverModifier({
            modifierGroup: 'group_' + this.chartId,
            showTooltip: false,
          })
        );
        this.sciInstance[index].sciChartSurface.chartModifiers.add(this.rolloverModifier[index]);
      },
      createCursorModifier(index: number) {
        // cursorModifer
        this.cursorModifier[index] = markRaw(
          new CursorModifier({
            crosshairStrokeThickness: 1,
            showTooltip: this.widgetSettingsDetail?.General?.ShowToolTip || false,
            showAxisLabels: false,
            crosshairStroke: 'transparent',
          })
        );

        this.cursorModifier[index].tooltipSvgTemplate = (seriesInfo: SeriesInfo[], svgAnnotation: CursorTooltipSvgAnnotation) => {
          let rowString = '';
          let i = 0;
          let width = 20;
          let hitIndex = 0;
          const itemAdded: any[] = [];
          seriesInfo.forEach((item: any, index: number) => {
            if (
              seriesInfo[index].isHit &&
              !isNaN(item.yValue) &&
              !itemAdded.filter((tooltipaleardy) => {
                return tooltipaleardy.seriesName == item.seriesName && tooltipaleardy.yValue == item.yValue;
              }).length
            ) {
              itemAdded.push({
                seriesName: item.seriesName,
                yValue: item.yValue,
              });
              hitIndex = index;
              i++;
              rowString =
                rowString +
                `<tspan x="8" dy="1.2em" fill="${item.stroke}">${this.customCurveName[item.seriesName]} : ${item.yValue.toFixed(2)}${
                  this.unitData[item.seriesName] ? ' ' + this.unitData[item.seriesName] : ''
                }</tspan>`;
              const textlength = (
                this.customCurveName[item.seriesName] +
                ' : ' +
                item.yValue.toFixed(2) +
                (this.unitData[item.seriesName] ? ' ' + this.unitData[item.seriesName] : '')
              ).length;
              width = width < textlength ? textlength : width;
            }
          });
          if (i && seriesInfo.length && this.widgetSettingsDetail?.General.IndexType === DataIndexTypes.Time) {
            i = i + 2;
            rowString =
              `<tspan x="8" dy="1.2em" fill="${
                this.currentTheme == Themes.DARK ? '#ffffff' : '#000000'
              }">Date: ${this.getFormatDate(seriesInfo[hitIndex].xValue)}</tspan>` +
              `<tspan x="8" dy="1.2em" fill="${
                this.currentTheme == Themes.DARK ? '#ffffff' : '#000000'
              }">Time: ${this.formatTime(seriesInfo[hitIndex].xValue)}</tspan>` +
              rowString;
          } else if (i && seriesInfo.length && this.widgetSettingsDetail?.General.IndexType === DataIndexTypes.Depth) {
            i++;
            rowString =
              `<tspan x="8" dy="1.2em" fill="${
                this.currentTheme == Themes.DARK ? '#ffffff' : '#000000'
              }">Depth: ${seriesInfo[hitIndex].xValue}</tspan>` + rowString;
            const textlength = ('Depth: ' + seriesInfo[hitIndex].xValue).length;
            width = width < textlength ? textlength : width;
          }
          const string = `<svg width="${width * 8 + 20}" height="${i * 17 + 16}" x="0"><defs>
              <filter id="id_1610011455082" x="0" y="0" width="200%" height="200%">
                <feOffset result="offOut" in="SourceAlpha" dx="3" dy="3"></feOffset>
                <feGaussianBlur result="blurOut" in="offOut" stdDeviation="3"></feGaussianBlur>
                <feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend>
              </filter>
            </defs>
            <rect rx="4" ry="4" width="95%" height="90%" style="stroke-width:1;stroke:${this.currentTheme == Themes.DARK ? '#ffffff' : '#000000'}"
             fill="${this.currentTheme == Themes.DARK ? '#1c1c1e' : '#ffffff'}"></rect>
            <svg width="100%"><text x="8" y="3" font-size="13" font-family="Verdana" dy="0">`;
          const { seriesViewRect } = svgAnnotation.parentSurface;
          const xCoord = svgAnnotation.x1;
          const yCoord = svgAnnotation.y1;
          let xCoordShift = 0;
          if (width * 8 + 20 + xCoord > seriesViewRect.width / DpiHelper.PIXEL_RATIO) {
            xCoordShift = seriesViewRect.width / DpiHelper.PIXEL_RATIO - (width * 8 + 10) - xCoord; //right end fixed
            const sciInstanceDup: any = this.sciInstance.filter((item) => {
              return item;
            });
            if (xCoord + seriesViewRect.width / DpiHelper.PIXEL_RATIO < width * 8 + 10) {
              if (sciInstanceDup.length == 1 && !this.sciInstance[0]) {
                if (this.widgetSettingsDetail?.General.Orientation === OrientationTypes.Vertical) {
                  if (this.widgetSettingsDetail?.General.IndexType === DataIndexTypes.Time) {
                    xCoordShift = -xCoord - 58;
                  } else {
                    xCoordShift = -xCoord - 40;
                  }
                } else {
                  xCoordShift = -xCoord;
                }
              } else if (
                sciInstanceDup.length > 1 &&
                sciInstanceDup[sciInstanceDup.length - 1].sciChartSurface.id != svgAnnotation.parentSurface.id
              ) {
                xCoordShift = 5;
              }
            } else if (sciInstanceDup.length > 1 && sciInstanceDup[0].sciChartSurface.id == svgAnnotation.parentSurface.id) {
              xCoordShift = 5; //left end fix
            }
          } else {
            xCoordShift = 5;
          }
          let yCoordShift = 0;
          if (i * 17 + 16 + yCoord > seriesViewRect.height / DpiHelper.PIXEL_RATIO) {
            yCoordShift = seriesViewRect.height / DpiHelper.PIXEL_RATIO - (i * 17 + 16) - yCoord + 10; //bottom end fixed
            if (yCoord + seriesViewRect.height / DpiHelper.PIXEL_RATIO < i * 17 + 16) {
              yCoordShift = 5;
            }
          } else {
            yCoordShift = 5;
          }
          svgAnnotation.xCoordShift = xCoordShift;
          svgAnnotation.yCoordShift = yCoordShift;
          if (i) {
            return string + rowString + `</text></svg></svg>`;
          } else {
            return `<svg height="0" width="0"></svg>`;
          }
        };
        this.sciInstance[index].sciChartSurface.chartModifiers.add(this.cursorModifier[index]);
      },
      findDataSeries(curve: Curve, channelName: string) {
        return this.dataSeries[channelName];
      },
      createLineObject(curve: Curve, firstTrack: boolean, index: number, i: number, channelName: string) {
        if (!this.fastLineSeries[index]) {
          this.fastLineSeries[index] = [];
        }
        this.fastLineSeries[index][i] = markRaw(
          new FastLineRenderableSeries(this.sciInstance[index].wasmContext, {
            dataSeries: this.findDataSeries(curve, channelName),
            strokeThickness: curve.ChartType === 'line' || curve.ChartType === 'stepLine' ? curve.LineThickness : 0,
            stroke: this.convertColor(curve.CurveColor),
            isDigitalLine: curve.ChartType == 'stepLine',
            isVisible: curve.Visible,
            dataLabels: {
              skipMode: EDataLabelSkipMode.SkipIfOverlapNext,
              precision: 2,
              aboveBelow: false,
              style: {
                fontFamily: 'Arial',
                fontSize: 12,
                padding: new Thickness(0, 10, 10, 0),
              },
              color: this.convertColor(curve.CurveColor),
            },
          })
        );
        this.fastLineSeries[index][i].dataLabelProvider.isEnabled = curve.ShowValue || false;
        this.fastLineSeries[index][i].rolloverModifierProps.markerColor = this.convertColor(curve.CurveColor);
        if (!firstTrack) {
          this.fastLineSeries[index][i].yAxisId = 'Y-' + index + '_' + i;
        }

        if ((curve.Marker && curve.ChartType !== 'text') || curve.ChartType === 'scatter') {
          const markerProp = {
            width: this.markerSize(curve.MarkerSize, curve.Marker || false) || 5,
            height: this.markerSize(curve.MarkerSize, curve.Marker || false) || 5,
            fill: this.convertColor(curve.CurveColor),
            stroke: this.convertColor(curve.CurveColor),
            strokeThickness: 1,
          };
          if (curve.Marker || curve.ChartType === 'scatter') {
            this.addMarkerPoints(curve, index, i, markerProp);
          } else {
            this.fastLineSeries[index][i].pointMarker = undefined;
          }
        }
        this.sciInstance[index].sciChartSurface.renderableSeries.add(this.fastLineSeries[index][i]);
        this.fastLineSeries[index][i].strokeDashArray = this.lineDash[curve.LineStyle || ''] || [10, 0];
      },
      addMarkerPoints(curve: Curve, index: number, i: number, markerProp: any) {
        if (curve.ChartType === 'scatter' && !curve.Marker) {
          this.fastLineSeries[index][i].pointMarker = new EllipsePointMarker(this.sciInstance[index].wasmContext, markerProp);
        } else if (curve.MarkerType == 'square') {
          this.fastLineSeries[index][i].pointMarker = new SquarePointMarker(this.sciInstance[index].wasmContext, markerProp);
        } else if (curve.MarkerType == 'triangle') {
          this.fastLineSeries[index][i].pointMarker = new TrianglePointMarker(this.sciInstance[index].wasmContext, markerProp);
        } else if (curve.MarkerType == 'cross') {
          this.fastLineSeries[index][i].pointMarker = new CrossPointMarker(this.sciInstance[index].wasmContext, markerProp);
        } else {
          this.fastLineSeries[index][i].pointMarker = new EllipsePointMarker(this.sciInstance[index].wasmContext, markerProp);
        }
      },
      addCompleteTrack(track: TrackSettings, index: number, showScale: boolean, scaleBackground: string) {
        // Create some DataSeries

        track.Curve.forEach((item: Curve) => {
          const uniqueID: number = item.Mnemonic.MnemonicId || 0;
          if (!this.dataSeries[uniqueID]) {
            this.dataSeries[uniqueID] = markRaw(
              new XyDataSeries(this.sciInstance[index].wasmContext, {
                dataSeriesName: uniqueID.toString(),
              })
            );
          }
          this.customCurveName[uniqueID] = item.Mnemonic.MnemonicName;
          if (!this.uniqueData[uniqueID]) {
            this.dataSeries[uniqueID].appendRange([1, 2], [NaN, NaN]);
            this.dataReload.push(uniqueID);
          } else {
            this.dataSeries[uniqueID].clear();
            this.dataSeries[uniqueID].appendRange(
              this.uniqueData[uniqueID].xValues,
              this.uniqueData[uniqueID].yValues,
              this.uniqueData[uniqueID].yValues
            );
          }
        });

        this.createXAxis(index, showScale, track, scaleBackground);

        let firstTrack = true;
        track.Curve.map((item: Curve, i: number) => {
          // Create YAxis
          this.createYAxis(index, i, track, firstTrack);
          if (!this.fastmountainSeries[index]) {
            this.fastmountainSeries[index] = [];
          }
          this.createMountainObject(track.Curve[i], firstTrack, index, i, item.Mnemonic.MnemonicId?.toString() || '0');
          this.createLineObject(track.Curve[i], firstTrack, index, i, item.Mnemonic.MnemonicId?.toString() || '0');
          firstTrack = false;
        });

        if (firstTrack) {
          this.createYAxis(index, 0, track, firstTrack);
        }
        this.createRollModifier(index);
        this.createCursorModifier(index);

        this.sciInstance[index].sciChartSurface.chartModifiers.add(
          new XAxisDragModifier({
            dragMode: EDragMode.Panning,
          })
        );

        this.rubberBandXyZoomModifier[index] = new RubberBandXyZoomModifier({
          xyDirection:
            this.widgetSettingsDetail?.General.Orientation === OrientationTypes.Horizontal ? EXyDirection.YDirection : EXyDirection.XDirection,
        });
        this.sciInstance[index].sciChartSurface.chartModifiers.add(this.rubberBandXyZoomModifier[index]);
        const mouseWheelModifier = new MouseWheelZoomModifier();
        mouseWheelModifier.modifierMouseWheel = (args) => {
          const delta = args.mouseWheelDelta * 0.1;
          mouseWheelModifier.parentSurface.xAxes.asArray().forEach((x) => {
            x.scroll(delta, EClipMode.None);
          });
        };
        this.sciInstance[index].sciChartSurface.chartModifiers.add(mouseWheelModifier);
        if (track.Background && track.Background != 'transparent') {
          this.sciInstance[index].sciChartSurface.background = this.convertColor(track.Background);
        } else {
          this.sciInstance[index].sciChartSurface.background = 'transparent';
        }
      },
      async initTrack(name: string, index: number, track: TrackSettings, showScale: boolean, scaleBackground: string) {
        const element = document.getElementById(name);
        if (!element) {
          console.log('element not found' + name);
          return;
        }
        this.sciInstance[index] = await SciChartSurface.create(name);
        this.sciInstance[index].sciChartSurface.padding = new Thickness(0, 0, 2, 0);

        this.addCompleteTrack(track, index, showScale, scaleBackground);
      },
      async initChart() {
        const query: any[] = [];
        this.widgetSettingsDetail?.Track.forEach((element: TrackSettings, i: number) => {
          if (element.TrackType !== 'Index') {
            let showScale = false;
            let scaleBackground = '';
            if (
              this.widgetSettingsDetail?.Track &&
              this.widgetSettingsDetail?.Track[i - 1] &&
              this.widgetSettingsDetail?.Track[i - 1].TrackType == 'Index'
            ) {
              showScale = true;
              scaleBackground = this.convertColor(this.widgetSettingsDetail?.Track[i - 1].Background);
            }
            query.push(this.initTrack('scichart-root-' + this.chartId + '-' + i, i, element, showScale, scaleBackground));
          }
        });
        const res = await Promise.all(query);
        this.startStreaming();
        this.counter++;
        return res;
      },
      formatTime(unixTimestamp: any) {
        const a = new Date(unixTimestamp * 1000);
        const seconds = a.getSeconds();
        const minutes = a.getMinutes();
        const hour = a.getHours();
        return (
          (hour < 10 ? '0' + hour : hour) +
          ':' +
          (minutes < 10 ? '0' + minutes : minutes) +
          ':' +
          (seconds < 10 ? '0' + seconds : seconds)
        ).toString();
      },
      onHeader(header: DataStoreChannelState[]) {
        console.log('header', header);
        header.forEach((value: DataStoreChannelState) => {
          // if (value?.dataType == 'string') {
          //   const uniqueID: string = value.channelId;
          //   this.unitData[uniqueID] = value.unit;
          // }
          if (this.minScale == undefined || value.StartIndex < this.minScale) {
            this.minScale = Number(value.StartIndex) / this.getDivider();
            this.setZoomLimit();
          }
        });
      },
      startStreaming() {
        const curveDetails: number[] = [];
        this.widgetSettingsDetail?.Track.forEach((element: TrackSettings) => {
          if (element.Curve && element.Curve.length) {
            element.Curve.forEach((ele: Curve) => {
              if (ele.Mnemonic.MnemonicId && !this.startedCurve.includes(Number(ele.Mnemonic.MnemonicId))) {
                curveDetails.push(Number(ele.Mnemonic.MnemonicId));
                this.startedCurve.push(Number(ele.Mnemonic.MnemonicId));
              }
            });
          }
        });
        if (curveDetails.length) {
          ChannelDataService.startStreaming({
            ChannelIds: curveDetails,
            callback: this.onMessage,
          });
          ChannelDataService.getState(curveDetails, this.onHeader);
          // ChannelDataService.getMetaData(curveDetails, this.onHeader);
        }
      },
      setZoomLimit() {
        if (!this.minScale || !this.endDate) {
          return;
        }
        (this.xAxis as NumericAxis[]).forEach((item: NumericAxis) => {
          item.visibleRangeLimit = new NumberRange(this.minScale - (this.viewPort / 90) * 10, this.endDate + (this.viewPort / 90) * 10);
        });
      },
      checkRequestRangeNeeded() {
        let needed = false;
        Object.keys(this.curvesStartIndex).forEach((element) => {
          if (this.curvesStartIndex[element] > this.startDate) {
            needed = true;
          }
        });
        if (needed) {
          this.requestHistoricalData({
            startIndex: this.startDate,
            endIndex: this.startDate,
          });
        }
      },
      getDivider() {
        return this.indexDivider[(this.widgetSettingsDetail?.General.IndexType as keyof typeof this.indexDivider) || 0];
      },
      onMessage(curveData: DataStoreChannelDataItem[]) {
        if (curveData && curveData.length) {
          curveData.forEach((data: DataStoreChannelDataItem) => {
            if (
              data.KeyIndex &&
              data.Value != undefined &&
              data.Value != null &&
              data.Value.toString() != '' &&
              data.ChannelId &&
              !isNaN(Number(data.Value))
            ) {
              const uniqueID: number = data.ChannelId;
              if (!this.uniqueData[uniqueID]) {
                this.uniqueData[uniqueID] = toRaw({
                  xValues: [],
                  yValues: [],
                  textValues: [],
                });
                clearTimeout(this.checkRequestRange);
                this.checkRequestRange = setTimeout(() => {
                  this.checkRequestRangeNeeded();
                }, 1500);
              }
              if (
                !this.uniqueData[uniqueID].xValues.length ||
                this.uniqueData[uniqueID].xValues[this.uniqueData[uniqueID].xValues.length - 1] <= Number(data.KeyIndex) / this.getDivider()
              ) {
                data.Value = Number(Number(data.Value).toFixed(6)) as any;
                if (!this.curvesStartIndex[uniqueID]) {
                  this.curvesStartIndex[uniqueID] = Number(data.KeyIndex) / this.getDivider();
                }
                this.setEndDateStartDate(data);
                if (!this.zoomEnable) {
                  clearTimeout(this.timeoutVisible);
                  this.timeoutVisible = setTimeout(() => {
                    this.xAxis.forEach((item: any) => {
                      item.visibleRange = new NumberRange(this.endDate - this.viewPort, this.endDate + (this.viewPort / 90) * 10);
                    });
                  }, 10);
                }
                const indexes = Number(data.KeyIndex) / this.getDivider();
                this.uniqueData[uniqueID].xValues.push(indexes);
                this.uniqueData[uniqueID].yValues.push(data.Value);
                if (this.dataReload.includes(uniqueID)) {
                  this.dataReload = this.dataReload.filter((item) => item != uniqueID);
                  this.dataSeries[uniqueID].clear();
                  this.dataSeries[uniqueID].appendRange(
                    this.uniqueData[uniqueID].xValues,
                    this.uniqueData[uniqueID].yValues,
                    this.uniqueData[uniqueID].yValues
                  );
                } else {
                  this.dataSeries[uniqueID].append(indexes, data.Value, data.Value);
                }
                this.dataload = true;
              }
            }
          });
        }
      },
      setEndDateStartDate(curveData: DataStoreChannelDataItem) {
        if (curveData && curveData.KeyIndex) {
          if (!this.minScale || this.minScale * this.getDivider() > curveData.KeyIndex) {
            this.minScale = Number(curveData.KeyIndex) / this.getDivider();
            this.setZoomLimit();
          }
          if (!this.startDate || this.startDate * this.getDivider() > curveData.KeyIndex) {
            this.startDate = Number(curveData.KeyIndex) / this.getDivider();
          }
          if (!this.endDate || this.endDate * this.getDivider() < curveData.KeyIndex) {
            this.endDate = Number(curveData.KeyIndex) / this.getDivider();
            this.setZoomLimit();
          }
        }
      },
      zoomRealData() {
        this.zoomEnable = !this.zoomEnable;
        if (!this.zoomEnable) {
          if (this.scale.max) {
            this.viewPort = ((this.scale.max - this.scale.min) / 100) * 90;
          }
          this.xAxis.forEach((element) => {
            element.visibleRange = new NumberRange(this.endDate - this.viewPort, this.endDate + (this.viewPort / 90) * 10);
          });
        }
      },
      setValue() {
        this.widgetSettingsDetail?.Track.forEach((ele: TrackSettings, it: number) => {
          if (ele.TrackType != 'Index') {
            ele.Curve.forEach((ele1: any) => {
              if (
                ele1.Mnemonic &&
                ele1.Mnemonic.MnemonicId &&
                this.uniqueData[ele1.Mnemonic.MnemonicId] &&
                this.uniqueData[ele1.Mnemonic.MnemonicId].xValues &&
                this.uniqueData[ele1.Mnemonic.MnemonicId].xValues.length
              ) {
                const uniqueID = ele1.Mnemonic.MnemonicId;
                this.dataSeries[uniqueID].clear();
                this.dataSeries[uniqueID].appendRange(this.uniqueData[uniqueID].xValues, this.uniqueData[uniqueID].yValues);
                this.xAxis[it].visibleRange = new NumberRange(this.scale.min, this.scale.max);
              }
            });
          }
        });
      },
      clearAndRender() {
        this.sciInstance.forEach((element: any) => {
          const sciChartSurface = toRaw(element?.sciChartSurface);
          sciChartSurface?.delete();
        });
        this.sciInstance = [];
        this.removeitem = false;
        clearTimeout(this.propertiesChangeTimeout);
        clearTimeout(this.updateTimeout);
        this.propertiesChangeTimeout = setTimeout(() => {
          this.dataSeries = {};
          this.trackScaleValues = {};
          this.removeitem = true;
          this.$nextTick(() => {
            this.initChart().then(() => {
              this.setValue();
            });
          });
        }, 250);
      },
    },
  });
</script>
<style scoped>
  .horizontal-header {
    max-height: 82px;
    display: flex;
    overflow: auto;
  }
  .vertical-header {
    max-width: 102px;
    display: flex;
    flex-direction: column-reverse;
    overflow: auto;
  }
  .canvas-drawing {
    touch-action: none;
  }

  .indextype-popup {
    position: absolute;
    height: 150px;
    width: 86%;
    max-width: 300px;
    padding: 10px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--widget-label-color);
    background-color: var(--grid-item-bg);
    border: 1px solid var(--property-border-color);
    box-shadow: 6px 7px 10px 0px var(--popup-box-shadow);
  }

  .title-row {
    position: relative;
    z-index: 2;
    height: 40px;
    padding: 0;
  }

  .invisible div {
    visibility: hidden;
  }

  .invisible:hover div {
    visibility: visible;
  }

  .invisible:hover {
    background-color: var(--curve-editor-bg);
  }

  .title-row-override {
    position: absolute;
    width: 160px;
    right: 0;
  }

  .comp-head {
    height: 30px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .comp-head .labelSpan {
    padding: 2px 10px 2px 14px;
    width: 100%;
  }

  .comp-head .labelSpan.alert-padding {
    padding: 2px 10px 2px 24px;
  }

  .title-cointainer {
    flex-direction: column;
    display: flex;
    min-height: 0;
  }

  .comp-head span {
    padding: 10px;
  }

  .column {
    width: 30%;
  }

  .pan-button {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 28px;
    position: absolute;
    right: 6px;
    top: 10px;
    z-index: 2;
  }

  .pan-button .chart-control {
    margin-left: 6px;
    cursor: pointer;
    position: relative;
  }

  .icon-color {
    fill: var(--widget-label-color);
  }

  .chart-control.inactive .icon-color {
    fill: var(--inactive-control);
  }

  .zoom-items {
    width: 82px;
    height: auto;
    position: absolute;
    right: 0;
    padding: 10px 0;
    color: var(--text-tertiary);
    background-color: var(--bg-app);
    z-index: 4;
    font-size: 12px;
  }

  .zoom-items .option-div {
    padding: 2px 10px;
  }
  .zoom-items .option-div:hover {
    background-color: var(--hover-primary);
  }

  .logPopupContainer {
    z-index: 100;
  }

  .no-pointer {
    pointer-events: none;
  }

  .chart-wrap {
    position: relative;
    z-index: 1;
    padding: 1px;
  }

  .horizontal-chart {
    display: flex;
    height: 100%;
    flex-direction: row;
    overflow: overlay;
  }

  .horizontal-chart .chart-min {
    padding-bottom: 3px;
  }

  .verticle-chart {
    display: flex;
    height: 100%;
    flex-direction: column-reverse;
    overflow: auto;
    margin: 0 0 5px 0;
  }

  .p-b-15 {
    padding-bottom: 15px;
  }

  .chart-min {
    min-width: 75px;
    min-height: 120px;
  }

  .chart-min.index-scale {
    min-width: 130px;
  }

  .verticle-chart .chart-min {
    min-width: 130px;
    min-height: 55px;
  }

  .verticle-chart .chart-min.index-scale {
    min-height: 70px;
  }

  .horizontal-chart .p-b-15 {
    padding-bottom: 3px;
    padding-left: 15px;
  }
  .horizontal-chart .no-padding {
    padding-left: 0;
  }

  .left-date {
    position: absolute;
    z-index: 1;
    bottom: 0;
    left: 5px;
    color: #000000;
    font-size: 11px;
    letter-spacing: 1px;
  }

  .horizontal-chart .left-date {
    transform: rotate(-90deg);
    bottom: unset;
    top: 26px;
    left: -29px;
  }

  .right-date {
    position: absolute;
    z-index: 1;
    bottom: 0;
    right: 5px;
    color: #000000;
    font-size: 11px;
    letter-spacing: 1px;
  }

  .horizontal-chart .right-date {
    transform: rotate(-90deg);
    bottom: 30px;
    top: unset;
    left: -29px;
    right: unset;
  }

  .right-date.dark,
  .left-date.dark {
    color: #ffffff;
  }

  .border-dummy {
    border: 1px solid;
    pointer-events: none;
  }

  .border-dummy-nonindex-verticle {
    position: absolute;
    height: calc(100% - 5px);
    width: 100%;
    margin: 0 0 0 0;
    z-index: 1;
  }

  .border-dummy-index-verticle {
    position: absolute;
    height: calc(100% - 5px);
    width: calc(100% - 58px);
    margin: 0px 0px 0 43px;
    z-index: 2;
  }

  .depth-chart .border-dummy-index-verticle {
    width: calc(100% - 44px);
    margin: -1px 0px 0 40px;
    height: calc(100% - 2px);
  }

  .border-dummy-nonindex-horizontal {
    position: absolute;
    height: 100%;
    width: 100%;
    margin: 0;
    z-index: 2;
  }

  .border-dummy-index-horizontal {
    position: absolute;
    height: calc(100% - 25px);
    width: 100%;
    margin: 0px 0px 0 0;
    z-index: 1;
  }

  .depth-chart .border-dummy-index-horizontal {
    height: calc(100% - 13px);
  }

  .p-2 {
    padding: 2px;
  }

  svg {
    pointer-events: none;
  }
  .alert-container {
    position: absolute;
    z-index: 2;
    top: 7px;
  }
  .override-height {
    height: calc(100% - 50px);
  }
  .override-date-pos {
    top: 65px !important;
  }

  .scichart-overview {
    position: absolute !important;
    z-index: 1;
  }

  .vertical-scroll {
    top: 0px;
    right: 2px;
    width: 5px;
    height: calc(100% - 8px);
    margin: 3px 0px 3px 0px;
  }

  .horizontal-scroll {
    bottom: 0px;
    left: 2px;
    width: calc(100% - 8px);
    height: 5px;
    margin: 0px;
  }

  ::v-deep .vertical-scroll .overview-selected rect {
    width: 5px !important;
  }

  ::v-deep .horizontal-scroll .overview-selected rect {
    height: 5px !important;
  }

  .disabled {
    cursor: not-allowed !important;
  }

  .disabled .icon-color {
    fill: var(--disabledButtonBg);
  }
  .lithology {
    opacity: 1;
  }
</style>
