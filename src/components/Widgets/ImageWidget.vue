<template>
  <div v-if="widgetSettingsDetail" class="full-size d-flex flex-col text-center align-items-center" :style="{ ...widgetStyles }">
    <div v-show="widgetSettingsDetail.General.ShowTitle" class="title" :style="widgetTitleStyles">
      {{ widgetSettingsDetail.General.Title }}
    </div>
    <div class="image-container">
      <template v-if="dynamicImageSrc">
        <img :src="dynamicImageSrc" :alt="widgetSettingsDetail?.General?.Title" class="main-image" />
      </template>
      <div v-else class="no-image-text">Image not available</div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { store } from '@/main';
  import { ChannelDataService } from '@/services/channeldata.service';
  import { DataStoreChannelDataItem } from '@/helpers/datastore/datamodels/datastore.channelitem';
  import { ColorSet, themeColors } from '@/interfaces/themeconfig.interfaces';
  import ImageSettings from 'server/helpers/settings.widgets/image.settings';
  import { IImageTemplateEntry } from 'server/interfaces/imagetemplate.interfaces';

  export default defineComponent({
    name: 'ImageWidget',
    props: {
      widgetSettingsDetail: { type: Object as PropType<ImageSettings>, required: true },
    },
    data() {
      return {
        uomvalue: 0.0 as number,
        channelIds: [] as number[],
      };
    },
    computed: {
      currentTheme() {
        return store.theme;
      },
      formattedValue(): string {
        const decimalPlaces = this.widgetSettingsDetail?.General?.Decimal || 0;
        return Number(this.uomvalue).toFixed(decimalPlaces);
      },
      dynamicImageSrc(): string | null {
        const value = parseFloat(this.formattedValue);
        const entries = this.widgetSettingsDetail?.Image?.Entries;
        const allEntries: IImageTemplateEntry[] = Array.isArray(entries) ? entries : Object.values(entries || {});
        const matchedEntry = allEntries.find((entry) => value >= entry.RangeMin && value <= entry.RangeMax);
        return matchedEntry?.ImageUrl || null;
      },

      widgetStyles() {
        const bg = this.widgetSettingsDetail?.Appearance?.BackgroundColour as keyof ColorSet;
        const border = this.widgetSettingsDetail?.Appearance?.BorderColour as keyof ColorSet;
        return {
          background: themeColors[this.currentTheme][bg] ?? this.widgetSettingsDetail?.Appearance?.BackgroundColour ?? '',
          borderColor: themeColors[this.currentTheme][border] ?? this.widgetSettingsDetail?.Appearance?.BorderColour ?? '',
          borderWidth: this.widgetSettingsDetail?.General?.BorderThickness + 'px',
          borderStyle: 'solid',
        };
      },
      widgetTitleStyles() {
        const key = this.widgetSettingsDetail?.Appearance?.TitleFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][key] ?? this.widgetSettingsDetail?.Appearance?.TitleFontColor ?? '';
        return {
          color: colorValue,
          fontSize: this.widgetSettingsDetail?.Font?.Title?.FontSize + 'px',
          fontFamily: this.widgetSettingsDetail?.Font?.Title?.FontFamily,
          fontWeight: this.widgetSettingsDetail?.Font?.Title?.FontWeight,
          fontStyle: this.widgetSettingsDetail?.Font?.Title?.FontStyle,
        };
      },
    },
    watch: {
      widgetSettingsDetail: {
        handler(newSettings) {
          if (newSettings?.Mnemonics?.length && newSettings.Mnemonics[0].MnemonicId) {
            this.channelIds = [+newSettings.Mnemonics[0].MnemonicId];
            this.startSubscription();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    beforeUnmount() {
      this.stopSubscription();
    },

    methods: {
      startSubscription() {
        ChannelDataService.startStreaming({
          ChannelIds: this.channelIds,
          callback: (data: DataStoreChannelDataItem[]) => {
            data.forEach((item) => {
              if (item?.Value != null && !isNaN(Number(item.Value))) {
                this.uomvalue = Number(item.Value);
              }
            });
          },
        });
      },
      stopSubscription() {
        ChannelDataService.stopStreaming(this.channelIds, () => {
          this.channelIds = [];
        });
      },
    },
  });
</script>

<style scoped>
  .imagewidget {
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 6px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .image-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    padding: 5px;
    justify-content: center;
    align-items: center;
  }

  .main-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }

  .title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 20px;
    max-width: 90%;
  }
  .no-image-text {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-quaternary);
    font-size: 14px;
    border: 1px dashed var(--border-secondary);
  }
</style>
