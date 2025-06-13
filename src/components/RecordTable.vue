<template>
  <div class="table-header-label p10 d-flex justify-content-space-between align-items-center fontSemibold fontSize-14">
    <span>Records</span>
    <div class="header-right d-flex gap10">
      <div class="toggle-container d-flex gap10 align-items-center fontNormal fontSize-12">
        <span>{{ isEnabled ? 'Enabled' : 'Disabled' }}</span>
        <ToggleSwitch v-model="isEnabled" class="toggle-width" @change="$emit('enableDisableJob', isEnabled)" />
      </div>
      <div class="search-input-container p-relative">
        <SearchInput v-model="searchName" placeholder="Search" />
      </div>
      <SvgIcon name="plus-icon" class="svg-icon size32 border icon-background secondary" @click.stop="createRecordsPopup = true" />
    </div>
  </div>
  <div class="grid-wrapper d-flex flex-col fontNormal fontSize-12 first-table">
    <div class="grid-header d-grid gap10 fontSemibold">
      <span>Enabled</span>
      <span>Id</span>
      <span>Name</span>
      <span>Time log Uid</span>
      <span>Depth log Uid</span>
      <span>Target Name</span>
      <span>Description</span>
      <span>Time</span>
      <span>Depth</span>
      <span>Increasing</span>
    </div>
    <div class="grid-body d-flex flex-col">
      <div
        v-for="item in filterdData"
        :key="item.RecordId"
        class="grid-row gap10 d-grid align-items-center"
        :class="{ highlighted: highlightedRow.RecordId === item?.RecordId }"
        @click.stop="getHighightedRow(item)">
        <div class="d-flex justify-content-center"><input v-model="item.Enabled" type="checkbox" /></div>
        <span class="text-ellipsis">{{ item.RecordId }}</span>
        <span class="capitalize-text">{{ item.Name }}</span>
        <span :title="item.TimeLogUid" class="text-ellipsis">{{ item.TimeLogUid }}</span>
        <span :title="item.DepthLogUid" class="text-ellipsis">{{ item.DepthLogUid }}</span>
        <span class="text-ellipsis">{{ item.TargetName }}</span>
        <span :title="item.Description" class="text-ellipsis">{{ item.Description }}</span>
        <div class="d-flex justify-content-center"><input v-model="item.TimeBased" type="checkbox" @click.stop="emitRecordChanges(item)" /></div>
        <div class="d-flex justify-content-center"><input v-model="item.DepthBased" type="checkbox" @click.stop="emitRecordChanges(item)" /></div>
        <div class="d-flex justify-content-center">
          <input v-model="item.DepthIncreasing" type="checkbox" @click.stop="emitRecordChanges(item)" />
        </div>
      </div>
      <div v-if="filterdData.length <= 0" class="no-data fontSize-14 noData">No Data Available</div>
    </div>
    <CreateRecords
      v-if="createRecordsPopup"
      :jobTypeList="jobTypes"
      :recordsDetails="records"
      @cancel="createRecordsPopup = false"
      @save="updateRecord" />
  </div>
</template>

<script lang="ts">
  import { IRecord } from '../../server/interfaces/datacollection.interfaces';
  import CreateRecords from '..//components/CreateRecords.vue';
  import { PropType } from 'vue';

  export default {
    name: 'RecordTable',
    components: {
      CreateRecords,
    },
    props: {
      allRecords: {
        type: Array as PropType<IRecord[]>,
        required: true,
        default: () => [],
      },
      isEnabledProp: {
        type: Boolean,
        required: true,
      },
      jobTypeListProp: {
        type: Array as PropType<string[]>,
        require: true,
      },
    },
    emits: ['sendHighightedRow', 'recordTosave', 'recordChanges', 'enableDisableJob'],
    data() {
      return {
        records: [] as IRecord[],
        createRecordsPopup: false as boolean,
        searchName: '' as string,
        isEnabled: true as boolean,
        highlightedRow: {
          RecordId: -1,
        } as IRecord,
        jobTypes: [] as string[],
      };
    },
    computed: {
      filterdData() {
        return this.records
          ?.filter((data) => data?.Name?.toLowerCase().includes(this.searchName?.toLowerCase()))
          .sort((a, b) => a.RecordId - b.RecordId);
      },
    },
    watch: {
      allRecords: {
        handler(newVal) {
          this.isEnabled = this.isEnabledProp;
          this.records = newVal ? JSON.parse(JSON.stringify(newVal)) : [];
          this.highlightedRow = this.records[0];
        },
        immediate: true,
      },
      jobTypeListProp: {
        handler(newVal) {
          this.jobTypes = newVal;
        },
      },
    },
    methods: {
      emitRecordChanges(item: IRecord) {
        this.highlightedRow = item;
        this.$emit('recordChanges', item);
      },
      async updateRecord(record: IRecord) {
        this.createRecordsPopup = false;
        this.highlightedRow = record;
        this.records.push(record);
        this.$emit('recordTosave', record);
      },
      getHighightedRow(record: IRecord) {
        this.highlightedRow = record;
        this.$emit('sendHighightedRow', this.highlightedRow);
      },
    },
  };
</script>

<style scoped>
  .grid-wrapper {
    overflow-y: hidden;
    border: 1px solid var(--bg-quaternary);
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  .grid-row {
    grid-template-columns: 60px 50px repeat(5, 1fr) 50px 50px 60px;
    padding: 5px 12px 5px 7px;
    background-color: var(--bg-quinary);
    border-bottom: 1px solid var(--border-tertiary);
    color: var(--text-quinary);
  }
  .grid-header {
    grid-template-columns: 50px 50px repeat(5, 1fr) 50px 50px 60px;
    border-bottom: 1px solid var(--border-tertiary);
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 10px 10px 10px 15px;
  }
  .first-table {
    flex: 3;
  }
  .grid-body {
    overflow-y: overlay;
  }
  .capitalize-text {
    text-transform: capitalize;
  }
  .highlighted {
    background-color: var(--bg-secondary);
  }
  .incheck {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  .no-data {
    text-align: center;
    color: var(--status-inactive-color);
    padding: 20px 0;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 55px;
    height: 22px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-disable);
    border-radius: 34px;
    transition: 0.3s;
    border: 1px solid var(--border-primary);
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 15px;
    width: 15px;
    left: 4px;
    bottom: 3px;
    background-color: var(--white);
    border-radius: 50%;
    transition: 0.3s;
  }

  input:checked + .slider {
    background-color: var(--bg-senary);
  }

  input:checked + .slider:before {
    transform: translateX(32px);
    background-color: var(--bg-primary);
  }
  .noData {
    text-align: center;
    color: var(--text-quinary);
    padding: 10px;
  }

  .toggle-width {
    width: 50px;
    height: 20px;
  }
</style>
