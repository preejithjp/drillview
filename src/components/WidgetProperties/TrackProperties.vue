<template>
  <section class="d-flex flex-col" @input="$emit('update:modelValue', localTrackSettings)">
    <template v-for="(t, ti) in localTrackSettings" :key="ti">
      <div class="heading fontBold fontSize-14 pt10 d-flex">
        <label v-if="t.TrackType === 'Index'" class="flex-full text-tertiary">Index Track</label>
        <label v-if="t.TrackType === 'Curve'" class="flex-full text-tertiary">Curve Track</label>
        <SvgIcon name="delete-icon" class="svg-icon size15" @click.stop="removeTrack(ti)" />
      </div>
      <div v-if="t.Background !== undefined" class="appearance-item fontSize-12 p-relative">
        <label :for="`${ti}-Background`" class="appearance-label">Background Color</label>
        <ColorPicker v-model="t.Background"></ColorPicker>
      </div>
      <div v-if="t.BorderColour !== undefined && t.TrackType !== 'Index'" class="appearance-item fontSize-12 p-relative">
        <label :for="`${ti}-BorderColour`" class="appearance-label">Border Color</label>
        <ColorPicker v-model="t.BorderColour"></ColorPicker>
      </div>
      <div v-if="t.BorderThickness !== undefined && t.TrackType !== 'Index'" class="appearance-item fontSize-12">
        <label :for="`${ti}-BorderThickness`" class="appearance-label">Border Thickness</label>
        <div class="dropdown-container">
          <input :id="`${ti}-BorderThickness`" v-model="t.BorderThickness" class="border-color-picker" type="number" />
        </div>
      </div>
      <div v-if="t.GridColor !== undefined && t.TrackType !== 'Index'" class="appearance-item fontSize-12 p-relative">
        <label :for="`${ti}-GridColor`" class="appearance-label">Grid Color</label>
        <ColorPicker v-model="t.GridColor"></ColorPicker>
      </div>
      <div v-if="t.GridThickness !== undefined && t.TrackType !== 'Index'" class="appearance-item fontSize-12">
        <label :for="`${ti}-GridThickness`" class="appearance-label">Grid Thickness</label>
        <div class="dropdown-container">
          <input :id="`${ti}-GridThickness`" v-model="t.GridThickness" class="border-color-picker" type="number" />
        </div>
      </div>
      <div v-if="t.GridThickness !== undefined && t.TrackType !== 'Index'" class="appearance-item fontSize-12 min-height-30">
        <label :for="`${ti}-GridThickness`" class="appearance-label">Grid Visible</label>
        <div class="dropdown-container">
          <label>
            <input v-model="t.GridVisibility" type="radio" :value="true" />
            Yes
          </label>
          <label>
            <input v-model="t.GridVisibility" type="radio" :value="false" />
            No
          </label>
        </div>
      </div>
    </template>
    <div class="d-flex justify-content-space-between m10">
      <div class="d-flex" @click="addTrack('Index')">
        <SvgIcon name="circle-plus-icon" class="svg-icon size20 icon-active-color ml-auto" />
        <label class="pl10 text-tertiary">Index Track</label>
      </div>
      <div class="d-flex" @click="addTrack('Curve')">
        <SvgIcon name="circle-plus-icon" class="svg-icon size20 icon-active-color ml-auto" />
        <label class="pl10">Curve Track</label>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
  import { store } from '@/main';
  import { TrackSettings } from '../../../server/helpers/settings.helpers/track.settings.helper';
  import { defineComponent } from 'vue';
  import ColorPicker from '../Common/ColorPicker.vue';

  export default defineComponent({
    components: { ColorPicker },
    props: {
      modelValue: {
        type: Object as () => TrackSettings[] | null,
        default: undefined,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        localTrackSettings: {} as TrackSettings[],
      };
    },
    computed: {
      activeTheme() {
        return store.theme;
      },
    },
    watch: {
      modelValue: {
        handler(newValue: TrackSettings[] | undefined) {
          if (newValue) {
            this.localTrackSettings = newValue;
          }
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      removeTrack(trackIndex: number) {
        this.localTrackSettings.splice(trackIndex, 1);
      },
      addTrack(trackType: string) {
        this.localTrackSettings.push({
          TrackType: trackType,
          TrackName: '',
          Background: '',
          BorderColour: '#dfe0e3',
          BorderThickness: 1,
          GridColor: '#dfe0e3',
          GridThickness: 1,
          GridVisibility: true,
          Curve: [],
        });
        if (trackType === 'Curve') {
          const count = this.localTrackSettings.filter((t) => t.TrackType === 'Curve').length;
          this.localTrackSettings[this.localTrackSettings.length - 1].TrackName = `Curve Track ${count}`;
        }
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

  .color-container {
    display: flex;
    align-items: center;
    margin-top: 8px;
    gap: 20px;
  }

  /* Color Pickers */
  .color-picker {
    width: 32px;
    height: 32px;
    border: 1px solid var(--bg-secondary);
    border-radius: 4px;
    cursor: pointer;
  }

  .appearance-container {
    padding: 16px;
    width: 100%;
  }

  .input-box {
    width: 40px;
    height: 30px;
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    text-align: start;
  }

  .heading {
    color: var(--black);
  }

  .appearance-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 2px 3px;
    gap: 20px;
    padding: 0 20px;
  }

  .dropdown-container {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  /* Background Color Picker (Solid Square) */
  .background-color-picker {
    width: 32px;
    height: 32px;
    border: none;
    cursor: pointer;
    background-color: transparent;
  }

  /* Border Color Picker - Bordered Square */
  .border-color-wrapper {
    display: flex;
    align-items: center;
  }

  .border-color-picker {
    width: 30px;
    /* Outer box */
    height: 30px;
    border: 2px solid var(--text-senary);
    /* Dark border */
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-secondary);
    cursor: pointer;
  }

  /* Inner small color picker */
  .border-color-picker input[type='color'] {
    width: 20px;
    height: 20px;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }

  /* Dropdown styling (Fixes arrow button inside square issue) */
  .dropdown {
    background: transparent;
    border: none;
    font-size: 16px;
    cursor: pointer;
  }
  .min-height-30 {
    min-height: 30px;
  }
</style>
