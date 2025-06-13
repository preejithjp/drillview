<template>
  <section class="d-flex flex-col" @input="$emit('update:modelValue', localGeneralSettings)">
    <div class="flex-col d-flex gap10 fontSize-12 comment-container">
      <div class="d-flex flex-col dropdown-item">
        <DropDown
          id="index-type"
          v-model="indexValue"
          :options="enumToOptions()"
          class="field-select fontNormal fontSize-12"
          @update:model-value="selectedValue($event)" />
      </div>
      <div class="d-flex flex-col gap10">
        <template v-if="indexVal">
          <div class="d-flex flex-row fontSize-12 justify-content-space-between align-items-center gap10">
            <span class="heading fontBold comment-curve-label">
              {{ localCopy[0]?.MnemonicName ? localCopy[0]?.MnemonicName : 'No comment has been selected.' }}
            </span>
            <label class="curve-selection btn primary fontSize" @click.stop="openPopupChannelSelection(CurveName.Curve1)">
              {{ localCopy[0]?.MnemonicName ? 'Change Comment' : 'Select Comment' }}
            </label>
          </div>
          <div class="d-flex flex-col curve-selection-container gap10">
            <div
              v-if="localCopy[1].MnemonicName"
              class="d-flex flex-row p-relative fontSize-12 justify-content-space-between align-items-center gap10">
              <input v-model="localCopy[1].DisplayName" class="input-box width-50" type="text" />
              <span class="heading width-25 text-ellipsis">{{ localCopy[1]?.MnemonicName }}</span>
              <div class="d-flex flex-row align-items-center gap5 width-25 justify-content-end">
                <SvgIcon
                  name="remove-icon"
                  class="svg-icon size24 icon-active-color secondary"
                  :class="{ 'disabled-icon': !localCopy[1]?.MnemonicName }"
                  @click.stop="onDeleteCurve(CurveName.Curve2)" />
              </div>
            </div>
            <div
              v-if="localCopy[2].MnemonicName"
              class="d-flex flex-row p-relative fontSize-12 justify-content-space-between align-items-center gap10">
              <input v-model="localCopy[2].DisplayName" class="input-box width-50" type="text" />
              <span class="heading width-25 text-ellipsis">{{ localCopy[2]?.MnemonicName }}</span>
              <div class="d-flex flex-row align-items-center gap5 width-25 justify-content-end">
                <SvgIcon
                  name="remove-icon"
                  class="svg-icon size24 icon-active-color secondary"
                  :class="{ 'disabled-icon': !localCopy[2]?.MnemonicName }"
                  @click.stop="onDeleteCurve(CurveName.Curve3)" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <CommentCurveSelectionPopup
        v-if="showcurveselection"
        v-model="selectedCurves"
        :isMultiSelect="isMultiSelect"
        :curveSelectUri="curveSelectUri"
        :indexType="Number(localGeneralSettings.IndexType)"
        @close-mnemonic-popup="closePopup"
        @click.stop="() => {}"
        @submit="onSelectClick"
        @update-curve-data="updateCurveData" />
    </div>
  </section>
</template>

<script lang="ts">
  import { defineComponent, PropType, ref } from 'vue';
  import { DataIndexTypes, GeneralSettings } from '../../../server/helpers/settings.helpers/general.settings.helper';
  import { CurveSelectionDetails } from '../CurveSelectionPopup.vue';
  import { MnemonicSettings } from '../../../server/helpers/settings.helpers/mnemonic.settings.helper';
  import CommentCurveSelectionPopup from '../CommentCurveSelectionPopup.vue';

  export enum CurveName {
    Curve1 = 'Comment',
    Curve2 = 'Curve2',
    Curve3 = 'Curve3',
  }

  const CurveIndexMap: Record<CurveName, number> = {
    [CurveName.Curve1]: 0,
    [CurveName.Curve2]: 1,
    [CurveName.Curve3]: 2,
  };

  export default defineComponent({
    components: {
      CommentCurveSelectionPopup,
    },
    props: {
      modelValue: {
        type: Object as PropType<GeneralSettings>,
        required: true,
      },
      mnemonics: Array as PropType<MnemonicSettings[] | null | undefined>,
      wellboreUri: String,
    },
    emits: ['update:modelValue', 'update:mnemonics'],
    data() {
      return {
        CurveName,
        localGeneralSettings: { ...this.modelValue } as GeneralSettings,
        showcurveselection: ref(false as boolean),
        isMultiSelect: ref(true as boolean),
        curveSelectUri: ref((this.wellboreUri || '') as string),
        selectedCurves: ref([] as CurveSelectionDetails[]),
        curveType: '' as CurveName,
        localCopy: ref([new MnemonicSettings(), new MnemonicSettings(), new MnemonicSettings()] as MnemonicSettings[]),
        indexTypes: [DataIndexTypes.Time, DataIndexTypes.Depth],
        indexVal: '' as string,
      };
    },
    computed: {
      decimalValue: {
        get() {
          return this.localGeneralSettings.Decimal;
        },
        set(value: string) {
          const num = parseInt(value, 10);
          this.localGeneralSettings.Decimal = isNaN(num) ? 0 : Math.min(Math.max(num, 0), 10);
        },
      },
      indexValue: {
        get() {
          const val = this.localGeneralSettings.IndexType;
          const options = this.indexTypes.map((type) => ({
            label: DataIndexTypes[type],
            value: type,
          }));
          return (
            options.find((opt) => opt.value === Number(val)) || {
              label: this.localGeneralSettings.IndexType !== undefined ? DataIndexTypes[this.localGeneralSettings.IndexType] : '',
              value: Number(val),
            }
          );
        },
        set(option: { value: string }) {
          this.localGeneralSettings.IndexType = option?.value as unknown as DataIndexTypes;
        },
      },
    },
    watch: {
      modelValue: {
        handler(newValue: GeneralSettings | undefined) {
          if (newValue) {
            this.localGeneralSettings = newValue;
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
      mnemonics: {
        handler(newValue, oldValue) {
          if (oldValue) {
            this.$emit('update:mnemonics', this.localCopy);
          }
        },
        immediate: true,
        deep: true,
      },
    },
    mounted() {
      this.indexVal = this.localGeneralSettings.IndexType !== undefined ? DataIndexTypes[this.localGeneralSettings.IndexType] : '';
      if (this.mnemonics?.length) {
        this.mnemonics?.forEach((curve: MnemonicSettings) => {
          const index = CurveIndexMap[curve.Id as CurveName];
          if (index !== undefined) {
            this.localCopy[index] = curve;
          }
        });
      }
    },
    methods: {
      selectedValue(selectedValue: Record<string, string | number>) {
        this.indexVal = selectedValue.label as string;
        this.localGeneralSettings.IndexType = selectedValue.value as unknown as DataIndexTypes;
        this.resetMnemonics();
      },
      enumToOptions() {
        return this.indexTypes.map((type) => ({
          label: DataIndexTypes[type],
          value: type,
        }));
      },
      onDeleteCurve(curveType: CurveName) {
        const index = CurveIndexMap[curveType];
        if (index === undefined) return;

        const emptyCurve: MnemonicSettings = new MnemonicSettings();

        this.localCopy[index] = { ...emptyCurve };
        this.$emit('update:mnemonics', this.localCopy);
      },
      updateCurveData(data: CurveSelectionDetails[]) {
        if (!data?.length) return;
        this.localCopy = this.localCopy.map((item, index) => {
          return {
            ...item,
            MnemonicName: data[index]?.name || '',
            MnemonicId: data[index]?.id,
            Unit: data[index]?.unit || '',
            DisplayName: index === 0 ? CurveName.Curve1 : data[index]?.name || '',
            Id: index === 0 ? CurveName.Curve1 : '',
          };
        });
        this.$emit('update:mnemonics', this.localCopy);
      },
      closePopup: function () {
        this.showcurveselection = false;
      },
      onSelectClick: function () {
        this.closePopup();
      },
      openPopupChannelSelection: async function (curveType: CurveName) {
        this.curveType = curveType;
        this.selectedCurves = this.localCopy
          .filter((m) => m.MnemonicName !== '')
          .map((m) => ({
            id: Number(m.MnemonicId),
            name: m.MnemonicName,
            unit: m.Unit,
            description: '',
          }));
        this.showcurveselection = true;
      },
      resetMnemonics() {
        const cleared = this.localCopy.map((item: Record<string, any>) => {
          const newItem: Record<string, any> = {};
          for (const key in item) {
            if (typeof item[key] === 'string') {
              newItem[key] = '';
            } else if (typeof item[key] === 'number') {
              newItem[key] = 0;
            } else {
              newItem[key] = item[key];
            }
          }
          return newItem;
        });
        this.localCopy = cleared as MnemonicSettings[];
        this.$emit('update:mnemonics', this.localCopy);
      },
    },
  });
</script>

<style scoped>
  .input-box {
    width: 100%;
    height: 30px;
    border-radius: 4px;
    text-align: start;
  }

  .dropdown-container {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .dropdown-container input[type='number'] {
    width: 50px;
    height: 30px;
    margin-right: 2px;
  }

  .btn.curve-selection {
    padding: 5px 10px;
    min-width: auto;
  }

  .field-select {
    flex: 1;
    padding: 0.6rem;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: var(--bg-septenary);
    border: 1px solid var(--border-tertiary);
    color: var(--text-tertiary);
  }

  .heading {
    color: var(--text-tertiary);
  }

  .fontSize {
    font-size: 12px;
  }
  .selected-curve {
    position: absolute;
    top: 100%;
    gap: 5px;
    margin-top: 4px;
  }

  .comment-container {
    margin: 10px 3px;
  }

  .comment-curve-label {
    max-width: 150px;
  }

  .dropdown-item {
    height: 30px;
  }

  .disabled-icon {
    filter: grayscale(100%);
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }
</style>
