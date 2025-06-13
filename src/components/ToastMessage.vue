<template>
  <div class="toast-container">
    <div v-for="toast in toastMessages" :key="toast.id" :class="['modal', `${toast.toastType}-border`]">
      <div class="modal-body p-relative">
        <SvgIcon :name="`${toast.toastType + '-icon'}`" :class="`svg-icon size24 icon-wrapper ${toast.toastType}-color ${toast.toastType}-border`" />
        <p class="message">
          <span :class="['fontSize-12 capitalize-text', `${toast.toastType}-color`]">{{ toast.toastType }}</span>
          <span class="fontSize-14 capitalize-text">{{ toast.message }}</span>
        </p>
        <SvgIcon name="close-icon" class="svg-icon size18 close-icon" @click="removeToast(toast.id!)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { store } from '@/main';
  import { defineComponent, watch } from 'vue';

  export enum ToastType {
    SUCCESS = 'Success',
    WARN = 'Warning',
    ERROR = 'Failure',
  }

  export interface ToastMessage {
    id?: number;
    message: string;
    toastType: ToastType;
    duration?: number;
  }

  export default defineComponent({
    name: 'ToastMessage',
    data() {
      return {
        ToastType: ToastType,
        toastDuration: 3000,
        toastMessages: [] as ToastMessage[],
      };
    },
    created() {
      watch(
        () => store.newToastMessage,
        (newToast) => {
          this.showToastMessage(newToast);
        }
      );
    },
    methods: {
      showToastMessage(toastMessage: ToastMessage) {
        toastMessage.id = Date.now();
        this.toastMessages.push(toastMessage);
        const toastDuration = toastMessage.duration ? toastMessage.duration : this.toastDuration;
        setTimeout(() => {
          this.removeToast(toastMessage.id!);
        }, toastDuration);
      },
      removeToast(id: number) {
        this.toastMessages = this.toastMessages.filter((toast: ToastMessage) => toast.id !== id);
      },
    },
  });
</script>

<style scoped>
  .toast-container {
    position: fixed;
    top: 25px;
    right: 25px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .modal {
    background: var(--bg-secondary);
    width: 375px;
    border-radius: 7px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    border-top: 7px solid var(--bg-primary);
  }

  .close-icon {
    position: absolute;
    top: 1em;
    right: 1em;
  }

  .modal-body {
    padding: 15px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .icon-wrapper {
    padding: 5px;
    width: 40px;
    height: 40px;
    border: 2px solid var(--success-color);
    border-radius: 50%;
  }

  .Success-color {
    color: var(--success-color);
  }

  .Warning-color {
    color: var(--warning-color);
  }

  .Failure-color {
    color: var(--error-color);
  }

  .Success-border {
    border-color: var(--success-color);
  }

  .Warning-border {
    border-color: var(--warning-color);
  }

  .Failure-border {
    border-color: var(--error-color);
  }

  .message {
    margin: 0;
    display: flex;
    flex-direction: column;
  }
  .capitalize-text {
    text-transform: capitalize;
  }
</style>
