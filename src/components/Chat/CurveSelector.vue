<template>
  <CommonPopup
    headerIcon="wellbore-icon"
    popup-title="Curve Selector"
    primary-btn-text="Select"
    :wrapper-style="{ width: '50%', height: '100%' }"
    @on-cancel="closePopup"
    @on-submit="onSelectClick">
    <div class="curveselector-wrapper">
      <div class="curveselector-header d-flex gap10 align-items-center justify-content-space-between">
        <span class="fontSemibold fontSize-12">{{ wellbore?.parent.name }} / {{ wellbore?.name }}</span>
      </div>
      <div class="curveselector-body scroll-auto scroll primary">
        <ul class="d-flex flex-col flex-full gap5 scroll-y-auto fontSize-12">
          <li v-for="log in logList" :key="log.uniqueIdentifier">
            <div class="log-name" @click="toggleLog(log)">
              <span class="arrow" :class="{ open: isLogExpanded(log) }"></span>
              {{ log.name }}
            </div>
            <ul v-show="isLogExpanded(log)" class="collapsible">
              <li
                v-for="mnemonic in mnemonicsList"
                :key="mnemonic.name"
                class="property-name selectable-item"
                :class="{ selected: isSelectedProperty(log, mnemonic) }"
                @click="selectProperty(log, mnemonic)">
                <div class="">
                  {{ mnemonic.name }}
                </div>
              </li>
            </ul>
          </li>
          <li v-if="!logList.length" class="no-data">No Logs or Curves found</li>
        </ul>
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { Api } from '@/services/api.services';
  import { StoreDataHeader } from '../../../server/interfaces/store.connector.interfaces';
  import CommonPopup from '@/components/Common/CommonPopup.vue';
  import { IMemberGroupChannel } from '../../../server/interfaces/chatmembers.interfaces';

  export interface SelectedProperty {
    parentId: string;
    parentName: string;
    logName: string;
    propertyName: string;
  }

  export default {
    name: 'CurveSelector',
    components: {
      CommonPopup,
    },
    props: {
      wellbore: {
        type: Object as () => StoreDataHeader,
      },
    },
    emits: ['onCancel', 'onSubmit'],
    data() {
      return {
        isOpen: false,
        isParentExpanded: false,
        searchInput: '',
        selectedCurve: {} as IMemberGroupChannel & { checked: true },
        mnemonicsList: [] as StoreDataHeader[],
        logList: [] as StoreDataHeader[],
        channelsetList: [] as StoreDataHeader[],
        wellboreList: [] as StoreDataHeader[],
        expandedWellbores: new Set<string>(),
        expandedChannelsets: new Set<string>(),
        expandedLogs: new Set<string>(),
      };
    },
    computed: {
      filteredWellbores() {
        if (this.searchInput === '') {
          return this.wellboreList;
        } else {
          return this.wellboreList.filter((wellbore) => wellbore.name.toLowerCase().includes(this.searchInput.toLowerCase()));
        }
      },
    },
    mounted() {
      this.fetchLogList(this.wellbore as StoreDataHeader);
    },
    methods: {
      async fetchWellbores() {
        const response = await Api.fetch('wellbores');
        if (response && response.length) {
          this.wellboreList = response;
        } else {
          this.wellboreList = [];
        }
      },
      async fetchLogList(wellbore: StoreDataHeader) {
        const response = await Api.fetch(`wellbores/${encodeURIComponent(wellbore.uri)}/logs`);
        if (response && response.length) {
          this.logList = response;
        } else {
          this.logList = [];
        }
      },
      async fetchChannelsetList(log: StoreDataHeader) {
        const response = await Api.fetch(`wellbores/${encodeURIComponent(log.uri)}/logs`);
        if (response && response.length) {
          this.channelsetList = response;
        } else {
          this.channelsetList = [];
        }
      },
      async getMnemonicList(logs: StoreDataHeader) {
        const response = await Api.fetch(`wellbores/${encodeURIComponent(logs.uri)}/mnemonics`);
        if (response && response.length) {
          this.mnemonicsList = response;
        } else {
          this.mnemonicsList = [];
        }
      },
      toggleLog(log?: StoreDataHeader) {
        this.selectedCurve = {} as IMemberGroupChannel & { checked: true };
        if (log) {
          if (this.expandedLogs.has(log.uniqueIdentifier)) {
            this.expandedLogs.delete(log.uniqueIdentifier);
          } else {
            this.expandedLogs.clear();
            this.expandedLogs.add(log.uniqueIdentifier);
          }
          this.getMnemonicList(log);
        } else {
          this.expandedLogs.clear();
        }
      },
      isLogExpanded(log: StoreDataHeader): boolean {
        return this.expandedLogs.has(log?.uniqueIdentifier);
      },
      selectProperty(log: StoreDataHeader, curve: StoreDataHeader) {
        this.selectedCurve = {
          ChannelId: curve?.id,
          ChannelName: curve.name,
          LogName: log.name,
          checked: true,
        };
      },
      isSelectedProperty(log: StoreDataHeader, curve: StoreDataHeader): boolean {
        return this.selectedCurve.LogName === log.name && this.selectedCurve.ChannelName === curve.name;
      },
      closePopup() {
        this.$emit('onCancel');
      },
      onSelectClick() {
        this.$emit('onSubmit', this.selectedCurve);
      },
    },
  };
</script>

<style scoped>
  .curveselector-header {
    padding: 10px;
  }

  .curveselector-body {
    padding: 10px;
  }

  .curveselector-wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow-y: auto;
  }

  .log-name {
    padding: 10px 20px;
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    cursor: pointer;
    border-bottom: 1px solid var(--border-tertiary);
  }

  .property-name {
    padding: 10px 50px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--border-tertiary);
    background-color: var(--bg-quinary);
  }

  ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
  }

  .arrow {
    margin-left: 5px;
    margin-right: 5px;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 6px solid;
    display: inline-block;
    transition: transform 0.2s ease;
  }

  .arrow.open {
    transform: rotate(90deg);
  }
</style>
