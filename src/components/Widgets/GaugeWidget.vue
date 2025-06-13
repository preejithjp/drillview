<template>
  <div
    :id="`guage_chart_${chartId}`"
    class="chartWrapper"
    :class="{ blinking: isBlinking }"
    :style="{ ...parentStyles, '--dynamic-color': dynamicColor }">
    <StatusBar v-show="widgetSettingsDetail.General.ShowStatusbar" :color="dynamicColor" />
    <div v-show="widgetSettingsDetail?.General?.ShowTitle" class="chartTitle" :style="titleStyles">{{ widgetSettingsDetail?.General?.Title }}</div>
    <div :id="`comp_content_${chartId}`" class="chartContainer comp-content" :style="contentStyles">
      <canvas :id="`canvas_${chartId}`" ref="gaugeCanvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
  import { store } from '../../main';
  import StatusBar from '../StatusBar.vue';
  import { defineComponent, watch } from 'vue';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { IResizeData } from '../../../server/interfaces/dashboard.interfaces';
  import GaugeSettings from '../../../server/helpers/settings.widgets/gauge.settings';
  import { EFontSize } from '../../../server/helpers/settings.helpers/font.settings.helper';
  import { DataStoreChannelDataItem } from '../../helpers/datastore/datamodels/datastore.channelitem';
  import { RangeColor, ERangeType } from '../../../server/helpers/settings.helpers/range.settings.helper';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';

  export interface GaugeChart {
    color: string;
    startangle: number;
    endangle: number;
  }

  enum InitType {
    LOAD = 'load',
    RESET = 'reset',
    THEMECHANGE = 'theme-change',
  }

  enum AlignType {
    CENTER = 'center',
    LEFT = 'left',
    MIDDLE = 'middle',
  }

  enum DirValue {
    DSC = 'dsc',
    ASC = 'asc',
  }

  enum ValueType {
    STRING = 'string',
  }

  const FontSizeFix = {
    // For bigger font size
    BB: 0.00001,
    BL: 0.007,
    BM: 0.015,
    BD: 0.022,
    // For large font size
    LB: 0.005,
    LL: 0.002,
    LM: 0.007,
    LD: 0.016,
    // For medium font size
    MB: 0.015,
    ML: 0.007,
    MM: 0.001,
    MD: 0.008,
    // For default font size
    DB: 0.02,
    DL: 0.015,
    DM: 0.005,
    DD: 0.001,
  };

  enum LineCap {
    ROUND = 'round',
  }

  let timeoutid = 0;
  let requestid = 0;
  const endangle = 40;
  const minangle = 140;
  const maxangle = 400;
  const startangle = 140;
  const centerfix = 1.15;
  const arcangle = 360 - (startangle - endangle);

  export default defineComponent({
    name: 'GaugeWidget',
    components: {
      StatusBar,
    },
    props: {
      chartId: {
        type: String,
        required: true,
      },
      widgetSettingsDetail: {
        type: Object as () => GaugeSettings,
        required: true,
      },
      resize: {
        type: Object as () => IResizeData,
        required: true,
      },
    },
    data() {
      return {
        dir: '' as string,
        degree: 0 as number,
        radius: 0 as number,
        cwidth: 0 as number,
        cheight: 0 as number,
        prevalue: 0 as number,
        datavalue: 0 as number,
        channelIds: [] as number[],
        isBlinking: false as boolean,
        isprocessing: false as boolean,
        chartsettings: [] as GaugeChart[],
        dynamicColor: 'transparent' as string,
        canvas: null as HTMLCanvasElement | null,
        contentElement: null as HTMLElement | null,
        dataarray: [] as DataStoreChannelDataItem[],
        ctx: null as CanvasRenderingContext2D | null,
      };
    },
    computed: {
      currentTheme() {
        return store.theme;
      },
      parentStyles() {
        const backgroundKey = this.widgetSettingsDetail?.Appearance?.BackgroundColour as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][backgroundKey] ?? this.widgetSettingsDetail?.Appearance?.BackgroundColour ?? '';
        const borderdKey = this.widgetSettingsDetail?.Appearance?.BorderColour as keyof ColorSet;
        const borderColorValue = themeColors[this.currentTheme][borderdKey] ?? this.widgetSettingsDetail?.Appearance?.BorderColour ?? '';

        return {
          backgroundColor: colorValue,
          borderColor: borderColorValue,
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
      contentStyles() {
        return {
          height: this.widgetSettingsDetail.General?.ShowTitle ? 'calc(100% - 26px)' : '100%',
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
          this.initGaugeChart(InitType.RESET, InitType.THEMECHANGE);
        }
      );
      watch(
        () => this.resize.count,
        () => {
          if (this.resize && (!this.resize.id || this.resize.id == this.chartId)) {
            this.handleResize(InitType.RESET, InitType.THEMECHANGE);
          }
        }
      );
      watch(
        () => this.widgetSettingsDetail,
        () => {
          this.handleResize(InitType.RESET);
        },
        { deep: true }
      );
      watch(
        () => this.datavalue,
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
        },
        { deep: true }
      );
    },
    mounted() {
      this.$nextTick(async () => {
        setTimeout(() => {
          this.initGaugeChart(InitType.LOAD);

          // Handle window resize
          window.addEventListener('resize', () => {
            this.handleResize(InitType.RESET, InitType.THEMECHANGE);
          });
        }, 200);
      });
    },
    beforeUnmount() {
      this.stopSubscription();
      window.removeEventListener('resize', () => {
        this.handleResize(InitType.RESET, InitType.THEMECHANGE);
      });
    },
    methods: {
      initGaugeChart: function (type: string, subtype?: string) {
        if (this.channelIds?.length) {
          this.stopSubscription();
        }

        if (type === InitType.LOAD) {
          this.datavalue = 0;
        }
        if (type == InitType.LOAD || (type == InitType.RESET && subtype != InitType.THEMECHANGE)) {
          this.dataarray = [];
        }
        if (type == InitType.LOAD || (type == InitType.RESET && subtype != InitType.THEMECHANGE)) {
          this.dir = DirValue.ASC;
          this.degree = startangle;
        }

        this.canvas = this.$refs.gaugeCanvas as HTMLCanvasElement | null;
        this.contentElement = this.canvas?.parentElement as HTMLElement | null;

        if (this.widgetSettingsDetail) {
          if (!this.datavalue && (type == InitType.LOAD || type == InitType.RESET)) {
            this.datavalue = parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`);
          }

          if (this.widgetSettingsDetail?.Mnemonics?.[0]?.MnemonicId) {
            this.channelIds = [+this.widgetSettingsDetail.Mnemonics[0].MnemonicId];
            this.startSubscription();
          }

          if (this.widgetSettingsDetail.Range) {
            if (this.datavalue && this.prevalue && Number(this.datavalue) < Number(this.prevalue)) {
              this.dir = DirValue.DSC;
            } else {
              this.dir = DirValue.ASC;
            }
          }

          this.drawGaugeChart();
        }
      },
      capitalize: function (s: string = '') {
        return (s && String(s[0]).toUpperCase() + String(s).slice(1)) || '';
      },
      drawGaugeChart: function () {
        if (this.canvas) {
          if (this.contentElement) {
            if (this.contentElement.clientWidth > this.contentElement.clientHeight) {
              this.canvas.width = this.contentElement.clientHeight + (this.contentElement.clientWidth - this.contentElement.clientHeight);
              this.canvas.height = this.contentElement.clientHeight;
            } else {
              this.canvas.width = this.contentElement.clientWidth;
              this.canvas.height = this.contentElement.clientWidth;
            }
          }

          this.ctx = this.canvas.getContext('2d');

          if (this.ctx) {
            this.cwidth = this.canvas.width;
            this.cheight = this.canvas.height;

            if (this.cwidth > this.cheight) {
              this.radius = this.cheight / 2;
            } else {
              this.radius = this.cwidth / 2;
            }

            this.ctx.clearRect(0, 0, this.cwidth, this.cheight);

            let arcAngle = 0;
            let diffAngle = 0;
            let secStartAngle = startangle;
            let secEndAngle = endangle;
            let chartObj: GaugeChart = {
              color: '',
              startangle: secStartAngle,
              endangle: secEndAngle,
            };

            this.chartsettings = [];
            if (this.widgetSettingsDetail?.Range?.RangeColors && this.widgetSettingsDetail.Range.RangeColors.length > 0) {
              let min = 0;
              let max = 0;
              const theme = themeColors?.[this.currentTheme];
              this.widgetSettingsDetail.Range.RangeColors.forEach((data: RangeColor) => {
                if (data.enabled) {
                  min = data.min || 0;
                  max = data.max || 0;

                  if (min > max) {
                    min = min + max;
                    max = min - max;
                    min = min - max;
                  }

                  if (this.widgetSettingsDetail?.Range?.RangeType == ERangeType.PERCENTAGE) {
                    diffAngle = (arcangle * (min - 0)) / 100;
                    arcAngle = (arcangle * (max - min)) / 100;
                  } else {
                    diffAngle =
                      (arcangle * (min - parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`))) /
                      (parseFloat(`${this.widgetSettingsDetail.Range?.RangeMax || 100}`) -
                        parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`));
                    arcAngle =
                      (arcangle * (max - min)) /
                      (parseFloat(`${this.widgetSettingsDetail.Range?.RangeMax || 100}`) -
                        parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`));
                  }

                  secStartAngle = startangle + diffAngle;
                  secEndAngle = secStartAngle + arcAngle;
                  if (secEndAngle > maxangle) {
                    secEndAngle = maxangle;
                  }
                  const resolvedColor = theme?.[data.color as keyof ColorSet] ?? data.color;

                  chartObj = {
                    color: resolvedColor,
                    startangle: secStartAngle,
                    endangle: secEndAngle,
                  };

                  this.chartsettings.push(chartObj);
                }
              });
            }

            if (this.chartsettings?.length > 0) {
              this.chartsettings.sort((a: GaugeChart, b: GaugeChart) => {
                return a.endangle - b.endangle;
              });
              const theme = themeColors?.[this.currentTheme];

              this.chartsettings.forEach((data: GaugeChart, index: number) => {
                const resolvedColor = theme?.[data.color as keyof ColorSet] ?? data.color;

                if (index == 0 && data.startangle > startangle) {
                  this.drawArc('#dedede', startangle, data.startangle);
                }

                this.drawArc(resolvedColor, data.startangle, data.endangle);

                if (index < this.chartsettings.length - 1) {
                  const diffSectorAngle = this.chartsettings[index + 1].startangle - this.chartsettings[index].endangle;
                  if (diffSectorAngle > 0) {
                    this.drawArc('#dedede', this.chartsettings[index].endangle, this.chartsettings[index + 1].startangle);
                  }
                }

                if (index == this.chartsettings.length - 1 && data.endangle != maxangle) {
                  this.drawArc('#dedede', data.endangle, maxangle);
                }
              });
            } else {
              this.drawArc('#dedede', startangle, maxangle);
            }

            this.drawSubMarkers();
            this.drawMainMarkers();
            this.drawScaleValues();
            this.drawNeedle();
          }
        }
      },
      drawArc: function (color: string, startdegree: number, enddegree: number) {
        if (this.ctx) {
          const startAngle = startdegree < minangle || startdegree > maxangle ? minangle : startdegree;
          const endAngle = enddegree > maxangle ? maxangle : enddegree < minangle ? minangle : enddegree;

          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = this.radius * 0.125;
          this.ctx.imageSmoothingEnabled = true;

          this.ctx.arc(
            this.cwidth / 2,
            (this.cheight / 2) * centerfix,
            this.radius * 0.9,
            this.degreesToRadians(startAngle),
            this.degreesToRadians(endAngle),
            false
          );

          this.ctx.stroke();
          this.ctx.closePath();
          this.ctx.restore();
        }
      },
      degreesToRadians: function (degrees: number) {
        return degrees * (Math.PI / 180);
      },
      radiansToDegrees: function (radians: number) {
        return radians * (180 / Math.PI);
      },
      drawSubMarkers: function () {
        if (this.ctx) {
          this.ctx.save();

          let x1, y1, x2, y2;
          const lineLength = this.radius * 0.79;
          const markerKey = this.widgetSettingsDetail?.Appearance?.MarkerColor as keyof ColorSet;
          const markerColorValue = themeColors[this.currentTheme][markerKey] ?? this.widgetSettingsDetail?.Appearance?.MarkerColor ?? '';

          this.ctx.fillStyle = markerColorValue;
          this.ctx.strokeStyle = markerColorValue;
          for (let i = 0; i < 51; i++) {
            const angle = ((i + 27.03) * (Math.PI * 2)) / 69.4;
            this.ctx.lineWidth = this.radius * 0.005;
            this.ctx.beginPath();

            x1 = this.cwidth / 2 + Math.cos(angle) * lineLength;
            y1 = (this.cheight / 2) * centerfix + Math.sin(angle) * lineLength;
            x2 = this.cwidth / 2 + Math.cos(angle) * (lineLength - lineLength / 10);
            y2 = (this.cheight / 2) * centerfix + Math.sin(angle) * (lineLength - lineLength / 10);

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);

            this.ctx.stroke();
          }

          this.ctx.restore();
        }
      },
      drawMainMarkers: function () {
        if (this.ctx) {
          this.ctx.save();

          let x1, y1, x2, y2;
          const lineLength = this.radius * 0.79;
          const markerKey = this.widgetSettingsDetail?.Appearance?.MarkerColor as keyof ColorSet;
          const markerColorValue = themeColors[this.currentTheme][markerKey] ?? this.widgetSettingsDetail?.Appearance?.MarkerColor ?? '';

          this.ctx.fillStyle = markerColorValue;
          this.ctx.strokeStyle = markerColorValue;
          for (let i = 0; i < 6; i++) {
            const angle = ((i + 2.7) * (Math.PI * 2)) / 6.938;
            this.ctx.lineWidth = this.radius * 0.008;
            this.ctx.beginPath();

            x1 = this.cwidth / 2 + Math.cos(angle) * lineLength;
            y1 = (this.cheight / 2) * centerfix + Math.sin(angle) * lineLength;
            x2 = this.cwidth / 2 + Math.cos(angle) * (lineLength - lineLength / 6);
            y2 = (this.cheight / 2) * centerfix + Math.sin(angle) * (lineLength - lineLength / 6);

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);

            this.ctx.stroke();
          }

          this.ctx.restore();
        }
      },
      drawScaleValues: function () {
        if (this.contentElement) {
          let canvas: HTMLCanvasElement | null = this.contentElement.querySelector(`#values_${this.chartId}`);

          if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = `values_${this.chartId}`;
            this.contentElement.appendChild(canvas);
          }

          if (canvas) {
            canvas.width = this.cwidth;
            canvas.height = this.cheight;

            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

            if (ctx) {
              ctx.clearRect(0, 0, this.cwidth, this.cheight);

              if (this.widgetSettingsDetail?.General?.ShowScale) {
                let secLabel = 0 as number;
                const secValue =
                  (parseFloat(`${this.widgetSettingsDetail.Range?.RangeMax || 100}`) -
                    parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`)) /
                  5;
                if (secValue) {
                  ctx.save();

                  let x, y;
                  const lineLength = this.radius * 0.56;
                  ctx.font = `${this.widgetSettingsDetail?.Font?.Value?.FontStyle} ${this.widgetSettingsDetail?.Font?.Value?.FontWeight} ${Math.floor(this.radius * (this.widgetSettingsDetail?.Font?.Value?.FontSize as unknown as number) * 0.01)}px  ${this.widgetSettingsDetail?.Font?.Value?.FontFamily}`;
                  ctx.textBaseline = AlignType.MIDDLE;
                  ctx.textAlign = AlignType.CENTER;
                  const valueFontey = this.widgetSettingsDetail?.Appearance?.ValueFontColor as keyof ColorSet;
                  const colorValue = themeColors[this.currentTheme][valueFontey] ?? this.widgetSettingsDetail?.Appearance?.ValueFontColor ?? '';

                  ctx.fillStyle = colorValue;
                  ctx.strokeStyle = colorValue;

                  secLabel = parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`);
                  for (let i = 0; i < 6; i++) {
                    const angle = ((i + 2.38) * (Math.PI * 2)) / 6.5;

                    ctx.beginPath();

                    x = this.cwidth / 2 + Math.cos(angle) * (lineLength - lineLength / 7);
                    y = (this.cheight / 2) * centerfix + Math.sin(angle) * (lineLength - lineLength / 7);

                    ctx.fillText(secLabel.toFixed(2), x, y);
                    ctx.stroke();

                    secLabel += secValue;
                    if (i == 5) {
                      secLabel = parseFloat(`${this.widgetSettingsDetail.Range?.RangeMax || 100}`);
                    }
                  }

                  ctx.restore();
                }
              }
            }
          }
        }
      },
      drawNeedle: function (datavalue: number | null = null, dir: string | null = null, degree: number | null = null) {
        if (!datavalue) {
          datavalue = this.datavalue;
        }

        if (!degree) {
          degree = this.degree;
        }

        if (!dir) {
          dir = this.dir;
        }

        if (this.contentElement) {
          let canvas: HTMLCanvasElement | null = this.contentElement.querySelector(`#needle_${this.chartId}`);
          const valueFontey = this.widgetSettingsDetail?.Appearance?.ValueFontColor as keyof ColorSet;
          const colorValue = themeColors[this.currentTheme][valueFontey] ?? this.widgetSettingsDetail?.Appearance?.ValueFontColor ?? '';

          if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = `needle_${this.chartId}`;
            this.contentElement.appendChild(canvas);
          }

          if (canvas) {
            canvas.width = this.cwidth;
            canvas.height = this.cheight;

            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

            if (ctx) {
              ctx.clearRect(0, 0, this.cwidth, this.cheight);

              if (this.widgetSettingsDetail?.General?.ShowValue || this.widgetSettingsDetail?.General?.ShowUom) {
                ctx.save();
                ctx.beginPath();

                if (!this.widgetSettingsDetail?.Mnemonics?.[0]?.Unit) {
                  ctx.textAlign = AlignType.CENTER;
                } else {
                  ctx.textAlign = AlignType.LEFT;
                }
                ctx.textBaseline = AlignType.MIDDLE;
                ctx.font = `${this.widgetSettingsDetail?.Font?.Value?.FontStyle} ${this.widgetSettingsDetail?.Font?.Value?.FontWeight} ${Math.floor(this.radius * (this.widgetSettingsDetail?.Font?.Value?.FontSize as unknown as number) * 0.01)}px  ${this.widgetSettingsDetail?.Font?.Value?.FontFamily}`;
                ctx.fillStyle = colorValue;
                ctx.strokeStyle = colorValue;

                let curValue = this.widgetSettingsDetail?.General?.ShowValue ? datavalue.toFixed(2) : '';
                const unitData = this.widgetSettingsDetail?.General?.ShowUom ? this.widgetSettingsDetail?.Mnemonics?.[0]?.Unit : '';
                if (!this.widgetSettingsDetail?.Mnemonics?.[0]?.Unit) {
                  curValue = unitData ? curValue + '' + unitData : curValue;
                  ctx.fillText(` ${curValue === '' ? '' : `[ ${curValue} ]`}`, this.cwidth / 2, this.cheight * centerfix * 0.58);
                } else {
                  const valueUnitText = curValue === '' ? '' : `[ ${curValue + unitData} ]`;
                  const textWidth = ctx.measureText(valueUnitText).width / 2;
                  let valX = this.cwidth / 2 - textWidth;
                  const valY = this.cheight * centerfix * 0.58;

                  switch (this.widgetSettingsDetail?.Font?.Unit?.FontSize) {
                    case EFontSize.Bigger:
                      switch (this.widgetSettingsDetail?.Font?.Value?.FontSize) {
                        case EFontSize.Bigger:
                          valX += this.radius * FontSizeFix.BB;
                          break;
                        case EFontSize.Large:
                          valX -= this.radius * FontSizeFix.BL;
                          break;
                        case EFontSize.Medium:
                          valX -= this.radius * FontSizeFix.BM;
                          break;
                        default:
                          valX -= this.radius * FontSizeFix.BD;
                          break;
                      }
                      break;
                    case EFontSize.Large:
                      switch (this.widgetSettingsDetail?.Font?.Value?.FontSize) {
                        case EFontSize.Bigger:
                          valX += this.radius * FontSizeFix.LB;
                          break;
                        case EFontSize.Large:
                          valX -= this.radius * FontSizeFix.LL;
                          break;
                        case EFontSize.Medium:
                          valX -= this.radius * FontSizeFix.LM;
                          break;
                        default:
                          valX -= this.radius * FontSizeFix.LD;
                          break;
                      }
                      break;
                    case EFontSize.Medium:
                      switch (this.widgetSettingsDetail?.Font?.Value?.FontSize) {
                        case EFontSize.Bigger:
                          valX += this.radius * FontSizeFix.MB;
                          break;
                        case EFontSize.Large:
                          valX += this.radius * FontSizeFix.ML;
                          break;
                        case EFontSize.Medium:
                          valX -= this.radius * FontSizeFix.MM;
                          break;
                        default:
                          valX -= this.radius * FontSizeFix.MD;
                          break;
                      }
                      break;
                    default:
                      switch (this.widgetSettingsDetail?.Font?.Value?.FontSize) {
                        case EFontSize.Bigger:
                          valX += this.radius * FontSizeFix.DB;
                          break;
                        case EFontSize.Large:
                          valX += this.radius * FontSizeFix.DL;
                          break;
                        case EFontSize.Medium:
                          valX += this.radius * FontSizeFix.DM;
                          break;
                        default:
                          valX -= this.radius * FontSizeFix.DD;
                          break;
                      }
                      break;
                  }

                  ctx.font = `${this.widgetSettingsDetail?.Font?.Value?.FontStyle} ${this.widgetSettingsDetail?.Font?.Value?.FontWeight} ${Math.floor(this.radius * (this.widgetSettingsDetail?.Font?.Value?.FontSize as unknown as number) * 0.01)}px  ${this.widgetSettingsDetail?.Font?.Value?.FontFamily}`;
                  ctx.fillStyle = colorValue;
                  ctx.strokeStyle = colorValue;
                  let valueText = curValue === '' ? '' : '[ ' + curValue;
                  ctx.fillText(valueText, valX, valY);
                  valX += ctx.measureText(valueText).width + 0.25;

                  const unitFontey = this.widgetSettingsDetail?.Appearance?.UnitFontColor as keyof ColorSet;
                  const unitcolorValue = themeColors[this.currentTheme][unitFontey] ?? this.widgetSettingsDetail?.Appearance?.UnitFontColor ?? '';

                  ctx.font = `${this.widgetSettingsDetail?.Font?.Unit?.FontStyle} ${this.widgetSettingsDetail?.Font?.Unit?.FontWeight} ${Math.floor(this.radius * (this.widgetSettingsDetail?.Font?.Unit?.FontSize as unknown as number) * 0.01)}px  ${this.widgetSettingsDetail?.Font?.Unit?.FontFamily}`;
                  ctx.fillStyle = unitcolorValue;
                  ctx.strokeStyle = unitcolorValue;
                  valueText = this.widgetSettingsDetail?.General?.ShowUom ? this.widgetSettingsDetail?.Mnemonics?.[0]?.Unit : '';
                  ctx.fillText(valueText, valX, valY);
                  valX += ctx.measureText(valueText).width;

                  ctx.font = `${this.widgetSettingsDetail?.Font?.Value?.FontStyle} ${this.widgetSettingsDetail?.Font?.Value?.FontWeight} ${Math.floor(this.radius * (this.widgetSettingsDetail?.Font?.Value?.FontSize as unknown as number) * 0.01)}px  ${this.widgetSettingsDetail?.Font?.Value?.FontFamily}`;
                  ctx.fillStyle = colorValue;
                  ctx.strokeStyle = colorValue;
                  valueText = curValue === '' ? '' : ' ]';
                  ctx.fillText(valueText, valX, valY);
                }
                ctx.stroke();
                ctx.restore();
              }

              ctx.save();
              ctx.translate(this.cwidth / 2, (this.cheight / 2) * centerfix);

              ctx.beginPath();

              let currentValue = datavalue;
              if (currentValue < parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`)) {
                currentValue = parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`);
              } else if (currentValue > parseFloat(`${this.widgetSettingsDetail.Range?.RangeMax || 100}`)) {
                currentValue = parseFloat(`${this.widgetSettingsDetail.Range?.RangeMax || 100}`);
              }

              if (degree) {
                if (dir) {
                  if (dir == DirValue.ASC) {
                    if (degree > startangle && degree < endangle) {
                      degree = endangle;
                    }
                  } else if (dir == DirValue.DSC) {
                    if (degree > endangle && degree < startangle) {
                      degree = startangle;
                    }
                  }
                }
                ctx.rotate(this.degreesToRadians(degree));
              }
              const progressKey = this.widgetSettingsDetail?.Appearance?.ProgressColor as keyof ColorSet;
              const progressColorValue = themeColors[this.currentTheme][progressKey] ?? this.widgetSettingsDetail?.Appearance?.ProgressColor ?? '';

              ctx.fillStyle = progressColorValue;
              ctx.strokeStyle = progressColorValue;

              ctx.lineCap = LineCap.ROUND;
              ctx.moveTo(0, 0);
              ctx.lineTo(this.radius * 0.66, 0);
              ctx.lineTo(0, -(this.radius * 0.015));
              ctx.lineTo(0, this.radius * 0.015);
              ctx.lineTo(this.radius * 0.66, 0);

              ctx.fill();
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.restore();

              ctx.beginPath();

              ctx.fillStyle = progressColorValue;
              ctx.strokeStyle = progressColorValue;
              ctx.lineWidth = 1;

              ctx.arc(this.cwidth / 2, (this.cheight / 2) * centerfix, this.radius * 0.05, (Math.PI * 360) / 180, (Math.PI * 0) / 180, false);

              ctx.fill();
              ctx.stroke();
              ctx.restore();

              let curPercentage = 0;
              if (currentValue && parseFloat(`${this.widgetSettingsDetail.Range?.RangeMax || 100}`)) {
                curPercentage =
                  (currentValue - parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`)) /
                  (parseFloat(`${this.widgetSettingsDetail.Range?.RangeMax || 100}`) -
                    parseFloat(`${this.widgetSettingsDetail.Range?.RangeMin || 0}`));
              }
              const curDegree = startangle + arcangle * curPercentage;

              let isAtLimit = false;
              if (dir == DirValue.ASC) {
                if (degree > curDegree) {
                  degree = curDegree;
                }

                if (curDegree >= 360 && degree >= 0 && degree <= endangle) {
                  if (degree >= curDegree - 360) {
                    isAtLimit = true;
                  } else {
                    degree++;
                  }
                } else {
                  if (degree >= curDegree) {
                    isAtLimit = true;
                  } else {
                    if (degree < maxangle - 1) {
                      degree++;
                    } else {
                      isAtLimit = true;
                    }
                  }
                }
              } else {
                if (degree == 0) {
                  degree = 360;
                }

                if (degree < curDegree) {
                  degree = curDegree;
                }

                if (curDegree > 360 && degree >= 0 && degree <= endangle) {
                  if (degree <= curDegree - 360) {
                    isAtLimit = true;
                  } else {
                    degree--;
                  }
                } else {
                  if (degree <= curDegree) {
                    isAtLimit = true;
                  } else {
                    degree--;
                  }
                }
              }

              this.dir = dir;
              this.degree = degree;
              this.prevalue = datavalue;
              if (isAtLimit == false) {
                requestid = requestAnimationFrame(() => {
                  this.drawNeedle(datavalue, dir, degree);
                });
              }
            }
          }
        }
      },
      processSubscriptionData: function () {
        this.isprocessing = true;
        const data = this.dataarray[0];
        this.dataarray.shift();
        if (
          data &&
          data.Value != undefined &&
          data.Value != null &&
          data.Value.toString() != '' &&
          !isNaN(Number(data.Value)) &&
          Number(data.Value)
        ) {
          let dir = DirValue.ASC;
          let dataValue: number = data.Value as unknown as number;
          if (typeof dataValue == ValueType.STRING) {
            dataValue = parseFloat(`${dataValue}`);
          }
          this.datavalue = dataValue;
          if (this.prevalue > dataValue) {
            dir = DirValue.DSC;
          } else {
            dir = DirValue.ASC;
          }
          if (requestid) {
            cancelAnimationFrame(requestid);
          }
          requestid = requestAnimationFrame(() => {
            this.drawNeedle(dataValue, dir);
          });
        }

        if (this.dataarray?.length > 0) {
          this.processSubscriptionData();
        } else {
          this.isprocessing = false;
        }
      },
      handleResize: function (type: string, subtype?: string) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.initGaugeChart(type, subtype);
          }, 200);
        });
      },
      startSubscription: function () {
        const ChannelIds: number[] = this.channelIds;
        ChannelDataService.startStreaming({
          ChannelIds,
          callback: (data: DataStoreChannelDataItem[]) => {
            if (data?.length) {
              data.forEach((item: DataStoreChannelDataItem) => {
                this.dataarray.push(item);
                if (this.dataarray?.length > 0 && this.isprocessing == false) {
                  this.processSubscriptionData();
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
        const theme = themeColors?.[this.currentTheme];

        let newColor = '';
        let isBlinking = false;

        this.widgetSettingsDetail?.Range?.RangeColors?.forEach((item) => {
          if (
            ((this.datavalue > item.min && this.datavalue <= item.max) ||
              (this.widgetSettingsDetail?.Range?.RangeMax && this.datavalue > this.widgetSettingsDetail.Range.RangeMax)) &&
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
    border-width: 0;
    border-style: solid;
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
    height: calc(100% - 26px);
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
