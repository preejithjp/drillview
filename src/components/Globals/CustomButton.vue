<template>
  <div v-bind="$attrs" :class="`btn primary ${type} ${size} ${disabled ? 'disable' : ''}`" @click="transmitEvent">
    <slot></slot>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export enum BtnType {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
    DESTRUCTIVE = 'destructive',
  }

  export enum BtnSizes {
    SMALL = 'sm',
    MEDIUM = 'm',
    REGULAR = 'reg',
    LARGE = 'larg',
  }

  export default defineComponent({
    name: 'CustomButton',
    inheritAttrs: true,
    props: {
      type: {
        type: String as () => BtnType,
        required: false,
        default: BtnType.PRIMARY,
      },
      size: {
        type: String as () => BtnSizes,
        required: false,
        default: BtnSizes.REGULAR,
      },
      disabled: { type: Boolean, required: false },
    },
    emits: ['click'],
    methods: {
      transmitEvent(event: MouseEvent) {
        if (!this.disabled) {
          this.$emit('click', event);
        }
      },
    },
  });
</script>

<style>
  .btn {
    display: inline-flex;
    justify-content: center;
    padding: 10px;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.875rem;
    min-width: 30px;
    outline: none;
    user-select: none;
    width: 120px;
    border-radius: 6px;
    border: none;
  }
  .btn.primary {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
  .btn.secondary {
    background-color: var(--bg-quinary);
    color: var(--text-quinary);
    border: 1px solid var(--border-primary);
  }

  .btn.destructive {
    background-color: var(--error-color);
    color: var(--text-primary);
  }

  .btn.disable {
    position: relative;
    background: var(--bg-disable) !important;
    cursor: not-allowed;
    color: var(--text-senary);
  }

  .btn.xs {
    width: 36px;
    height: 36px;
  }

  .btn.sm {
    width: 110px;
    border-radius: 4px;
    height: 30px;
    align-items: center;
  }

  .btn.larg {
    width: 150px;
    border-radius: 4px;
    height: 30px;
    align-items: center;
  }
</style>
