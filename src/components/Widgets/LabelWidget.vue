<template>
  <div class="full-size d-flex flex-col text-center align-items-center fontSize-16 fontSemibold" :style="widgetStyles">
    <StatusBar v-if="labelwidgetSettingsDetail?.General?.ShowStatusbar" :status="'normal'" />
    <div v-if="labelwidgetSettingsDetail?.General?.ShowTitle" class="title" :style="widgetTitleStyles">
      {{ labelwidgetSettingsDetail?.General.Title }}
    </div>
    <div
      v-show="labelwidgetSettingsDetail?.General?.ShowActiveWell"
      class="value-container d-flex gap20 align-items-center"
      :style="widgetValueStyles">
      <span id="main-value">{{ selectedWellbore }}</span>
    </div>
  </div>
</template>
<script lang="ts">
  import LabelSettings from '../../../server/helpers/settings.widgets/label.settings';
  import { defineComponent, PropType } from 'vue';
  import StatusBar from '../StatusBar.vue';
  import { store } from '@/main';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';
  export default defineComponent({
    name: 'LabelWidget',
    components: {
      StatusBar,
    },
    props: {
      widgetSettingsDetail: Object as PropType<LabelSettings>,
      aciveWellbore: String,
    },
    data() {
      return {
        labelwidgetSettingsDetail: { ...this.widgetSettingsDetail } as LabelSettings | undefined,
        selectedWellbore: this.aciveWellbore,
      };
    },
    computed: {
      currentTheme() {
        return store.theme;
      },
      widgetTitleStyles() {
        const titleFontColorKey = this.labelwidgetSettingsDetail?.Appearance?.TitleFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][titleFontColorKey] ?? this.labelwidgetSettingsDetail?.Appearance?.TitleFontColor ?? '';

        return {
          color: colorValue,
          fontSize: this.labelwidgetSettingsDetail?.Font.Title.FontSize + 'px',
          fontFamily: this.labelwidgetSettingsDetail?.Font.Title.FontFamily,
          fontWeight: this.labelwidgetSettingsDetail?.Font.Title.FontWeight,
          fontStyle: this.labelwidgetSettingsDetail?.Font.Title.FontStyle,
        };
      },
      widgetValueStyles() {
        const valueFontColorKey = this.labelwidgetSettingsDetail?.Appearance?.ValueFontColor as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][valueFontColorKey] ?? this.labelwidgetSettingsDetail?.Appearance?.ValueFontColor ?? '';

        return {
          color: colorValue,
          fontSize: this.labelwidgetSettingsDetail?.Font?.Value?.FontSize + 'px',
          fontFamily: this.labelwidgetSettingsDetail?.Font?.Value?.FontFamily,
          fontWeight: this.labelwidgetSettingsDetail?.Font?.Value?.FontWeight,
          fontStyle: this.labelwidgetSettingsDetail?.Font?.Value?.FontStyle,
        };
      },

      widgetStyles() {
        const backgroundKey = this.labelwidgetSettingsDetail?.Appearance?.BackgroundColour as keyof ColorSet;
        const colorValue = themeColors[this.currentTheme][backgroundKey] ?? this.labelwidgetSettingsDetail?.Appearance?.BackgroundColour ?? '';
        const baorderdKey = this.labelwidgetSettingsDetail?.Appearance?.BorderColour as keyof ColorSet;
        const baorderColorValue = themeColors[this.currentTheme][baorderdKey] ?? this.labelwidgetSettingsDetail?.Appearance?.BorderColour ?? '';
        const borderThickness = this.labelwidgetSettingsDetail?.General?.BorderThickness ?? 0;

        return {
          background: colorValue,
          borderColor: baorderColorValue,
          borderWidth: borderThickness + 'px',
          borderStyle: 'solid',
        };
      },
    },
    watch: {
      aciveWellbore: {
        handler(newwellbore) {
          this.selectedWellbore = '';
          this.selectedWellbore = newwellbore;
        },
        deep: true,
        immediate: true,
      },
      widgetSettingsDetail: {
        handler(newSettings) {
          this.labelwidgetSettingsDetail = { ...newSettings };
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      capitalizeTheme(theme: string) {
        return theme.charAt(0).toUpperCase() + theme.slice(1);
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
</style>
