<template>
  <div class="container d-flex flex-col height-100 width-100">
    <div class="details-tabs d-flex justify-content-between">
      <div class="tab-container align-items-center d-flex width-50">
        <span
          v-for="(tab, index) in jobTab"
          :key="index"
          class="tab-item fontSemibold fontSize-13"
          :class="{ 'active fontSemibold': index === activeTabIndex }"
          @click="setActiveTab(index)">
          {{ tab }}
        </span>
        <SvgIcon name="plus-icon" class="svg-icon size32 border icon-background secondary" @click="addnewTabPopup = true" />
      </div>
      <CustomButton class="d-flex align-items-center" :disabled="isDisabledSave" @click="updateRigDetails">Save</CustomButton>
    </div>
    <GeneralRecords v-if="activeTab === ActiveTab.General && rigDetails.RigId" :generalData="rigDetails" @data-from-general="getGeneralData" />
    <CreateJobType v-if="addnewTabPopup" :jobTypeListProp="jobTab" @cancel="addnewTabPopup = false" @save="insertTab" />
    <RecordTable
      v-if="activeTab != ActiveTab.General"
      :isEnabledProp="isEnabled"
      :allRecords="allRecords"
      @enable-disable-job="setJobEnableDisable"
      @record-changes="getRecordChanges"
      @record-tosave="updateRecordTable"
      @send-highighted-row="getHighLightedItem" />
    <RecordItemTable
      v-if="activeTab != ActiveTab.General"
      :activeTabProps="activeTab"
      :recordName="recordName"
      :recordIdProps="recordId"
      :itemsToDisplay="recordItems"
      @record-item-to-save="isDisabledSave = false"
      @item-changes="getItemChange" />
  </div>
</template>

<script lang="ts">
  import RecordTable from '../components/RecordTable.vue';
  import RecordItemTable from '../components/RecordItemTable.vue';
  import { Api } from '../services/api.services';
  import GeneralRecords from '../components/GeneralRecords.vue';
  import { IJobType, IRecord, IRecordItem, IRig } from '../../server/interfaces/datacollection.interfaces';
  import CreateJobType from '../components/CreateJobType.vue';

  export enum ActiveTab {
    General = 'General',
  }
  export default {
    name: 'DataCollectionDetails',
    components: {
      RecordTable,
      RecordItemTable,
      GeneralRecords,
      CreateJobType,
    },
    data() {
      return {
        ActiveTab: ActiveTab,
        jobTab: ['General'] as string[],
        activeTabIndex: 0 as number,
        recordId: 1 as number,
        recordName: '' as string,
        rigDetails: {} as IRig,
        addnewTabPopup: false as boolean,
        recordItems: [] as IRecordItem[],
        generalDataToUpdate: {} as Partial<IRig>,
        isDisabledSave: true,
        allRecords: [] as IRecord[],
        isEnabled: true as boolean,
        readyToUpdateRecord: false as boolean,
      };
    },
    computed: {
      activeTab(): string {
        return this.jobTab[this.activeTabIndex];
      },
    },
    async created() {
      if (this.$route.params.jobtype) {
        await this.fetchRecords();
        this.activeTabIndex = this.jobTab.findIndex((tab) => tab === this.$route.params.jobtype);
      } else {
        await this.fetchRecords();
      }
      this.setRecordsToDisplay();
    },
    methods: {
      setJobEnableDisable(value: boolean) {
        this.isDisabledSave = false;
        this.readyToUpdateRecord = true;
        this.rigDetails.JobTypes.forEach((jt: IJobType) => {
          if (jt.Name === this.activeTab) {
            jt.Enabled = value;
          }
        });
      },
      getRecordChanges(items: IRecord) {
        this.isDisabledSave = false;
        this.readyToUpdateRecord = true;
        this.updateRecordTable(items);
      },
      getItemChange(items: IRecordItem) {
        this.readyToUpdateRecord = true;
        this.rigDetails.JobTypes.forEach((jt: IJobType, index: number) => {
          if (jt.Name === this.activeTab) {
            jt.Records.forEach((record: IRecord, ind: number) => {
              if (record.RecordId === this.recordId) {
                const finIndex = record.Items?.findIndex((item: IRecordItem) => item.ItemId === items.ItemId);
                if (finIndex > -1) {
                  this.rigDetails.JobTypes[index].Records[ind].Items[finIndex] = items;
                } else {
                  if (!this.rigDetails.JobTypes[index].Records[ind].Items) {
                    this.rigDetails.JobTypes[index].Records[ind].Items = [];
                  }
                  this.rigDetails.JobTypes[index].Records[ind].Items?.push(items);
                }
              }
            });
          }
        });
        this.isDisabledSave = false;
      },
      async setActiveTab(index: number) {
        this.activeTabIndex = index;
        this.setRecordsToDisplay();
      },
      setRecordsToDisplay() {
        const job = this.rigDetails?.JobTypes?.find((jt) => jt.Name === this.activeTab);
        this.isEnabled = job?.Enabled !== undefined ? job.Enabled : true;
        if (job) {
          this.allRecords = job.Records;
          this.recordId = this.allRecords[0]?.RecordId;
          this.recordName = this.allRecords[0]?.Name;
          this.fetchRecordItems();
        }
      },
      getGeneralData(data: Partial<IRig>) {
        this.generalDataToUpdate = data;
        this.isDisabledSave = false;
      },
      async updateGeneralData() {
        const { RigId, ...fieldsToUpdate } = this.generalDataToUpdate;
        await Api.patch(`dataCollection/${RigId}`, fieldsToUpdate);
      },
      async getHighLightedItem(record: IRecord) {
        this.recordId = record.RecordId;
        this.recordName = record.Name;
        this.fetchRecordItems();
      },
      updateRecordTable(record: IRecord) {
        this.readyToUpdateRecord = true;
        this.rigDetails.JobTypes.forEach((jt: IJobType, index: number) => {
          if (jt.Name === this.activeTab) {
            const finIndex = jt.Records?.findIndex((item: IRecord) => item.RecordId === record.RecordId);
            if (finIndex > -1) {
              this.rigDetails.JobTypes[index].Records[finIndex] = record;
            } else {
              if (!this.rigDetails.JobTypes[index].Records) {
                this.rigDetails.JobTypes[index].Records = [];
              }
              this.rigDetails.JobTypes[index].Records.push(record);
            }
          }
        });
        this.recordId = record.RecordId;
        this.recordName = record.Name;
        this.fetchRecordItems();
        this.isDisabledSave = false;
      },
      async updateRigDetails() {
        if (this.generalDataToUpdate && Object.keys(this.generalDataToUpdate).length > 0) {
          this.updateGeneralData();
        }
        await this.updateRecords();
        this.isDisabledSave = true;
        this.generalDataToUpdate = {};
      },
      async updateRecords() {
        if (this.readyToUpdateRecord) {
          await Api.patch(`dataCollection/${this.$route.params.id}/records-items`, this.rigDetails.JobTypes);
        }
      },
      fetchRecordItems() {
        this.recordItems = this.rigDetails.JobTypes.filter((jt: IJobType) => jt.Name === this.activeTab).flatMap((jt: IJobType) =>
          (jt.Records ?? []).filter((record: IRecord) => record.RecordId === this.recordId).flatMap((record: IRecord) => record.Items ?? [])
        );
      },
      async fetchRecords() {
        const result = await Api.fetch(`dataCollection/${this.$route.params.id}`);
        if (result) {
          this.rigDetails = result;
          if (this.jobTab.length === 1) {
            this.jobTab = ['General', ...new Set(this.rigDetails.JobTypes.map((jt) => jt.Name))];
          }
        }
      },
      async insertTab(data: IJobType) {
        if (data.Records && data.Records.length > 0) {
          this.isDisabledSave = false;
        }
        this.readyToUpdateRecord = true;
        this.rigDetails.JobTypes.push(data);
        this.jobTab.push(data.Name);
        this.setActiveTab(this.jobTab.length - 1);
        this.addnewTabPopup = false;
      },
    },
  };
</script>

<style scoped>
  .container {
    padding: 10px 20px;
    background: var(--bg-quaternary);
  }
  .details-tabs {
    justify-content: flex-start;
    gap: 20px;
    padding: 10px 10px 0 0;
  }
  .tab-item {
    color: var(--text-static-tertiary);
    position: relative;
    cursor: pointer;
    text-align: center;
  }
  .active {
    color: var(--text-tertiary);
  }
  .tab-container {
    flex: 1;
    background-color: var(--bg-septenary);
    border-radius: 5px;
    gap: 60px;
    border: 1px solid var(--border-tertiary);
    padding: 5px 10px;
  }
  .icon-background {
    box-shadow: unset;
  }
  .icon-background:hover {
    box-shadow: 0 0 1px 1px var(--border-tertiary);
  }
</style>
