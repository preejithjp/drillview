<template>
  <div v-outsideclick="onOutsideClick" class="color-picker-wrapper">
    <div class="dropdown-container" @click="openColorPalette">
      <div class="background-color-display" :style="{ backgroundColor: colorList[modelValue as keyof ColorSet] || modelValue }"></div>
    </div>

    <div v-if="isPaletteOpen" class="palette-wrapper">
      <div class="color-grid">
        <div
          v-for="(color, key) in colorList"
          :key="key"
          class="color-box"
          :style="{ backgroundColor: color }"
          :data-color="color"
          @click.stop="customColorSelected(color)"></div>
      </div>
      <div class="custom-color-wrapper">
        <RgbHexColorPicker v-model="selectedColor" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';
  import { Themes } from '@/interfaces/state.interfaces';
  import { store } from '@/main';
  import RgbHexColorPicker from './RgbHexColorPicker.vue';

  export default defineComponent({
    name: 'ColorPicker',
    components: {
      RgbHexColorPicker,
    },
    props: {
      modelValue: {
        type: String,
        required: true,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        selectedColor: '',
        isPaletteOpen: false,
      };
    },
    computed: {
      activeTheme(): Themes {
        return store.theme as unknown as Themes;
      },
      colorList() {
        return themeColors[this.activeTheme] || ({} as ColorSet);
      },
    },
    watch: {
      selectedColor(newColor) {
        this.$emit('update:modelValue', newColor);
      },
      modelValue: {
        immediate: true,
        handler(newVal) {
          this.selectedColor = this.getResolvedColor(newVal);
        },
      },
      activeTheme: {
        handler() {
          const key = this.modelValue as keyof ColorSet;
          if (this.colorList[key]) {
            this.$emit('update:modelValue', key);
          }
        },
        immediate: true,
      },
    },
    mounted() {
      this.selectedColor = this.getResolvedColor(this.modelValue);
    },
    methods: {
      getResolvedColor(value: string): string {
        return this.colorList[value as keyof ColorSet] || value;
      },
      openColorPalette() {
        this.isPaletteOpen = true;
      },
      customColorSelected(color: string) {
        const matchedKey = (Object.keys(this.colorList) as Array<keyof ColorSet>).find(
          (key) => this.colorList[key]?.trim().toLowerCase() === color.trim().toLowerCase()
        );
        if (matchedKey) {
          this.$emit('update:modelValue', matchedKey);
        } else {
          this.$emit('update:modelValue', color);
        }
        this.isPaletteOpen = false;
      },
      onOutsideClick(show: boolean) {
        if (show) {
          this.isPaletteOpen = false;
        }
      },
    },
  });
</script>
<style scoped>
  .dropdown-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 2px;
    position: relative;
  }

  .background-color-display {
    width: 30px;
    height: 30px;
    border: 1px solid var(--border-primary);
    cursor: pointer;
  }
  .palette-wrapper {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 10px;
    background: var(--bg-septenary);
    border: 0.5px solid var(--status-inactive-color);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .color-grid {
    display: grid;
    grid-template-columns: repeat(7, 35px);
    gap: 5px;
    place-items: center;
  }
  .color-box {
    width: 24px;
    height: 24px;
    cursor: pointer;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    transition: transform 0.2s ease-in-out;
  }

  .color-box:hover {
    transform: scale(1.1);
  }

  /* Transparent checker pattern */
  [data-color='transparent'] {
    background-color: transparent !important;
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
      linear-gradient(-45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc);
    background-size: 10px 10px;
  }
  .more-option {
    line-height: 25px;
    color: var(--text-tertiary);
    margin-top: 10px;
  }
  .custom-color-wrapper {
    margin-top: 10px;
  }
</style>
