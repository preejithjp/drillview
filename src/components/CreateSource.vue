<template>
  <CommonPopup
    :popupTitle="popupTitle"
    primaryBtnText="Save"
    secondaryBtnText="Cancel"
    :disabledPrimaryBttn="!isFormValid"
    @on-submit="onSave"
    @on-cancel="$emit('cancel')">
    <div class="popup-fields width-100">
      <div class="field">
        <label for="member-url" class="field-label fontSize-14">URL</label>
        <input id="member-url" v-model="sourceData.Url" type="text" class="field-input fontNormal fontSize-14" placeholder="Enter URL" />
      </div>
      <div class="ui-dialog-layout-50">
        <div class="field">
          <label for="member-name" class="field-label fontSize-14">Name</label>
          <input id="member-name" v-model="sourceData.Name" type="text" class="field-input fontNormal fontSize-14" placeholder="Enter Name" />
        </div>
        <div class="field">
          <label for="member-version" class="field-label fontSize-14">Version</label>
          <DropDown id="member-version" v-model="sourceData.Version" :options="versionOptions" class="field-select fontNormal fontSize-14" />
        </div>
      </div>
      <div class="field">
        <label for="member-url" class="field-label fontSize-14">Max Connection</label>
        <input
          id="member-url"
          v-model="sourceData.MaxConnections"
          type="text"
          class="field-input fontNormal fontSize-14"
          placeholder="Enter Max Connection" />
      </div>
      <div class="ui-dialog-layout-50">
        <div class="field">
          <label for="member-description" class="field-label fontSize-14">User Name</label>
          <input
            id="member-description"
            v-model="sourceData.UserName"
            type="text"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter User Name" />
        </div>
        <div class="field p-relative">
          <label for="member-password" class="field-label fontSize-14">Password</label>
          <input
            id="member-password"
            v-model="sourceData.Password"
            :type="`${passwordReveal ? 'text' : 'password'}`"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter Password"
            autocomplete="new-password" />
          <SvgIcon
            :name="`${passwordReveal ? 'openEye' : 'closeEye'}`"
            class="svg-icon size14 passwordReveal"
            @click="passwordReveal = !passwordReveal" />
        </div>
      </div>
      <div class="ui-proxy-layout-50">
        <div class="field">
          <label class="field-label fontSize-14">Use Proxy</label>
          <input v-model="sourceData.IsProxy" type="checkbox" />
        </div>
        <div v-if="sourceData.IsProxy" class="field">
          <label class="field-label fontSize-14">Authentication</label>
          <input v-model="ProxyConfig.Authentication" type="checkbox" />
        </div>
      </div>
      <div v-if="sourceData.IsProxy" class="field">
        <label for="member-name" class="field-label fontSize-14">Host Name</label>
        <input id="member-name" v-model="ProxyConfig.HostName" type="text" class="field-input fontNormal fontSize-14" placeholder="Enter Host Name" />
      </div>
      <div v-if="sourceData.IsProxy" class="ui-dialog-layout-50">
        <div class="field">
          <label for="member-description" class="field-label fontSize-14">User Name</label>
          <input
            id="member-description"
            v-model="ProxyConfig.UserName"
            type="text"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter User Name" />
        </div>
        <div v-if="sourceData.IsProxy" class="field p-relative">
          <label for="member-password" class="field-label fontSize-14">Password</label>
          <input
            id="member-password"
            v-model="ProxyConfig.Password"
            :type="`${proxyPasswordReveal ? 'text' : 'password'}`"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter Password"
            autocomplete="new-password" />
          <SvgIcon
            :name="`${proxyPasswordReveal ? 'openEye' : 'closeEye'}`"
            class="svg-icon size14 passwordReveal"
            @click="proxyPasswordReveal = !proxyPasswordReveal" />
        </div>
      </div>
      <div class="field">
        <label class="field-label fontSize-14">Connection Status</label>
        <SvgIcon name="reload-icon" class="svg-icon size16 search-icon" @click="testConnection" />
        <span>Test</span>
        <SvgIcon v-if="isTested && isActive" name="tick-icon" class="svg-icon size16" />
        <SvgIcon v-if="isTested && !isActive" name="close-icon-circle" class="svg-icon size16 error-color" />
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { ISourceConfig, SourceProxyConfig, ResponseType, WITSMLVersion } from '../../server/interfaces/synchronizer.interfaces';
  import { Api } from '@/services/api.services';
  import { SourceConfigService } from 'server/interfaces/datasimplex.interfaces';

  export default defineComponent({
    name: 'CreateSource',
    components: { CommonPopup },
    props: {
      initialSourceData: {
        type: Object as () => Partial<ISourceConfig> | null,
        default: null,
      },
    },
    emits: ['save', 'cancel'],
    data() {
      return {
        sourceData: {
          Url: '',
          Name: '',
          UserName: '',
          Password: '',
          MaxConnections: 1,
          IsProxy: false,
          Version: WITSMLVersion.v1,
        } as Partial<ISourceConfig>,
        ProxyConfig: {
          HostName: '',
          UserName: '',
          Password: '',
          Authentication: false,
        } as Partial<SourceProxyConfig>,
        passwordReveal: false as boolean,
        proxyPasswordReveal: false as boolean,
        isTested: false as boolean,
        isActive: false as boolean,
      };
    },
    computed: {
      versionOptions(): string[] {
        return Object.values(WITSMLVersion);
      },
      popupTitle() {
        return this.initialSourceData && Object.keys(this.initialSourceData).length ? 'Edit Source' : 'Add New Source';
      },
      isFormValid(): boolean {
        const urlRegex = /^(https?:\/\/)([\w.-]+)\.([a-z]{2,})(:\d+)?(\/[\w.-]*)*\/?$/i;
        return !!(
          this.sourceData.Url &&
          urlRegex.test(this.sourceData.Url) &&
          this.sourceData.Name &&
          this.sourceData.UserName &&
          this.sourceData.Password &&
          this.sourceData.MaxConnections &&
          (!this.sourceData.IsProxy ||
            (this.ProxyConfig.HostName && urlRegex.test(this.ProxyConfig.HostName) && this.ProxyConfig.UserName && this.ProxyConfig.Password))
        );
      },
    },
    mounted() {
      if (this.initialSourceData && Object.keys(this.initialSourceData).length !== 0) {
        this.sourceData = this.initialSourceData;
        this.ProxyConfig = this.initialSourceData.ProxyConfig as SourceProxyConfig;
      }
    },
    methods: {
      async onSave() {
        const data = {
          ...this.sourceData,
          ProxyConfig: this.ProxyConfig,
        };
        if (this.initialSourceData && Object.keys(this.initialSourceData).length !== 0) {
          await Api.patch('synchronizers/source/' + this.initialSourceData.SourceId, data);
        } else {
          await Api.submit('synchronizers/source', data);
        }
        this.$emit('save');
      },
      async testConnection() {
        const data: SourceConfigService = {
          Url: this.sourceData.Url || '',
          UserName: this.sourceData.UserName || '',
          Password: this.sourceData.Password || '',
          Proxy: {
            UseProxy: this.sourceData.IsProxy || false,
            HostName: this.ProxyConfig.HostName || '',
            Authentication: this.ProxyConfig.Authentication || false,
            UserName: this.ProxyConfig.UserName || '',
            Password: this.ProxyConfig.Password || '',
          },
          Version: this.sourceData.Version || WITSMLVersion.v1,
          Maxconnections: this.sourceData.MaxConnections || 0,
        };
        const response = await Api.submit('synchronizers/connectionstatus', data);
        this.isTested = true;
        this.isActive = response === ResponseType.Connected;
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
    flex: 0 0 100px;
  }

  .field-input,
  .field-select {
    flex: 1;
    padding: 0.6rem;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: var(--bg-septenary);
    border: 1px solid var(--border-tertiary);
    color: var(--text-tertiary);
  }

  .ui-dialog-layout-50 {
    display: grid;
    grid-template-columns: auto auto;
    gap: 30px;
  }

  .ui-proxy-layout-50 {
    display: grid;
    grid-template-columns: 20% auto;
    gap: 30px;
  }

  .field svg {
    color: var(--icon-secondary);
  }

  .field .error-color {
    color: var(--error-color);
  }
</style>
