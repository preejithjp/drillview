<template>
  <div
    v-if="numericwidgetSettingsDetail"
    class="numericwidget full-size d-flex flex-col text-center align-items-center fontSize-16 fontSemibold"
    :style="{ ...widgetStyles, '--dynamic-color': dynamicColor }"
    :class="{ 'blinking-bg': isBlinking }">
    <StatusBar v-if="numericwidgetSettingsDetail.General?.ShowStatusbar" :color="dynamicColor" />
    <div v-if="numericwidgetSettingsDetail.General?.ShowTitle" class="title" :style="widgetTitleStyles">
      {{ title }}
    </div>
    <div v-if="numericwidgetSettingsDetail?.Mnemonics" class="value-container d-flex text-center align-items-center">
      <template v-if="numericwidgetSettingsDetail.General?.ShowIndex">
        <div v-if="indexType === DataStoreIndexTypes.Time" class="d-flex flex-col">
          <span v-dateTimeFormat="'dd-mm-yyyy'" class="main-value fontNormal fontSize-14" :style="widgetValueStyles">{{ indexValue }}</span>
          <span v-dateTimeFormat="'time'" class="main-value" :style="widgetValueStyles">{{ indexValue }}</span>
        </div>

        <div v-if="indexType === DataStoreIndexTypes.Depth">
          <span class="main-value fontNormal fontSize-14" :style="widgetValueStyles">{{ formattedIndex }}</span>
        </div>
      </template>
      <template v-else>
        <span id="main-value" :style="widgetValueStyles">{{ formattedValue }}</span>
      </template>
      <span id="unit" class="unit" :style="[widgetUnitStyles, { visibility: numericwidgetSettingsDetail.General.ShowUom ? 'visible' : 'hidden' }]">
        {{ numericwidgetSettingsDetail?.Mnemonics[0]?.Unit }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, watch } from 'vue';
  import StatusBar from '../StatusBar.vue';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { store } from '@/main';
  import { DataStoreChannelDataItem } from '@/helpers/datastore/datamodels/datastore.channelitem';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';
  import NumericSettings from 'server/helpers/settings.widgets/numeric.settings';
  import { DataStoreChannelState } from '@/helpers/datastore/datamodels/datastore.channelstate';
  import { DataStoreIndexTypes } from '@/helpers/datastore/datamodels/datastore.indextypes';
  export default defineComponent({
    name: 'NumericWidget',
    components: {
      StatusBar,
    },
    props: {
      widgetSettingsDetail: Object as PropType<NumericSettings>,
    },
    data() {
      return {
        DataStoreIndexTypes,
        uomvalue: 0.0 as number,
        channelIds: [] as number[],
        numericwidgetSettingsDetail: { ...this.widgetSettingsDetail } as NumericSettings | undefined,
        title: this.widgetSettingsDetail?.General.Title || 'Numeric',
        isBlinking: false,
        dynamicColor: 'transparent' as string,
        blinkInterval: null as ReturnType<typeof setInterval> | null,
        indexValue: 0.0 as number,
        indexType: '' as unknown as DataStoreIndexTypes,
      };
    },
    computed: {
      formattedIndex(): string {
        const decimalPlaces = this.numericwidgetSettingsDetail?.General.Decimal || 0;
        const result = this.indexValue / Math.pow(10, 15);
        return Number(result).toFixed(decimalPlaces);
      },
      currentTheme() {
        return store.theme;
      },

      widgetTitleStyles() {
        const titleFontColorKey = this.numericwidgetSettingsDetail?.Appearance?.TitleFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][titleFontColorKey] ?? this.numericwidgetSettingsDetail?.Appearance?.TitleFontColor ?? '';
        return {
          color: colorValue,
          fontSize: this.numericwidgetSettingsDetail?.Font.Title.FontSize + 'px',
          fontFamily: this.numericwidgetSettingsDetail?.Font.Title.FontFamily,
          fontWeight: this.numericwidgetSettingsDetail?.Font.Title.FontWeight,
          fontStyle: this.numericwidgetSettingsDetail?.Font.Title.FontStyle,
        };
      },
      widgetValueStyles() {
        const ValueFontColorkey = this.numericwidgetSettingsDetail?.Appearance?.ValueFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][ValueFontColorkey] ?? this.numericwidgetSettingsDetail?.Appearance?.ValueFontColor ?? '';
        return {
          color: colorValue,
          fontSize: this.numericwidgetSettingsDetail?.Font.Value?.FontSize + 'px',
          fontFamily: this.numericwidgetSettingsDetail?.Font.Value?.FontFamily,
          fontWeight: this.numericwidgetSettingsDetail?.Font.Value?.FontWeight,
          fontStyle: this.numericwidgetSettingsDetail?.Font.Value?.FontStyle,
        };
      },
      widgetUnitStyles() {
        const UnitFontColorkey = this.numericwidgetSettingsDetail?.Appearance?.UnitFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][UnitFontColorkey] ?? this.numericwidgetSettingsDetail?.Appearance?.UnitFontColor ?? '';
        return {
          color: colorValue,
          fontSize: this.numericwidgetSettingsDetail?.Font.Unit?.FontSize + 'px',
          fontFamily: this.numericwidgetSettingsDetail?.Font.Unit?.FontFamily,
          fontWeight: this.numericwidgetSettingsDetail?.Font.Unit?.FontWeight,
          fontStyle: this.numericwidgetSettingsDetail?.Font.Unit?.FontStyle,
        };
      },
      widgetStyles() {
        const BackgroundColorkey = this.numericwidgetSettingsDetail?.Appearance?.BackgroundColour as keyof ColorSet;
        const colorValue =
          themeColors[this.currentTheme][BackgroundColorkey] !== undefined
            ? themeColors[this.currentTheme][BackgroundColorkey]
            : (this.numericwidgetSettingsDetail?.Appearance?.BackgroundColour ?? '');
        const baorderdKey = this.numericwidgetSettingsDetail?.Appearance?.BorderColour as keyof ColorSet;
        const baorderColorValue = themeColors[this.currentTheme][baorderdKey] ?? this.numericwidgetSettingsDetail?.Appearance?.BorderColour ?? '';
        const borderThickness = this.numericwidgetSettingsDetail?.General?.BorderThickness ?? 0;
        return {
          background: colorValue,
          borderColor: baorderColorValue,
          borderWidth: borderThickness + 'px',
          borderStyle: 'solid',
        };
      },
      formattedValue(): string {
        const decimalPlaces = this.numericwidgetSettingsDetail?.General.Decimal || 0;
        return Number(this.uomvalue).toFixed(decimalPlaces);
      },
    },
    watch: {
      indexType(newValue) {
        this.indexType = newValue;
      },
      storeTheme() {
        if (this.widgetSettingsDetail?.Appearance) {
          this.numericwidgetSettingsDetail = { ...this.widgetSettingsDetail };
        }
      },
      widgetSettingsDetail: {
        handler(newSettings) {
          this.numericwidgetSettingsDetail = { ...newSettings };
          if (this.numericwidgetSettingsDetail?.General?.Title) {
            this.title = this.numericwidgetSettingsDetail.General.Title;
          } else {
            this.title = 'Numeric';
          }
          this.checkAlarm();
          if (this.numericwidgetSettingsDetail)
            if (this.numericwidgetSettingsDetail.Mnemonics?.length && this.numericwidgetSettingsDetail?.Mnemonics[0].MnemonicId) {
              this.channelIds = [+this.numericwidgetSettingsDetail.Mnemonics[0].MnemonicId];
              this.startSubcription();
            }
        },
        deep: true,
        immediate: true,
      },
      defaultAlarmColor(): string {
        const alarmLow = this.widgetSettingsDetail?.Alarm?.find((alarm) => alarm.MinValue === 0);
        if (!alarmLow || !alarmLow.Color) return 'transparent';
        const colorKey = alarmLow.Color as keyof ColorSet;
        const themeColor = themeColors[this.currentTheme]?.[colorKey];
        return themeColor ?? alarmLow.Color ?? 'transparent';
      },
    },
    created() {
      watch(
        () => this.uomvalue,
        () => {
          this.checkAlarm();
        }
      );
    },
    mounted() {
      this.dynamicColor = this.getDefaultAlarmColor();
    },
    beforeUnmount() {
      this.stopSubscription();
    },
    methods: {
      getDefaultAlarmColor() {
        const alarmLow = this.widgetSettingsDetail?.Alarm?.find((alarm) => alarm.MinValue === 0);
        let colorValue = '';
        if (alarmLow?.Color && themeColors?.[this.currentTheme]) {
          const colorKey = alarmLow.Color as keyof ColorSet;
          const themeColor = themeColors[this.currentTheme][colorKey];
          colorValue = themeColor !== undefined ? themeColor : alarmLow.Color;
        } else {
          colorValue = alarmLow?.Color ?? 'transparent';
        }
        return alarmLow ? colorValue : 'transparent';
      },
      capitalizeTheme(theme: string) {
        return theme.charAt(0).toUpperCase() + theme.slice(1);
      },
      stopSubscription: function () {
        const ChannelIds: number[] = this.channelIds;
        ChannelDataService.stopStreaming(ChannelIds, this.handleSubscritptionStop);
      },
      handleSubscritptionStop: function () {
        this.channelIds = [];
      },
      startSubcription: function () {
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
                  this.uomvalue = item.Value as unknown as number;
                  this.indexValue = item.KeyIndex as unknown as number;
                }
              });
            }
          },
        });
        ChannelDataService.getState([this.channelIds[0]], (data: DataStoreChannelState[]) => {
          if (data && data.length > 0) {
            this.indexType = data[0].ChannelInfo?.IndexType;
          }
        });
      },
      checkAlarm() {
        if (this.widgetSettingsDetail?.Alarm) {
          const activeAlarm = this.widgetSettingsDetail.Alarm.find((alarm) => this.uomvalue >= alarm.MinValue && this.uomvalue <= alarm.MaxValue);
          if (activeAlarm) {
            const theme = themeColors?.[this.currentTheme];
            const colorKey = activeAlarm.Color;
            const themedColor = colorKey && theme ? (theme[colorKey as keyof ColorSet] ?? colorKey) : (colorKey ?? '');
            if (activeAlarm.Warning && activeAlarm.Blinking) {
              this.startBlinking(themedColor);
            } else {
              this.stopBlinking(themedColor);
            }
          } else {
            this.stopBlinking(this.getDefaultAlarmColor());
          }
        }
      },
      startBlinking(color: string) {
        if (this.blinkInterval) {
          clearInterval(this.blinkInterval);
        }
        this.isBlinking = true;
        let isColorVisible = true;
        this.blinkInterval = setInterval(() => {
          this.dynamicColor = isColorVisible ? color : 'transparent';
          isColorVisible = !isColorVisible;
        }, 1500);
        setTimeout(() => {
          this.stopBlinking(color);
        }, 10000);
      },
      stopBlinking(color: string) {
        if (this.blinkInterval) {
          clearInterval(this.blinkInterval);
          this.blinkInterval = null;
        }
        this.isBlinking = false;
        this.dynamicColor = color;
      },
    },
  });
</script>
<style>
  .value-container {
    flex-grow: 1;
  }

  .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
    margin-top: 5px;
    display: inline-block;
    vertical-align: middle;
  }

  .blinking-bg {
    animation: blinkBackground 2s infinite;
  }

  @keyframes blinkBackground {
    0%,
    100% {
      background-color: var(--dynamic-color);
    }
    50% {
      background-color: var(--white);
    }
  }

  #main-value {
    display: inline-block;
  }

  .unit {
    display: inline-block;
  }
</style>
