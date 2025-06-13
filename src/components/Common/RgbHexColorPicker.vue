<template>
  <div class="color-picker">
    <div class="mode-tabs">
      <div :class="{ active: mode === 'rgb' }" @click="mode = 'rgb'">RGB</div>
      <div :class="{ active: mode === 'hex' }" @click="mode = 'hex'">HEX</div>
    </div>
    <div class="d-flex flex-row gap5">
      <!-- RGB inputs -->
      <div v-if="mode === 'rgb'" class="rgb-inputs">
        <label class="fontWeight-600">
          R:
          <input v-model.number="r" type="number" min="0" max="255" @input="onRgbInput" />
        </label>
        <label class="fontWeight-600">
          G:
          <input v-model.number="g" type="number" min="0" max="255" @input="onRgbInput" />
        </label>
        <label>
          B:
          <input v-model.number="b" type="number" min="0" max="255" @input="onRgbInput" />
        </label>
      </div>

      <!-- HEX input -->
      <div v-else class="hex-input">
        <label>
          HEX:
          <input v-model="hex" type="text" maxlength="8" placeholder="#RRGGBB" @input="onHexInput" />
        </label>
      </div>
      <input v-model="nativeColor" type="color" :class="['native-color-input']" class="ml-auto" />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { ColorSet, themeColors } from '../../interfaces/themeconfig.interfaces';
  import { store } from '@/main';
  import { Themes } from '@/interfaces/state.interfaces';
  export default defineComponent({
    name: 'RgbHexColorPicker',
    props: {
      modelValue: {
        type: String,
        required: true,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        mode: 'rgb' as 'rgb' | 'hex',
        r: 255,
        g: 255,
        b: 255,
        hex: '#ffffff',
        nativeColor: '#ffffff',
      };
    },
    computed: {
      activeTheme(): Themes {
        return store.theme as unknown as Themes;
      },
      currentTheme() {
        return store.theme;
      },
      colorList() {
        return themeColors[this.activeTheme] || ({} as ColorSet);
      },
    },
    watch: {
      nativeColor(newColor: string) {
        // When native color changes, update r,g,b and hex
        this.hex = newColor.toLowerCase();
        const { r, g, b } = this.hexToRgb(newColor);
        if (r !== null) {
          this.r = r;
          this.g = g;
          this.b = b;
        }
        this.$emit('update:modelValue', this.hex);
      },
    },
    mounted() {
      const colorList = themeColors[this.currentTheme] ?? {};
      const isKey = this.modelValue in colorList;
      const resolvedColor = isKey ? colorList[this.modelValue as keyof ColorSet] : this.modelValue;
      this.nativeColor = resolvedColor;
    },
    methods: {
      onRgbInput() {
        // Clamp values
        this.r = this.clamp(this.r, 0, 255);
        this.g = this.clamp(this.g, 0, 255);
        this.b = this.clamp(this.b, 0, 255);
        this.hex = this.rgbToHex(this.r, this.g, this.b);
        this.nativeColor = this.hex;
        this.$emit('update:modelValue', this.hex);
      },
      onHexInput() {
        if (!this.hex.startsWith('#')) {
          this.hex = '#' + this.hex;
        }
        if (this.isValidHex(this.hex)) {
          this.nativeColor = this.hex;
          const { r, g, b } = this.hexToRgb(this.hex);
          if (r !== null) {
            this.r = r;
            this.g = g;
            this.b = b;
          }
        }
        this.$emit('update:modelValue', this.hex);
      },
      clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
      },
      isValidHex(hex: string) {
        return /^#([0-9a-fA-F]{6})$/.test(hex);
      },
      hexToRgb(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: null, g: null, b: null };
      },
      rgbToHex(r: number, g: number, b: number) {
        return (
          '#' +
          [r, g, b]
            .map((x) => {
              const hex = x.toString(16);
              return hex.length === 1 ? '0' + hex : hex;
            })
            .join('')
        );
      },
    },
  });
</script>

<style scoped>
  .color-picker {
    width: 260px;
  }

  .mode-tabs {
    display: flex;
    margin-bottom: 8px;
  }

  .mode-tabs div {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid var(--border-secondary);
    background: var(--white);
    cursor: pointer;
    font-weight: bold;
    text-align: center;
  }

  .mode-tabs div.active {
    background: var(--bg-primary);
    color: var(--white);
    border-color: var(--bg-primary);
  }
  [data-color='transparent'] {
    width: 24px;
    height: 24px;
    background-color: transparent !important;
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
      linear-gradient(-45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc);
    background-size: 10px 10px;
  }
  .native-color-input {
    -webkit-appearance: none;
    width: 30px;
    height: 30px;
    cursor: pointer;
    border: none;
    padding: 0;
    margin: 0;
    box-shadow: none;
    background-color: attr(data-color);
  }
  .ml-auto {
    margin-left: auto;
  }
  .rgb-inputs label,
  .hex-input label {
    display: inline-block;
    margin-right: 8px;
  }

  .rgb-inputs input {
    width: 35px;
    padding: 4px;
    margin-left: 4px;
    border: 1px solid var(--border-secondary);
    border-radius: 4px;
  }
  .hex-input input {
    width: 80px;
    padding: 4px;
    margin-left: 4px;
    border: 1px solid var(--border-secondary);
    border-radius: 4px;
  }
</style>
