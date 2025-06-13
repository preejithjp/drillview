<template>
  <div class="table-header mb10">
    <div class="customize-header">
      <span class="align-header-center">
        <span class="fontSemibold fontSize-12">Synchronize All Logs (including current and New Logs)</span>
        <input
          v-model="transferLog"
          type="checkbox"
          @change="
            $emit('update:transferTimebaseLog', transferLog);
            $emit('update:tranferDepthLog', transferLog);
          " />
      </span>
    </div>
    <div class="create-right-table-actions">
      <SvgIcon name="import-icon" class="svg-icon size32" @click="openImportLog = true" />
      <div class="search-input-container">
        <SearchInput v-model="filterInput" placeholder="Search" />
      </div>
    </div>
  </div>

  <div class="flex-full overflow-hidden panel-wrapper">
    <div class="right-panel-container width-100">
      <div class="panel-sidebar">
        <div class="create-job-panel-container">
          <div class="create-job-panel-header-wrapper fontSemibold fontSize-12">Source Log Name</div>
          <div class="create-job-body-panel-wrapper d-flex justify-content-center flex-full">
            <div v-if="filteredLogList.length" class="log-list fontSize-10">
              <div
                v-for="log in filteredLogList"
                :key="log.ObjectUid"
                class="log-item"
                :class="{ active: selectedLog?.ObjectUid === log?.ObjectUid }"
                @click="selectLog(log)">
                <SvgIcon :name="'StartIndex' in log ? 'time-log-icon' : 'depth-log-icon'" class="svg-icon size24" />
                <span>{{ log.ObjectName }}</span>
              </div>
            </div>

            <div v-else class="log-list fontSize-10">
              <div class="log-item justify-content-center">
                <span>No Log Available</span>
              </div>
            </div>
          </div>

          <div class="create-job-footer-wrapper">
            <CustomButton @click="openLogPopup()">Add New Log</CustomButton>
          </div>
        </div>
      </div>

      <div class="d-flex flex-col flex-full">
        <div class="popup-fields d-flex width-100 fontSize-12">
          <div class="field d-flex align-items-center">
            <label for="operator-name" class="field-label fontBold">Target Uid</label>
            <input id="operator-name" v-model="targetList.UUID" disabled type="text" class="field-input fontNormal" placeholder="Enter the Uid" />
            <div class="d-flex align-items-center gap5">
              <SvgIcon
                name="reload-singe-icon"
                class="svg-icon size24"
                @click="
                  targetList.useSameAsSource = false;
                  targetList.UUID = generateUUID();
                " />
              <input
                v-model="targetList.useSameAsSource"
                type="checkbox"
                @change="targetList.UUID = targetList.useSameAsSource ? selectedLog.ObjectUid : generateUUID()" />
              <label class="field-label fontSize-10">Use Same as Source</label>
            </div>
          </div>
          <div class="field d-flex align-items-center">
            <label for="operator-name" class="field-label fontBold">Target Name</label>
            <input id="operator-name" v-model="targetList.Name" type="text" class="field-input fontNormal" placeholder="Enter the Name" />
            <div class="d-flex align-items-center gap5 fontSize-10">
              <label>Template</label>
              <u>Surface Time Template</u>
              <CustomButton class="change-button fontSize-10">Change...</CustomButton>
            </div>
          </div>
        </div>
        <div class="table-container fontSize-12 width-100 height-100">
          <table class="common-table">
            <thead>
              <tr class="">
                <th>Source Curve Name</th>
                <th>Target Curve Name</th>
                <th>Data Type</th>
                <th>Unit Type</th>
                <th>Source Unit</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(mnemonic, index) in selectedLog?.CurveMaps" :key="mnemonic.TargetUid">
                <td>
                  <input v-model="mnemonic.SourceCurveName" type="text" class="field-input fontNormal table-input" placeholder="Enter" />
                </td>
                <td>
                  <input v-model="mnemonic.TargetCurveName" type="text" class="field-input fontNormal table-input" placeholder="Enter" />
                </td>
                <td class="dropdownmodel">
                  <DropDown v-model="mnemonic.DataType" :options="dataTypeOptions" />
                </td>
                <td class="dropdownmodel">
                  <DropDown v-model="mnemonic.UnitType" :options="unitTypeOptions" />
                </td>
                <td class="dropdownmodel">
                  <DropDown v-model="mnemonic.SourceUnit" :options="sourceUnitOptions" />
                </td>
                <td>
                  <input
                    v-model="mnemonic.Description"
                    type="text"
                    class="field-input fontNormal table-input"
                    placeholder="Enter the Description"
                    @keydown.tab.prevent="addNewRow(index)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <CreateObjects v-if="isCreateNewObject" :selectType="tab.Log" @close-popup="closePopup" @on-submit="newLog"></CreateObjects>
    <ImportObjects
      v-if="openImportLog"
      :source="source"
      :type="tab.Log"
      @selected-objects="importedLog"
      @close-popup="openImportLog = false"></ImportObjects>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import CreateObjects from './CreateObjects.vue';
  import ImportObjects from './ImportObjects.vue';
  import { DepthLog, TimebaseLog } from 'server/interfaces/synchronizer.interfaces';
  import { v4 as uuidv4 } from 'uuid';
  import { ILogs, LogEntry, IndexTypes } from './../../../server/interfaces/datasimplex.interfaces';
  import { TargetList, CreateObject, Tabs } from '@/interfaces/synchronizer.interface';
  import { Api } from '@/services/api.services';
  import { IUnitTypes } from 'server/interfaces/uniteditor.interface';
  import { store } from '@/main';
  import { ToastType } from '../ToastMessage.vue';
  import { BtnSizes } from '../Globals/CustomButton.vue';

  export default defineComponent({
    name: 'LogTab',
    components: {
      CreateObjects,
      ImportObjects,
    },
    props: {
      source: {
        type: String,
        required: true,
        default: '',
      },
      logdata: {
        type: Array as () => DepthLog[] | TimebaseLog[],
        required: false,
        default: () => [],
      },
      tranferDepthLog: {
        type: Boolean,
        required: true,
      },
      transferTimebaseLog: {
        type: Boolean,
        required: true,
      },
    },
    emits: ['update:logdata', 'update:transferTimebaseLog', 'update:tranferDepthLog'],
    data() {
      return {
        BtnSizes,
        logList: [] as ILogs[],
        selectedLog: {} as DepthLog | TimebaseLog,
        mnemicList: [] as LogEntry[],
        targetList: {
          UUID: '',
          Name: '',
          useSameAsSource: false,
        } as TargetList,
        isCreateNewObject: false as boolean,
        JoblogDetails: [...this.logdata] as DepthLog[] | TimebaseLog[],
        dataTypeOptions: ['double', 'float', 'string', 'int', 'boolean', 'dateTime', 'date', 'time', 'decimal', 'short', 'long'] as string[],
        unitTypeOptions: [] as string[],
        sourceUnitOptions: ['ft', 'klbf'] as string[],
        openImportLog: false as boolean,
        filterInput: '' as string,
        transferLog: (this.tranferDepthLog || this.transferTimebaseLog || false) as boolean,
        unitList: [] as IUnitTypes[],
        tab: Tabs,
      };
    },
    computed: {
      filteredLogList(): DepthLog[] | TimebaseLog[] {
        return this.JoblogDetails.filter((log) => log.ObjectName.toLowerCase().includes(this.filterInput.toLowerCase()));
      },
    },
    watch: {
      JoblogDetails: {
        handler(newVal) {
          this.$emit('update:logdata', newVal);
        },
        deep: true,
      },
      selectedLog: {
        handler() {
          this.updateLogValues();
        },
        deep: true,
      },
      targetList: {
        handler() {
          this.selectedLog.TargetUID = this.targetList.UUID;
          this.selectedLog.TargetName = this.targetList.Name;
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.getUnits();
        this.JoblogDetails = this.logdata;
        if (this.JoblogDetails && this.JoblogDetails.length > 0) {
          this.selectLog(this.JoblogDetails[0]);
        }
      });
    },
    methods: {
      closePopup() {
        this.isCreateNewObject = false;
      },
      async getUnits() {
        const res: IUnitTypes[] = await Api.fetch(`unittypes`);
        if (res && res.length) {
          this.unitTypeOptions = res.map((unit: IUnitTypes) => unit.UnitType);
        }
      },
      selectLog(log: TimebaseLog | DepthLog) {
        this.selectedLog = log;
        this.targetList.UUID = log.TargetUID;
        this.targetList.Name = log.TargetName;
      },
      updateLogValues() {
        if (!this.selectedLog || !this.selectedLog.ObjectUid) return;
        this.JoblogDetails = this.JoblogDetails.map((log) => (log.ObjectUid === this.selectedLog.ObjectUid ? { ...log, ...this.selectedLog } : log));
      },
      newLog(item: CreateObject) {
        this.isCreateNewObject = false;
        const duplicateItem = this.JoblogDetails.filter((log) => log.ObjectName == item.Name);
        if (duplicateItem.length) {
          store.showToast(ToastType.WARN, `Duplicate log name: ${item.Name}`);
          return;
        }
        const newLog: DepthLog | TimebaseLog = {
          ObjectName: item.Name,
          ObjectUid: item.UUID,
          TargetName: item.Name,
          TargetUID: item.UUID,
          TemplateReferenceID: item.UUID,
          TemplateReferenceName: item.Name,
          CurveMaps: [
            {
              SourceCurveName: '',
              SourceUnit: '',
              TargetCurveName: '',
              TargetAlias: '',
              TargetUid: this.generateUUID(),
              TargetUnit: '',
              UnitType: '',
              DataType: '',
              Description: '',
            },
          ],
        };
        if (item.IndexType === IndexTypes.Depth) {
          (newLog as DepthLog).StartIndexInft = 20;
        } else {
          (newLog as TimebaseLog).StartIndex = 20;
        }
        this.JoblogDetails.push(newLog);
      },
      openLogPopup() {
        this.isCreateNewObject = true;
      },
      addNewRow(index: number) {
        if (this.selectedLog && this.selectedLog.CurveMaps) {
          this.selectedLog.CurveMaps.splice(index + 1, 0, {
            SourceCurveName: '',
            SourceUnit: '',
            TargetCurveName: '',
            TargetAlias: '',
            TargetUid: this.generateUUID(),
            TargetUnit: '',
            UnitType: '',
            DataType: '',
            Description: '',
          });
        }
      },
      async importedLog(item: ILogs[]) {
        if (!item) return;

        const existingNames = new Set(this.JoblogDetails.map((log) => log.ObjectName));
        const duplicateNames: string[] = [];

        item.forEach((log: ILogs) => {
          if (existingNames.has(log.ObjectName)) {
            duplicateNames.push(log.ObjectName);
            return;
          }

          const isDepthLog = log.LogIndexType === IndexTypes.Depth;
          const jobLogEntry: DepthLog | TimebaseLog = {
            ObjectName: log.ObjectName,
            ObjectUid: log.ObjectUid,
            TargetName: log.ObjectName,
            TargetUID: log.ObjectUid,
            TemplateReferenceID: log.ObjectUid,
            TemplateReferenceName: log.ObjectName,
            CurveMaps: [
              {
                SourceCurveName: '',
                SourceUnit: '',
                TargetCurveName: '',
                TargetAlias: '',
                TargetUid: this.generateUUID(),
                TargetUnit: '',
                UnitType: '',
                DataType: '',
                Description: '',
              },
            ],
          };

          if (isDepthLog) {
            (jobLogEntry as DepthLog).StartIndexInft = 20;
          } else {
            (jobLogEntry as TimebaseLog).StartIndex = 20;
          }

          this.JoblogDetails.push(jobLogEntry);
          existingNames.add(log.ObjectName);
        });

        if (duplicateNames.length > 0) {
          store.showToast(ToastType.WARN, `Skipped duplicates: ${duplicateNames.join(', ')}`);
        }
      },
      generateUUID() {
        return uuidv4();
      },
    },
  });
</script>
<style scoped>
  .table-header {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 36px;
  }

  .table-header svg {
    color: var(--icon-secondary);
  }

  .table-actions {
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;
  }

  .icon {
    margin-right: 5px;
    vertical-align: middle;
    color: var(--text-tertiary);
  }

  .search-input-container {
    position: relative;
    width: 80%;
    height: 36px;
  }
  .icon-wrapper {
    display: flex;
    gap: 15px;
    align-items: center;
    justify-content: end;
  }

  .create-right-table-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;
  }

  .align-header-center {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .panel-sidebar {
    width: 20%;
    min-width: 200px;
    border-right: 1px solid var(--border-tertiary);
  }

  .right-panel-container {
    display: flex;
    flex: 1;
    height: 100%;
    background-color: var(--bg-app);
    gap: 10px;
  }

  .create-job-panel-container {
    background-color: var(--bg-septenary);
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
  }

  .create-job-panel-header-wrapper {
    display: flex;
    align-items: center;
    padding: 0 25px;
    height: 50px;
  }

  .create-job-footer-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .create-job-body-panel-wrapper {
    background: var(--bg-app);
    overflow-y: auto;
  }

  .log-list {
    flex-grow: 1;
    overflow-y: auto;
    background-color: var(--bg-septenary);
  }

  .log-item {
    display: flex;
    align-items: center;
    padding: 8px;
    cursor: pointer;
  }

  .log-item:hover {
    background: var(--hover-secondary);
  }

  .log-item.active {
    background: var(--hover-secondary);
  }

  .log-item svg {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .panel-wrapper {
    border: 2px solid var(--border-tertiary);
    border-radius: 5px;
    height: calc(100% - 46px);
  }

  .btn-width {
    width: auto;
  }

  .popup-fields {
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.5rem 1rem;
  }

  .field {
    gap: 0.5rem;
  }

  .field-label {
    flex: 0 0 95px;
    text-align: left;
  }

  .field-input {
    flex: 1;
    padding: 0.6rem;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--border-tertiary);
    background-color: var(--bg-septenary);
  }

  .table-container {
    overflow-y: auto;
    border-radius: 6px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 12px;
    text-align: left;
  }

  select {
    border: none;
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
  }

  .change-button {
    width: auto;
    padding: 4px;
    cursor: pointer;
  }

  .all-check-text {
    text-align: center;
    margin-top: 10%;
  }

  .table-input {
    background: none;
    border: none;
    outline: none;
  }
  .dropdownmodel {
    height: 30px;
  }
</style>
