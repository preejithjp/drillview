<template>
  <div class="chatsettings-container d-flex flex-col flex-full">
    <div class="d-flex flex-col flex-full gap10">
      <div>
        <span class="fontSemibold fontsize-14">Notification Settings</span>
      </div>
      <label class="d-flex gap10 align-items-center">
        <input v-model="chatgroupSettings.Snooze" type="checkbox" class="size16" @change="onSettingsChange('Snooze')" />
        Disable High priority message notification
      </label>
      <label class="d-flex gap10 align-items-center">
        <input
          v-model="chatgroupSettings.Beep"
          type="checkbox"
          class="size16"
          :disabled="chatgroupSettings.Snooze"
          @change="onSettingsChange('Beep')" />
        Enable High priority message notification sound
      </label>
    </div>
  </div>
</template>

<script lang="ts">
  import { Api } from '@/services/api.services';
  import { IMemberGroupData } from '../../../server/interfaces/chatgroup.interfaces';
  import { defineComponent, PropType } from 'vue';
  import { IChatGroupSettings } from 'server/interfaces/chatmembers.interfaces';
  import { BtnType } from '../Globals/CustomButton.vue';

  export interface Settings {
    Log: string;
    Mnemonic: string;
    Unit: string;
    errors: {
      Log: boolean;
      Mnemonic: boolean;
      Unit: boolean;
    };
  }

  export default defineComponent({
    name: 'ChatSettings',
    props: {
      chatgroup: {
        type: Object as PropType<IMemberGroupData>,
        required: true,
      },
    },
    data() {
      return {
        BtnType: BtnType,
        chatgroupSettings: {} as IMemberGroupData,
        chatgroupUpdated: {} as IMemberGroupData,
      };
    },
    watch: {
      chatgroup: {
        handler(newVal: IMemberGroupData) {
          this.chatgroupSettings = JSON.parse(JSON.stringify(newVal));
          this.chatgroupUpdated = newVal;
        },
        immediate: true,
      },
    },
    methods: {
      onSettingsChange(settingParameter: keyof IChatGroupSettings) {
        const settings: IChatGroupSettings = {};
        Object.assign(settings, { [settingParameter]: this.chatgroupSettings[settingParameter] });
        this.updateChatGroupSettings(settings);
      },
      async updateChatGroupSettings(settings: IChatGroupSettings) {
        const response = await Api.patch(`chatmembers/${this.chatgroupSettings.ParentGroupId}`, settings);
        if (response) {
          Object.assign(this.chatgroupUpdated, settings);
        }
      },
    },
  });
</script>

<style scoped>
  .chatsettings-container {
    padding: 10px;
  }
</style>
