<template>
  <CommonPopup
    :popupTitle="popupTitle"
    primaryBtnText="Save"
    secondaryBtnText="Cancel"
    :disabledPrimaryBttn="!isFormValid"
    @on-submit="onSave"
    @on-cancel="$emit('cancel')">
    <div class="popup-fields width-100">
      <div class="create-job-right-header gap5">
        <div class="create-job-right-header-box tab-box fontMedium fontSize-12">
          <span v-for="tab in Tabs" :key="tab" class="tab-item" :class="{ fontBold: SelectedTabes === tab }" @click="onSelectTab(tab)">
            {{ tab }}
          </span>
        </div>
      </div>
      <div class="ui-dialog-layout-50">
        <div class="field">
          <label for="member-url" class="field-label fontSize-14">URL</label>
          <input id="member-url" v-model="targetData.Url" type="text" class="field-input fontNormal fontSize-14" placeholder="Enter URL" />
        </div>
        <div class="field">
          <label for="member-version" class="field-label fontSize-14">User Type</label>
          <DropDown id="member-version" v-model="targetData.UserType" :options="versionOptions" class="field-select fontNormal fontSize-14" />
        </div>
      </div>
      <div class="ui-dialog-layout-50">
        <div class="field">
          <label for="member-description" class="field-label fontSize-14">User Name</label>
          <input
            id="member-description"
            v-model="targetData.UserName"
            type="text"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter User Name" />
        </div>
        <div class="field p-relative">
          <label for="member-password" class="field-label fontSize-14">Password</label>
          <input
            id="member-password"
            v-model="targetData.Password"
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
          <input v-model="targetData.Proxy.UseProxy" type="checkbox" />
        </div>
        <div class="field">
          <label class="field-label fontSize-14">Authentication</label>
          <input v-model="targetData.Proxy.Authentication" type="checkbox" />
        </div>
      </div>
      <div class="field">
        <label for="member-name" class="field-label fontSize-14">Host Name</label>
        <input
          id="member-name"
          v-model="targetData.Proxy.HostName"
          type="text"
          class="field-input fontNormal fontSize-14"
          placeholder="Enter Host Name" />
      </div>
      <div class="ui-dialog-layout-50">
        <div class="field">
          <label for="member-description" class="field-label fontSize-14">User Name</label>
          <input
            id="member-description"
            v-model="targetData.Proxy.UserName"
            type="text"
            class="field-input fontNormal fontSize-14"
            placeholder="Enter User Name" />
        </div>
        <div class="field p-relative">
          <label for="member-password" class="field-label fontSize-14">Password</label>
          <input
            id="member-password"
            v-model="targetData.Proxy.Password"
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
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import CommonPopup from './Common/CommonPopup.vue';
  import { TargetConfig, TargetStructure, WITSMLVersion } from '../../server/interfaces/synchronizer.interfaces';
  import { SynchronizerSaveData } from '../assets/synchronizersavedata';

  export enum TargetTabs {
    PRODUCT_STORE = 'Product Store',
    DATA_STORE = 'Data Store',
  }

  export default defineComponent({
    name: 'CreateTarget',
    components: { CommonPopup },
    props: {
      initialTargetData: {
        type: Object as () => Partial<TargetStructure> | null,
        default: null,
      },
    },
    emits: ['save', 'cancel'],
    data() {
      return {
        Tabs: Object.values(TargetTabs) as TargetTabs[],
        SelectedTabes: TargetTabs.PRODUCT_STORE as TargetTabs,
        TargetVal: {} as TargetStructure,
        targetData: SynchronizerSaveData.Target.ProductStore as TargetConfig,
        passwordReveal: false as boolean,
        proxyPasswordReveal: false as boolean,
      };
    },
    computed: {
      versionOptions(): string[] {
        return Object.values(WITSMLVersion);
      },
      popupTitle() {
        return 'Target Configuration';
      },
      isFormValid(): boolean {
        const urlRegex = /^(https?:\/\/)([\w.-]+)\.([a-z]{2,})(:\d+)?(\/[\w.-]*)*\/?$/i;
        return !!(
          this.targetData.Url &&
          urlRegex.test(this.targetData.Url) &&
          this.targetData.UserName &&
          this.targetData.Password &&
          this.targetData.UserType &&
          (!this.targetData.Proxy?.UseProxy ||
            (this.targetData.Proxy.HostName &&
              urlRegex.test(this.targetData.Proxy.HostName) &&
              this.targetData.Proxy.UserName &&
              this.targetData.Proxy.Password))
        );
      },
    },
    mounted() {
      this.TargetVal = this.initialTargetData as TargetStructure;
      if (this.initialTargetData) {
        this.targetData = { ...(this.initialTargetData.ProductStore ?? this.getDefaultTargetData()) };
      }
    },
    methods: {
      async onSave() {
        if (this.SelectedTabes === TargetTabs.DATA_STORE) {
          this.initialTargetData!.DataStore = this.targetData;
        } else {
          this.initialTargetData!.ProductStore = this.targetData;
        }
        this.$emit('save', this.initialTargetData);
      },
      onSelectTab(tab: string) {
        this.SelectedTabes = tab as TargetTabs;
        if (this.SelectedTabes === TargetTabs.DATA_STORE) {
          this.initialTargetData!.ProductStore = this.targetData;
        } else {
          this.initialTargetData!.DataStore = this.targetData;
        }
        this.targetData = this.getDefaultTargetData();
        this.targetData =
          tab === TargetTabs.DATA_STORE
            ? (this.initialTargetData?.DataStore ?? this.getDefaultTargetData())
            : (this.initialTargetData?.ProductStore ?? this.getDefaultTargetData());
      },
      getDefaultTargetData(): TargetConfig {
        return SynchronizerSaveData.Target.ProductStore as TargetConfig;
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
    gap: 20px;
  }

  .ui-proxy-layout-50 {
    display: grid;
    grid-template-columns: 20% auto;
    gap: 20px;
  }

  .field svg {
    color: var(--icon-secondary);
  }

  .field .error-color {
    color: var(--error-color);
  }
  .create-job-right-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    background-color: var(--bg-app);
    padding: 15px 1rem;
    gap: 10px;
  }

  .create-job-right-header {
    display: flex;
    height: 35px;
    margin-bottom: 5px;
    height: 30px;
  }

  .create-job-right-header-box {
    display: flex;
    gap: 5px;
    border: 1px solid var(--border-tertiary);
    background-color: var(--bg-septenary);
    border-radius: 5px;
  }

  .tab-item {
    padding: 8px 0;
    position: relative;
    cursor: pointer;
    text-align: center;
  }
  .tab-box {
    padding: 8px 0;
    width: 100%;
    align-items: center;
    gap: 50px;
    padding-left: 30px;
  }
</style>
