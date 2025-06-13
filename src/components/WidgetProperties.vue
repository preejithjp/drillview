<template>
  <div v-outsideclick="onOutsideClick" class="sidebar d-flex flex-col fontNormal fontSize-14">
    <div class="sidebar-icons d-flex flex-row align-items-center gap10">
      <div
        v-for="(tab, index) in filteredTabs"
        :key="index"
        class="tabIcons"
        :title="tab.title"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key as TabNames">
        <SvgIcon :name="tab.icon" class="svg-icon size40" />
      </div>
      <SvgIcon name="save-icon" class="svg-icon size20 icon-active-color ml-auto" @click="updatesettings" />
    </div>
    <div v-if="localSettings" class="settings-panel scroll primary scroll-auto height-100">
      <div v-show="activeTab === TabNames.TAB1" class="appearance-container">
        <AppearanceProperty v-if="localSettings.Appearance" v-model="localSettings.Appearance" />
        <GeneralProperty v-model="localSettings.General" :tabName="TabNames.TAB1" />
        <TrackProperty v-if="widgetType === WidgetTypes.LOG" v-model="localSettings.Track" />
        <FontProperty v-if="localSettings.Font" v-model="localSettings.Font" />
      </div>
      <div v-show="activeTab === TabNames.TAB2" v-if="localSettings.Mnemonics">
        <MnemonicProperty
          v-if="![WidgetTypes.LOG, WidgetTypes.COMMENT, WidgetTypes.LABEL].includes(widgetType as WidgetType)"
          v-model:mnemonics="localSettings.Mnemonics"
          v-model:title="localSettings.General.Title"
          :wellboreUri="wellboreUri"
          @remove-mnemonic="removeMnemonic"
          @update:mnemonics="updateMnemonics" />
        <GeneralProperty
          v-model="localSettings.General"
          v-model:title="localSettings.General.Title"
          :widgetType="widgetType"
          :tabName="TabNames.TAB2"
          :enableIndexType="localSettings.Track.some((track) => Array.isArray(track.Curve) && track.Curve.length)"
          @update:mnemonics="updateMnemonics" />
        <LogCurveProperty
          v-if="widgetType === WidgetTypes.LOG"
          v-model="localSettings.Track"
          :wellboreUri="wellboreUri"
          :indexType="localSettings.General.IndexType" />
        <CommentCurveProperty
          v-if="widgetType === WidgetTypes.COMMENT"
          v-model="localSettings.General"
          v-model:mnemonics="localSettings.Mnemonics"
          :wellboreUri="wellboreUri"
          @update:mnemonics="updateMnemonics" />
        <RangeProperty v-if="localSettings.Range && widgetType !== WidgetTypes.LOG" v-model="localSettings.Range" :tabName="TabNames.TAB2" />
      </div>
      <div v-show="activeTab === TabNames.TAB3">
        <AlarmProperty v-if="localSettings.Alarm" v-model="localSettings.Alarm" />
        <RangeProperty v-if="localSettings.Range" v-model="localSettings.Range" :tabName="TabNames.TAB3" />
        <ImageProperty v-if="localSettings.Image" v-model="localSettings.Image" />
      </div>
      <div v-show="activeTab === TabNames.TAB4" v-if="localSettings.General">
        <GeneralProperty v-model="localSettings.General" :tabName="TabNames.TAB4" />
      </div>
    </div>

    <ConfirmationPopup
      v-if="showDeleteConfirmation"
      :show="showDeleteConfirmation"
      message="Are you sure you want to proceed without saving your changes?"
      secondaryBtnText="Cancel"
      primaryBtnText="Ok"
      @on-cancel="cancelWidgetPage"
      @on-submit="okCloseWidget"
      @click.stop="() => {}"></ConfirmationPopup>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { DashboardSettings } from '../../server/helpers/settings.helper';
  import { Api } from '@/services/api.services';
  import { TabDetails, TabNames, WidgetType } from '@/interfaces/dashboard.interfaces';
  import AppearanceProperty from './WidgetProperties/AppearanceProperty.vue';
  import TrackProperty from './WidgetProperties/TrackProperties.vue';
  import FontProperty from './WidgetProperties/FontProperty.vue';
  import MnemonicProperty from './WidgetProperties/MnemonicProperty.vue';
  import LogCurveProperty from './WidgetProperties/LogCurvesProperties.vue';
  import AlarmProperty from './WidgetProperties/AlarmProperty.vue';
  import GeneralProperty from './WidgetProperties/GeneralProperty.vue';
  import ConfirmationPopup from '@/components/Common/ConfirmationPopup.vue';
  import RangeProperty from './WidgetProperties/RangeProperty.vue';
  import { MnemonicSettings } from '../../server/helpers/settings.helpers/mnemonic.settings.helper';
  import ImageProperty from './WidgetProperties/ImageProperty.vue';
  import CommentCurveProperty from './WidgetProperties/CommentCurveProperty.vue';

  export default defineComponent({
    name: 'WidgetProperties',
    components: {
      AppearanceProperty,
      TrackProperty,
      FontProperty,
      MnemonicProperty,
      LogCurveProperty,
      AlarmProperty,
      GeneralProperty,
      RangeProperty,
      ConfirmationPopup,
      ImageProperty,
      CommentCurveProperty,
    },
    props: {
      widgetSettingsDetail: Object as PropType<DashboardSettings>,
      selectedWellboreUri: String,
      widgetType: String,
    },
    emits: ['close', 'updateSettingsChange'],
    data() {
      return {
        TabNames,
        WidgetTypes: WidgetType,
        originalwidgetSettingsDetail: {} as DashboardSettings | undefined,
        previousWidgetSettingDetails: undefined as DashboardSettings | undefined,
        localSettings: { ...this.widgetSettingsDetail } as DashboardSettings | undefined,
        tabs: TabDetails,
        activeTab: TabNames.TAB2 as TabNames,
        showDeleteConfirmation: false as boolean,
        wellboreUri: this.selectedWellboreUri || ('' as string),
        widgetTitle: '' as string,
      };
    },
    computed: {
      filteredTabs() {
        return TabDetails.filter((tab) => {
          if (tab.key === TabNames.TAB2 && !Array.isArray(this.localSettings?.Mnemonics)) return false;
          if (tab.key === TabNames.TAB3 && !this.localSettings?.Alarm && !this.localSettings?.Range) return false;
          return true;
        });
      },
      activeTabComputed() {
        return this.filteredTabs.length > 0 ? (this.filteredTabs[1].key as TabNames) : TabNames.TAB1;
      },
    },
    watch: {
      filteredTabs: {
        handler(newTabs) {
          if (!newTabs.some((tab: { key: TabNames; icon: string }) => tab.key === this.activeTab)) {
            this.activeTab = newTabs.length > 1 ? newTabs[1].key : TabNames.TAB1;
          }
        },
        deep: true,
        immediate: true,
      },
      selectedWellboreUri: {
        handler(newVal) {
          this.wellboreUri = newVal;
        },
      },
      widgetSettingsDetail: {
        handler(newVal, oldValue) {
          if (newVal?.SettingId != oldValue?.SettingId) {
            this.localSettings = { ...newVal };
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.activeTab = this.activeTabComputed;
      this.originalwidgetSettingsDetail = JSON.parse(JSON.stringify(this.widgetSettingsDetail));
    },
    methods: {
      cancelWidgetPage() {
        this.showDeleteConfirmation = false;
      },
      okCloseWidget() {
        this.localSettings = this.originalwidgetSettingsDetail;
        this.showDeleteConfirmation = false;
        this.$emit('updateSettingsChange', this.localSettings);
        this.$emit('close');
      },
      isDataChanged() {
        return JSON.stringify(this.localSettings) !== JSON.stringify(this.originalwidgetSettingsDetail);
      },
      onOutsideClick(show: boolean) {
        if (show) {
          if (this.isDataChanged()) {
            this.showDeleteConfirmation = true;
          } else {
            this.$emit('close');
          }
        }
      },
      async updatesettings() {
        await Api.patch('settings/' + (this.localSettings as DashboardSettings).SettingId, this.localSettings);
        this.$emit('updateSettingsChange', this.localSettings);
        this.$emit('close');
      },
      removeMnemonic(index: number) {
        this.localSettings?.Mnemonics?.splice(index, 1);
      },
      updateMnemonics(data: MnemonicSettings[]) {
        if (this.localSettings && data) {
          this.localSettings.Mnemonics = data;
          this.$emit('updateSettingsChange', this.localSettings);
        }
      },
    },
  });
</script>

<style scoped>
  .sidebar {
    width: 400px;
    background-color: var(--bg-septenary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px 20px;
  }

  .sidebar-icons {
    border-bottom: 2px solid var(--scroll-track-color);
  }

  .sidebar-icons .tabIcons.active {
    border-bottom: 3px solid var(--icon-primary);
  }

  .sidebar-icons .tabIcons {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .settings-panel {
    overflow: auto;
    padding: 10px;
    color: var(--text-quaternary);
    padding: 20px 30px;
  }

  .ml-auto {
    margin-left: auto;
  }
</style>
