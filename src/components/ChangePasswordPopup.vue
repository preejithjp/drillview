<template>
  <CommonPopup
    :popupTitle="'Change Password'"
    primaryBtnText="Save"
    secondaryBtnText="Cancel"
    :disabledPrimaryBttn="!reEnterPassword.NewPassword"
    @on-submit="onSave"
    @on-cancel="onCancel">
    <div class="popup-fields">
      <div class="field">
        <label for="changePassword-name" class="field-label fontBold fontSize-14">New Password</label>
        <span class="p-relative">
          <input
            id="changePassword-name"
            v-model="reEnterPassword.NewPassword"
            :type="`${passwordReveal.initial ? 'text' : 'password'}`"
            autocomplete="off"
            class="fontNormal fontSize-14"
            placeholder="Enter Password" />
          <SvgIcon
            :name="`${passwordReveal.initial ? 'openEye' : 'closeEye'}`"
            class="svg-icon size14 passwordReveal"
            @click="passwordReveal.initial = !passwordReveal.initial" />
        </span>
      </div>
      <div class="field">
        <label for="confirm-password" class="field-label fontBold fontSize-14">Confirm Password</label>
        <span class="p-relative">
          <input
            id="confirm-password"
            v-model="reEnterPassword.ConfirmPassword"
            :type="`${passwordReveal.confirm ? 'text' : 'password'}`"
            autocomplete="off"
            class="fontNormal fontSize-14"
            placeholder="Enter Confirm Password" />
          <SvgIcon
            :name="`${passwordReveal.confirm ? 'openEye' : 'closeEye'}`"
            class="svg-icon size14 passwordReveal"
            @click="passwordReveal.confirm = !passwordReveal.confirm" />
        </span>
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { Api } from '../services/api.services';
  import { store } from '../main';

  export interface Ipassword {
    NewPassword: string;
    ConfirmPassword: string;
  }

  export default defineComponent({
    name: 'ChangePasswordPopup',
    components: { CommonPopup },
    emits: ['cancel'],
    data() {
      return {
        reEnterPassword: {
          NewPassword: '',
          ConfirmPassword: '',
        } as Ipassword,
        passwordReveal: {
          initial: false,
          confirm: false,
        },
      };
    },
    methods: {
      async onSave() {
        if (this.reEnterPassword.NewPassword === this.reEnterPassword.ConfirmPassword) {
          await Api.patch(`members/${store.userInfo.MEMBERID}/change-password`, { Password: this.reEnterPassword.NewPassword });
          this.$emit('cancel');
        }
      },
      onCancel() {
        this.$emit('cancel');
      },
    },
  });
</script>

<style scoped>
  .popup-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .field-label {
    flex: 0 0 140px;
  }
</style>
