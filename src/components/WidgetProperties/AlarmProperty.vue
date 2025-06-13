<template>
  <div class="alarm-wrapper">
    <template v-for="(alarm, index) in localAlarms" :key="index">
      <div class="alarm-container" @input="updateAlarm()">
        <div class="d-flex align-items-center gap10 fontSize-12">
          <input v-model="alarm.Warning" type="checkbox" class="toggle-switch1" />
          <span>{{ alarm.AlarmType }}</span>
        </div>

        <template v-if="alarm.Warning">
          <div class="value-container">
            <div class="color-container flex-full gap10">
              <label class="input-label">Max Value</label>
              <input v-model="alarm.MaxValue" type="number" class="input-box" />
            </div>
            <div class="color-container flex-full gap10">
              <label class="input-label">Min Value</label>
              <input v-model="alarm.MinValue" type="number" class="input-box" />
            </div>
          </div>

          <div class="color-container flex-full gap10">
            <div class="d-flex flex-full gap10">
              <label class="input-label">Color</label>
              <ColorPicker v-model="alarm.Color"></ColorPicker>
            </div>

            <div class="blinking-container flex-full">
              <label class="input-label">Blinking</label>
              <input v-model="alarm.Blinking" type="checkbox" class="toggle-switch1" />
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { AlarmSettings } from '../../../server/helpers/settings.helpers/alarm.settings.helper';
  import ColorPicker from '../Common/ColorPicker.vue';

  export default defineComponent({
    components: { ColorPicker },
    props: {
      modelValue: {
        type: Array as PropType<AlarmSettings[]>,
        required: true,
      },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        localAlarms: [...this.modelValue], // Clone array to avoid direct mutation
      };
    },
    watch: {
      modelValue: {
        handler(newValue: AlarmSettings[]) {
          this.localAlarms = [...newValue];
        },
        immediate: true,
        deep: true,
      },
    },
    methods: {
      updateAlarm() {
        this.$emit('update:modelValue', [...this.localAlarms]);
      },
    },
  });
</script>

<style scoped>
  .alarm-container {
    display: flex;
    flex-flow: column;
    gap: 4px;
    padding: 10px 0;
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
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
    gap: 10px;
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
  .blinking-container {
    gap: 10px;
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .alarm-title {
    color: var(--text-tertiary);
    margin-bottom: 12px;
  }

  .input-box {
    width: 40px;
    height: 30px;
    border-radius: 4px;
    text-align: start;
  }
</style>
