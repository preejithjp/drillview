<template>
  <section class="d-flex flex-col gap5" @input="$emit('update:modelValue', localFontlSettings)">
    <template v-if="localFontlSettings.Title">
      <div class="heading fontBold fontSize-14">Title Settings</div>

      <!-- Font Family -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Title-FontFamily">Font Family</label>
        <DropDown id="Title-FontFamily" v-model="titleFontFamily" class="input-box flex-full" :options="enumToOptions(EFontFamily)" />
      </div>

      <!-- Font Size -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Title-FontSize">Font Size</label>
        <DropDown id="Title-FontSize" v-model="titleFontSize" class="input-box flex-full" :options="enumToOptions(EFontSize)" />
      </div>

      <!-- Font Weight -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Title-FontWeight">Font Weight</label>
        <DropDown id="Title-FontWeight" v-model="titleFontWeight" class="input-box flex-full" :options="enumToOptions(EFontWeight)" />
      </div>
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full">Font Style</label>
        <DropDown v-model="titleFontStyle" class="input-box flex-full" :options="enumToOptions(EFontStyle)" />
      </div>
    </template>
    <template v-if="localFontlSettings.Value">
      <div v-if="localFontlSettings.Value" class="heading fontBold fontSize-14">Value Settings</div>

      <!-- Font Family -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Value-FontFamily">Font Family</label>
        <DropDown id="Value-FontFamily" v-model="valueFontFamily" class="input-box flex-full" :options="enumToOptions(EFontFamily)" />
      </div>

      <!-- Font Size -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Value-FontSize">Font Size</label>
        <DropDown id="Value-FontSize" v-model="valueFontSize" class="input-box flex-full" :options="enumToOptions(EFontSize)" />
      </div>

      <!-- Font Weight -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Value-FontWeight">Font Weight</label>
        <DropDown id="Value-FontWeight" v-model="valueFontWeight" class="input-box flex-full" :options="enumToOptions(EFontWeight)" />
      </div>
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full">Font Style</label>
        <DropDown v-model="valueFontStyle" class="input-box flex-full" :options="enumToOptions(EFontStyle)" />
      </div>
    </template>
    <template v-if="localFontlSettings.Unit">
      <div class="heading fontBold fontSize-14">Unit Settings</div>

      <!-- Font Family -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Unit-FontFamily">Font Family</label>
        <DropDown id="Unit-FontFamily" v-model="unitFontFamily" class="input-box flex-full" :options="enumToOptions(EFontFamily)" />
      </div>

      <!-- Font Size -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Unit-FontSize">Font Size</label>
        <DropDown id="Unit-FontSize" v-model="unitFontSize" class="input-box flex-full" :options="enumToOptions(EFontSize)" />
      </div>

      <!-- Font Weight -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Unit-FontWeight">Font Weight</label>
        <DropDown id="Unit-FontWeight" v-model="unitFontWeight" class="input-box flex-full" :options="enumToOptions(EFontWeight)" />
      </div>
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full">Font Style</label>
        <DropDown v-model="unitFontStyle" class="input-box flex-full" :options="enumToOptions(EFontStyle)" />
      </div>
    </template>
    <template v-if="localFontlSettings.Label">
      <div class="heading fontBold fontSize-14">Label Settings</div>

      <!-- Font Family -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Title-FontFamily">Font Family</label>
        <DropDown id="Title-FontFamily" v-model="labelFontFamily" class="input-box flex-full" :options="enumToOptions(EFontFamily)" />
      </div>

      <!-- Font Size -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Title-FontSize">Font Size</label>
        <DropDown id="Title-FontSize" v-model="labelFontSize" class="input-box flex-full" :options="enumToOptions(EFontSize)" />
      </div>

      <!-- Font Weight -->
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full" for="Title-FontWeight">Font Weight</label>
        <DropDown id="Title-FontWeight" v-model="labelFontWeight" class="input-box flex-full" :options="enumToOptions(EFontWeight)" />
      </div>
      <div class="appearance-item fontSize-12">
        <label class="appearance-label flex-full">Font Style</label>
        <DropDown v-model="labelFontStyle" class="input-box flex-full" :options="enumToOptions(EFontStyle)" />
      </div>
    </template>
  </section>
</template>

<script lang="ts">
  import { EFontFamily, EFontSize, EFontStyle, EFontWeight, FontSettings } from '../../../server/helpers/settings.helpers/font.settings.helper';
  import { defineComponent } from 'vue';

  export default defineComponent({
    props: {
      modelValue: {
        type: Object as () => FontSettings | null,
        default: undefined,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        localFontlSettings: { ...this.modelValue } as FontSettings,
        EFontFamily,
        EFontSize,
        EFontWeight,
        EFontStyle,
      };
    },
    computed: {
      titleFontFamily: {
        get() {
          const val = this.localFontlSettings.Title.FontFamily;
          return this.enumToOptions(this.EFontFamily).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Title.FontFamily = option?.value as EFontFamily;
        },
      },
      titleFontSize: {
        get() {
          const val = this.localFontlSettings.Title.FontSize;
          const options = this.enumToOptions(this.EFontSize);
          return options.find((opt) => opt.value == val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Title.FontSize = option?.value as EFontSize;
        },
      },
      titleFontWeight: {
        get() {
          const val = this.localFontlSettings.Title.FontWeight;
          return this.enumToOptions(this.EFontWeight).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Title.FontWeight = option?.value as EFontWeight;
        },
      },
      titleFontStyle: {
        get() {
          const val = this.localFontlSettings.Title.FontStyle;
          return this.enumToOptions(this.EFontStyle).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Title.FontStyle = option?.value as EFontStyle;
        },
      },
      valueFontFamily: {
        get() {
          const val = this.localFontlSettings.Value?.FontFamily;
          return this.enumToOptions(this.EFontFamily).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          if (this.localFontlSettings.Value) {
            this.localFontlSettings.Value.FontFamily = option?.value as EFontFamily;
          }
        },
      },
      valueFontSize: {
        get() {
          const val = this.localFontlSettings.Value?.FontSize;
          const options = this.enumToOptions(this.EFontSize);
          return options.find((opt) => opt.value == val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          if (this.localFontlSettings.Value) {
            this.localFontlSettings.Value.FontSize = option?.value as EFontSize;
          }
        },
      },
      valueFontWeight: {
        get() {
          const val = this.localFontlSettings.Value?.FontWeight;
          return this.enumToOptions(this.EFontWeight).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          if (this.localFontlSettings.Value) {
            this.localFontlSettings.Value.FontWeight = option?.value as EFontWeight;
          }
        },
      },
      valueFontStyle: {
        get() {
          const val = this.localFontlSettings.Value?.FontStyle;
          return this.enumToOptions(this.EFontStyle).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          if (this.localFontlSettings.Value) {
            this.localFontlSettings.Value.FontStyle = option?.value as EFontStyle;
          }
        },
      },
      unitFontFamily: {
        get() {
          const val = this.localFontlSettings.Unit?.FontFamily;
          return this.enumToOptions(this.EFontFamily).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          if (this.localFontlSettings.Unit) this.localFontlSettings.Unit.FontFamily = option?.value as EFontFamily;
        },
      },
      unitFontSize: {
        get() {
          const val = this.localFontlSettings.Unit?.FontSize;
          const options = this.enumToOptions(this.EFontSize);
          return options.find((opt) => opt.value == val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          if (this.localFontlSettings.Unit) this.localFontlSettings.Unit.FontSize = option?.value as EFontSize;
        },
      },
      unitFontWeight: {
        get() {
          const val = this.localFontlSettings.Unit?.FontWeight;
          return this.enumToOptions(this.EFontWeight).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          if (this.localFontlSettings.Unit) {
            this.localFontlSettings.Unit!.FontWeight = option?.value as EFontWeight;
          }
        },
      },
      unitFontStyle: {
        get() {
          const val = this.localFontlSettings.Unit?.FontStyle;
          return this.enumToOptions(this.EFontStyle).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Unit!.FontStyle = option?.value as EFontStyle;
        },
      },
      labelFontFamily: {
        get() {
          const val = this.localFontlSettings.Label?.FontFamily;
          return this.enumToOptions(this.EFontFamily).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Label!.FontFamily = option?.value as EFontFamily;
        },
      },
      labelFontSize: {
        get() {
          const val = this.localFontlSettings.Label?.FontSize;
          const options = this.enumToOptions(this.EFontSize);
          return options.find((opt) => opt.value == val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Label!.FontSize = option?.value as EFontSize;
        },
      },
      labelFontWeight: {
        get() {
          const val = this.localFontlSettings.Label?.FontWeight;
          return this.enumToOptions(this.EFontWeight).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Label!.FontWeight = option?.value as EFontWeight;
        },
      },
      labelFontStyle: {
        get() {
          const val = this.localFontlSettings.Label?.FontStyle;
          return this.enumToOptions(this.EFontStyle).find((option) => option.value === val) || { label: val, value: val };
        },
        set(option: { value: string }) {
          this.localFontlSettings.Label!.FontStyle = option?.value as EFontStyle;
        },
      },
    },
    watch: {
      modelValue: {
        handler(newValue: FontSettings | undefined) {
          if (newValue) {
            this.localFontlSettings = newValue;
          }
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      enumToOptions(enumObj: Record<string, string>) {
        return Object.entries(enumObj).map(([label, value]) => ({ label, value }));
      },
    },
  });
</script>

<style scoped>
  .input-label {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .input-box {
    width: 40px;
    height: 30px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    text-align: start;
  }

  .heading {
    color: var(--text-tertiary);
    padding: 10px 0;
  }

  .appearance-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 2px 3px;
    gap: 20px;
    padding: 0 20px;
    height: 32px;
  }
</style>
