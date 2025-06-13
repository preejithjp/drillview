<template>
  <section class="d-flex flex-col">
    <div class="heading fontBold fontSize-14">General</div>
    <div v-if="localAppearancelSettings.BackgroundColour" class="appearance-item fontSize-12">
      <label class="appearance-label">Background Color</label>
      <ColorPicker v-model="localAppearancelSettings.BackgroundColour"></ColorPicker>
    </div>
    <div v-if="localAppearancelSettings.BorderColour" class="appearance-item fontSize-12">
      <label class="appearance-label">Border Color</label>
      <ColorPicker v-model="localAppearancelSettings.BorderColour"></ColorPicker>
    </div>
    <div v-if="localAppearancelSettings.TitleFontColor" class="appearance-item fontSize-12">
      <label class="appearance-label">Title Font Color</label>
      <ColorPicker v-model="localAppearancelSettings.TitleFontColor"></ColorPicker>
    </div>
    <div v-if="localAppearancelSettings.ValueFontColor" class="appearance-item fontSize-12">
      <label class="appearance-label">Value Font Color</label>
      <ColorPicker v-model="localAppearancelSettings.ValueFontColor"></ColorPicker>
    </div>
    <div v-if="localAppearancelSettings.UnitFontColor" class="appearance-item fontSize-12">
      <label class="appearance-label">Unit Font Color</label>
      <ColorPicker v-model="localAppearancelSettings.UnitFontColor"></ColorPicker>
    </div>
    <div v-if="localAppearancelSettings.MarkerColor" class="appearance-item fontSize-12">
      <label class="appearance-label">Marker Color</label>
      <ColorPicker v-model="localAppearancelSettings.MarkerColor"></ColorPicker>
    </div>
    <div v-if="localAppearancelSettings.ProgressColor" class="appearance-item fontSize-12">
      <label class="appearance-label">Progress Color</label>
      <ColorPicker v-model="localAppearancelSettings.ProgressColor"></ColorPicker>
    </div>
    <div v-if="localAppearancelSettings.LabelFontColor" class="appearance-item fontSize-12">
      <label class="appearance-label">Label Font Color</label>
      <ColorPicker v-model="localAppearancelSettings.LabelFontColor"></ColorPicker>
    </div>
  </section>
</template>

<script lang="ts">
  import { AppearanceSettings } from '../../../server/helpers/settings.helpers/appearance.settings.helper';
  import { defineComponent } from 'vue';
  import ColorPicker from '../Common/ColorPicker.vue';
  export default defineComponent({
    components: { ColorPicker },
    props: {
      modelValue: {
        type: Object as () => AppearanceSettings | null,
        default: undefined,
      },
    },
    data() {
      return {
        localAppearancelSettings: { ...this.modelValue } as AppearanceSettings,
      };
    },
    watch: {
      modelValue: {
        handler(newValue: AppearanceSettings | undefined) {
          if (newValue) {
            this.localAppearancelSettings = newValue;
          }
        },
        immediate: true,
        deep: true,
      },
    },
  });
</script>

<style scoped>
  label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .input-label {
    font-size: 12px;
    margin-bottom: 4px;
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
  }
</style>
