<template>
  <div class="modal-window-dashboard d-flex fontSize-14">
    <div class="modal-wrapper d-flex" :style="wrapperStyle">
      <div class="model-container d-flex">
        <div v-if="popupTitle" class="modal-header d-flex justify-content-space-between">
          <span class="d-flex gap5 align-items-center text-secondary">
            <SvgIcon v-if="headerIcon" :name="headerIcon" class="svg-icon size30 text-secondary" />
            <span class="fontSize-16 fontBold title-text">{{ popupTitle }}</span>
          </span>
          <SvgIcon name="close-icon" class="svg-icon size14 text-tertiary" @click="$emit('onCancel')" />
        </div>
        <div class="modal-content d-flex">
          <slot></slot>
        </div>
        <div v-if="footer" class="modal-footer flex-row d-flex">
          <CustomButton v-if="secondaryBtnText" :type="BtnType.SECONDARY" @click="$emit('onCancel')">{{ secondaryBtnText }}</CustomButton>
          <CustomButton :disabled="disabledPrimaryBttn" :type="BtnType.PRIMARY" @click="$emit('onSubmit')">{{ primaryBtnText }}</CustomButton>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { BtnType } from '../Globals/CustomButton.vue';

  export default defineComponent({
    name: 'CommonPopup',
    props: {
      headerIcon: { type: String },
      popupTitle: { type: String, required: true },
      primaryBtnText: { type: String, default: 'Ok' },
      secondaryBtnText: { type: String },
      disabledPrimaryBttn: { type: Boolean, default: false },
      footer: { type: Boolean, default: true },
      wrapperStyle: { type: Object as PropType<Record<string, string>> },
    },
    emits: ['onSubmit', 'onCancel'],
    data() {
      return {
        BtnType: BtnType,
      };
    },
    methods: {},
  });
</script>

<style scoped>
  .modal-window-dashboard {
    top: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 100;
    justify-content: center;
    align-items: center;
    background: var(--overlay-bg);
  }

  .modal-window-dashboard .modal-wrapper {
    width: 70%;
    background-color: transparent;
    max-height: 80%;
    flex-flow: column nowrap;
    border: 1px solid var(--border-tertiary);
    border-radius: 7px;
    overflow-y: auto;
  }

  .model-container {
    height: 100%;
    background-color: var(--popup-bg);
    border-radius: 7px;
    flex-flow: column nowrap;
    overflow-y: auto;
  }

  .modal-window-dashboard .modal-header {
    margin: 0;
    padding: 10px 25px;
    color: var(--text-tertiary);
    border-bottom: 1px solid var(--border-tertiary);
    align-items: center;
    background-color: var(--popup-header-bg);
  }

  .modal-window-dashboard .modal-content {
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
  }

  .modal-content {
    padding: 20px 25px;
    overflow-y: auto;
    overflow: visible;
  }

  .modal-window-dashboard .modal-footer {
    padding: 10px 25px 25px;
    flex: 0 0 auto;
    justify-content: flex-end;
    gap: 10px;
  }

  .title-text {
    color: var(--common-popup-title);
  }
</style>
