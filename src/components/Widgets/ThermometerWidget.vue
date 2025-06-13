<template>
  <div
    :id="`thermometer_${chartId}`"
    class="chartWrapper"
    :class="{ blinking: isBlinking }"
    :style="{ ...parentStyles, '--dynamic-color': dynamicColor }">
    <StatusBar v-show="widgetSettingsDetail.General.ShowStatusbar" :color="dynamicColor" />
    <div v-show="widgetSettingsDetail?.General?.ShowTitle" class="chartTitle" :style="titleStyles">{{ widgetSettingsDetail?.General?.Title }}</div>
    <div :id="`comp_content_${chartId}`" class="chartContainer comp-content">
      <canvas :id="`canvas_${chartId}`" ref="chartCanvas"></canvas>
      <canvas :id="`progressbar_${chartId}`" ref="progressCanvas"></canvas>
    </div>
    <div v-if="widgetSettingsDetail?.General?.ShowValue || widgetSettingsDetail?.General?.ShowUom" class="compFooter">
      <span v-if="widgetSettingsDetail?.General?.ShowValue" :style="valueStyles">{{ Number(value).toFixed(decimal).toString() }}</span>
      <span v-if="widgetSettingsDetail?.General?.ShowUom" :style="unitStyles">{{ widgetSettingsDetail?.Mnemonics?.[0]?.Unit }}</span>
    </div>
  </div>
</template>

<script lang="ts">
  import { store } from '../../main';
  import StatusBar from '../StatusBar.vue';
  import { defineComponent, watch } from 'vue';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { IResizeData } from '../../../server/interfaces/dashboard.interfaces';
  import { ERangeType } from '../../../server/helpers/settings.helpers/range.settings.helper';
  import ThermometerSettings from '../../../server/helpers/settings.widgets/thermometer.settings';
  import { DataStoreChannelDataItem } from '../../helpers/datastore/datamodels/datastore.channelitem';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';

  enum AlignType {
    CENTER = 'center',
    LEFT = 'left',
    MIDDLE = 'middle',
  }

  enum GlobalCompOp {
    DESTINATION_OUT = 'destination-out',
  }

  enum FillStyle {
    TRANSPARENT = 'transparent',
    LIGHTGRAY = '#dedede',
  }

  let timeoutid = 0;

  export default defineComponent({
    name: 'ThermometerWidget',
    components: {
      StatusBar,
    },
    props: {
      chartId: {
        type: String,
        required: true,
      },
      widgetSettingsDetail: {
        type: Object as () => ThermometerSettings,
        required: true,
      },
      resize: {
        type: Object as () => IResizeData,
        required: true,
      },
    },
    data() {
      return {
        value: 0 as number,
        radius: 0 as number,
        decimal: 0 as number,
        timeout: 0 as number,
        initialScale: 0 as number,
        channelIds: [] as number[],
        isBlinking: false as boolean,
        dynamicColor: 'transparent' as string,
        parentNode: null as HTMLElement | null,
        canvas: null as HTMLCanvasElement | null,
        ctx: null as CanvasRenderingContext2D | null,
        canvasProgress: null as HTMLCanvasElement | null,
        ctxProgress: null as CanvasRenderingContext2D | null,
      };
    },
    computed: {
      currentTheme() {
        return store.theme;
      },
      parentStyles() {
        const backgroundKey = this.widgetSettingsDetail?.Appearance?.BackgroundColour as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][backgroundKey] ?? this.widgetSettingsDetail?.Appearance?.BackgroundColour ?? '';
        const baorderdKey = this.widgetSettingsDetail?.Appearance?.BorderColour as keyof ColorSet;
        const baorderColorValue = themeColors[this.currentTheme][baorderdKey] ?? this.widgetSettingsDetail?.Appearance?.BorderColour ?? '';

        return {
          backgroundColor: colorValue,
          borderColor: baorderColorValue,
          borderWidth: `${this.widgetSettingsDetail?.General?.BorderThickness}px`,
        };
      },
      titleStyles() {
        const titleFontey = this.widgetSettingsDetail?.Appearance?.TitleFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][titleFontey] ?? this.widgetSettingsDetail?.Appearance?.TitleFontColor ?? '';
        return {
          fontFamily: this.widgetSettingsDetail?.Font?.Title?.FontFamily,
          fontSize: `${this.widgetSettingsDetail?.Font?.Title?.FontSize}px`,
          fontWeight: this.widgetSettingsDetail?.Font?.Title?.FontWeight,
          fontStyle: this.widgetSettingsDetail?.Font?.Title?.FontStyle,
          color: colorValue,
        };
      },
      valueStyles() {
        const valueFontey = this.widgetSettingsDetail?.Appearance?.ValueFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][valueFontey] ?? this.widgetSettingsDetail?.Appearance?.ValueFontColor ?? '';
        return {
          fontFamily: this.widgetSettingsDetail?.Font?.Value?.FontFamily,
          fontSize: `${this.widgetSettingsDetail?.Font?.Value?.FontSize}px`,
          fontWeight: this.widgetSettingsDetail?.Font?.Value?.FontWeight,
          fontStyle: this.widgetSettingsDetail?.Font?.Value?.FontStyle,
          color: colorValue,
        };
      },
      unitStyles() {
        const unitFontey = this.widgetSettingsDetail?.Appearance?.UnitFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][unitFontey] ?? this.widgetSettingsDetail?.Appearance?.UnitFontColor ?? '';
        return {
          fontFamily: this.widgetSettingsDetail?.Font?.Unit?.FontFamily,
          fontSize: `${this.widgetSettingsDetail?.Font?.Unit?.FontSize}px`,
          fontWeight: this.widgetSettingsDetail?.Font?.Unit?.FontWeight,
          fontStyle: this.widgetSettingsDetail?.Font?.Unit?.FontStyle,
          color: colorValue,
        };
      },
      blinkingValues() {
        return this.widgetSettingsDetail?.Range?.RangeColors?.map((item) => item.enabled && item.blinking);
      },
    },
    created() {
      watch(
        () => store.theme,
        () => {
          this.bindEvents();
        }
      );
      watch(
        () => this.resize.count,
        () => {
          if (this.resize && (!this.resize.id || this.resize.id == this.chartId)) {
            this.handleResize();
          }
        }
      );
      watch(
        () => this.widgetSettingsDetail,
        () => {
          this.handleResize();
        },
        { deep: true }
      );
      watch(
        () => this.value,
        () => {
          this.handleBlink();
        }
      );
      watch(
        () => this.blinkingValues,
        (newValue, oldValue) => {
          const theme = themeColors?.[this.currentTheme];

          this.blinkingValues?.forEach((item: boolean, index: number) => {
            const rangeColor = this.widgetSettingsDetail?.Range?.RangeColors?.[index];

            if (item && newValue?.[index] !== oldValue?.[index] && rangeColor) {
              const colorKey = rangeColor.color;
              const resolvedColor = theme?.[colorKey as keyof ColorSet] ?? colorKey;
              if (resolvedColor === this.dynamicColor) {
                this.handleBlink();
              }
            }
          });
        }
      );
    },
    mounted() {
      this.$nextTick(async () => {
        setTimeout(() => {
          this.bindEvents();
          this.value = this.widgetSettingsDetail?.Range?.RangeMin || 0;
          this.initialScale = this.widgetSettingsDetail?.Range?.RangeMin || 0;

          // Handle window resize
          window.addEventListener('resize', this.handleResize);
        }, 200);
      });
    },
    beforeUnmount() {
      this.stopSubscription();
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      bindEvents: function () {
        if (this.channelIds?.length) {
          this.stopSubscription();
        }

        this.canvas = this.$refs.chartCanvas as HTMLCanvasElement | null;
        this.canvasProgress = this.$refs.progressCanvas as HTMLCanvasElement | null;
        this.parentNode = this.canvas?.parentElement?.parentElement as HTMLElement | null;

        if (this.widgetSettingsDetail?.Mnemonics?.[0]?.MnemonicId) {
          this.channelIds = [+this.widgetSettingsDetail.Mnemonics[0].MnemonicId];
          this.startSubscription();
        }

        if (this.parentNode) {
          if (this.canvas) {
            this.canvas.width = this.parentNode.clientWidth;
            this.canvas.height = this.parentNode.clientHeight;
            this.ctx = this.canvas.getContext('2d');

            this.radius = Math.floor(this.canvas.width / 8) > 20 ? 20 : Math.floor(this.canvas.width / 8);
          }

          if (this.canvasProgress) {
            this.canvasProgress.width = this.parentNode.clientWidth;
            this.canvasProgress.height = this.parentNode.clientHeight;
            this.ctxProgress = this.canvasProgress.getContext('2d');
          }
        }
        this.drawChart();
        this.drawProgress();
      },
      capitalize: function (s: string = '') {
        return (s && String(s[0]).toUpperCase() + String(s).slice(1)) || '';
      },
      drawChart: function () {
        if (this.ctx && this.canvas) {
          let range = 100;
          if (this.widgetSettingsDetail?.Range && this.widgetSettingsDetail.Range.RangeMax > this.widgetSettingsDetail.Range.RangeMin) {
            range = this.widgetSettingsDetail?.Range ? this.widgetSettingsDetail.Range.RangeMax - this.widgetSettingsDetail.Range.RangeMin : 0;
          }
          const typeVal = this.widgetSettingsDetail?.Range?.RangeType == ERangeType.PERCENTAGE ? 100 : range;

          this.fillRangeColors(typeVal);
          this.drawOuterRect();

          if (this.widgetSettingsDetail?.General?.ShowScale) {
            this.drawRuler();
          }
        }
      },
      fillRangeColors: function (typeVal: number) {
        if (this.ctx && this.canvas) {
          this.ctx.beginPath();
          this.ctx.rect(this.canvas.width / 2 - 20, 10, this.radius * 2, this.canvas.height - 20);
          this.ctx.fillStyle = FillStyle.TRANSPARENT;
          this.ctx.fill();
        }
        if (this.widgetSettingsDetail?.Range?.RangeColors.length) {
          this.widgetSettingsDetail.Range.RangeColors.forEach((ele) => {
            if (!ele.enabled) return;
            const theme = themeColors?.[this.currentTheme];
            if (this.ctx && this.canvas) {
              if (this.widgetSettingsDetail?.Range) {
                this.ctx.beginPath();
                this.ctx.rect(
                  this.canvas.width / 2 - this.radius,
                  this.canvas.height -
                    10 -
                    (this.widgetSettingsDetail.Range.RangeType != ERangeType.PERCENTAGE
                      ? (ele.min < this.widgetSettingsDetail.Range.RangeMin ? this.widgetSettingsDetail.Range.RangeMin : ele.min) -
                        this.widgetSettingsDetail.Range.RangeMin
                      : ele.min < this.widgetSettingsDetail.Range.RangeMin
                        ? this.widgetSettingsDetail.Range.RangeMin
                        : ele.min) *
                      ((this.canvas.height - 20) / typeVal),
                  this.radius * 2,
                  -((ele.max > this.widgetSettingsDetail.Range.RangeMax ? this.widgetSettingsDetail.Range.RangeMax : ele.max) - ele.min) *
                    ((this.canvas.height - 20) / typeVal)
                );
                const resolvedColor = theme?.[ele.color as keyof ColorSet] ?? ele.color;
                this.ctx.fillStyle = ele.enabled ? resolvedColor : FillStyle.LIGHTGRAY;
                this.ctx.fill();
              }
            }
          });
        }

        if (this.ctx && this.canvas) {
          this.ctx.save();
          this.ctx.globalCompositeOperation = GlobalCompOp.DESTINATION_OUT;
          this.ctx.lineWidth = 10;
          this.ctx.beginPath();
          this.ctx.arc(this.canvas.width / 2, this.radius + 10, this.radius + 7, 1 * Math.PI, 0);
          this.ctx.stroke();
          this.ctx.restore();
        }
      },
      drawOuterRect: function () {
        if (this.ctx && this.canvas) {
          const boarderdKey = this.widgetSettingsDetail?.Appearance?.BorderColour as keyof ColorSet;
          const boarderColorValue = themeColors[this.currentTheme][boarderdKey] ?? this.widgetSettingsDetail?.Appearance?.BorderColour ?? '';

          this.ctx.strokeStyle = boarderColorValue;

          this.ctx.lineWidth = 4;
          this.ctx.beginPath();
          this.ctx.arc(this.canvas.width / 2, this.radius + 10, this.radius, 1 * Math.PI, 0);
          this.ctx.moveTo(this.canvas.width / 2 - this.radius, this.radius + 10);
          this.ctx.lineTo(this.canvas.width / 2 - this.radius, this.canvas.height - 10);
          this.ctx.lineTo(this.canvas.width / 2 + this.radius, this.canvas.height - 10);
          this.ctx.lineTo(this.canvas.width / 2 + this.radius, this.radius + 10);
          this.ctx.stroke();
        }
      },
      drawRuler: function () {
        if (this.canvas && this.ctx) {
          this.ctx.textBaseline = AlignType.MIDDLE;

          let fontSize = Math.floor((this.widgetSettingsDetail.Font.Value?.FontSize as unknown as number) * this.radius * 0.07);
          if (fontSize > (this.widgetSettingsDetail.Font.Value?.FontSize as unknown as number)) {
            fontSize = this.widgetSettingsDetail.Font.Value?.FontSize as unknown as number;
          }

          const markerKey = this.widgetSettingsDetail?.Appearance?.MarkerColor as keyof ColorSet;
          const markerColorValue = themeColors[this.currentTheme][markerKey] ?? this.widgetSettingsDetail?.Appearance?.MarkerColor ?? '';

          this.ctx.font = `${this.widgetSettingsDetail?.Font?.Value?.FontStyle} ${this.widgetSettingsDetail?.Font?.Value?.FontWeight} ${fontSize}px ${this.widgetSettingsDetail?.Font?.Value?.FontFamily}`;
          this.ctx.fillStyle = markerColorValue;

          const min = this.widgetSettingsDetail.Range?.RangeMin || 0;
          const max = this.widgetSettingsDetail.Range?.RangeMax || 0;

          const minGap = 40;
          const padding = 12;
          const availableHeight = this.canvas.height - 2 * padding;
          const numSteps = Math.floor(availableHeight / minGap);
          const stepSize = (max - min) / (numSteps + 1);

          for (let i = 0; i <= numSteps + 1; i++) {
            const y = padding + i * (availableHeight / (numSteps + 1));
            const value = max - i * stepSize;
            this.ctx.fillText(value.toFixed(this.decimal), this.canvas.width / 2 + this.radius + 4, y);
          }
        }
      },
      drawProgress: function () {
        const animateProgress = () => {
          const interval = 2;

          if (Math.round(this.value) != Math.round(this.initialScale)) {
            if (this.value < this.initialScale) {
              this.initialScale -= interval;
              if (this.value > this.initialScale) {
                this.initialScale = this.value;
              }
            } else {
              this.initialScale += interval;
              if (this.value < this.initialScale) {
                this.initialScale = this.value;
              }
            }

            this.drawProgress();
            this.drawMovingRect();
            if (this.timeout) {
              cancelAnimationFrame(this.timeout);
            }
            this.timeout = requestAnimationFrame(animateProgress);
          }
        };

        requestAnimationFrame(animateProgress);
      },
      drawMovingRect: function () {
        if (this.ctxProgress && this.canvasProgress) {
          this.ctxProgress.clearRect(0, 0, this.canvasProgress.width, this.canvasProgress.height);
          let range = 100;
          const barwidth = this.radius * 0.6;
          if (this.widgetSettingsDetail?.Range && (this.widgetSettingsDetail.Range.RangeMax || 0) > (this.widgetSettingsDetail.Range.RangeMin || 0)) {
            range = this.widgetSettingsDetail.Range.RangeMax - this.widgetSettingsDetail.Range.RangeMin;
          }
          let x1 = 0;
          if (this.initialScale >= (this.widgetSettingsDetail?.Range?.RangeMax || 0)) {
            x1 = this.canvasProgress.height - barwidth - 12;
          } else if (this.initialScale >= (this.widgetSettingsDetail?.Range?.RangeMin || 0)) {
            x1 = (this.initialScale - (this.widgetSettingsDetail?.Range?.RangeMin || 0)) * ((this.canvasProgress.height - barwidth - 12) / range);
          }
          const progressKey = this.widgetSettingsDetail?.Appearance?.ProgressColor as keyof ColorSet;
          const progressColorValue = themeColors[this.currentTheme][progressKey] ?? this.widgetSettingsDetail?.Appearance?.ProgressColor ?? '';

          this.ctxProgress.fillStyle = progressColorValue;

          this.ctxProgress.lineWidth = 4;
          this.ctxProgress.beginPath();
          this.ctxProgress.arc(this.canvasProgress.width / 2, this.canvasProgress.height - x1, barwidth, 1 * Math.PI, 0);
          this.ctxProgress.moveTo(this.canvasProgress.width / 2 - barwidth, this.canvasProgress.height - x1);
          this.ctxProgress.lineTo(this.canvasProgress.width / 2 - barwidth, this.canvasProgress.height - barwidth);
          this.ctxProgress.lineTo(this.canvasProgress.width / 2 + barwidth, this.canvasProgress.height - barwidth);
          this.ctxProgress.lineTo(this.canvasProgress.width / 2 + barwidth, this.canvasProgress.height - x1);
          this.ctxProgress.fill();

          // Remove overflow in the bottom
          this.ctxProgress.save();
          this.ctxProgress.globalCompositeOperation = GlobalCompOp.DESTINATION_OUT;
          this.ctxProgress.lineWidth = 4;
          this.ctxProgress.beginPath();
          this.ctxProgress.moveTo(this.canvasProgress.width / 2 - 20, this.canvasProgress.height - 12);
          this.ctxProgress.lineTo(this.canvasProgress.width / 2 - 20, this.canvasProgress.height);
          this.ctxProgress.lineTo(this.canvasProgress.width / 2 + 20, this.canvasProgress.height);
          this.ctxProgress.lineTo(this.canvasProgress.width / 2 + 20, this.canvasProgress.height - 12);
          this.ctxProgress.fill();
          this.ctxProgress.restore();
        }
      },
      handleResize: function () {
        this.$nextTick(() => {
          setTimeout(() => {
            this.bindEvents();
          }, 200);
        });
      },
      startSubscription: function () {
        const ChannelIds = this.channelIds;
        ChannelDataService.startStreaming({
          ChannelIds,
          callback: (data: DataStoreChannelDataItem[]) => {
            if (data?.length) {
              data.forEach((item: DataStoreChannelDataItem) => {
                if (
                  item &&
                  item.Value != undefined &&
                  item.Value != null &&
                  item.Value.toString() != '' &&
                  !isNaN(Number(item.Value)) &&
                  Number(item.Value)
                ) {
                  this.value = item.Value as unknown as number;
                  this.drawProgress();
                }
              });
            }
          },
        });
      },
      stopSubscription: function () {
        const ChannelIds: number[] = this.channelIds;
        ChannelDataService.stopStreaming(ChannelIds, this.handleSubscritptionStop);
      },
      handleSubscritptionStop: function () {
        this.channelIds = [];
      },
      handleBlink: function () {
        let blinkStart: number | null = null;
        let isBlinkingActive = false;

        if (timeoutid) {
          cancelAnimationFrame(timeoutid);
        }

        let newColor = '';
        let isBlinking = false;
        const theme = themeColors?.[this.currentTheme];

        this.widgetSettingsDetail?.Range?.RangeColors?.forEach((item) => {
          if (
            ((this.value > item.min && this.value <= item.max) ||
              (this.widgetSettingsDetail?.Range?.RangeMax && this.value > this.widgetSettingsDetail.Range.RangeMax)) &&
            item.enabled
          ) {
            const colorKey = item.color;
            const resolvedColor = theme?.[colorKey as keyof ColorSet] ?? colorKey;
            newColor = resolvedColor;
            if (item.blinking) {
              isBlinking = true;
            }
          }
        });

        this.dynamicColor = newColor;

        const animateBlink = (timestamp: number) => {
          if (!blinkStart) {
            blinkStart = timestamp;
          }

          const elapsed = timestamp - blinkStart;

          if (elapsed >= 3000) {
            this.isBlinking = false;
            cancelAnimationFrame(timeoutid);
            return;
          }

          if (Math.floor(elapsed / 500) % 2 === 0) {
            if (!isBlinkingActive && isBlinking) {
              this.isBlinking = true;
              isBlinkingActive = true;
            }
          } else {
            if (isBlinkingActive) {
              this.isBlinking = false;
              isBlinkingActive = false;
            }
          }

          timeoutid = requestAnimationFrame(animateBlink);
        };

        this.isBlinking = false;
        blinkStart = null;
        timeoutid = requestAnimationFrame(animateBlink);
      },
    },
  });
</script>

<style scoped>
  .chartWrapper {
    width: 100%;
    height: 100%;
    border-style: solid;
    border-color: transparent;
    display: flex;
    flex-flow: column;
    transition: background-color 0.5s ease;
  }

  .chartTitle {
    height: 26px;
    padding: 4px 10px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chartContainer {
    background: transparent !important;
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
  }

  .chartContainer :deep(canvas) {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    position: absolute;
  }

  .compFooter {
    width: 100%;
    height: 22px;
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
  }

  .blinking {
    animation: blinkBackground 1s infinite;
  }

  @keyframes blinkBackground {
    0%,
    100% {
      background-color: var(--dynamic-color);
    }

    50% {
      background-color: transparent;
    }
  }
</style>
