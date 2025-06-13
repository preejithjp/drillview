<template>
  <div>
    <label :class="['toggle-switch', { on: modelValue === trueValue }]">
      <input
        v-model="toggleValue"
        type="checkbox"
        :checked="toggleValue === trueValue"
        :true-value="trueValue"
        :false-value="falseValue"
        @change="$emit('update:modelValue', toggleValue)" />
      <span class="slider"></span>
    </label>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  export default defineComponent({
    props: {
      modelValue: { type: [String, Number, Boolean] },
      trueValue: { required: false, type: [String, Number, Boolean], default: true },
      falseValue: { required: false, type: [String, Number, Boolean], default: false },
    },
    emits: ['update:modelValue'],
    data() {
      return {
        toggleValue: this.modelValue || this.falseValue,
      };
    },
  });
</script>

<style scoped>
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-disable);
    border-radius: 34px;
    transition: 0.3s;
    border: 1px solid var(--border-primary);
  }

  .toggle-switch:after {
    position: absolute;
    content: '';
    left: 6%;
    bottom: 10%;
    background-color: var(--icon-teritiary);
    border-radius: 50%;
    transition: 0.3s;
    height: 80%;
    aspect-ratio: 1;
  }
  .toggle-switch.on:after {
    background-color: var(--bg-primary);
    right: 6%;
    left: unset;
  }

  input:checked + .slider {
    background-color: var(--bg-senary);
  }
</style>
