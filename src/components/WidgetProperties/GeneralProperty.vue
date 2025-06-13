<template>
  <section class="d-flex flex-col" @input="$emit('update:modelValue', localGeneralSettings)">
    <div class="flex-col d-flex gap10 fontSize-12">
      <div v-if="localGeneralSettings.Title !== undefined && tabName == TabNames.TAB2" class="title-item fontSize-12">
        <input v-model="localGeneralSettings.Title" class="input-box" type="text" @input="onInputChange($event)" />
      </div>

      <div v-if="tabName == TabNames.TAB4" class="d-flex flex-col gap10">
        <label v-if="localGeneralSettings.ShowTitle !== undefined" class="d-flex gap10 align-items-center">
          <input v-model="localGeneralSettings.ShowTitle" type="checkbox" class="size16" />
          Show Title
        </label>

        <label v-if="localGeneralSettings.ShowStatusbar !== undefined" class="d-flex gap10 align-items-center">
          <input v-model="localGeneralSettings.ShowStatusbar" type="checkbox" class="size16" />
          Show Statusbar
        </label>

        <label v-if="localGeneralSettings.ShowActiveWell !== undefined" class="d-flex gap10 align-items-center">
          <input v-model="localGeneralSettings.ShowActiveWell" type="checkbox" class="size16" />
          Show Active Wellbore
        </label>

        <label v-if="localGeneralSettings.ShowToolTip !== undefined" class="d-flex gap10 align-items-center">
          <input v-model="localGeneralSettings.ShowToolTip" type="checkbox" class="size16" />
          Show Tooltip
        </label>

        <label v-if="localGeneralSettings.ShowUom !== undefined" class="d-flex gap10 align-items-center">
          <input v-model="localGeneralSettings.ShowUom" type="checkbox" class="size16" />
          Show UOM
        </label>

        <label v-if="localGeneralSettings.ShowScale !== undefined" class="d-flex gap10 align-items-center">
          <input v-model="localGeneralSettings.ShowScale" type="checkbox" class="size16" />
          Show Scale
        </label>

        <label v-if="localGeneralSettings.ShowValue !== undefined" class="d-flex gap10 align-items-center">
          <input v-model="localGeneralSettings.ShowValue" type="checkbox" class="size16" />
          Show Value
        </label>

        <label v-if="localGeneralSettings.ShowIndex !== undefined" class="d-flex gap10 align-items-center">
          <input v-model="localGeneralSettings.ShowIndex" type="checkbox" class="size16" />
          Show Index
        </label>
      </div>

      <div v-if="tabName == TabNames.TAB1" class="d-flex flex-col fontSize-12">
        <div v-if="localGeneralSettings.BorderThickness !== undefined" class="appearance-item b-thickness-m">
          <label class="appearance-label">Border Thicknes</label>
          <div class="dropdown-container">
            <input v-model="localGeneralSettings.BorderThickness" class="input-box" type="number" />
          </div>
        </div>
        <div v-if="localGeneralSettings.Orientation !== undefined" class="appearance-item b-thickness-m">
          <label class="appearance-label">Orientation</label>
          <DropDown
            id="orientation"
            v-model="orientationValue"
            :options="enumOrientation()"
            class="field-select fontNormal font-size"
            @update:model-value="selectedOrientation($event)" />
        </div>
      </div>

      <div v-if="localGeneralSettings.Decimal !== undefined && tabName == TabNames.TAB2" class="appearance-item padding-decimal fontSize-12">
        <label class="appearance-label">Decimal</label>
        <div class="dropdown-container">
          <input v-model="decimalValue" class="input-box" type="number" :max="10" />
        </div>
      </div>

      <div v-if="tabName == TabNames.TAB2 && widgetType === WidgetTypes.LOG" class="d-flex flex-col dropdown-item">
        <DropDown
          id="index-type"
          v-model="indexValue"
          :options="enumToOptions()"
          :isDisabled="enableIndexType"
          class="field-select fontNormal font-size"
          @update:model-value="selectedValue($event)" />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { TabNames, WidgetType } from '@/interfaces/dashboard.interfaces';
  import { DataIndexTypes, GeneralSettings, OrientationTypes } from '../../../server/helpers/settings.helpers/general.settings.helper';

  export default defineComponent({
    props: {
      modelValue: {
        type: Object as PropType<GeneralSettings>,
        required: true,
      },
      tabName: {
        type: String,
        required: false,
      },
      enableIndexType: {
        type: Boolean,
        default: false,
      },
      widgetType: String,
    },
    emits: ['update:modelValue', 'update:title'],
    data() {
      return {
        WidgetTypes: WidgetType,
        TabNames,
        localGeneralSettings: { ...this.modelValue } as GeneralSettings,
        indexTypes: [DataIndexTypes.Time, DataIndexTypes.Depth],
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
            label: DataIndexTypes[type] || '',
            value: type,
          }));
          const foundOption = options.find((opt) => opt.value === val);
          return foundOption || { label: val?.toString() || '', value: val || '' };
        },
        set(option: { value: string }) {
          this.localGeneralSettings.IndexType = option?.value as unknown as DataIndexTypes;
        },
      },
      orientationValue: {
        get() {
          const val = this.localGeneralSettings.Orientation;
          const foundOption = this.enumOrientation().find((opt) => opt.value === val);
          return foundOption || { label: val?.toString() || '', value: val || '' };
        },
        set(option: { value: string }) {
          this.localGeneralSettings.Orientation = option?.value as unknown as OrientationTypes;
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
    },
    mounted() {},
    methods: {
      enumToOptions() {
        return this.indexTypes.map((type) => ({
          label: DataIndexTypes[type],
          value: type,
        }));
      },
      enumOrientation() {
        return [
          { label: '0°', value: OrientationTypes.Horizontal },
          { label: '90°', value: OrientationTypes.Vertical },
        ];
      },
      onInputChange(event: Event) {
        const target = event.target as HTMLInputElement;
        this.$emit('update:title', target.value);
      },
      selectedValue(selectedValue: Record<string, string | number>) {
        this.localGeneralSettings.IndexType = selectedValue.value as unknown as DataIndexTypes;
      },
      selectedOrientation(selectedValue: Record<string, string | number>) {
        this.localGeneralSettings.Orientation = selectedValue.value as unknown as OrientationTypes;
      },
    },
  });
</script>

<style scoped>
  .appearance-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 2px 3px;
    gap: 20px;
    padding: 0 20px;
    height: 32px;
  }

  .padding-decimal {
    padding: 0;
  }

  .b-thickness-m {
    margin: 2px 3px;
  }

  .padding-decimal {
    padding: 0;
  }

  .b-thickness-m {
    margin: 2px 3px;
  }

  .title-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 10px 3px;
    gap: 20px;
  }

  .input-box {
    width: 100%;
    height: 30px;
    border-radius: 4px;
    text-align: start;
  }

  .borderitem {
    display: grid;
    grid-template-columns: 1fr 50px;
    padding: 0 22px;
    align-items: center;
  }

  .borderitem input[type='number'] {
    margin-left: 4px;
  }

  .size16 {
    width: 16px;
    height: 16px;
  }

  .dropdown-container {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .dropdown-container input[type='number'] {
    width: 50px;
    height: 28px;
    margin-right: 2px;
  }
  .min-width-150 {
    min-width: 150px;
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

  .font-size {
    font-size: 12px;
  }

  .dropdown-item {
    margin: 10px 3px;
  }
</style>
