<template>
  <div class="modal-backdrop">
    <div class="modal">
      <!-- Header -->
      <div class="modal-header">
        <SvgIcon name="close-icon" class="svg-icon size12" @click="onCancel" />
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="icon-wrapper flex-shrink-0">
          <span class="svg-icon size24 fontSize-20">!</span>
        </div>
        <p class="message">
          <span class="message-title fontSize-14">Confirmation</span>
          <span class="fontSize-16">{{ message }}</span>
        </p>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <CustomButton @click="onSecondaryBtnClick">{{ secondaryBtnText }}</CustomButton>
        <CustomButton :type="BtnType.DESTRUCTIVE" @click="onSubmit">{{ primaryBtnText }}</CustomButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { BtnType } from '../Globals/CustomButton.vue';

  export default defineComponent({
    name: 'ConfirmationPopup',
    props: {
      primaryBtnText: { type: String, default: 'Delete' },
      secondaryBtnText: { type: String, default: 'Cancel' },
      message: {
        type: String,
        default: 'Are you sure you want to proceed?',
      },
    },
    emits: ['onCancel', 'onSubmit'],
    data() {
      return {
        BtnType: BtnType,
      };
    },
    methods: {
      onCancel() {
        this.$emit('onCancel');
      },
      onSecondaryBtnClick() {
        this.$emit('onCancel');
      },
      onSubmit() {
        this.$emit('onSubmit');
      },
    },
  });
</script>

<style scoped>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: var(--bg-quaternary);
    width: 450px;
    border: 1px solid var(--border-tertiary);
    border-top: 7px solid var(--bg-primary);
    border-radius: 7px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  .modal-header {
    color: var(--text-secondary);
    padding: 15px;
    display: flex;
    justify-content: end;
    align-items: center;
  }

  .modal-body {
    padding: 0px 20px 25px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border: 2px solid var(--icon-primary);
    border-radius: 50%;
    color: var(--text-secondary);
  }

  .message {
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .modal-footer {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid var(--border-tertiary);
  }
</style>
