<template>
  <div class="flex-col d-flex mb10" @input="$emit('update:mnemonics', localCopy)">
    <!-- Show "No curves selected" message -->
    <div v-if="!localCopy || localCopy.length === 0" class="fontSize-14">
      <div class="d-flex flex-row fontSize-12 justify-content-space-between align-items-center padding2px">
        <span class="heading fontBold">No curve has been selected.</span>
        <CustomButton class="btn-width" @click="openPopupChannelSelection()">Select Curve</CustomButton>
      </div>
    </div>
    <div v-else class="d-flex flex-row fontSize-12 justify-content-space-between align-items-center padding2px">
      <div>
        <template v-if="!isMultiSelect">
          <!-- Single selection (Radio behavior) -->
          <div class="d-flex align-items-center gap5 heading">
            <span class="heading fontBold">{{ localCopy?.[0]?.MnemonicName }}</span>
            <span v-if="localCopy?.[0]?.Unit" class="heading fontBold">({{ localCopy?.[0]?.Unit }})</span>
          </div>
        </template>
        <template v-else>
          <!-- Multiple selection (Checkbox behavior) -->
          <div v-for="(curve, index) in localCopy" :key="index" class="d-flex align-items-center gap5 heading">
            <span class="heading fontBold">{{ curve.MnemonicName }}</span>
            <span v-if="curve.Unit" class="heading fontBold">({{ curve.Unit }})</span>
            <SvgIcon name="delete-icon" class="svg-icon size14 icon-danger ml-auto" @click="removeCurve(index)" />
          </div>
        </template>
      </div>
      <div class="d-flex flex-row fontSize-12 gap5">
        <CustomButton class="btn-width" @click="openPopupChannelSelection()">{{ isMultiSelect ? 'Change Curves' : 'Change Curve' }}</CustomButton>
      </div>
    </div>
    <CurveSelectionPopup
      v-if="showcurveselection"
      v-model="selectedCurves"
      :isMultiSelect="isMultiSelect"
      :curveSelectUri="curveSelectUri"
      @close-mnemonic-popup="closePopup"
      @click.stop="() => {}"
      @submit="onSelectClick"
      @update-curve-data="updateCurveData" />
  </div>
</template>

<script lang="ts">
  import { ref } from 'vue';
  import { defineComponent, PropType } from 'vue';
  import CurveSelectionPopup, { CurveSelectionDetails } from '../CurveSelectionPopup.vue';
  import { StoreDataHeader } from '../../../server/interfaces/store.connector.interfaces';
  import { MnemonicSettings } from '../../../server/helpers/settings.helpers/mnemonic.settings.helper';
  import { multiSelectwidgetConfig } from '@/interfaces/dashboard.interfaces';

  export default defineComponent({
    components: {
      CurveSelectionPopup,
    },
    props: {
      mnemonics: Array as PropType<MnemonicSettings[] | null | undefined>,
      wellboreUri: String,
      title: String,
    },
    emits: ['openPopupChannelSelection', 'removeMnemonic', 'update:mnemonics', 'update:title'],
    data() {
      return {
        selectedChannel: ref(0 as number),
        isMultiSelect: ref(false as boolean),
        selectedChannels: ref([] as number[]),
        selectedChannelName: ref('' as string),
        widgetTitle: ref(this.title as string),
        tableData: ref([] as StoreDataHeader[]),
        showcurveselection: ref(false as boolean),
        widgetConfig: ref(multiSelectwidgetConfig),
        curveSelectUri: ref((this.wellboreUri || '') as string),
        localCopy: ref((this.mnemonics || []) as MnemonicSettings[]),
        selectedCurves: ref(
          this.mnemonics?.map((m) => ({ id: m.MnemonicId, name: m.MnemonicName, unit: m.Unit, description: '' })) || ([] as CurveSelectionDetails[])
        ),
      };
    },
    watch: {
      mnemonics: {
        handler(newValue, oldValue) {
          if (oldValue) {
            this.localCopy = newValue || ([] as MnemonicSettings[]);
            this.$emit('update:mnemonics', this.localCopy);

            this.selectedCurves = this.mnemonics?.map((m) => ({
              id: m.MnemonicId,
              name: m.MnemonicName,
              unit: m.Unit,
              description: '',
            })) as CurveSelectionDetails[];
          }
        },
        immediate: true,
        deep: true,
      },
      wellboreUri: {
        handler(newValue) {
          this.curveSelectUri = newValue;
        },
      },
    },
    methods: {
      updateCurveData: function (data: CurveSelectionDetails[]) {
        if (data?.length) {
          this.localCopy = [];
          let widgetTitle = '';
          data.forEach((item: CurveSelectionDetails, index: number) => {
            if (item.description || item.name) {
              if (index > 0) {
                widgetTitle += ' & ';
              }
              widgetTitle += item.description || item.name;
            }
            this.localCopy.push({ MnemonicName: item.name, MnemonicId: item.id, LogName: '', Unit: item.unit, UnitType: '', Color: '' });
          });
          this.widgetTitle = widgetTitle;
          this.$emit('update:title', this.widgetTitle);
          this.$emit('update:mnemonics', this.localCopy);
        }
      },
      closePopup: function () {
        this.showcurveselection = false;
      },
      openPopupChannelSelection: async function () {
        if (this.widgetConfig.multiSelectWidgets.includes('Numeric')) {
          // TODO: Need logic to distinguish between single and multiple curve selection
          this.isMultiSelect = true;
        } else {
          this.isMultiSelect = false;
        }

        this.showcurveselection = true;
      },
      onSelectClick: function () {
        this.closePopup();
      },
      openPopup: function () {
        this.$emit('openPopupChannelSelection');
      },
      removeCurve: function (index: number) {
        this.$emit('removeMnemonic', index);
      },
    },
  });
</script>

<style scoped>
  .svg-icon {
    cursor: pointer;
    pointer-events: auto;
  }

  .ml-auto {
    margin-left: auto;
  }

  .heading {
    color: var(--text-tertiary);
  }

  .padding2px {
    padding: 2px;
  }

  .btn-width {
    width: auto;
    padding: 5px 10px;
    min-width: auto;
    font-size: 12px;
  }
</style>
