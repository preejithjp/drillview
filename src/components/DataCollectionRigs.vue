<template>
  <div class="collectionHeader d-flex">
    <SvgIcon name="resource-icon" class="svg-icon size32 flex-shrink-0" />
    <span class="fontSize-14 fontSemibold">Configuration</span>
    <SvgIcon name="plus-icon" class="svg-icon size32 border icon-bg flex-shrink-0 secondary" @click="addNewRigPopup = true" />
    <div class="height-100">
      <DropDown v-model="selectedOption" :options="filterOptions" :placeholder="FilterAll.All" class="filter-dropdown" />
    </div>

    <div class="search-input-container">
      <SearchInput v-model="searchTerm" placeholder="Search" />
    </div>
  </div>
  <DataCollectionRigDetails :allRigs="filteredData" @re-fetch-rig="fetchRig" />
  <AddnewRig v-if="addNewRigPopup" @cancel="addNewRigPopup = false" @save="fetchRig" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { IDropdownOptions } from './Globals/DropDown.vue';
  import DataCollectionRigDetails from '../components/DataCollectionRigdetails.vue';
  import AddnewRig from '../components/AddnewRig.vue';
  import { IRig } from '../../server/interfaces/datacollection.interfaces';
  import { Status, SyncUnsyncStatus } from '../components/DataCollectionRigdetails.vue';
  import { Api } from '@/services/api.services';

  export enum FilterAll {
    All = 'All',
  }

  export default defineComponent({
    name: 'DataCollectionRigs',
    components: { DataCollectionRigDetails, AddnewRig },
    data() {
      return {
        FilterAll: FilterAll,
        SyncUnsyncStatus: SyncUnsyncStatus,
        Status: Status,
        filterOptions: this.generateFilterOptions(),
        selectedOption: null as IDropdownOptions | null,
        addNewRigPopup: false as boolean,
        searchTerm: '' as string,
        rigs: [] as IRig[],
      };
    },
    computed: {
      filteredData() {
        return this.rigs.filter((rig) => this.filterAndSearchRigs(rig));
      },
    },
    created() {
      this.fetchRig();
    },
    methods: {
      generateFilterOptions(): IDropdownOptions[] {
        return [...Object.values(FilterAll), ...Object.values(Status), ...Object.values(SyncUnsyncStatus)].map((value) => ({
          label: value,
          value: value,
        }));
      },
      filterAndSearchRigs(rig: IRig) {
        const filterData =
          (rig?.Name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            rig?.Well?.Operator?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            rig?.Target?.Host?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            rig?.Well?.ServiceCompany?.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
          (!this.selectedOption ||
            this.selectedOption.label === FilterAll.All ||
            (rig.Status ? this.Status.Active : this.Status.Inactive) === this.selectedOption.label ||
            (rig.SyncStatus ? this.SyncUnsyncStatus.Sync : this.SyncUnsyncStatus.Unsync) === this.selectedOption.label);
        return filterData;
      },
      async fetchRig() {
        const result = await Api.fetch('dataCollection');
        this.rigs = result;
      },
    },
  });
</script>

<style scoped>
  .dataCollection-view {
    padding: 0 0px 15px;
    overflow: hidden;
  }
  .collectionHeader {
    padding: 10px 25px 10px 18px;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
  }
  .search-input-container {
    position: relative;
  }
  .collectionHeader span {
    color: var(--text-tertiary);
    flex: 1;
  }
  .collectionHeader svg {
    box-shadow: unset;
  }
  .icon-bg {
    background-color: var(--bg-septenary);
    border: 1px solid var(--border-tertiary);
  }
  .filter-dropdown {
    width: 250px !important;
    height: 100%;
    border-radius: 4px;
  }
</style>
