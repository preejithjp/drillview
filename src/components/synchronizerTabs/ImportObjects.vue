<template>
  <CommonPopup
    headerIcon="wellbore-icon"
    popup-title="Object Selection"
    secondary-btn-text="Cancel"
    primary-btn-text="Select"
    :wrapper-style="{ width: '60%', height: '80%' }"
    @on-cancel="closePopup"
    @on-submit="onSubmit">
    <LoadingIcon v-if="loading" class="loader" />

    <!-- Search Input -->
    <div v-if="!loading" class="synchronizer-header d-flex gap10 align-items-center justify-content-space-between mb10">
      <span class="fontSemibold fontSize-12">Select {{ type }}</span>
      <div class="d-flex">
        <SearchInput v-model="filterInput" placeholder="Search" />
      </div>
    </div>
    <div class="wellbore-list">
      <div v-for="wellbore in wellboresFiltered" :key="wellbore.WellboreUid" class="wellbore-item">
        <div class="wellbore-header" @click="toggleExpand(wellbore)">
          <span class="expand-icon">
            <SvgIcon
              :class="expandedWellbores[wellbore.WellboreUid] ? '' : 'rotate270'"
              :name="LoadingWithWellboresId[wellbore.WellboreUid] ? 'loading-icon' : 'downArrow-icon'"
              class="svg-icon size14" />
          </span>
          <span>{{ wellbore.WellName }}</span>
        </div>
        <div v-if="expandedWellbores[wellbore.WellboreUid] && wellbore.logDetails?.length" class="logs-list">
          <div v-for="log in wellbore.logDetails" :key="log.ObjectUid" class="log-item">
            <input
              type="checkbox"
              :checked="selectedLogs.some((selectedLog) => selectedLog.ObjectUid === log.ObjectUid)"
              @click="toggleLogSelection(log)" />
            <span>{{ log.ObjectName }} {{ log.ObjectType ? '| ' + log.ObjectType : '' }}</span>
          </div>
        </div>
        <div
          v-if="!LoadingWithWellboresId[wellbore.WellboreUid] && expandedWellbores[wellbore.WellboreUid] && !wellbore.logDetails?.length"
          class="logs-list">
          <div class="log-item">
            <span>No Data Available</span>
          </div>
        </div>
      </div>
    </div>
  </CommonPopup>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Api } from '@/services/api.services';
  import { IWellbores, ILogs } from 'server/interfaces/datasimplex.interfaces';
  import { OtherObjects, WellboreDetials, Tabs } from '@/interfaces/synchronizer.interface';
  import CommonPopup from '../Common/CommonPopup.vue';

  export interface WellboreLoading {
    [key: string]: boolean;
  }

  export default defineComponent({
    name: 'ImportObjects',
    components: {
      CommonPopup,
    },
    props: {
      source: {
        type: String,
        required: true,
        default: '',
      },
      type: {
        type: String,
        required: false,
        default: Tabs.Log,
      },
    },
    emits: ['closePopup', 'selectedObjects'],
    data() {
      return {
        wellboreList: [] as WellboreDetials[],
        selectedLogs: [] as ILogs[],
        expandedWellbores: {} as Record<string, boolean>,
        filterInput: '' as string,
        loading: false as boolean,
        LoadingWithWellboresId: {} as WellboreLoading,
      };
    },

    computed: {
      wellboresFiltered(): WellboreDetials[] {
        const searchInput = this.filterInput.trim().toLowerCase();
        return searchInput ? this.wellboreList.filter((well) => well.WellboreName.toLowerCase().includes(searchInput)) : this.wellboreList || [];
      },
    },
    mounted() {
      this.fetchWellbores();
    },
    methods: {
      async fetchWellbores() {
        this.loading = true;
        let response: IWellbores[] = [];
        if (this.source) {
          response = await Api.fetch('synchronizers/object/wellbores', [this.source] as string[]);
        }
        if (response && response.length) {
          const uniqueWellbores = new Map();
          response.forEach((wellbore) => {
            uniqueWellbores.set(wellbore.WellboreUid, wellbore);
            this.wellboreList = Array.from(uniqueWellbores.values()) || [];
          });
        }
        this.loading = false;
      },
      transformedData(wellboreData: IWellbores | null = null) {
        return {
          WellId: wellboreData?.WellUid || '',
          WellboreId: wellboreData?.WellboreUid || '',
          SourceId: this.source || '',
        };
      },
      toggleExpand(wellbore: WellboreDetials) {
        this.expandedWellbores[wellbore.WellboreUid] = !this.expandedWellbores[wellbore.WellboreUid];
        if (this.expandedWellbores[wellbore.WellboreUid]) {
          this.getLogDetails(wellbore);
        }
      },

      async getLogDetails(wellbore: WellboreDetials) {
        if (this.LoadingWithWellboresId[wellbore.WellboreUid]) {
          this.LoadingWithWellboresId[wellbore.WellboreUid] = false;
        }
        this.LoadingWithWellboresId[wellbore.WellboreUid] = true;
        if (this.type == Tabs.OtherObjects) {
          const objectTypes = ['Wbgeometry', 'BHARuns', 'FluidReports', 'Rigs'];
          const requests = objectTypes.map((type) => {
            const data = this.transformedData(wellbore);
            return Api.submit(`synchronizers/objects/${type.toLowerCase()}`, data);
          });
          const responses = await Promise.all(requests);
          responses.map((response) => {
            if (response && response.length) {
              if (!wellbore.logDetails) {
                wellbore.logDetails = [] as OtherObjects[];
              }
              wellbore.logDetails = response;
            }
          });
        } else {
          const objectTypes: string = this.type == Tabs.Trajectory ? 'Trajectories' : this.type.toLowerCase() + 's';
          const response = await Api.submit('synchronizers/objects/' + objectTypes, this.transformedData(wellbore));
          wellbore.logDetails = response || [];
        }
        this.LoadingWithWellboresId[wellbore.WellboreUid] = false;
      },

      toggleLogSelection(log: ILogs) {
        if (this.selectedLogs.find((ele) => ele.ObjectUid == log.ObjectUid)) {
          this.selectedLogs = this.selectedLogs.filter((ele) => ele.ObjectUid != log.ObjectUid);
        } else {
          this.selectedLogs.push(log);
        }
      },
      isSelected(log: ILogs) {
        this.selectedLogs.push(log);
        return log.ObjectUid;
      },
      onSubmit() {
        if (this.selectedLogs.length > 0) {
          this.$emit('selectedObjects', this.selectedLogs);
          this.$emit('closePopup');
        }
      },
      closePopup() {
        this.$emit('closePopup');
      },
    },
  });
</script>

<style scoped>
  /* Wellbore List Container */
  .wellbore-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
    overflow-y: auto;
  }

  /* Wellbore Item */
  .wellbore-item {
    background: var(--bg-quaternary);
  }

  /* Wellbore Header */
  .wellbore-header {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: bold;
    padding: 10px;
  }

  .expand-icon {
    margin-right: 10px;
  }

  /* Logs List */
  .logs-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
    padding-left: 20px;
    padding-top: 5px;
  }

  /* Log Item */
  .log-item {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .log-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  .blinking-text {
    text-align: center;
    color: var(--text-secondary);
    animation: blink 1s infinite;
  }
</style>
