<template>
  <section class="d-flex flex-col" @input="$emit('update:modelValue', localRangeSettings)">
    <div class="flex-col d-flex gap10 mt10 fontSize-12">
      <div v-if="tabName == TabNames.TAB2" class="common-props mt10">
        <div class="appearance-item fontSize-12">
          <label class="type-label">Scale Type</label>
          <DropDown v-model="rangeTypeModel" :options="rangeTypeOptions" class="input-box flex-full" />
        </div>
        <div class="appearance-item fontSize-12">
          <label class="type-label">Scale Min</label>
          <input v-model="localRangeSettings!.RangeMin" class="input-box" type="number" />
        </div>
        <div class="appearance-item fontSize-12">
          <label class="type-label">Scale Max</label>
          <input v-model="localRangeSettings!.RangeMax" class="input-box" type="number" />
        </div>
      </div>
      <div v-if="tabName == TabNames.TAB3" class="range-wrapper-item fontSize-12 mt10">
        <div class="range-wrapper">
          <div
            v-for="(color, index) in localRangeSettings?.RangeColors?.filter((c) => c.label)
              .slice()
              .reverse()"
            :key="index"
            class="range-container">
            <div class="d-flex align-items-center gap10 fontSize-12">
              <input v-model="color.enabled" type="checkbox" class="toggle-switch1" />
              <span>{{ color.label }}</span>
            </div>
            <div v-show="color.enabled" class="value-container gap10">
              <div class="d-flex flex-full gap10 align-items-center">
                <label class="input-label">Max Value</label>
                <input v-model="color.max" type="number" class="input-box" />
              </div>
              <div class="d-flex flex-full gap10 align-items-center">
                <label class="input-label">Min Value</label>
                <input v-model="color.min" type="number" class="input-box" />
              </div>
            </div>
            <div v-show="color.enabled" class="color-container flex-full gap10">
              <div class="d-flex flex-full gap10 align-items-center">
                <label class="input-label">Color</label>
                <ColorPicker v-model="color.color"></ColorPicker>
              </div>
              <div class="blinking-container flex-full gap10 align-items-center">
                <label class="input-label">Blinking</label>
                <input v-model="color.blinking" type="checkbox" class="toggle-switch1" :disabled="!color.enabled" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { TabNames } from '@/interfaces/dashboard.interfaces';
  import { RangeSettings, ERangeType, RangeColor } from '../../../server/helpers/settings.helpers/range.settings.helper';
  import ColorPicker from '../Common/ColorPicker.vue';
  import { ColorSet, themeColors } from '@/interfaces/themeconfig.interfaces';
  import { store } from '@/main';

  export default defineComponent({
    components: { ColorPicker },
    props: {
      modelValue: {
        type: Object as PropType<RangeSettings | null | undefined>,
        required: true,
      },
      tabName: {
        type: String,
        required: false,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        TabNames,
        rangeTypes: Object.entries(ERangeType),
        localRangeSettings: { ...this.modelValue } as RangeSettings | null | undefined,
      };
    },
    computed: {
      currentTheme() {
        return store.theme;
      },
      reversedColors() {
        const theme = themeColors?.[this.currentTheme];

        return (
          this.localRangeSettings?.RangeColors?.filter((color) => color.label)
            ?.slice()
            .reverse()
            .map((color) => ({
              ...color,
              resolvedColor: theme?.[color.color as keyof ColorSet] ?? color.color,
            })) || []
        );
      },
      rangeTypeModel: {
        get(): { label: string; value: string } | null {
          const val = this.localRangeSettings?.RangeType;
          return val ? { label: val, value: val } : null;
        },
        set(option: { label: string; value: string }) {
          if (this.localRangeSettings) {
            this.localRangeSettings.RangeType = option.value as ERangeType;
          }
        },
      },
      rangeTypeOptions(): { label: string; value: string }[] {
        return Object.values(ERangeType).map((val) => ({
          label: val,
          value: val,
        }));
      },
    },
    watch: {
      modelValue: {
        handler(newValue: RangeSettings | null | undefined) {
          if (newValue) {
            this.localRangeSettings = newValue;
          }
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      addRange: function () {
        this.localRangeSettings?.RangeColors.push(new RangeColor());
      },
      removeRange: function (index: number = -1) {
        if (index > -1) {
          this.localRangeSettings?.RangeColors.splice(index, 1);
        }
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
    height: 32px;
  }

  .input-box {
    width: 100%;
    height: 30px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    text-align: start;
  }

  .borderitem {
    display: grid;
    grid-template-columns: 1fr 50px;
  }

  .dropdown-container {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .background-color-picker {
    width: 32px;
    height: 32px;
    border: none;
    cursor: pointer;
    background-color: transparent;
  }

  .range-wrapper-item {
    display: flex;
    flex-flow: column;
  }

  .range-wrapper {
    display: flex;
    flex-flow: column;
  }

  .range-container {
    display: flex;
    flex-flow: column;
    gap: 4px;
    padding: 10px 0;
  }

  .range-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 3px;
    gap: 4px;
  }

  .type-label {
    width: 66px;
  }

  .range-header-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 2px;
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
  }

  .value-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 8px;
    align-items: center;
  }

  .value-container div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .input-label {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .color-container {
    display: flex;
    align-items: center;
    margin-top: 8px;
    gap: 20px;
  }

  .color-picker {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: transparent;
    background-color: transparent;
  }

  .blinking-container {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .common-props {
    display: flex;
    flex-flow: column;
    gap: 4px;
  }
</style>
