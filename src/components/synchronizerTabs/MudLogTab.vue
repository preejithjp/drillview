<template>
  <div class="table-header mb10">
    <div class="customize-header">
      <span class="align-header-center">
        <span class="fontSemibold fontSize-12">Synchronize All Logs (including current and New MudLog)</span>
        <input v-model="tranferAllMudLogs" type="checkbox" @change="$emit('update:tranferMudlog', tranferAllMudLogs)" />
      </span>
    </div>
    <div class="create-right-table-actions">
      <SvgIcon name="import-icon" class="svg-icon size32" @click="openImport = true" />
      <div class="search-input-container">
        <SearchInput v-model="filterInput" placeholder="Search" />
      </div>
    </div>
  </div>

  <div class="flex-full overflow-hidden panel-wrapper">
    <div class="right-panel-container width-100">
      <div class="panel-sidebar">
        <div class="create-job-panel-container">
          <div class="create-job-panel-header-wrapper fontSemibold fontSize-12">
            <!-- <div class="flex-full p-relative fontSemibold fontSize-14"> -->
            Source Mud Log Name
            <!-- </div> -->
          </div>

          <div class="create-job-body-panel-wrapper d-flex justify-content-center flex-full">
            <div v-if="filterMudLogList.length > 0" class="log-list fontSize-10">
              <div
                v-for="mudLog in filterMudLogList"
                :key="mudLog.ObjectUid"
                class="log-item"
                :class="{ active: selectedMudLog?.ObjectUid === mudLog?.ObjectUid }"
                @click="selectMudLog(mudLog)">
                <SvgIcon name="trejectory-icon" class="svg-icon size24" />
                <span>{{ mudLog.ObjectName }}</span>
              </div>
            </div>
            <div v-else class="log-list fontSize-10">
              <div class="log-item justify-content-center">
                <span>No Mud LogAvailable</span>
              </div>
            </div>
          </div>

          <div class="create-job-footer-wrapper">
            <CustomButton class="btn-width" @click="openMudLogPopup()">Add New MudLog</CustomButton>
          </div>
        </div>
      </div>

      <div class="d-flex flex-col flex-full">
        <div class="popup-fields d-flex width-100 fontSize-12">
          <div class="field d-flex align-items-center">
            <label for="operator-name" class="field-label fontBold">Target Uid</label>
            <input id="operator-name" v-model="targetList.UUID" disabled type="text" class="field-input fontNormal" placeholder="Enter the UID" />
            <div class="d-flex align-items-center gap5">
              <SvgIcon
                name="reload-icon"
                class="svg-icon size24"
                @click="
                  targetList.UUID = generateUUID();
                  targetList.useSameAsSource = false;
                  updateSelectedDetails();
                " />
              <input
                v-model="targetList.useSameAsSource"
                type="checkbox"
                @change="
                  targetList.useSameAsSource == true ? (targetList.UUID = selectedMudLog.ObjectUid) : (targetList.UUID = generateUUID());
                  updateSelectedDetails();
                " />
              <label class="field-label fontSize-10">Use Same as Source</label>
            </div>
          </div>
          <div class="field d-flex align-items-center">
            <label for="operator-name" class="field-label fontBold">Target Name</label>
            <input
              id="operator-name"
              v-model="targetList.Name"
              type="text"
              class="field-input fontNormal"
              placeholder="Enter the Name"
              @change="updateSelectedDetails()" />
          </div>
        </div>
      </div>
    </div>
    <CreateObjects v-if="isCreateNewObject" :selectType="tab.Mudlog" @close-popup="closePopup" @on-submit="newMudLog"></CreateObjects>
    <ImportObjects
      v-if="openImport"
      :source="source"
      :type="tab.Mudlog"
      @selected-objects="importedMudlog"
      @close-popup="openImport = false"></ImportObjects>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import { IMudLogs } from 'server/interfaces/datasimplex.interfaces';
  import { BaseObject } from 'server/interfaces/synchronizer.interfaces';
  import CreateObjects from './CreateObjects.vue';
  import ImportObjects from './ImportObjects.vue';
  import { TargetList, CreateObject, Tabs } from '@/interfaces/synchronizer.interface';
  import { ToastType } from '../ToastMessage.vue';
  import { store } from '@/main';

  export default defineComponent({
    name: 'MudLogTab',
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
      modelValue: {
        type: Array as () => BaseObject[],
        required: true,
        default: () => [],
      },
      tranferMudlog: {
        type: Boolean,
        required: true,
      },
    },
    emits: ['update:modelValue', 'update:tranferMudlog'],
    data() {
      return {
        selectedMudLog: {} as BaseObject,
        mudLogList: [...this.modelValue] as BaseObject[],
        isCreateNewObject: false as boolean,
        targetList: {
          UUID: '',
          Name: '',
          useSameAsSource: false,
        } as TargetList,
        openImport: false as boolean,
        filterInput: '' as string,
        tranferAllMudLogs: (this.tranferMudlog || false) as boolean,
        tab: Tabs,
      };
    },
    computed: {
      filterMudLogList(): BaseObject[] {
        return this.mudLogList.filter((mud) => mud.ObjectName.toLowerCase().includes(this.filterInput.toLowerCase()));
      },
    },
    watch: {
      mudLogList: {
        handler(newVal) {
          this.$emit('update:modelValue', newVal);
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (this.mudLogList.length > 0) {
          this.selectMudLog(this.mudLogList[0]);
        }
      });
    },
    methods: {
      selectMudLog(MudLog: BaseObject) {
        this.selectedMudLog = MudLog;
        this.targetList.UUID = this.selectedMudLog.TargetUID;
        this.targetList.Name = this.selectedMudLog.TargetName;
      },
      updateSelectedDetails() {
        this.mudLogList = this.mudLogList.map((item) => {
          if (item.ObjectUid == this.selectedMudLog.ObjectUid) {
            return {
              ObjectName: item.ObjectName,
              ObjectUid: item.ObjectUid,
              TargetUID: this.targetList.UUID,
              TargetName: this.targetList.Name,
            };
          } else {
            return item;
          }
        });
      },
      generateUUID() {
        return uuidv4();
      },
      closePopup() {
        this.isCreateNewObject = false;
      },
      openMudLogPopup() {
        this.isCreateNewObject = true;
      },
      importedMudlog(data: IMudLogs[]) {
        if (!data) return;

        const existingNames = new Set(this.mudLogList.map((obj) => obj.ObjectName));
        const newUniqueItems: typeof this.mudLogList = [];
        const duplicateNames: string[] = [];

        data.forEach((item: IMudLogs) => {
          if (existingNames.has(item.ObjectName)) {
            duplicateNames.push(item.ObjectName);
          } else {
            newUniqueItems.push({
              ObjectUid: item.ObjectUid,
              ObjectName: item.ObjectName,
              TargetUID: item.ObjectUid,
              TargetName: item.ObjectName,
            });
            existingNames.add(item.ObjectName);
          }
        });

        this.mudLogList = [...this.mudLogList, ...newUniqueItems];

        if (duplicateNames.length > 0) {
          store.showToast(ToastType.WARN, `Skipped duplicates: ${duplicateNames.join(', ')}`);
        }
      },
      newMudLog(item: CreateObject) {
        const duplicateItem = this.mudLogList.filter((mudlog) => mudlog.ObjectName == item.Name);
        if (duplicateItem.length) {
          store.showToast(ToastType.WARN, `Duplicate mudlog name: ${item.Name}`);
          return;
        }
        this.mudLogList.push({
          ObjectUid: item.UUID,
          ObjectName: item.Name,
          TargetUID: item.UUID,
          TargetName: item.Name,
        });
        this.closePopup();
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

  .log-item.active {
    background: var(--hover-secondary);
  }
  .btn-width {
    width: auto;
  }
</style>
