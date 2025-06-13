<template>
  <div v-if="commentWidgetSettingsDetail" class="full-size d-flex flex-col text-center align-items-center fontSize-14" :style="{ ...widgetStyles }">
    <StatusBar v-if="commentWidgetSettingsDetail.General?.ShowStatusbar" />
    <div v-if="commentWidgetSettingsDetail.General?.ShowTitle" class="title" :style="widgetTitleStyles">
      {{ commentWidgetSettingsDetail?.General?.Title || 'Comment' }}
    </div>

    <div v-if="commentWidgetSettingsDetail?.Mnemonics" class="card-container d-flex flex-col gap5 p10 height-100 width-100">
      <template v-if="curveData.length">
        <DynamicScroller class="height-100" :items="curveData" key-field="id" :min-item-size="100" :item-size="null">
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :min-item-size="100"
              :item="item"
              :active="active"
              :watch-data="true"
              :size-dependencies="[
                item.curveValue1,
                item.curveValue2,
                item.curveValue3,
                commentWidgetSettingsDetail?.Mnemonics[0]?.DisplayName,
                commentWidgetSettingsDetail?.Mnemonics[1]?.DisplayName,
                commentWidgetSettingsDetail?.Mnemonics[2]?.DisplayName,
              ]"
              :data-index="index">
              <div class="d-flex flex-col pr5 height-100">
                <div
                  class="card d-flex flex-col gap5 align-items-start"
                  :class="[index === highlightIndex ? 'highlight-bg' : index % 2 === 0 ? 'card-white' : 'card-grey']">
                  <div
                    v-if="commentWidgetSettingsDetail.General.IndexType === DataIndexTypes.Time"
                    v-dateTimeFormat="'mm/dd/yyyy hh:mi am'"
                    class="break-word"
                    :style="widgetLabelStyles">
                    {{ item?.date }}
                  </div>
                  <div v-if="commentWidgetSettingsDetail.General.IndexType === DataIndexTypes.Depth" class="break-word" :style="widgetLabelStyles">
                    {{ formattedDepthValue(item?.keyIndex || '') }}
                  </div>
                  <div class="d-flex flex-row gap10 align-items-center width-100 flex-wrap">
                    <div v-if="commentWidgetSettingsDetail?.Mnemonics[1]?.MnemonicName" class="d-flex flex-row gap5 align-items-center flex-wrap">
                      <span class="break-word" :style="widgetLabelStyles">
                        {{ commentWidgetSettingsDetail?.Mnemonics[1]?.DisplayName || commentWidgetSettingsDetail?.Mnemonics[1]?.MnemonicName }}:
                      </span>
                      <span class="break-word" :style="widgetValueStyles">{{ formattedValue(item?.curveValue2 || '') }}</span>
                      <span
                        v-if="commentWidgetSettingsDetail?.Mnemonics[1]?.Unit"
                        class="break-word"
                        :style="[widgetUnitStyles, { visibility: commentWidgetSettingsDetail.General.ShowUom ? 'visible' : 'hidden' }]">
                        {{ commentWidgetSettingsDetail?.Mnemonics[1]?.Unit }}
                      </span>
                    </div>
                    <div v-if="commentWidgetSettingsDetail?.Mnemonics[2]?.MnemonicName" class="d-flex flex-row gap5 align-items-center flex-wrap">
                      <span class="break-word" :style="widgetLabelStyles">
                        {{ commentWidgetSettingsDetail?.Mnemonics[2]?.DisplayName || commentWidgetSettingsDetail?.Mnemonics[2]?.MnemonicName }}:
                      </span>
                      <span class="break-word" :style="widgetValueStyles">{{ formattedValue(item?.curveValue3 || '') }}</span>
                      <span
                        v-if="commentWidgetSettingsDetail?.Mnemonics[2]?.Unit"
                        class="break-word"
                        :style="[widgetUnitStyles, { visibility: commentWidgetSettingsDetail.General.ShowUom ? 'visible' : 'hidden' }]">
                        {{ commentWidgetSettingsDetail?.Mnemonics[2]?.Unit }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex flex-row gap5 align-items-center width-100 flex-wrap">
                    <span class="break-word" :style="widgetValueStyles">
                      <b>{{ formattedValue(item?.curveValue1 || '') }}</b>
                    </span>
                    <span class="break-word" :style="widgetUnitStyles">
                      <b>{{ commentWidgetSettingsDetail?.Mnemonics[0]?.Unit }}</b>
                    </span>
                  </div>
                </div>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import StatusBar from '../StatusBar.vue';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { store } from '@/main';
  import { DataStoreChannelDataItem } from '@/helpers/datastore/datamodels/datastore.channelitem';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';
  import CommentSettings from 'server/helpers/settings.widgets/comment.settings';
  import { MnemonicSettings } from 'server/helpers/settings.helpers/mnemonic.settings.helper';
  import { DataStoreChannelState } from '@/helpers/datastore/datamodels/datastore.channelstate';
  import { DataIndexTypes } from '../../../server/helpers/settings.helpers/general.settings.helper';

  export interface CurveValues {
    curveValue1: string;
    curveValue2: string;
    curveValue3: string;
    keyIndex?: number;
    date: string;
    id: number;
  }

  export default defineComponent({
    name: 'CommentWidget',
    components: {
      StatusBar,
    },
    props: {
      widgetSettingsDetail: Object as PropType<CommentSettings>,
    },
    data() {
      return {
        DataIndexTypes: DataIndexTypes,
        channelIds: [] as number[],
        commentWidgetSettingsDetail: { ...this.widgetSettingsDetail } as CommentSettings | undefined,
        curveData: [] as CurveValues[],
        highlightIndex: null as number | null,
        startDate: 0 as number,
        endDate: 0 as number,
        isLoadingHistory: true as boolean,
        lastScrollTop: 0 as number,
        indexCount: 25 as number,
        time: 1 as number,
        count: 0 as number,
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
        const titleFontColorKey = this.commentWidgetSettingsDetail?.Appearance?.TitleFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][titleFontColorKey] ?? this.commentWidgetSettingsDetail?.Appearance?.TitleFontColor ?? '';
        return {
          color: colorValue,
          fontSize: this.commentWidgetSettingsDetail?.Font.Title.FontSize + 'px',
          fontFamily: this.commentWidgetSettingsDetail?.Font.Title.FontFamily,
          fontWeight: this.commentWidgetSettingsDetail?.Font.Title.FontWeight,
          fontStyle: this.commentWidgetSettingsDetail?.Font.Title.FontStyle,
        };
      },
      widgetValueStyles() {
        const ValueFontColorkey = this.commentWidgetSettingsDetail?.Appearance?.ValueFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][ValueFontColorkey] ?? this.commentWidgetSettingsDetail?.Appearance?.ValueFontColor ?? '';
        return {
          color: colorValue,
          fontSize: this.commentWidgetSettingsDetail?.Font?.Value?.FontSize + 'px',
          fontFamily: this.commentWidgetSettingsDetail?.Font?.Value?.FontFamily,
          fontWeight: this.commentWidgetSettingsDetail?.Font?.Value?.FontWeight,
          fontStyle: this.commentWidgetSettingsDetail?.Font?.Value?.FontStyle,
        };
      },
      widgetUnitStyles() {
        const UnitFontColorkey = this.commentWidgetSettingsDetail?.Appearance?.UnitFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][UnitFontColorkey] ?? this.commentWidgetSettingsDetail?.Appearance?.UnitFontColor ?? '';
        return {
          color: colorValue,
          fontSize: this.commentWidgetSettingsDetail?.Font.Unit?.FontSize + 'px',
          fontFamily: this.commentWidgetSettingsDetail?.Font.Unit?.FontFamily,
          fontWeight: this.commentWidgetSettingsDetail?.Font.Unit?.FontWeight,
          fontStyle: this.commentWidgetSettingsDetail?.Font.Unit?.FontStyle,
        };
      },
      widgetLabelStyles() {
        const LabelFontColorkey = this.commentWidgetSettingsDetail?.Appearance?.LabelFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][LabelFontColorkey] ?? this.commentWidgetSettingsDetail?.Appearance?.LabelFontColor ?? '';
        return {
          color: colorValue,
          fontSize: this.commentWidgetSettingsDetail?.Font.Label?.FontSize + 'px',
          fontFamily: this.commentWidgetSettingsDetail?.Font.Label?.FontFamily,
          fontWeight: this.commentWidgetSettingsDetail?.Font.Label?.FontWeight,
          fontStyle: this.commentWidgetSettingsDetail?.Font.Label?.FontStyle,
        };
      },
      widgetStyles() {
        const BackgroundColorkey = this.commentWidgetSettingsDetail?.Appearance?.BackgroundColour as keyof ColorSet;
        const colorValue =
          themeColors[this.currentTheme][BackgroundColorkey] !== undefined
            ? themeColors[this.currentTheme][BackgroundColorkey]
            : (this.commentWidgetSettingsDetail?.Appearance?.BackgroundColour ?? '');
        const baorderdKey = this.commentWidgetSettingsDetail?.Appearance?.BorderColour as keyof ColorSet;
        const baorderColorValue = themeColors[this.currentTheme][baorderdKey] ?? this.commentWidgetSettingsDetail?.Appearance?.BorderColour ?? '';
        const borderThickness = this.commentWidgetSettingsDetail?.General?.BorderThickness ?? 0;
        return {
          background: colorValue,
          borderColor: baorderColorValue,
          borderWidth: borderThickness + 'px',
          borderStyle: 'solid',
        };
      },
    },
    watch: {
      storeTheme() {
        if (this.widgetSettingsDetail?.Appearance) {
          this.commentWidgetSettingsDetail = { ...this.widgetSettingsDetail };
        }
      },
      widgetSettingsDetail: {
        handler(newSettings) {
          this.commentWidgetSettingsDetail = { ...newSettings };

          if (this.commentWidgetSettingsDetail)
            if (this.commentWidgetSettingsDetail.Mnemonics?.length && this.commentWidgetSettingsDetail?.Mnemonics[0].MnemonicId) {
              this.channelIds = this.commentWidgetSettingsDetail.Mnemonics.filter(
                (item: MnemonicSettings) => item.MnemonicName !== '' && item.MnemonicName !== undefined && item.MnemonicId !== undefined
              ).map((item: MnemonicSettings) => Number(item.MnemonicId));
              this.initialFetchData();
            }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        const scrollElement = document.querySelector('.vue-recycle-scroller');
        if (scrollElement) {
          scrollElement.addEventListener('scroll', this.handleScrollUpForHistory);
        }
      });
    },
    beforeUnmount() {
      this.stopSubscription();
      // Remove the scroll event listener
      const scrollElement = document.querySelector('.vue-recycle-scroller');
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', this.handleScrollUpForHistory);
      }
    },
    methods: {
      initialFetchData() {
        ChannelDataService.getLastNRowsData({
          NRows: this.indexCount,
          ChannelIds: [this.channelIds[0]],
          callback: (data: DataStoreChannelDataItem[]) => {
            this.endDate = data[0]?.KeyIndex ?? 0;
            this.fetchRangeData(data, false);
            this.getStateData();
            this.startSubcription();
          },
        });
      },
      updateHighlightIndex() {
        this.highlightIndex = this.curveData.length - 1;
        setTimeout(() => {
          this.highlightIndex = null;
        }, 15000);
      },
      scrollToBottom() {
        this.$nextTick(() => {
          const scrollContainer = document.querySelector('.vue-recycle-scroller') as HTMLDivElement;
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        });
      },
      formattedValue(value: string): string {
        if (value === '' || isNaN(Number(value))) {
          return value;
        } else {
          const decimalPlaces = this.commentWidgetSettingsDetail?.General.Decimal || 0;
          return Number(value).toFixed(decimalPlaces);
        }
      },
      formattedDepthValue(value: string): string {
        if (value === '' || isNaN(Number(value))) {
          return value;
        } else {
          const decimalPlaces = this.commentWidgetSettingsDetail?.General.Decimal || 0;
          const val = Number(value) / Math.pow(10, 15);
          return Number(val).toFixed(decimalPlaces);
        }
      },
      stopSubscription: function () {
        ChannelDataService.stopStreaming([this.channelIds[0]], this.handleSubscritptionStop);
      },
      handleSubscritptionStop: function () {
        this.channelIds = [];
      },
      startSubcription: function () {
        ChannelDataService.startStreaming({
          ChannelIds: [this.channelIds[0]],
          callback: (data: DataStoreChannelDataItem[]) => {
            if (data?.length) {
              data.forEach((item: DataStoreChannelDataItem) => {
                if (item && item.Value != undefined && item.Value != null && item.Value.toString() !== '') {
                  // Prepare a map of existing entries for quick lookup
                  const keyIndexMap = new Map(this.curveData.map((curve) => [curve.keyIndex, curve]));
                  const existing = keyIndexMap.get(item.KeyIndex);
                  if (existing) {
                    existing.curveValue1 = String(item.Value);
                  } else {
                    this.curveData.push({
                      curveValue1: String(item.Value),
                      curveValue2: '',
                      curveValue3: '',
                      keyIndex: item.KeyIndex,
                      date: item.DateTime.toString(),
                      id: this.curveData.length + 1,
                    });
                  }
                  this.updateHighlightIndex();
                  this.scrollToBottom();
                  // Fetch historical data for other curves
                  this.fetchRangeData([item], true);
                }
              });
            }
          },
        });
      },
      fetchRangeData(data: DataStoreChannelDataItem[], updateExisting: boolean = false) {
        const mnemonicData = this.commentWidgetSettingsDetail?.Mnemonics || [];

        data.forEach((item) => {
          ChannelDataService.getRangeData({
            ChannelIds: this.channelIds.slice(1),
            StartIndex: item.KeyIndex - 1,
            EndIndex: item.KeyIndex + 1,
            callback: (curveDat: DataStoreChannelDataItem[]) => {
              const groupedData = this.groupDataByChannelId(curveDat);
              const [mnemonic2, mnemonic3] = this.channelIds.slice(1);

              const curve2Map = new Map((groupedData[mnemonic2] || []).map((item) => [item.KeyIndex, item]));
              const curve3Map = new Map((groupedData[mnemonic3] || []).map((item) => [item.KeyIndex, item]));

              const curveValue2 = String(curve2Map.get(item.KeyIndex)?.Value ?? '');
              const curveValue3 = String(curve3Map.get(item.KeyIndex)?.Value ?? '');

              if (updateExisting) {
                // Update the last inserted record
                const lastEntry = this.curveData[this.curveData.length - 1];
                this.channelIds.slice(1).forEach((ele) => {
                  if (mnemonicData[1]?.MnemonicId.toString() === ele.toString()) {
                    lastEntry.curveValue2 = curveValue2;
                  } else if (mnemonicData[2]?.MnemonicId.toString() === ele.toString()) {
                    lastEntry.curveValue3 = curveValue3;
                  }
                });
              } else {
                this.curveData.push({
                  curveValue1: String(item.Value),
                  curveValue2,
                  curveValue3,
                  keyIndex: item.KeyIndex,
                  date: item.DateTime.toString(),
                  id: this.curveData.length + 1,
                });
              }
            },
          });
        });
      },
      getStateData() {
        ChannelDataService.getState([this.channelIds[0]], (data: DataStoreChannelState[]) => {
          if (data?.length) {
            this.startDate = data[data.length - 1].StartIndex || 0;
          }
        });
      },
      groupDataByChannelId(data: DataStoreChannelDataItem[]): Record<number, DataStoreChannelDataItem[]> {
        return data.reduce(
          (acc, item) => {
            (acc[item.ChannelId] ||= []).push(item);
            return acc;
          },
          {} as Record<number, DataStoreChannelDataItem[]>
        );
      },
      handleScrollUpForHistory() {
        const scrollElement = document.querySelector('.vue-recycle-scroller') as HTMLDivElement;
        if (!scrollElement) return;

        const currentScrollTop = scrollElement.scrollTop;
        const scrollThreshold = scrollElement.clientHeight * 0.25; // 25% of visible height
        // Check if user is scrolling up
        if (currentScrollTop <= this.lastScrollTop) {
          // If user is near the top (within dynamic threshold)
          if (currentScrollTop < scrollThreshold && this.isLoadingHistory) {
            this.isLoadingHistory = false;
            this.fetchHistoricalData();
          }
        }
        // Update the last scroll position
        this.lastScrollTop = currentScrollTop;
      },
      getRange() {
        if (this.commentWidgetSettingsDetail?.General?.IndexType === DataIndexTypes.Time) {
          const startIndex = this.endDate - 1 - this.time * 60 * 60 * 1000;
          return startIndex;
        } else {
          const startIndex = this.endDate - 1 - 100;
          return startIndex;
        }
      },
      fetchHistoricalData() {
        if (this.startDate <= this.endDate) {
          const rangeSize = {
            startIndex: this.getRange(),
            endIndex: this.endDate - 1,
          };

          const actualStartIndex = this.startDate ?? 0;
          if (rangeSize.startIndex <= actualStartIndex) {
            rangeSize.startIndex = actualStartIndex;
          }

          // Fetch historical data
          ChannelDataService.getRangeData({
            ChannelIds: this.channelIds,
            callback: this.onHistoricalReceive,
            StartIndex: rangeSize.startIndex,
            EndIndex: rangeSize.endIndex,
          });
          // Set for next fetch
          this.endDate = rangeSize.startIndex;
        }
      },
      onHistoricalReceive(curveData: DataStoreChannelDataItem[]) {
        // Group data by ChannelId
        if (!curveData?.length) {
          this.fetchHistoricalData();
          this.isLoadingHistory = true;
          return;
        }
        const groupedData = this.groupDataByChannelId(curveData);

        const [mnemonic1, mnemonic2, mnemonic3] = this.channelIds;

        const curve1Data = groupedData[mnemonic1] || [];
        const curve2Data = mnemonic2 ? groupedData[mnemonic2] || [] : [];
        const curve3Data = mnemonic3 ? groupedData[mnemonic3] || [] : [];

        // Create lookup maps for curve2 and curve3 using KeyIndex
        const curve2Map = new Map(curve2Data.map((item) => [item.KeyIndex, item]));
        const curve3Map = new Map(curve3Data.map((item) => [item.KeyIndex, item]));

        // Sort curve1Data by KeyIndex
        curve1Data.sort((a, b) => a.KeyIndex - b.KeyIndex);

        // Prepare a map of existing entries for quick lookup
        const keyIndexMap = new Map(this.curveData.map((curve) => [curve.keyIndex, curve]));

        const newEntries: CurveValues[] = [];

        for (const item of curve1Data) {
          const keyIndex = item.KeyIndex;
          const existing = keyIndexMap.get(keyIndex);

          if (existing) {
            // Update existing entry
            existing.curveValue1 = String(item?.Value ?? '');
            existing.curveValue2 = String(curve2Map.get(keyIndex)?.Value ?? '');
            existing.curveValue3 = String(curve3Map.get(keyIndex)?.Value ?? '');
            existing.date = item.DateTime.toString();
          } else {
            // Add new entry
            newEntries.push({
              curveValue1: String(item?.Value ?? ''),
              curveValue2: String(curve2Map.get(keyIndex)?.Value ?? ''),
              curveValue3: String(curve3Map.get(keyIndex)?.Value ?? ''),
              date: item.DateTime.toString(),
              keyIndex: keyIndex,
              id: this.curveData.length + newEntries.length,
            });
          }
        }

        // Prepend new entries to the beginning of curveData
        this.curveData = [...newEntries, ...this.curveData];

        // Maintain scroll position
        const container = document.querySelector('.vue-recycle-scroller') as HTMLDivElement;
        const previousScrollHeight = container?.scrollHeight || 0;

        this.$nextTick(() => {
          const newScrollHeight = container?.scrollHeight || 0;
          const scrollDiff = newScrollHeight - previousScrollHeight;
          container.scrollTop += scrollDiff;
        });

        this.isLoadingHistory = true;
      },
    },
  });
</script>
<style>
  .title {
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 150px;
    margin-top: 5px;
    margin-bottom: 5px;
    display: inline-block;
    vertical-align: middle;
  }

  .card-container {
    overflow-y: auto;
  }

  .card {
    padding: 8px;
    border-radius: 3px;
    margin-bottom: 5px;
  }

  .break-word {
    overflow-wrap: anywhere;
  }

  .highlight-bg {
    background-color: var(--highlight-bg-color);
  }

  .card-white {
    background-color: var(--msg-bg-current-user);
  }

  .card-grey {
    background-color: var(--msg-bg-other-user);
  }
</style>
