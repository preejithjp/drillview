<template>
  <div class="height-100">
    <div class="settings-tab">
      <div class="field d-flex align-items-center gap5 mb10">
        <label for="operator-name" class="field-label">Header Frequency In Minute:</label>
        <input
          id="operator-name"
          v-model="settingsDetails.HeaderFrequencyInMinute"
          type="number"
          class="field-input fontNormal"
          placeholder="Enter Header Frequency" />
      </div>

      <div class="field d-flex align-items-center gap5 mb10">
        <label for="operator-name" class="field-label">Data Frequency In Seconds:</label>
        <input
          id="operator-name"
          v-model="settingsDetails.DataFrequencyInSecond"
          type="number"
          class="field-input fontNormal"
          placeholder="Enter Data Frequency" />
      </div>

      <div class="field d-flex align-items-center gap5 mb10">
        <label for="operator-name" class="field-label">Start Index in UTC:</label>
        <input
          id="operator-name"
          v-model="settingsDetails.StartDateIndexInUtc"
          type="number"
          class="field-input fontNormal"
          placeholder="Enter Start Index in UTC" />
      </div>

      <div class="field d-flex align-items-center gap5 mb10">
        <label for="operator-name" class="field-label">Start Date Index in ft:</label>
        <input
          id="operator-name"
          v-model="settingsDetails.StartIndexInft"
          type="number"
          class="field-input fontNormal"
          placeholder="Enter Start Index in ft" />
      </div>

      <div class="field d-flex align-items-center gap5 mb10">
        <label for="backfilling-toggle" class="field-label toggle-width">BackFilling:</label>
        <ToggleSwitch v-model="settingsDetails.BackFilling" class="toggle-width" />
        <span class="toggle-label">{{ settingsDetails.BackFilling == true ? 'Yes' : 'No' }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { JobSettings } from '../../../server/interfaces/synchronizer.interfaces';

  export default defineComponent({
    name: 'SettingsTab',
    components: {},
    props: {
      modelValue: {
        type: Object as () => JobSettings,
        required: true,
        default: () => {},
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        settingsDetails: {
          ...this.modelValue,
        } as unknown as JobSettings,
      };
    },
    watch: {
      settingsDetails: {
        handler(newVal) {
          this.$emit('update:modelValue', newVal);
        },
        deep: true,
      },
    },
    methods: {},
  });
</script>
<style scoped>
  .settings-tab {
    padding: 20px;
  }

  .field label:first-of-type {
    width: 20%;
  }

  .field-input {
    flex: 1;
    padding: 0.6rem;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--border-tertiary);
    background-color: var(--bg-septenary);
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-switch .slider {
    position: absolute;
    cursor: pointer;
    background-color: var(--bg-septenary);
    border-radius: 24px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: 0.4s;
    border: 1px solid var(--border-tertiary);
  }

  .toggle-switch .slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: var(--border-tertiary);
    border-radius: 50%;
    transition: 0.4s;
  }

  .toggle-switch input:checked + .slider {
    background-color: var(--bg-primary);
  }

  .toggle-switch input:checked + .slider:before {
    transform: translateX(26px);
  }

  .toggle-width {
    width: 50px;
  }

  .toggle-label {
    margin-left: 10px;
    font-weight: 500;
  }
</style>
